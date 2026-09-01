import { describe, it, expect, beforeEach } from 'vitest';
import { database, generateUuid } from '../../src/db/database';
import { appSchema } from '../../src/db/schema';
import {
  populateMockDatabase,
  mockHousehold,
  mockSenior,
  mockTicket,
  mockServiceRequest,
  mockSopSteps,
} from '../fixtures/database.fixture';

describe('WatermelonDB Schema & Domain Models Suite', () => {
  beforeEach(async () => {
    await database.clearAll();
  });

  describe('Database Schema & Table Definitions', () => {
    it('defines all 9 core offline tables in appSchema', () => {
      const expectedTables = [
        'households',
        'seniors',
        'tickets',
        'service_requests',
        'sop_steps',
        'sop_progress',
        'activity_feed_items',
        'sync_outbox',
        'media_uploads',
      ];

      expectedTables.forEach((table) => {
        expect(appSchema.tables[table]).toBeDefined();
        expect(appSchema.tables[table]?.name).toBe(table);
        expect(appSchema.tables[table]?.columns.length).toBeGreaterThan(0);
      });
    });

    it('generates valid RFC4122 v4 UUIDs for client mutations', () => {
      const uuid1 = generateUuid();
      const uuid2 = generateUuid();

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid1).toMatch(uuidRegex);
      expect(uuid2).toMatch(uuidRegex);
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('Collection Operations & Model Methods', () => {
    beforeEach(async () => {
      await populateMockDatabase();
    });

    it('retrieves and maps HouseholdModel with fullAddress helper', async () => {
      const household = await database.households.find('hh_blr_001');
      expect(household).not.toBeNull();
      expect(household?.name).toBe('Varma Household');
      expect(household?.status).toBe('ACTIVE');
      expect(household?.fullAddress).toBe(
        'Flat 402, Palm Meadows, 100ft Road, Indiranagar, Bengaluru, 560038',
      );
    });

    it('retrieves SeniorModel with emergency contact details and allergies array', async () => {
      const senior = await database.seniors.find('snr_blr_001');
      expect(senior).not.toBeNull();
      expect(senior?.fullName).toBe('Kalyan Varma');
      expect(senior?.bloodGroup).toBe('B+');
      expect(senior?.allergies).toEqual(['Penicillin', 'Sulfa drugs']);
      expect(senior?.emergencyContactPhone).toBe('+919845012345');
      expect(senior?.isPrimary).toBe(true);
    });

    it('queries tickets by assigned care officer', async () => {
      const tickets = await database.tickets.query(
        (t) => t.assigned_care_officer_id === 'co_prof_001',
      );
      expect(tickets.length).toBe(1);
      expect(tickets[0]?.category).toBe('ROUTINE_CHECKUP');
      expect(tickets[0]?.status).toBe('IN_PROGRESS');
    });

    it('queries and orders SOP steps by step_index', async () => {
      const steps = await database.sopSteps.query((s) => s.sop_version_id === 'sop_vitals_v1');
      expect(steps.length).toBe(4);
      expect(steps[0]?.title).toBe('Senior Identity Verification & Greeting');
      expect(steps[1]?.inputType).toBe('VITALS');
      expect(steps[2]?.inputType).toBe('CHOICE');
      expect(steps[3]?.inputType).toBe('PHOTO');
    });

    it('supports updates and deletions on collections', async () => {
      const updated = await database.serviceRequests.update('sr_field_001', {
        status: 'ON_SITE',
      });
      expect(updated?.status).toBe('ON_SITE');

      const verified = await database.serviceRequests.find('sr_field_001');
      expect(verified?.status).toBe('ON_SITE');

      const deleted = await database.serviceRequests.delete('sr_field_001');
      expect(deleted).toBe(true);
      expect(await database.serviceRequests.find('sr_field_001')).toBeNull();
    });
  });

  describe('Outbox Mutation Staging', () => {
    it('stages client mutations in sync_outbox with client UUID and pending status', async () => {
      const outboxItem = await database.stageMutation(
        'STATUS_TRANSITION',
        'service_requests',
        'sr_field_001',
        {
          type: 'START_WORK',
          isGeofenceVerified: true,
          distanceMeters: 24,
        },
      );

      expect(outboxItem.id).toBeDefined();
      expect(outboxItem.mutationType).toBe('STATUS_TRANSITION');
      expect(outboxItem.entityName).toBe('service_requests');
      expect(outboxItem.entityId).toBe('sr_field_001');
      expect(outboxItem.status).toBe('PENDING');
      expect(outboxItem.payload.distanceMeters).toBe(24);

      const retrieved = await database.syncOutbox.find(outboxItem.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.status).toBe('PENDING');
    });

    it('notifies subscribers on database changes', async () => {
      let notified = false;
      const unsubscribe = database.syncOutbox.subscribe(() => {
        notified = true;
      });

      await database.stageMutation('FEED_NOTE', 'activity_feed_items', 'feed_001', {
        content: 'Test care note',
      });

      expect(notified).toBe(true);
      unsubscribe();
    });
  });
});
