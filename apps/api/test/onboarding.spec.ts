import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingController } from '../src/modules/households/onboarding.controller';
import { LeadStage, FamilyRole } from '@poco/constants';

describe('OnboardingController Integration', () => {
  let controller: OnboardingController;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      lead: {
        create: vi.fn(),
        update: vi.fn(),
      },
      household: {
        create: vi.fn(),
      },
      householdMembership: {
        create: vi.fn(),
      },
      senior: {
        create: vi.fn(),
      },
      seniorMedicalProfile: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb: any) => cb(prismaMock)),
    };
    controller = new OnboardingController(prismaMock as any);
  });
  describe('ONBD-01: Auto-create Lead on Signup', () => {
    it('creates a sales lead with NEW stage', async () => {
      prismaMock.lead.create.mockResolvedValue({
        id: 'lead-1',
        contactName: 'Sunil Sharma',
        phone: '9876543210',
        stage: LeadStage.NEW,
      });

      const result = await controller.createOnboardingLead({
        name: 'Sunil Sharma',
        phone: '9876543210',
        email: 'sunil@example.com',
      });

      expect(result.leadId).toBe('lead-1');
      expect(result.stage).toBe(LeadStage.NEW);
      expect(prismaMock.lead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          contactName: 'Sunil Sharma',
          stage: LeadStage.NEW,
        }),
      });
    });
  });

  describe('ONBD-02: Household with 1-4 Seniors Registration', () => {
    it('registers household and seniors in transaction', async () => {
      prismaMock.household.create.mockResolvedValue({ id: 'hh-1', name: 'Sharma Residence' });
      prismaMock.householdMembership.create.mockResolvedValue({ id: 'mem-1' });
      prismaMock.senior.create.mockResolvedValue({ id: 'snr-1' });
      prismaMock.seniorMedicalProfile.create.mockResolvedValue({ id: 'med-1' });

      const result = await controller.setupHousehold(
        { sub: 'user-1' },
        {
          householdName: 'Sharma Residence',
          addressLine1: '123 Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          seniors: [
            {
              name: 'Devendra Sharma',
              dateOfBirth: '1950-05-15',
              gender: 'MALE',
              bloodGroup: 'O+',
              medicalProfile: {
                iceContactName: 'Sunil Sharma',
                iceContactPhone: '9876543210',
                iceRelationship: 'Son',
                allergies: ['Penicillin'],
                chronicConditions: ['Hypertension'],
              },
            },
          ],
        },
      );

      expect(result.householdId).toBe('hh-1');
      expect(result.seniorCount).toBe(1);
      expect(prismaMock.senior.create).toHaveBeenCalledTimes(1);
    });

    it('rejects setup if senior count is 0 or exceeds 4', async () => {
      await expect(
        controller.setupHousehold(
          { sub: 'user-1' },
          {
            householdName: 'Sharma Residence',
            addressLine1: '123 Indiranagar',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560038',
            seniors: [],
          },
        ),
      ).rejects.toThrow('A household onboarding requires between 1 and 4 seniors');
    });
  });

  describe('ONBD-03: Lead Conversion and Sales to CS Handoff', () => {
    it('transitions lead to CONVERTED upon onboarding submission', async () => {
      prismaMock.lead.update.mockResolvedValue({ id: 'lead-1', stage: LeadStage.CONVERTED });

      const res = await controller.submitOnboarding(
        { sub: 'user-1' },
        { leadId: 'lead-1', householdId: 'hh-1' },
      );

      expect(res.status).toBe('PENDING_CS_HANDOFF');
      expect(prismaMock.lead.update).toHaveBeenCalledWith({
        where: { id: 'lead-1' },
        data: expect.objectContaining({
          stage: LeadStage.CONVERTED,
          convertedHouseholdId: 'hh-1',
        }),
      });
    });
  });
});
