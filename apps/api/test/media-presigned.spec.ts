import { describe, it, expect, beforeAll } from 'vitest';
import { PrismaClient } from '@poco/database';
import { MediaService } from '../src/modules/media/media.service';

describe('Real PostgreSQL Integration: Media Uploads & Presigned URLs (TEST-04, D-13, D-14)', () => {
  let prisma: PrismaClient;
  let mediaService: MediaService;

  beforeAll(() => {
    prisma = new PrismaClient();
    mediaService = new MediaService();
  });

  it('generates direct presigned upload URL and rejects invalid mime types or excessive sizes', async () => {
    // 1. Valid Image Upload URL
    const imageUpload = await mediaService.generatePresignedUploadUrl({
      fileName: 'blood_pressure_reading.jpg',
      mimeType: 'image/jpeg',
      fileSizeBytes: 1024 * 1024 * 2, // 2MB
      category: 'VISIT_PHOTO',
    });

    expect(imageUpload.key).toContain('uploads/VISIT_PHOTO/');
    expect(imageUpload.uploadUrl).toBeDefined();
    expect(imageUpload.publicUrl).toBeDefined();
    expect(imageUpload.expiresInSeconds).toBe(300);

    // 2. Reject unsupported executable MIME type
    await expect(
      mediaService.generatePresignedUploadUrl({
        fileName: 'malicious.exe',
        mimeType: 'application/x-msdownload',
      }),
    ).rejects.toThrow();

    // 3. Reject oversized payload (>25MB)
    await expect(
      mediaService.generatePresignedUploadUrl({
        fileName: 'huge_video.mp4',
        mimeType: 'image/jpeg',
        fileSizeBytes: 30 * 1024 * 1024, // 30MB
      }),
    ).rejects.toThrow();
  });

  it('verifies seeded mock media fixture records in PostgreSQL database', async () => {
    const fixtures = await prisma.mediaAttachment.findMany();
    expect(fixtures.length).toBeGreaterThanOrEqual(5);

    const seniorAvatar = fixtures.find(f => f.s3Key === 'media/avatars/senior_ramamurthy.jpg');
    expect(seniorAvatar).toBeDefined();
    expect(seniorAvatar?.mimeType).toBe('image/jpeg');

    const audioNote = fixtures.find(f => f.s3Key === 'media/audio/officer_voice_note_h1.m4a');
    expect(audioNote).toBeDefined();
    expect(audioNote?.mimeType).toBe('audio/m4a');
  });
});
