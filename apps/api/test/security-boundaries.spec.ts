import { describe, it, expect, beforeAll } from 'vitest';
import { PrismaClient } from '@poco/database';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@poco/constants';
import * as bcrypt from 'bcryptjs';

describe('Real PostgreSQL Integration: Security Boundaries & Role Enforcements (TEST-02, D-08, D-10)', () => {
  let prisma: PrismaClient;
  let authService: AuthService;
  let jwtService: JwtService;

  beforeAll(() => {
    prisma = new PrismaClient();
    jwtService = new JwtService({ secret: 'dev-external-secret-change-in-production-min-32-chars-long' });
    const prismaService = { client: prisma, ...prisma } as any;
    authService = new AuthService(prismaService, jwtService);
  });

  it('enforces external family token isolation from internal ops routes', async () => {
    // External user authenticates
    const person = await prisma.person.findFirst({
      where: { email: 'family1@pocoeldercare.com' },
      include: { householdMemberships: true },
    });
    expect(person).toBeDefined();

    const externalTokens = await authService.loginExternal({
      phone: person!.phone,
      otp: '123456',
    });

    const decoded = jwtService.verify(externalTokens.accessToken);
    expect(decoded.tokenType).toBe('EXTERNAL');
    expect(decoded.householdId).toBeDefined();
    // External JWT must NOT contain internal role claims
    expect(decoded.roles).toBeUndefined();
  });

  it('authenticates all standard internal staff roles and verifies distinct permission roles', async () => {
    const rolesToTest = [
      { email: 'admin@pocoeldercare.com', expectedRole: UserRole.SUPER_ADMIN },
      { email: 'ops@pocoeldercare.com', expectedRole: UserRole.OPS_MANAGER },
      { email: 'manager@pocoeldercare.com', expectedRole: UserRole.CARE_MANAGER },
      { email: 'officer1@pocoeldercare.com', expectedRole: UserRole.CARE_OFFICER },
    ];

    for (const testCase of rolesToTest) {
      const loginRes = await authService.loginInternal({
        email: testCase.email,
        password: 'PocoCare123!',
      });

      expect(loginRes.accessToken).toBeDefined();
      const decoded = jwtService.verify(loginRes.accessToken);
      expect(decoded.tokenType).toBe('INTERNAL');
      expect(decoded.roles).toContain(testCase.expectedRole);
    }
  });

  it('rejects internal login with incorrect password with unauthorized exception', async () => {
    await expect(
      authService.loginInternal({
        email: 'admin@pocoeldercare.com',
        password: 'IncorrectPassword123!',
      }),
    ).rejects.toThrow();
  });
});
