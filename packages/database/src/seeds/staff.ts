import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserRole, CertificationStatus } from '@poco/constants';

export const SEED_STAFF = {
  admin: {
    id: '11111111-1111-4111-a111-111111111111',
    email: 'admin@pocoeldercare.com',
    fullName: 'Rajesh Sharma',
    phone: '9876500001',
    roles: [UserRole.SUPER_ADMIN]
  },
  opsManager: {
    id: '22222222-2222-4222-a222-222222222222',
    email: 'ops@pocoeldercare.com',
    fullName: 'Priya Venkatesh',
    phone: '9876500002',
    roles: [UserRole.OPS_MANAGER]
  },
  careManager: {
    id: '33333333-3333-4333-a333-333333333333',
    email: 'manager@pocoeldercare.com',
    fullName: 'Ananya Deshmukh',
    phone: '9876500003',
    roles: [UserRole.CARE_MANAGER]
  },
  careOfficer: {
    id: '44444444-4444-4444-a444-444444444444',
    email: 'officer@pocoeldercare.com',
    fullName: 'Karthik Raman',
    phone: '9876500004',
    roles: [UserRole.CARE_OFFICER],
    profile: {
      id: '44444444-4444-4444-b444-444444444444',
      phone: '9876500004',
      clusterCode: 'South Bangalore',
      isAvailable: true,
      homeBaseLat: 12.9279,
      homeBaseLng: 77.6271
    }
  }
};

export async function seedStaff(prisma: PrismaClient): Promise<void> {
  const passwordHash = await bcrypt.hash('PocoCare123!', 10);

  // 1. Seed Super Admin
  await prisma.internalUser.upsert({
    where: { email: SEED_STAFF.admin.email },
    update: { name: SEED_STAFF.admin.fullName, passwordHash },
    create: {
      id: SEED_STAFF.admin.id,
      email: SEED_STAFF.admin.email,
      name: SEED_STAFF.admin.fullName,
      phone: SEED_STAFF.admin.phone,
      passwordHash,
      roles: {
        create: SEED_STAFF.admin.roles.map((role) => ({ role }))
      }
    }
  });

  // 2. Seed Ops Manager
  await prisma.internalUser.upsert({
    where: { email: SEED_STAFF.opsManager.email },
    update: { name: SEED_STAFF.opsManager.fullName, passwordHash },
    create: {
      id: SEED_STAFF.opsManager.id,
      email: SEED_STAFF.opsManager.email,
      name: SEED_STAFF.opsManager.fullName,
      phone: SEED_STAFF.opsManager.phone,
      passwordHash,
      roles: {
        create: SEED_STAFF.opsManager.roles.map((role) => ({ role }))
      }
    }
  });

  // 3. Seed Care Manager
  await prisma.internalUser.upsert({
    where: { email: SEED_STAFF.careManager.email },
    update: { name: SEED_STAFF.careManager.fullName, passwordHash },
    create: {
      id: SEED_STAFF.careManager.id,
      email: SEED_STAFF.careManager.email,
      name: SEED_STAFF.careManager.fullName,
      phone: SEED_STAFF.careManager.phone,
      passwordHash,
      roles: {
        create: SEED_STAFF.careManager.roles.map((role) => ({ role }))
      }
    }
  });

  // 4. Seed Care Officer with Profile and Certifications
  const officerUser = await prisma.internalUser.upsert({
    where: { email: SEED_STAFF.careOfficer.email },
    update: { name: SEED_STAFF.careOfficer.fullName, passwordHash },
    create: {
      id: SEED_STAFF.careOfficer.id,
      email: SEED_STAFF.careOfficer.email,
      name: SEED_STAFF.careOfficer.fullName,
      phone: SEED_STAFF.careOfficer.phone,
      passwordHash,
      roles: {
        create: SEED_STAFF.careOfficer.roles.map((role) => ({ role }))
      }
    }
  });

  const profile = await prisma.careOfficerProfile.upsert({
    where: { internalUserId: officerUser.id },
    update: {
      clusterCode: SEED_STAFF.careOfficer.profile.clusterCode,
      isAvailable: SEED_STAFF.careOfficer.profile.isAvailable
    },
    create: {
      id: SEED_STAFF.careOfficer.profile.id,
      internalUserId: officerUser.id,
      phone: SEED_STAFF.careOfficer.profile.phone,
      clusterCode: SEED_STAFF.careOfficer.profile.clusterCode,
      isAvailable: SEED_STAFF.careOfficer.profile.isAvailable,
      homeBaseLat: SEED_STAFF.careOfficer.profile.homeBaseLat,
      homeBaseLng: SEED_STAFF.careOfficer.profile.homeBaseLng
    }
  });

  // Seed unexpired certifications for the officer
  const certExpiry = new Date();
  certExpiry.setFullYear(certExpiry.getFullYear() + 2); // Valid for 2 years

  const certRecords = await prisma.certification.findMany();

  for (const cert of certRecords) {
    await prisma.careOfficerCertification.upsert({
      where: {
        careOfficerId_certificationId: {
          careOfficerId: profile.id,
          certificationId: cert.id
        }
      },
      update: {
        expiresAt: certExpiry,
        status: CertificationStatus.ACTIVE
      },
      create: {
        careOfficerId: profile.id,
        certificationId: cert.id,
        issuedAt: new Date(),
        expiresAt: certExpiry,
        status: CertificationStatus.ACTIVE
      }
    });
  }
}
