import type { PrismaClient } from '@prisma/client';
import { FamilyRole, VitalType, VitalSeverity } from '@poco/constants';
import { SEED_STAFF } from './staff';

export const SEED_HOUSEHOLDS = {
  saharaActive: {
    id: 'f0000001-0000-4000-a000-000000000001',
    name: 'Nair Family Household',
    addressLine1: '42, 3rd Cross, 7th Main, Koramangala 4th Block',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560034',
    latitude: 12.9279,
    longitude: 77.6271,
    contactPerson: {
      id: 'p0000001-0000-4000-a000-000000000001',
      fullName: 'Vikram Nair',
      phone: '9876500010',
      email: 'vikram.nair@example.com'
    },
    seniors: [
      {
        id: 's0000001-0000-4000-a000-000000000001',
        fullName: 'Ramamurthy Nair',
        dateOfBirth: new Date('1948-04-15'),
        gender: 'MALE',
        bloodGroup: 'B+',
        medical: {
          abhaId: '91-2345-6789-0123',
          allergies: ['Penicillin', 'Sulfa drugs'],
          chronicConditions: ['Hypertension', 'Osteoarthritis'],
          iceContactName: 'Vikram Nair',
          iceContactPhone: '9876500010',
          iceRelationship: 'Son'
        }
      },
      {
        id: 's0000002-0000-4000-a000-000000000002',
        fullName: 'Sarala Nair',
        dateOfBirth: new Date('1952-09-20'),
        gender: 'FEMALE',
        bloodGroup: 'O+',
        medical: {
          abhaId: '91-3456-7890-1234',
          allergies: [],
          chronicConditions: ['Type 2 Diabetes', 'Hypothyroidism'],
          iceContactName: 'Vikram Nair',
          iceContactPhone: '9876500010',
          iceRelationship: 'Son'
        }
      }
    ],
    walletBalancePaise: 500000 // ₹5,000
  },
  kavachFresh: {
    id: 'f0000002-0000-4000-a000-000000000002',
    name: 'Iyer Family Residence',
    addressLine1: '108, Temple Street, Malleshwaram',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560003',
    latitude: 13.0031,
    longitude: 77.5643,
    contactPerson: {
      id: 'p0000002-0000-4000-a000-000000000002',
      fullName: 'Sneha Iyer',
      phone: '9876500020',
      email: 'sneha.iyer@example.com'
    },
    seniors: [
      {
        id: 's0000003-0000-4000-a000-000000000003',
        fullName: 'Subramanian Iyer',
        dateOfBirth: new Date('1945-11-12'),
        gender: 'MALE',
        bloodGroup: 'A+',
        medical: {
          abhaId: '91-4567-8901-2345',
          allergies: [],
          chronicConditions: ['Mild Cognitive Impairment'],
          iceContactName: 'Sneha Iyer',
          iceContactPhone: '9876500020',
          iceRelationship: 'Daughter'
        }
      }
    ],
    walletBalancePaise: 50000 // ₹500
  },
  sampoornaNri: {
    id: 'f0000003-0000-4000-a000-000000000003',
    name: 'Krishnan Family Home',
    addressLine1: '78, 14th Main, Indiranagar',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560038',
    latitude: 12.9784,
    longitude: 77.6408,
    contactPerson: {
      id: 'p0000003-0000-4000-a000-000000000003',
      fullName: 'Arvind Krishnan',
      phone: '9876500030',
      email: 'arvind.krishnan@example.com'
    },
    seniors: [
      {
        id: 's0000004-0000-4000-a000-000000000004',
        fullName: 'Meenakshi Krishnan',
        dateOfBirth: new Date('1943-02-18'),
        gender: 'FEMALE',
        bloodGroup: 'AB+',
        medical: {
          abhaId: '91-5678-9012-3456',
          allergies: ['Aspirin'],
          chronicConditions: ['Congestive Heart Failure', 'Severe Osteoporosis'],
          iceContactName: 'Arvind Krishnan (US)',
          iceContactPhone: '9876500030',
          iceRelationship: 'Son'
        }
      }
    ],
    walletBalancePaise: 1500000 // ₹15,000
  }
};

export async function seedHouseholds(prisma: PrismaClient): Promise<void> {
  const saharaPackage = await prisma.subscriptionPackage.findUnique({ where: { code: 'SAHARA' } });
  const kavachPackage = await prisma.subscriptionPackage.findUnique({ where: { code: 'KAVACH' } });
  const sampoornaPackage = await prisma.subscriptionPackage.findUnique({ where: { code: 'SAMPOORNA' } });

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // 1. Seed Sahara Active Household (Nair Family)
  const h1 = SEED_HOUSEHOLDS.saharaActive;
  const person1 = await prisma.person.upsert({
    where: { phone: h1.contactPerson.phone },
    update: { fullName: h1.contactPerson.fullName, email: h1.contactPerson.email },
    create: {
      id: h1.contactPerson.id,
      fullName: h1.contactPerson.fullName,
      phone: h1.contactPerson.phone,
      email: h1.contactPerson.email
    }
  });

  const household1 = await prisma.household.upsert({
    where: { id: h1.id },
    update: {
      name: h1.name,
      assignedCareOfficerId: SEED_STAFF.careOfficer.id
    },
    create: {
      id: h1.id,
      name: h1.name,
      addressLine1: h1.addressLine1,
      city: h1.city,
      state: h1.state,
      postalCode: h1.postalCode,
      latitude: h1.latitude,
      longitude: h1.longitude,
      assignedCareOfficerId: SEED_STAFF.careOfficer.id
    }
  });

  await prisma.householdMembership.upsert({
    where: {
      personId_householdId: {
        personId: person1.id,
        householdId: household1.id
      }
    },
    update: { role: FamilyRole.PRIMARY_CAREGIVER, isPrimaryContact: true },
    create: {
      personId: person1.id,
      householdId: household1.id,
      role: FamilyRole.PRIMARY_CAREGIVER,
      isPrimaryContact: true
    }
  });

  // Seed Seniors for H1
  for (const s of h1.seniors) {
    const senior = await prisma.senior.upsert({
      where: { id: s.id },
      update: { fullName: s.fullName, bloodGroup: s.bloodGroup },
      create: {
        id: s.id,
        householdId: household1.id,
        fullName: s.fullName,
        dateOfBirth: s.dateOfBirth,
        gender: s.gender,
        bloodGroup: s.bloodGroup
      }
    });

    await prisma.seniorMedicalProfile.upsert({
      where: { seniorId: senior.id },
      update: {
        abhaId: s.medical.abhaId,
        allergies: s.medical.allergies,
        chronicConditions: s.medical.chronicConditions
      },
      create: {
        seniorId: senior.id,
        abhaId: s.medical.abhaId,
        allergies: s.medical.allergies,
        chronicConditions: s.medical.chronicConditions,
        iceContactName: s.medical.iceContactName,
        iceContactPhone: s.medical.iceContactPhone,
        iceRelationship: s.medical.iceRelationship
      }
    });

    // Seed baseline vitals for Ramamurthy
    if (s.fullName === 'Ramamurthy Nair') {
      await prisma.vitalReading.create({
        data: {
          seniorId: senior.id,
          vitalType: VitalType.BLOOD_PRESSURE,
          recordedAt: new Date(Date.now() - 3600000), // 1 hour ago
          systolic: 135,
          diastolic: 85,
          unit: 'mmHg',
          severity: VitalSeverity.NORMAL
        }
      });
    }
  }

  // Seed Wallet for H1
  await prisma.householdWallet.upsert({
    where: { householdId: household1.id },
    update: { balancePaise: h1.walletBalancePaise },
    create: {
      householdId: household1.id,
      balancePaise: h1.walletBalancePaise,
      creditLimitPaise: 0
    }
  });

  // Seed Subscription for H1
  if (saharaPackage?.activeVersionId) {
    await prisma.householdSubscription.upsert({
      where: { householdId: household1.id },
      update: {
        packageVersionId: saharaPackage.activeVersionId,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        status: 'ACTIVE'
      },
      create: {
        householdId: household1.id,
        packageVersionId: saharaPackage.activeVersionId,
        billingCycle: 'MONTHLY',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        status: 'ACTIVE'
      }
    });
  }

  // 2. Seed Kavach Fresh Household (Iyer Family)
  const h2 = SEED_HOUSEHOLDS.kavachFresh;
  const person2 = await prisma.person.upsert({
    where: { phone: h2.contactPerson.phone },
    update: { fullName: h2.contactPerson.fullName, email: h2.contactPerson.email },
    create: {
      id: h2.contactPerson.id,
      fullName: h2.contactPerson.fullName,
      phone: h2.contactPerson.phone,
      email: h2.contactPerson.email
    }
  });

  const household2 = await prisma.household.upsert({
    where: { id: h2.id },
    update: { name: h2.name },
    create: {
      id: h2.id,
      name: h2.name,
      addressLine1: h2.addressLine1,
      city: h2.city,
      state: h2.state,
      postalCode: h2.postalCode,
      latitude: h2.latitude,
      longitude: h2.longitude
    }
  });

  await prisma.householdMembership.upsert({
    where: {
      personId_householdId: {
        personId: person2.id,
        householdId: household2.id
      }
    },
    update: { role: FamilyRole.PRIMARY_CAREGIVER, isPrimaryContact: true },
    create: {
      personId: person2.id,
      householdId: household2.id,
      role: FamilyRole.PRIMARY_CAREGIVER,
      isPrimaryContact: true
    }
  });

  for (const s of h2.seniors) {
    const senior = await prisma.senior.upsert({
      where: { id: s.id },
      update: { fullName: s.fullName },
      create: {
        id: s.id,
        householdId: household2.id,
        fullName: s.fullName,
        dateOfBirth: s.dateOfBirth,
        gender: s.gender,
        bloodGroup: s.bloodGroup
      }
    });

    await prisma.seniorMedicalProfile.upsert({
      where: { seniorId: senior.id },
      update: { abhaId: s.medical.abhaId },
      create: {
        seniorId: senior.id,
        abhaId: s.medical.abhaId,
        allergies: s.medical.allergies,
        chronicConditions: s.medical.chronicConditions,
        iceContactName: s.medical.iceContactName,
        iceContactPhone: s.medical.iceContactPhone,
        iceRelationship: s.medical.iceRelationship
      }
    });
  }

  await prisma.householdWallet.upsert({
    where: { householdId: household2.id },
    update: { balancePaise: h2.walletBalancePaise },
    create: {
      householdId: household2.id,
      balancePaise: h2.walletBalancePaise,
      creditLimitPaise: 0
    }
  });

  if (kavachPackage?.activeVersionId) {
    await prisma.householdSubscription.upsert({
      where: { householdId: household2.id },
      update: {
        packageVersionId: kavachPackage.activeVersionId,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        status: 'ACTIVE'
      },
      create: {
        householdId: household2.id,
        packageVersionId: kavachPackage.activeVersionId,
        billingCycle: 'MONTHLY',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        status: 'ACTIVE'
      }
    });
  }

  // 3. Seed Sampoorna NRI Household (Krishnan Family)
  const h3 = SEED_HOUSEHOLDS.sampoornaNri;
  const person3 = await prisma.person.upsert({
    where: { phone: h3.contactPerson.phone },
    update: { fullName: h3.contactPerson.fullName, email: h3.contactPerson.email },
    create: {
      id: h3.contactPerson.id,
      fullName: h3.contactPerson.fullName,
      phone: h3.contactPerson.phone,
      email: h3.contactPerson.email
    }
  });

  const household3 = await prisma.household.upsert({
    where: { id: h3.id },
    update: { name: h3.name },
    create: {
      id: h3.id,
      name: h3.name,
      addressLine1: h3.addressLine1,
      city: h3.city,
      state: h3.state,
      postalCode: h3.postalCode,
      latitude: h3.latitude,
      longitude: h3.longitude
    }
  });

  await prisma.householdMembership.upsert({
    where: {
      personId_householdId: {
        personId: person3.id,
        householdId: household3.id
      }
    },
    update: { role: FamilyRole.PRIMARY_CAREGIVER, isPrimaryContact: true },
    create: {
      personId: person3.id,
      householdId: household3.id,
      role: FamilyRole.PRIMARY_CAREGIVER,
      isPrimaryContact: true
    }
  });

  for (const s of h3.seniors) {
    const senior = await prisma.senior.upsert({
      where: { id: s.id },
      update: { fullName: s.fullName },
      create: {
        id: s.id,
        householdId: household3.id,
        fullName: s.fullName,
        dateOfBirth: s.dateOfBirth,
        gender: s.gender,
        bloodGroup: s.bloodGroup
      }
    });

    await prisma.seniorMedicalProfile.upsert({
      where: { seniorId: senior.id },
      update: { abhaId: s.medical.abhaId },
      create: {
        seniorId: senior.id,
        abhaId: s.medical.abhaId,
        allergies: s.medical.allergies,
        chronicConditions: s.medical.chronicConditions,
        iceContactName: s.medical.iceContactName,
        iceContactPhone: s.medical.iceContactPhone,
        iceRelationship: s.medical.iceRelationship
      }
    });
  }

  await prisma.householdWallet.upsert({
    where: { householdId: household3.id },
    update: { balancePaise: h3.walletBalancePaise },
    create: {
      householdId: household3.id,
      balancePaise: h3.walletBalancePaise,
      creditLimitPaise: 0
    }
  });

  if (sampoornaPackage?.activeVersionId) {
    await prisma.householdSubscription.upsert({
      where: { householdId: household3.id },
      update: {
        packageVersionId: sampoornaPackage.activeVersionId,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        status: 'ACTIVE'
      },
      create: {
        householdId: household3.id,
        packageVersionId: sampoornaPackage.activeVersionId,
        billingCycle: 'MONTHLY',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        status: 'ACTIVE'
      }
    });
  }
}
