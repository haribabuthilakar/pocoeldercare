import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CareOfficersService } from '../src/modules/care-officers/care-officers.service';
import { UserRole } from '@poco/constants';

describe('CareOfficersService Integration', () => {
  let service: CareOfficersService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      household: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      careOfficerProfile: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      careOfficerCertification: {
        findMany: vi.fn(),
      },
      ticket: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };
    service = new CareOfficersService(prismaMock as any);
  });

  describe('CARE-01, CARE-02, CARE-03: 1:1 Mapping & Certification Gates', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90); // 90 days future

    it('assigns care officer to household when caller is CARE_MANAGER and certifications are valid', async () => {
      prismaMock.household.findUnique.mockResolvedValue({
        id: 'hh-1',
        assignedCareOfficerId: null,
      });

      prismaMock.careOfficerProfile.findUnique.mockResolvedValue({
        id: 'officer-1',
        isAvailable: true,
        certifications: [
          {
            status: 'ACTIVE',
            expiresAt: futureDate,
            certification: { code: 'BLS_CPR', name: 'Basic Life Support' },
          },
          {
            status: 'ACTIVE',
            expiresAt: futureDate,
            certification: { code: 'GERIATRIC_CORE', name: 'Geriatric Care Core' },
          },
        ],
      });

      prismaMock.household.update.mockResolvedValue({
        id: 'hh-1',
        assignedCareOfficerId: 'officer-1',
        assignedCareOfficer: { internalUser: { name: 'Kavitha M' } },
      });

      const res = await service.assignCareOfficer(
        'hh-1',
        'officer-1',
        { sub: 'mgr-1', roles: [UserRole.CARE_MANAGER] },
        ['BLS_CPR', 'GERIATRIC_CORE'],
      );

      expect(res.success).toBe(true);
      expect(res.assignedCareOfficerId).toBe('officer-1');
      expect(prismaMock.household.update).toHaveBeenCalledWith({
        where: { id: 'hh-1' },
        data: { assignedCareOfficerId: 'officer-1' },
        include: expect.any(Object),
      });
    });

    it('blocks assignment if caller lacks CARE_MANAGER / OPS_MANAGER role (CARE-02)', async () => {
      prismaMock.household.findUnique.mockResolvedValue({ id: 'hh-1', assignedCareOfficerId: null });
      prismaMock.careOfficerProfile.findUnique.mockResolvedValue({ id: 'officer-1', isAvailable: true, certifications: [] });

      await expect(
        service.assignCareOfficer('hh-1', 'officer-1', { sub: 'sales-1', roles: [UserRole.SALES_LEAD] }),
      ).rejects.toThrow('authorized to assign Care Officers');
    });

    it('blocks assignment if officer is missing mandatory certifications (CARE-03)', async () => {
      prismaMock.household.findUnique.mockResolvedValue({ id: 'hh-1', assignedCareOfficerId: null });
      prismaMock.careOfficerProfile.findUnique.mockResolvedValue({
        id: 'officer-1',
        isAvailable: true,
        certifications: [
          // Missing GERIATRIC_CORE
          {
            status: 'ACTIVE',
            expiresAt: futureDate,
            certification: { code: 'BLS_CPR', name: 'Basic Life Support' },
          },
        ],
      });

      await expect(
        service.assignCareOfficer('hh-1', 'officer-1', { sub: 'mgr-1', roles: [UserRole.CARE_MANAGER] }, ['BLS_CPR', 'GERIATRIC_CORE']),
      ).rejects.toThrow('missing mandatory unexpired certification(s): GERIATRIC_CORE');
    });

    it('blocks assignment if household already has another active care officer (CARE-01)', async () => {
      prismaMock.household.findUnique.mockResolvedValue({
        id: 'hh-1',
        assignedCareOfficerId: 'officer-99', // already assigned to another
      });

      prismaMock.careOfficerProfile.findUnique.mockResolvedValue({
        id: 'officer-1',
        isAvailable: true,
        certifications: [
          { status: 'ACTIVE', expiresAt: futureDate, certification: { code: 'BLS_CPR' } },
          { status: 'ACTIVE', expiresAt: futureDate, certification: { code: 'GERIATRIC_CORE' } },
        ],
      });

      await expect(
        service.assignCareOfficer('hh-1', 'officer-1', { sub: 'mgr-1', roles: [UserRole.CARE_MANAGER] }, ['BLS_CPR', 'GERIATRIC_CORE']),
      ).rejects.toThrow('Household is already assigned to officer officer-99');
    });
  });

  describe('CARE-04 & CARE-05: Supervisor Hierarchy & Fallback Escalation', () => {
    it('traverses directReports for supervising Care Officer', async () => {
      prismaMock.careOfficerProfile.findUnique.mockResolvedValue({
        id: 'mgr-profile-1',
        directReports: [
          {
            id: 'officer-1',
            phone: '9876543210',
            isAvailable: true,
            clusterCode: 'BLR_SOUTH',
            internalUser: { name: 'Kavitha M', email: 'kavitha@poco.care' },
            assignedHousehold: { id: 'hh-1', name: 'Rao Household', seniors: [{ id: 's-1' }] },
            assignedTickets: [{ id: 't-1' }],
            certifications: [],
          },
        ],
      });

      const supervised = await service.getSupervisedOfficers('mgr-user-1');
      expect(supervised.length).toBe(1);
      expect(supervised[0].name).toBe('Kavitha M');
      expect(supervised[0].assignedHousehold?.name).toBe('Rao Household');
      expect(supervised[0].activeTicketsCount).toBe(1);
    });

    it('escalates ticket to ReportingLine supervisor on SLA breach (CARE-05, SLA-04)', async () => {
      prismaMock.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        assignedCareOfficerId: 'officer-1',
        assignedCareOfficer: {
          id: 'officer-1',
          manager: {
            id: 'supervisor-1',
            internalUser: { name: 'Senior Officer Anand' },
          },
        },
      });

      prismaMock.ticket.update.mockResolvedValue({
        id: 'ticket-1',
        assignedCareOfficerId: 'supervisor-1',
        status: 'WAITING_OPS_UPDATE',
      });

      const res = await service.executeSupervisorFallback('ticket-1');
      expect(res.success).toBe(true);
      expect(res.escalatedToSupervisorId).toBe('supervisor-1');
      expect(res.escalatedToSupervisorName).toBe('Senior Officer Anand');
    });
  });
});
