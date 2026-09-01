import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole, FamilyRole } from '@poco/constants';
import * as bcrypt from 'bcryptjs';

describe('AuthService and Guards Integration', () => {
  let authService: AuthService;
  let prismaMock: any;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test-secret' });
    prismaMock = {
      person: { findUnique: vi.fn(), create: vi.fn() },
      internalUser: { findUnique: vi.fn(), create: vi.fn() },
      household: { create: vi.fn(), findUnique: vi.fn() },
      householdMembership: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
      lead: { create: vi.fn() },
    };

    authService = new AuthService(prismaMock as any, jwtService);
  });

  describe('AUTH-01 and D-11: External User Signup and Login', () => {
    it('creates Person and Household, issues external JWT with 15m lifetime', async () => {
      const mockPerson = { id: 'person-1', phone: '9876543210', name: 'Ramesh Ram', email: 'ramesh@example.com' };
      const mockHousehold = { id: 'hh-1', name: "Ramesh Family" };

      prismaMock.person.findUnique.mockResolvedValue(null);
      prismaMock.person.create.mockResolvedValue(mockPerson);
      prismaMock.householdMembership.findMany.mockResolvedValue([]);
      prismaMock.household.create.mockResolvedValue(mockHousehold);
      prismaMock.householdMembership.create.mockResolvedValue({
        id: 'mem-1',
        personId: mockPerson.id,
        householdId: mockHousehold.id,
        role: FamilyRole.PRIMARY_CAREGIVER,
        isPrimaryContact: true,
      });
      prismaMock.lead.create.mockResolvedValue({ id: 'lead-1' });

      const tokens = await authService.signupExternal({
        name: 'Ramesh Rao',
        phone: '9876543210',
        email: 'ramesh@example.com',
        role: FamilyRole.PRIMARY_CAREGIVER,
      });

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.expiresIn).toBe(900);

      const decoded = jwtService.verify(tokens.accessToken);
      expect(decoded.sub).toBe('person-1');
      expect(decoded.householdId).toBe('hh-1');
      expect(decoded.role).toBe(FamilyRole.PRIMARY_CAREGIVER);
      expect(decoded.tokenType).toBe('EXTERNAL');
    });

    it('issues 7-day token when clientType is mobile (D-13)', async () => {
      const mockPerson = {
        id: 'person-1',
        phone: '9876543210',
        householdMemberships: [
          { householdId: 'hh-1', role: FamilyRole.PRIMARY_CAREGIVER, isPrimaryContact: true },
        ],
      };

      prismaMock.person.findUnique.mockResolvedValue(mockPerson);

      const tokens = await authService.loginExternal(
        { phone: '9876543210', otp: '123456' },
        'mobile',
      );

      expect(tokens.expiresIn).toBe(7 * 24 * 60 * 60);
    });
  });

  describe('AUTH-02 and D-14: Internal Staff Login with Multi-Roles', () => {
    it('authenticates internal user with bcrypt password and embeds roles array in JWT', async () => {
      const passwordHash = await bcrypt.hash('SecretPass123!', 10);
      const mockInternalUser = {
        id: 'staff-1',
        email: 'ops@poco.care',
        name: 'Anita Sharma',
        passwordHash,
        isActive: true,
        roles: [
          { role: UserRole.OPS_MANAGER },
          { role: UserRole.CARE_OFFICER },
        ],
      };

      prismaMock.internalUser.findUnique.mockResolvedValue(mockInternalUser);

      const tokens = await authService.loginInternal({
        email: 'ops@poco.care',
        password: 'SecretPass123!',
      });

      expect(tokens.accessToken).toBeDefined();
      const decoded = jwtService.verify(tokens.accessToken);
      expect(decoded.sub).toBe('staff-1');
      expect(decoded.email).toBe('ops@poco.care');
      expect(decoded.tokenType).toBe('INTERNAL');
      expect(decoded.roles).toEqual([UserRole.OPS_MANAGER, UserRole.CARE_OFFICER]);
    });

    it('rejects internal login with incorrect password', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass123!', 10);
      prismaMock.internalUser.findUnique.mockResolvedValue({
        id: 'staff-1',
        email: 'ops@poco.care',
        passwordHash,
        isActive: true,
      });

      await expect(
        authService.loginInternal({
          email: 'ops@poco.care',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow();
    });
  });

  describe('AUTH-05 and D-12: Multi-Household Context Switching', () => {
    it('generates a new token scoped to the selected household if caller is active member', async () => {
      prismaMock.householdMembership.findUnique.mockResolvedValue({
        id: 'mem-2',
        householdId: 'hh-2',
        role: FamilyRole.SECONDARY_CAREGIVER,
        person: { id: 'person-1', phone: '9876543210' },
      });

      const tokens = await authService.switchHousehold('person-1', 'hh-2');
      expect(tokens.accessToken).toBeDefined();
      const decoded = jwtService.verify(tokens.accessToken);
      expect(decoded.householdId).toBe('hh-2');
      expect(decoded.role).toBe(FamilyRole.SECONDARY_CAREGIVER);
    });
  });
});