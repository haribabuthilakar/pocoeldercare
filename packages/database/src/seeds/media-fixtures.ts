import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export async function seedMediaFixtures(prisma: PrismaClient): Promise<void> {
  // Locate monorepo root by walking up until package.json with workspaces or pnpm-workspace.yaml
  let currentDir = __dirname;
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.join(currentDir, 'pnpm-workspace.yaml')) || fs.existsSync(path.join(currentDir, 'turbo.json'))) {
      break;
    }
    currentDir = path.dirname(currentDir);
  }
  const rootDir = currentDir;
  const uploadsDir = path.resolve(rootDir, 'uploads');
  const apiUploadsDir = path.resolve(rootDir, 'apps/api/uploads');

  for (const dir of [uploadsDir, apiUploadsDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const sampleFixtures = [
    {
      key: 'media/avatars/senior_ramamurthy.jpg',
      content: 'MOCK_JPEG_BINARY_DATA_SENIOR_AVATAR_RAMAMURTHY',
      mimeType: 'image/jpeg',
      fileSize: 45200,
      entityType: 'SENIOR_PROFILE',
      entityId: 's0000001-0000-4000-a000-000000000001',
      uploaderId: '11111111-1111-4111-a111-111111111111'
    },
    {
      key: 'media/avatars/officer_karthik.jpg',
      content: 'MOCK_JPEG_BINARY_DATA_OFFICER_AVATAR_KARTHIK',
      mimeType: 'image/jpeg',
      fileSize: 51400,
      entityType: 'OFFICER_PROFILE',
      entityId: '44444444-4444-4444-a444-444444444444',
      uploaderId: '11111111-1111-4111-a111-111111111111'
    },
    {
      key: 'media/prescriptions/prescription_h1_dr_sharma.jpg',
      content: 'MOCK_JPEG_BINARY_DATA_PRESCRIPTION_SLIP_DR_SHARMA',
      mimeType: 'image/jpeg',
      fileSize: 84000,
      entityType: 'SERVICE_REQUEST',
      entityId: 'b0000005-0000-4000-a000-000000000005',
      uploaderId: '44444444-4444-4444-a444-444444444444'
    },
    {
      key: 'media/sop_proofs/bp_monitor_reading_h1.jpg',
      content: 'MOCK_JPEG_BINARY_DATA_BP_MONITOR_DIGITAL_DISPLAY_135_85',
      mimeType: 'image/jpeg',
      fileSize: 62000,
      entityType: 'VISIT_STEP_PROOF',
      entityId: 'f0000001-0000-4000-a000-000000000001',
      uploaderId: '44444444-4444-4444-a444-444444444444'
    },
    {
      key: 'media/audio/officer_voice_note_h1.m4a',
      content: 'MOCK_M4A_AUDIO_BINARY_DATA_VOICE_UPDATE_RAMAMURTHY_WALK',
      mimeType: 'audio/m4a',
      fileSize: 128000,
      entityType: 'ACTIVITY_FEED_ITEM',
      entityId: 'f0000001-0000-4000-a000-000000000001',
      uploaderId: '44444444-4444-4444-a444-444444444444'
    },
    {
      key: 'media/records/health_summary_ramamurthy.pdf',
      content: 'MOCK_PDF_BINARY_DATA_GERIATRIC_WELLNESS_SUMMARY_RAMAMURTHY_NAIR',
      mimeType: 'application/pdf',
      fileSize: 240000,
      entityType: 'SENIOR_MEDICAL_RECORD',
      entityId: 's0000001-0000-4000-a000-000000000001',
      uploaderId: '11111111-1111-4111-a111-111111111111'
    }
  ];

  for (const fixture of sampleFixtures) {
    for (const dir of [uploadsDir, apiUploadsDir]) {
      const filePath = path.join(dir, fixture.key);
      const parentDir = path.dirname(filePath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(filePath, fixture.content, 'utf-8');
    }

    await prisma.mediaAttachment.upsert({
      where: { s3Key: fixture.key },
      update: {
        mimeType: fixture.mimeType,
        fileSize: fixture.fileSize,
        entityType: fixture.entityType,
        entityId: fixture.entityId,
        uploaderId: fixture.uploaderId
      },
      create: {
        s3Key: fixture.key,
        mimeType: fixture.mimeType,
        fileSize: fixture.fileSize,
        entityType: fixture.entityType,
        entityId: fixture.entityId,
        uploaderId: fixture.uploaderId
      }
    });
  }
}
