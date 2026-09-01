import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserRole, FamilyRole, TicketStatus, ServiceRequestStatus, TicketPriority, SlaStatus, TriageStatus, ActivityActorType, ActivityEventType, VitalType, VitalSeverity, VitalSource, BillingCycle, SubscriptionStatus, CertificationStatus } from '@poco/constants';
import { SEED_STAFF } from './staff';

export async function seedRealistic(prisma: PrismaClient, isQuick: boolean = false): Promise<void> {
  const officerCount = isQuick ? 5 : 50;
  const householdCount = isQuick ? 10 : 200;

  console.log(`🌱 Generating ${isQuick ? 'QUICK DEV' : 'FULL REALISTIC'} seed data (~${officerCount} officers, ~${householdCount} households)...`);
  const passwordHash = await bcrypt.hash('PocoCare123!', 10);

  const packages = await prisma.package.findMany({ include: { versions: true } });
  const kavachPackage = packages.find(p => p.code === 'KAVACH');
  const saharaPackage = packages.find(p => p.code === 'SAHARA');
  const sampoornaPackage = packages.find(p => p.code === 'SAMPOORNA');

  const services = await prisma.serviceCatalog.findMany({ include: { versions: true } });
  const certifications = await prisma.certification.findMany();

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // 1. Seed Core Internal Role Users (>=2 users per role per D-08 / TEST-01)
  const roleAccounts = [
    { email: 'admin@pocoeldercare.com', name: 'Rajesh Sharma (Admin)', roles: [UserRole.SUPER_ADMIN] },
    { email: 'admin2@pocoeldercare.com', name: 'Sanjay Gupta (Admin 2)', roles: [UserRole.SUPER_ADMIN] },
    { email: 'ops@pocoeldercare.com', name: 'Priya Venkatesh (Ops)', roles: [UserRole.OPS_MANAGER] },
    { email: 'ops2@pocoeldercare.com', name: 'Rohan Mehra (Ops 2)', roles: [UserRole.OPS_MANAGER] },
    { email: 'manager@pocoeldercare.com', name: 'Ananya Deshmukh (Care Manager)', roles: [UserRole.CARE_MANAGER] },
    { email: 'manager2@pocoeldercare.com', name: 'Deepak Verma (Care Manager 2)', roles: [UserRole.CARE_MANAGER] },
    { email: 'sales@pocoeldercare.com', name: 'Vikram Joshi (Sales Lead)', roles: [UserRole.SALES_LEAD] },
    { email: 'sales2@pocoeldercare.com', name: 'Neha Kapoor (Sales 2)', roles: [UserRole.SALES_LEAD] },
    { email: 'leadcare@pocoeldercare.com', name: 'Major Arvind Swamy (Senior Care Officer)', roles: [UserRole.CARE_OFFICER] }
  ];

  for (const acc of roleAccounts) {
    const user = await prisma.internalUser.upsert({
      where: { email: acc.email },
      update: { name: acc.name, passwordHash },
      create: {
        email: acc.email,
        name: acc.name,
        phone: '9876540000',
        passwordHash,
        roles: {
          create: acc.roles.map((role) => ({ role }))
        }
      }
    });

    if (acc.email === 'leadcare@pocoeldercare.com') {
      await prisma.careOfficerProfile.upsert({
        where: { internalUserId: user.id },
        update: {},
        create: {
          internalUserId: user.id,
          phone: '9876540000',
          homeBaseLat: 12.9716,
          homeBaseLng: 77.5946,
          clusterCode: 'BANGALORE_CENTRAL',
          isAvailable: true
        }
      });
    }
  }

  const supervisorUser = await prisma.internalUser.findUnique({ where: { email: 'leadcare@pocoeldercare.com' }, include: { careOfficerProfile: true } });
  const supervisorProfileId = supervisorUser?.careOfficerProfile?.id;

  // 2. Seed Care Officers with Profiles and Certifications
  const officerProfileIds: string[] = [];
  const territories = ['South Bangalore', 'East Bangalore', 'Central Mumbai', 'South Delhi', 'Central Chennai', 'Cyberabad'];
  const certExpiry = new Date();
  certExpiry.setFullYear(certExpiry.getFullYear() + 2);

  for (let i = 1; i <= officerCount; i++) {
    const code = i.toString().padStart(3, '0');
    const officerEmail = `officer${i}@pocoeldercare.com`;
    const officerUser = await prisma.internalUser.upsert({
      where: { email: officerEmail },
      update: { name: `Care Officer ${code}`, passwordHash },
      create: {
        email: officerEmail,
        name: `Care Officer ${code}`,
        phone: `9876510${code}`,
        passwordHash,
        roles: {
          create: [{ role: UserRole.CARE_OFFICER }]
        }
      }
    });

    const officerProfile = await prisma.careOfficerProfile.upsert({
      where: { internalUserId: officerUser.id },
      update: {
        managerId: supervisorProfileId,
        isAvailable: true
      },
      create: {
        internalUserId: officerUser.id,
        managerId: supervisorProfileId,
        phone: `9876510${code}`,
        homeBaseLat: 12.9 + (i * 0.002),
        homeBaseLng: 77.6 + (i * 0.002),
        clusterCode: territories[i % territories.length],
        isAvailable: true
      }
    });

    // Seed certifications for officer
    for (const cert of certifications) {
      await prisma.careOfficerCertification.upsert({
        where: {
          careOfficerId_certificationId: {
            careOfficerId: officerProfile.id,
            certificationId: cert.id
          }
        },
        update: { expiresAt: certExpiry, status: CertificationStatus.ACTIVE },
        create: {
          careOfficerId: officerProfile.id,
          certificationId: cert.id,
          issuedAt: new Date(),
          expiresAt: certExpiry,
          status: CertificationStatus.ACTIVE
        }
      });
    }

    officerProfileIds.push(officerProfile.id);
  }

  // 3. Seed Households, Seniors, Medical Profiles, Vitals, Subscriptions & Wallets
  const firstNames = ['Ramesh', 'Suresh', 'Kavitha', 'Meenakshi', 'Subramanian', 'Rajalakshmi', 'Devendra', 'Kamala', 'Anand', 'Shanti', 'Bhaskar', 'Gayatri'];
  const lastNames = ['Sharma', 'Iyer', 'Nair', 'Banerjee', 'Patel', 'Reddy', 'Khan', 'Deshmukh', 'Chatterjee', 'Venkatesh'];
  const cities = [
    { city: 'Bangalore', state: 'Karnataka', pin: '560034', lat: 12.9279, lng: 77.6271 },
    { city: 'Mumbai', state: 'Maharashtra', pin: '400050', lat: 19.0596, lng: 72.8295 },
    { city: 'Delhi NCR', state: 'Delhi', pin: '110017', lat: 28.5355, lng: 77.2100 },
    { city: 'Chennai', state: 'Tamil Nadu', pin: '600028', lat: 13.0418, lng: 80.2544 },
    { city: 'Hyderabad', state: 'Telangana', pin: '500081', lat: 17.4435, lng: 78.3772 }
  ];
  const chronicList = [
    ['Type 2 Diabetes', 'Hypertension'],
    ['Osteoarthritis', 'Mild Cognitive Impairment'],
    ['Cardiac Arrhythmia', 'Hypercholesterolemia'],
    ['Dementia', 'Hypertension', 'Severe Osteoporosis'],
    ['Chronic Kidney Disease (Stage 3)', 'Diabetes']
  ];

  for (let h = 1; h <= householdCount; h++) {
    const hCode = h.toString().padStart(4, '0');
    const loc = cities[h % cities.length];
    // Strict 1:1 household-to-care-officer mapping invariant
    const assignedOfficerProfileId = h <= officerProfileIds.length ? officerProfileIds[h - 1] : null;
    const famLastName = lastNames[h % lastNames.length];
    const famFirstName = firstNames[h % firstNames.length];

    const person = await prisma.person.upsert({
      where: { phone: `987652${hCode}` },
      update: { name: `${famFirstName} ${famLastName}`, email: `family${h}@pocoeldercare.com` },
      create: {
        phone: `987652${hCode}`,
        name: `${famFirstName} ${famLastName}`,
        email: `family${h}@pocoeldercare.com`
      }
    });

    const household = await prisma.household.upsert({
      where: { id: `a0000000-0000-4000-b000-${hCode.padStart(12, '0')}` },
      update: { assignedCareOfficerId: assignedOfficerProfileId },
      create: {
        id: `a0000000-0000-4000-b000-${hCode.padStart(12, '0')}`,
        name: `${famLastName} Family Household`,
        addressLine1: `${(h * 7) % 150 + 1}, Garden Road`,
        city: loc.city,
        state: loc.state,
        postalCode: loc.pin,
        latitude: loc.lat + ((h % 20) * 0.001),
        longitude: loc.lng + ((h % 20) * 0.001),
        assignedCareOfficerId: assignedOfficerProfileId
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

    // Seed 1-2 Seniors per household
    const seniorCount = (h % 3 === 0) ? 2 : 1;
    const seniorIds: string[] = [];

    for (let s = 1; s <= seniorCount; s++) {
      const seniorGender = s === 1 ? 'MALE' : 'FEMALE';
      const seniorName = s === 1 ? `Elder ${famFirstName} ${famLastName}` : `Mrs. ${famLastName}`;
      const senior = await prisma.senior.create({
        data: {
          householdId: household.id,
          name: seniorName,
          dateOfBirth: new Date(1940 + (h % 20), (h % 12), (h % 28) + 1),
          gender: seniorGender,
          bloodGroup: s === 1 ? 'B+' : 'O+',
          medicalProfile: {
            create: {
              abhaId: `91-${(1000 + h).toString()}-${(2000 + h).toString()}-${(3000 + s).toString()}`,
              allergies: h % 4 === 0 ? ['Penicillin', 'Sulfa'] : [],
              chronicConditions: chronicList[h % chronicList.length],
              iceContactName: `${famFirstName} ${famLastName}`,
              iceContactPhone: `987652${hCode}`,
              iceRelationship: 'Son/Daughter'
            }
          }
        }
      });
      seniorIds.push(senior.id);

      // Seed 3 historic vitals
      await prisma.seniorVitalReading.create({
        data: {
          seniorId: senior.id,
          vitalType: VitalType.BLOOD_PRESSURE,
          numericValue: 130 + (h % 25),
          unit: 'mmHg',
          severity: (h % 5 === 0) ? VitalSeverity.ATTENTION : VitalSeverity.NORMAL,
          source: VitalSource.MANUAL,
          recordedAt: new Date(Date.now() - 86400000 * 2)
        }
      });
    }

    // Seed Wallet
    const walletBalance = (h % 4 === 0) ? 50000 : 500000; // ₹500 or ₹5,000
    await prisma.householdWallet.upsert({
      where: { householdId: household.id },
      update: {},
      create: {
        householdId: household.id,
        balancePaise: walletBalance,
        creditLimitPaise: 0
      }
    });

    // Seed Subscription
    const chosenPkg = (h % 3 === 0) ? sampoornaPackage : (h % 2 === 0 ? saharaPackage : kavachPackage);
    const chosenVersion = chosenPkg?.versions[0];
    if (chosenVersion) {
      await prisma.householdSubscription.create({
        data: {
          householdId: household.id,
          packageVersionId: chosenVersion.id,
          billingCycle: BillingCycle.MONTHLY,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          status: SubscriptionStatus.ACTIVE
        }
      });
    }

    // Seed Tickets across operational spectrum (D-03)
    if (h % 2 === 0 && services.length > 0) {
      const chosenService = services[h % services.length];
      const activeVersion = chosenService.versions[0];

      const ticketPriority = (h % 6 === 0) ? TicketPriority.EMERGENCY : TicketPriority.ROUTINE;
      const slaStatus = (h % 8 === 0) ? SlaStatus.BREACHED : ((h % 4 === 0) ? SlaStatus.AT_RISK : SlaStatus.NORMAL);
      const ticketStatus = slaStatus === SlaStatus.BREACHED ? TicketStatus.IN_PROGRESS : TicketStatus.OPEN;

      const ticket = await prisma.ticket.create({
        data: {
          householdId: household.id,
          seniorId: seniorIds[0],
          title: `${chosenService.name} for ${famLastName} family`,
          description: `Routine scheduled ${chosenService.name} visit.`,
          category: chosenService.category,
          priority: ticketPriority,
          status: ticketStatus,
          slaStatus,
          responseDueAt: new Date(Date.now() - 3600000),
          deliveryDueAt: new Date(Date.now() + 7200000),
          assignedCareOfficerId: assignedOfficerProfileId,
          serviceRequests: {
            create: [
              {
                serviceCatalogVersionId: activeVersion.id,
                status: ServiceRequestStatus.IN_PROGRESS,
                unitPricePaise: activeVersion.pricePaise,
                assignedCareOfficerId: assignedOfficerProfileId
              }
            ]
          }
        }
      });

      // Seed Multilingual Activity Feed Chat (D-04)
      await prisma.activityFeedItem.create({
        data: {
          householdId: household.id,
          actorType: ActivityActorType.PERSON,
          actorId: person.id,
          senderName: person.name,
          eventType: ActivityEventType.MESSAGE,
          content: h % 2 === 0 ? "Namaste, please check Dad's BP medicines today. Unka sugar bhi check kar lena." : 'Hello, Care Officer visit was very good today. Thank you!',
          aiTriageStatus: TriageStatus.CONFIRMED,
          linkedTicketId: ticket.id
        }
      });
    }
  }

  console.log(`✅ ${isQuick ? 'Quick' : 'Realistic'} seed populated successfully.`);
}
