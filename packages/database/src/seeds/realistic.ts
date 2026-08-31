import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserRole, FamilyRole } from '@poco/constants';

/**
 * Scaled load test seed generator creating ~50 officers and ~200 households per D-135.
 */
export async function seedRealistic(prisma: PrismaClient): Promise<void> {
  console.log('🌱 Starting realistic scaled seed generation (~50 officers, ~200 households)...');
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const saharaPackage = await prisma.subscriptionPackage.findUnique({ where: { code: 'SAHARA' } });
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const officerIds: string[] = [];

  // 1. Seed 50 Care Officers
  for (let i = 1; i <= 50; i++) {
    const code = i.toString().padStart(3, '0');
    const officer = await prisma.internalUser.upsert({
      where: { email: `officer${code}@pocoeldercare.com` },
      update: {},
      create: {
        email: `officer${code}@pocoeldercare.com`,
        fullName: `Care Officer ${code}`,
        phone: `9876510${code}`,
        passwordHash,
        roles: {
          create: [{ role: UserRole.CARE_OFFICER }]
        },
        careOfficerProfile: {
          create: {
            employeeCode: `POCO-CO-${code}`,
            territory: i % 2 === 0 ? 'South Bangalore' : 'East Bangalore',
            maxHouseholdCapacity: 25,
            isAvailable: true,
            currentLatitude: 12.9 + (i * 0.002),
            currentLongitude: 77.6 + (i * 0.002)
          }
        }
      }
    });

    officerIds.push(officer.id);
  }

  // 2. Seed 200 Households
  for (let h = 1; h <= 200; h++) {
    const hCode = h.toString().padStart(3, '0');
    const assignedOfficerId = officerIds[h % officerIds.length];

    const person = await prisma.person.upsert({
      where: { phone: `9876520${hCode}` },
      update: {},
      create: {
        fullName: `Family Contact ${hCode}`,
        phone: `9876520${hCode}`,
        email: `family${hCode}@example.com`
      }
    });

    const household = await prisma.household.upsert({
      where: { id: `a0000000-0000-4000-b000-${hCode.padStart(12, '0')}` },
      update: {},
      create: {
        id: `a0000000-0000-4000-b000-${hCode.padStart(12, '0')}`,
        name: `Household ${hCode}`,
        addressLine1: `${h} Main Street`,
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560034',
        latitude: 12.9 + (h * 0.0005),
        longitude: 77.6 + (h * 0.0005),
        assignedCareOfficerId
      }
    });

    await prisma.householdMembership.upsert({
      where: {
        personId_householdId: {
          personId: person.id,
          householdId: household.id
        }
      },
      update: {},
      create: {
        personId: person.id,
        householdId: household.id,
        role: FamilyRole.PRIMARY_CAREGIVER,
        isPrimaryContact: true
      }
    });

    // Senior for household
    await prisma.senior.create({
      data: {
        householdId: household.id,
        fullName: `Senior Resident ${hCode}`,
        dateOfBirth: new Date('1948-01-01'),
        gender: h % 2 === 0 ? 'MALE' : 'FEMALE',
        bloodGroup: 'B+',
        medicalProfile: {
          create: {
            abhaId: `91-0000-0000-${hCode.padStart(4, '0')}`,
            allergies: [],
            chronicConditions: ['Hypertension'],
            iceContactName: `Family Contact ${hCode}`,
            iceContactPhone: `9876520${hCode}`,
            iceRelationship: 'Child'
          }
        }
      }
    });

    // Wallet
    await prisma.householdWallet.upsert({
      where: { householdId: household.id },
      update: {},
      create: {
        householdId: household.id,
        balancePaise: 500000,
        creditLimitPaise: 0
      }
    });

    // Subscription
    if (saharaPackage?.activeVersionId) {
      await prisma.householdSubscription.upsert({
        where: { householdId: household.id },
        update: {},
        create: {
          householdId: household.id,
          packageVersionId: saharaPackage.activeVersionId,
          billingCycle: 'MONTHLY',
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          status: 'ACTIVE'
        }
      });
    }
  }

  console.log('✅ Scaled seed finished successfully.');
}

// Standalone execution support
if (require.main === module) {
  const prisma = new PrismaClient();
  seedRealistic(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
