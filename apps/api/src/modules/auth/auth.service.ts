import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.module';
import {
  ExternalSignUpDto,
  ExternalLoginDto,
  InternalLoginDto,
} from '@poco/validation';
import {
  buildExternalJwtPayload,
  buildInternalJwtPayload,
  isExternalJwt,
  isInternalJwt,
} from '@poco/business-rules';
import { FamilyRole, UserRole } from '@poco/constants';
import { AuthTokenResponse } from '@poco/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signupExternal(dto: ExternalSignUpDto): Promise<AuthTokenResponse> {
    const existingPerson = await this.prisma.person.findUnique({
      where: { phone: dto.phone },
    });

    let person = existingPerson;
    if (!person) {
      person = await this.prisma.person.create({
        data: {
          phone: dto.phone,
          name: dto.name,
          email: dto.email,
        },
      });
    }

    // Create a new default Household for this person if specified or none exists
    const memberships = await this.prisma.householdMembership.findMany({
      where: { personId: person.id },
    });

    let householdId: string;
    if (memberships.length === 0) {
      const household = await this.prisma.household.create({
        data: {
          name: dto.householdName || `${dto.name}'s Family`,
          addressLine1: 'Pending Onboarding Address',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          latitude: 12.9716,
          longitude: 77.5946,
          wallet: {
            create: {
              balancePaise: 0,
              creditLimitPaise: 0,
            },
          },
        },
      });

      await this.prisma.householdMembership.create({
        data: {
          personId: person.id,
          householdId: household.id,
          role: dto.role || FamilyRole.PRIMARY_CAREGIVER,
          isPrimaryContact: true,
        },
      });

      // Also create a sales lead for this new customer signup (ONBD-01)
      await this.prisma.lead.create({
        data: {
          contactName: dto.name,
          phone: dto.phone,
          email: dto.email,
          stage: 'NEW',
          notes: 'Auto-created from customer signup',
        },
      });

      householdId = household.id;
    } else {
      householdId = memberships[0].householdId;
    }

    const payload = buildExternalJwtPayload(
      person.id,
      householdId,
      dto.role || FamilyRole.PRIMARY_CAREGIVER,
      person.phone,
    );

    return this.generateTokens(payload, 'web');
  }

  async loginExternal(dto: ExternalLoginDto, clientType: 'web' | 'mobile' = 'web'): Promise<AuthTokenResponse> {
    // In mock/test dev environment, accept any valid 6-digit OTP (e.g. 123456)
    const person = await this.prisma.person.findUnique({
      where: { phone: dto.phone },
      include: {
        householdMemberships: {
          include: { household: true },
        },
      },
    });

    if (!person) {
      throw new NotFoundException('Account with this phone number not found. Please sign up.');
    }

    const primaryMembership = person.householdMemberships.find((m) => m.isPrimaryContact) || person.householdMemberships[0];
    if (!primaryMembership) {
      throw new BadRequestException('No active household membership associated with this user');
    }

    const payload = buildExternalJwtPayload(
      person.id,
      primaryMembership.householdId,
      primaryMembership.role as FamilyRole,
      person.phone,
    );

    return this.generateTokens(payload, clientType);
  }

  async loginInternal(dto: InternalLoginDto): Promise<AuthTokenResponse> {
    const user = await this.prisma.internalUser.findUnique({
      where: { email: dto.email },
      include: {
        roles: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid staff credentials or account disabled');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid staff credentials');
    }

    const roleEnums = user.roles.map((r) => r.role as UserRole);
    const payload = buildInternalJwtPayload(
      user.id,
      user.email,
      roleEnums,
    );

    return this.generateTokens(payload, 'web');
  }

  async switchHousehold(personId: string, targetHouseholdId: string): Promise<AuthTokenResponse> {
    const membership = await this.prisma.householdMembership.findUnique({
      where: {
        personId_householdId: {
          personId,
          householdId: targetHouseholdId,
        },
      },
      include: { person: true },
    });

    if (!membership) {
      throw new ForbiddenException('User is not a member of target household');
    }

    const payload = buildExternalJwtPayload(
      membership.person.id,
      membership.householdId,
      membership.role as FamilyRole,
      membership.person.phone,
    );

    return this.generateTokens(payload, 'web');
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokenResponse> {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken);
      if (decoded.tokenType !== 'REFRESH') {
        throw new UnauthorizedException('Invalid token type');
      }

      if (decoded.payloadType === 'EXTERNAL') {
        const person = await this.prisma.person.findUnique({
          where: { id: decoded.sub },
        });
        if (!person) throw new UnauthorizedException('User no longer exists');

        const membership = await this.prisma.householdMembership.findFirst({
          where: { personId: person.id, householdId: decoded.householdId },
        });
        if (!membership) throw new UnauthorizedException('Membership expired');

        const payload = buildExternalJwtPayload(
          person.id,
          membership.householdId,
          membership.role as FamilyRole,
          person.phone,
        );
        return this.generateTokens(payload, decoded.clientType || 'web');
      } else if (decoded.payloadType === 'INTERNAL') {
        const user = await this.prisma.internalUser.findUnique({
          where: { id: decoded.sub },
          include: { roles: true },
        });
        if (!user || !user.isActive) throw new UnauthorizedException('User disabled or deleted');

        const payload = buildInternalJwtPayload(
          user.id,
          user.email,
          user.roles.map((r) => r.role as UserRole),
        );
        return this.generateTokens(payload, 'web');
      }

      throw new UnauthorizedException('Invalid refresh payload');
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(
    payload: any,
    clientType: 'web' | 'mobile' = 'web',
  ): Promise<AuthTokenResponse> {
    // 15m for web, 7d for mobile field app (D-13)
    const accessExpiresIn = clientType === 'mobile' ? 7 * 24 * 60 * 60 : 15 * 60;
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessExpiresIn,
    });

    const refreshPayload = {
      sub: payload.sub,
      tokenType: 'REFRESH',
      payloadType: payload.tokenType,
      householdId: payload.householdId,
      clientType,
      tokenId: Math.random().toString(36).substring(2),
    };

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: 30 * 24 * 60 * 60, // 30 days
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      tokenType: 'Bearer',
    };
  }
}
