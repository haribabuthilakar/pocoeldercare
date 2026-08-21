import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { RoleType } from '@poco/database';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async sendOtp(dto: SendOtpDto) {
    const { phone } = dto;
    // Generate deterministic 6-digit OTP in dev or pseudo-random
    const isDev = this.configService.get('NODE_ENV') !== 'production';
    const otp = isDev ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();

    // Cache in Redis for 300 seconds (5 mins)
    const redisKey = `otp:${phone}`;
    await this.redisService.set(redisKey, otp, 300);

    return {
      success: true,
      message: 'OTP sent successfully',
      phone,
      ...(isDev ? { devOtp: otp } : {}),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const { phone, otp } = dto;
    const redisKey = `otp:${phone}`;
    const cachedOtp = await this.redisService.get(redisKey);

    const isDev = this.configService.get('NODE_ENV') !== 'production';
    if (!cachedOtp && !(isDev && otp === '123456')) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (cachedOtp && cachedOtp !== otp && !(isDev && otp === '123456')) {
      throw new BadRequestException('Invalid OTP');
    }

    // Invalidate OTP after successful check
    await this.redisService.del(redisKey);

    // Find or create User
    let user = await this.prisma.user.findUnique({
      where: { phone },
      include: { userRoles: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          name: 'Pococare User',
          userRoles: {
            create: [{ role: RoleType.FAMILY_PRIMARY_LOCAL }],
          },
        },
        include: { userRoles: true },
      });
    }

    return this.generateTokens(user);
  }

  async loginWithEmail(dto: LoginEmailDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { userRoles: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokens(user);
  }

  async register(dto: RegisterDto) {
    const { name, email, password, phone, initialRole } = dto;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const roleToAssign = initialRole || RoleType.FAMILY_PRIMARY_NRI;

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        userRoles: {
          create: [{ role: roleToAssign }],
        },
      },
      include: { userRoles: true },
    });

    return this.generateTokens(user);
  }

  async refreshToken(dto: RefreshTokenDto) {
    const { refreshToken } = dto;
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || 'poco_dev_refresh_secret_key_0987654321';

    try {
      const payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { userRoles: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User no longer exists or is deactivated');
      }

      return this.generateTokens(user, payload.activeRole, payload.activeHouseholdId);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async switchRole(userId: string, dto: SwitchRoleDto) {
    const { targetRole, householdId } = dto;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hasRole = user.userRoles.some((r) => r.role === targetRole);
    if (!hasRole) {
      throw new BadRequestException(`User does not hold role: ${targetRole}`);
    }

    return this.generateTokens(user, targetRole, householdId);
  }

  private generateTokens(user: any, activeRole?: RoleType, activeHouseholdId?: string) {
    const primaryRole = activeRole || user.userRoles[0]?.role || RoleType.FAMILY_PRIMARY_LOCAL;
    const accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') || 'poco_dev_access_secret_key_1234567890';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') || 'poco_dev_refresh_secret_key_0987654321';

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.userRoles.map((r: any) => ({ role: r.role, householdId: r.householdId })),
      activeRole: primaryRole,
      activeHouseholdId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        activeRole: primaryRole,
        roles: user.userRoles,
      },
    };
  }
}
