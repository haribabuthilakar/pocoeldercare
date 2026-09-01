import { PrismaClient } from '@prisma/client';
import { seedStaff } from './seeds/staff';
import { seedCatalog } from './seeds/catalog';
import { seedPackages } from './seeds/packages';
import { seedPartners } from './seeds/partners';
import { seedRealistic } from './seeds/realistic';
import { seedMediaFixtures } from './seeds/media-fixtures';

const prisma = new PrismaClient();

export async function truncateAllTables(prisma: PrismaClient): Promise<void> {
  console.log('🧹 Truncating all tables in FK-safe topological order...');
  const tableNames = [
    'media_attachments',
    'audit_logs',
    'outbound_integration_calls',
    'webhook_events',
    'activity_feed_items',
    'senior_vital_readings',
    'ticket_sop_progress',
    'care_officer_visit_logs',
    'service_requests',
    'tickets',
    'wallet_transactions',
    'household_wallets',
    'household_subscriptions',
    'package_service_quotas',
    'senior_medical_profiles',
    'seniors',
    'family_escalation_tiers',
    'household_memberships',
    'care_officer_certifications',
    'onboarding_visits',
    'leads',
    'households',
    'persons',
    'care_officer_profiles',
    'internal_user_roles',
    'internal_users',
    'package_versions',
    'subscription_packages',
    'sop_step_versions',
    'service_catalog_versions',
    'service_catalogs',
    'certifications',
    'integration_partners',
    'system_configs'
  ];

  for (const table of tableNames) {
    try {
      await prisma.$executeRawUnsafe('TRUNCATE TABLE "' + table + '" CASCADE;');
    } catch (e) {
      // Table might not exist yet if fresh
    }
  }
  console.log('   ✅ Tables truncated cleanly.');
}

export async function main() {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_SEED) {
    console.error('❌ SEED ABORTED: Running seed scripts against production databases is strictly prohibited per D-136.');
    process.exit(1);
  }

  const isQuick = process.argv.includes('--quick') || process.env.QUICK_SEED === 'true';
  console.log(`🚀 Starting Poco Elder Care database seeding (${isQuick ? 'QUICK MODE' : 'FULL SCALED MODE'})...\n`);
  const startTime = Date.now();

  try {
    await truncateAllTables(prisma);

    console.log('1/6 Seeding service catalog, SOP steps, and certifications...');
    await seedCatalog(prisma);
    await seedPackages(prisma);

    console.log('2/6 Seeding integration partners...');
    await seedPartners(prisma);

    console.log('3/6 Seeding staff accounts and supervisor hierarchy...');
    await seedStaff(prisma);

    console.log('4/6 Seeding realistic households, clinical records, and tickets...');
    await seedRealistic(prisma, isQuick);

    console.log('5/6 Seeding and syncing mock media fixtures to local storage...');
    await seedMediaFixtures(prisma);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 Seeding completed successfully in ${elapsed}s!\n`);
    console.log('📋 DEMO CREDENTIALS:');
    console.log('------------------------------------------------------------');
    console.log('Super Admin:    admin@pocoeldercare.com     / PocoCare123!');
    console.log('Ops Manager:    ops@pocoeldercare.com       / PocoCare123!');
    console.log('Care Manager:   manager@pocoeldercare.com   / PocoCare123!');
    console.log('Lead Officer:   leadcare@pocoeldercare.com  / PocoCare123!');
    console.log('Care Officer 1: officer1@pocoeldercare.com  / PocoCare123!');
    console.log('Family 1:       family1@pocoeldercare.com   / PocoCare123!');
    console.log('------------------------------------------------------------');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch(() => process.exit(1));
}
