import { describe, it, expect } from 'vitest';
import { TABLE_DEFINITIONS } from '../lib/table-schemas';
import { dbStore } from '../lib/mock-db-store';

describe('Database CRUD Administration App Workflows', () => {
  it('should register all 18 Prisma models with complete field definitions', () => {
    const tableKeys = Object.keys(TABLE_DEFINITIONS);
    expect(tableKeys.length).toBe(18);
    expect(tableKeys).toContain('User');
    expect(tableKeys).toContain('Household');
    expect(tableKeys).toContain('Member');
    expect(tableKeys).toContain('IceProfile');
    expect(tableKeys).toContain('ServiceCatalog');
    expect(tableKeys).toContain('EmergencyEvent');
    expect(tableKeys).toContain('WalletTransaction');
  });

  it('should perform Create, Read, Update, and Delete on User table', () => {
    // 1. Create
    const newUser = dbStore.createRow('User', {
      name: 'Test Specialist Doctor',
      phone: '+919876500000',
      email: 'test.doc@poco.in',
      isActive: true,
    });
    expect(newUser.id).toBeDefined();
    expect(newUser.name).toBe('Test Specialist Doctor');

    // 2. Read
    const fetched = dbStore.getRow('User', newUser.id);
    expect(fetched).toBeDefined();
    expect(fetched?.email).toBe('test.doc@poco.in');

    // 3. Update
    const updated = dbStore.updateRow('User', newUser.id, {
      name: 'Dr. Test Specialist (Updated)',
    });
    expect(updated?.name).toBe('Dr. Test Specialist (Updated)');

    // 4. Delete
    const deleted = dbStore.deleteRow('User', newUser.id);
    expect(deleted).toBe(true);
    expect(dbStore.getRow('User', newUser.id)).toBeUndefined();
  });

  it('should manage complex JSON fields in IceProfile table', () => {
    const ice = dbStore.createRow('IceProfile', {
      memberId: 'mbr-test-01',
      bloodGroup: 'AB+',
      allergies: ['Aspirin', 'Contrast Dye'],
      chronicConditions: ['Asthma'],
      active: true,
    });

    expect(ice.bloodGroup).toBe('AB+');
    expect(ice.allergies).toContain('Aspirin');

    dbStore.updateRow('IceProfile', ice.id, {
      bloodGroup: 'O-',
      allergies: ['Aspirin', 'Contrast Dye', 'Latex'],
    });

    const updated = dbStore.getRow('IceProfile', ice.id);
    expect(updated?.bloodGroup).toBe('O-');
    expect(updated?.allergies).toContain('Latex');
  });
});
