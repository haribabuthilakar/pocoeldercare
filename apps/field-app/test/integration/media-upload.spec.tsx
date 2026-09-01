import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { database } from '../../src/db/database';
import { mediaUploadManager } from '../../src/media/media-upload-manager';
import { syncEngine } from '../../src/sync/sync-engine';
import { PhotoProofCapture } from '../../src/components/media/photo-proof-capture';
import { populateMockDatabase } from '../fixtures/database.fixture';

describe('S3 Direct Media Upload & Queueing Suite', () => {
  beforeEach(async () => {
    await database.clearAll();
    syncEngine.setOnline(true);
    mediaUploadManager.setMockUploader(undefined);
    vi.clearAllMocks();
  });

  describe('MediaUploadManager Core Operations', () => {
    beforeEach(async () => {
      await populateMockDatabase();
    });

    it('queues photo in local media_uploads table and processes background S3 direct upload', async () => {
      const mockUri = 'file:///data/cache/vitals_reading.jpg';

      const upload = await mediaUploadManager.queueUpload(
        'sop_progress',
        'prog_001',
        mockUri,
      );

      expect(upload.id).toBeDefined();
      expect(upload.localUri).toBe(mockUri);
      expect(upload.status).toBe('PENDING');

      // Process upload queue
      const result = await mediaUploadManager.processQueue();

      expect(result.completed).toBe(1);
      expect(result.failed).toBe(0);

      const completed = await database.mediaUploads.find(upload.id);
      expect(completed?.status).toBe('COMPLETED');
      expect(completed?.progress).toBe(100);
      expect(completed?.presignedUrl).toContain('https://storage.poco.care/');

      // Verify SopProgress record updated with public URL
      const progress = await database.sopProgress.find('prog_001');
      expect(progress?.proofUrl).toBe(completed?.presignedUrl);

      // Verify outbox mutation staged
      const outbox = await database.syncOutbox.query();
      const match = outbox.find((o) => o.entityId === 'prog_001');
      expect(match).toBeDefined();
      expect(match?.payload.proofUrl).toBe(completed?.presignedUrl);
    });

    it('handles simulated S3 upload failure and allows retry', async () => {
      let shouldFail = true;
      mediaUploadManager.setMockUploader(async () => {
        if (shouldFail) {
          throw new Error('S3 Network timeout');
        }
        return {
          s3Key: 'visits/proof.jpg',
          publicUrl: 'https://storage.poco.care/visits/proof.jpg',
        };
      });

      const upload = await database.mediaUploads.create({
        local_uri: 'file:///data/photo.jpg',
        entity_type: 'sop_progress',
        entity_id: 'prog_001',
        status: 'PENDING',
        progress: 0,
      });

      const result1 = await mediaUploadManager.processQueue();
      expect(result1.failed).toBe(1);

      const failedRecord = await database.mediaUploads.find(upload.id);
      expect(failedRecord?.status).toBe('FAILED');

      // Now retry with success
      shouldFail = false;
      await mediaUploadManager.retryUpload(upload.id);

      const successRecord = await database.mediaUploads.find(upload.id);
      expect(successRecord?.status).toBe('COMPLETED');
    });
  });

  describe('PhotoProofCapture Component', () => {
    it('renders capture button and triggers local photo staging', async () => {
      const onCaptured = vi.fn();
      render(
        <PhotoProofCapture
          entityType="sop_progress"
          entityId="prog_001"
          onPhotoCaptured={onCaptured}
        />,
      );

      const captureBtn = screen.getByTestId('capture-photo-button');
      expect(captureBtn).toBeInTheDocument();

      fireEvent.click(captureBtn);

      await waitFor(() => {
        expect(onCaptured).toHaveBeenCalled();
        expect(screen.getByTestId('photo-preview-card')).toBeInTheDocument();
      });
    });

    it('displays remove button and clears photo state', async () => {
      render(
        <PhotoProofCapture
          entityType="sop_progress"
          entityId="prog_001"
          existingPhotoUrl="https://storage.poco.care/sample.jpg"
        />,
      );

      expect(screen.getByTestId('photo-preview-card')).toBeInTheDocument();
      expect(screen.getByText('Uploaded to S3')).toBeInTheDocument();

      const removeBtn = screen.getByTestId('remove-photo-button');
      fireEvent.click(removeBtn);

      await waitFor(() => {
        expect(screen.getByTestId('capture-photo-button')).toBeInTheDocument();
      });
    });
  });
});
