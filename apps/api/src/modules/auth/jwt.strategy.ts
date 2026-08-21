import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'poco_dev_access_secret_key_1234567890',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { userRoles: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or account is deactivated');
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      roles: user.userRoles,
      activeHouseholdId: payload.activeHouseholdId,
      activeRole: payload.activeRole,
    };
  }
}
