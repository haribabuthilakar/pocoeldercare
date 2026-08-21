import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { AuthService } from '../modules/auth/auth.service';
import { RoleType } from '@poco/database';
import { PrismaService } from '../database/prisma.service';

describe('AuthService Integration', () => {
  let authService: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        PrismaModule,
        RedisModule,
        JwtModule.register({}),
      ],
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should send OTP and return devOtp in development', async () => {
    const res = await authService.sendOtp({ phone: '+919999988888' });
    expect(res.success).toBe(true);
    expect(res.phone).toBe('+919999988888');
    expect(res.devOtp).toBe('123456');
  });

  it('should verify OTP and return dual JWT tokens and user payload', async () => {
    const res = await authService.verifyOtp({ phone: '+919999988888', otp: '123456' });
    expect(res.accessToken).toBeDefined();
    expect(res.refreshToken).toBeDefined();
    expect(res.user).toBeDefined();
    expect(res.user.phone).toBe('+919999988888');
  });

  it('should register a new NRI family member with email and password', async () => {
    const email = `nri.${Date.now()}@example.com`;
    const res = await authService.register({
      name: 'Priya Sharma (NRI US)',
      email,
      password: 'SecurePassword123!',
      phone: `+1415${Math.floor(1000000 + Math.random() * 9000000)}`,
      initialRole: RoleType.FAMILY_PRIMARY_NRI,
    });

    expect(res.accessToken).toBeDefined();
    expect(res.user.email).toBe(email);
    expect(res.user.activeRole).toBe(RoleType.FAMILY_PRIMARY_NRI);
  });

  it('should login with email and verify password hash', async () => {
    const res = await authService.loginWithEmail({
      email: 'admin@pococare.in',
      password: 'PocoCare@2026',
    });

    expect(res.accessToken).toBeDefined();
    expect(res.user.name).toBe('Radhakrishnan Nair');
  });

  it('should refresh access token using valid refresh token', async () => {
    const loginRes = await authService.loginWithEmail({
      email: 'dispatcher@pococare.in',
      password: 'PocoCare@2026',
    });

    const refreshRes = await authService.refreshToken({
      refreshToken: loginRes.refreshToken,
    });

    expect(refreshRes.accessToken).toBeDefined();
    expect(refreshRes.refreshToken).toBeDefined();
  });
});
