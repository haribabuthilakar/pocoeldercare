import { database } from '../db/database';
import type { MediaUploadRecord, MediaUploadModel } from '../db/models/media-upload';
import { syncEngine } from '../sync/sync-engine';

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

export type MediaUploadListener = (uploads: MediaUploadModel[]) => void;

export class MediaUploadManager {
  private isProcessing: boolean = false;
  private listeners: Set<MediaUploadListener> = new Set();
  private mockUploader?: (
    localUri: string,
    onProgress: (progress: number) => void,
  ) => Promise<{ s3Key: string; publicUrl: string }>;

  constructor() {
    // Auto-process queue on network reconnection
    syncEngine.subscribe((state) => {
      if (state.isOnline) {
        this.processQueue();
      }
    });
  }

  public setMockUploader(
    uploader?: (
      localUri: string,
      onProgress: (progress: number) => void,
    ) => Promise<{ s3Key: string; publicUrl: string }>,
  ) {
    this.mockUploader = uploader;
  }

  public subscribe(listener: MediaUploadListener): () => void {
    this.listeners.add(listener);
    this.getQueue().then(listener);
    return () => this.listeners.delete(listener);
  }

  private async notify() {
    const queue = await this.getQueue();
    this.listeners.forEach((l) => l(queue));
  }

  public async getQueue(): Promise<MediaUploadModel[]> {
    return database.mediaUploads.query();
  }

  public async queueUpload(
    entityType: string,
    entityId: string,
    localUri: string,
    autoProcess: boolean = false,
  ): Promise<MediaUploadModel> {
    const upload = await database.mediaUploads.create({
      local_uri: localUri,
      entity_type: entityType,
      entity_id: entityId,
      status: 'PENDING',
      progress: 0,
    });

    this.notify();
    if (autoProcess && syncEngine.getState().isOnline) {
      await this.processQueue();
    }

    return upload;
  }

  public async processQueue(): Promise<{ completed: number; failed: number }> {
    if (this.isProcessing) return { completed: 0, failed: 0 };
    if (!syncEngine.getState().isOnline) return { completed: 0, failed: 0 };

    this.isProcessing = true;
    let completed = 0;
    let failed = 0;

    try {
      const pendingUploads = await database.mediaUploads.query(
        (u) => u.status === 'PENDING' || u.status === 'FAILED',
      );

      for (const upload of pendingUploads) {
        try {
          await database.mediaUploads.update(upload.id, {
            status: 'UPLOADING',
            progress: 10,
          });
          this.notify();

          let uploadResult: { s3Key: string; publicUrl: string };

          if (this.mockUploader) {
            uploadResult = await this.mockUploader(upload.localUri, async (prog) => {
              await database.mediaUploads.update(upload.id, { progress: prog });
              this.notify();
            });
          } else {
            // Default realistic S3 direct presigned PUT simulation
            uploadResult = await this.defaultUploadHandler(upload.localUri, async (prog) => {
              await database.mediaUploads.update(upload.id, { progress: prog });
              this.notify();
            });
          }

          // Mark upload completed
          await database.mediaUploads.update(upload.id, {
            status: 'COMPLETED',
            progress: 100,
            s3_key: uploadResult.s3Key,
            presigned_url: uploadResult.publicUrl,
          });

          // Link public URL back to parent entity (e.g. SopProgress)
          if (upload.entityType === 'sop_progress') {
            await database.sopProgress.update(upload.entityId, {
              proof_url: uploadResult.publicUrl,
              synced: false,
            });

            // Stage sync mutation
            await database.stageMutation('SOP_PROGRESS', 'sop_progress', upload.entityId, {
              proofUrl: uploadResult.publicUrl,
              s3Key: uploadResult.s3Key,
            });
          }

          completed++;
        } catch {
          await database.mediaUploads.update(upload.id, {
            status: 'FAILED',
            progress: 0,
          });
          failed++;
        }
      }
    } finally {
      this.isProcessing = false;
      this.notify();
    }

    return { completed, failed };
  }

  private async defaultUploadHandler(
    localUri: string,
    onProgress: (prog: number) => void,
  ): Promise<{ s3Key: string; publicUrl: string }> {
    onProgress(35);
    // Simulate network latency for direct PUT
    await new Promise((r) => setTimeout(r, 50));
    onProgress(75);
    await new Promise((r) => setTimeout(r, 50));

    const s3Key = `visits/photos/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
    const publicUrl = `https://storage.poco.care/${s3Key}`;
    onProgress(100);
    return { s3Key, publicUrl };
  }

  public async retryUpload(uploadId: string): Promise<{ completed: number; failed: number }> {
    await database.mediaUploads.update(uploadId, { status: 'PENDING', progress: 0 });
    return this.processQueue();
  }
}

export const mediaUploadManager = new MediaUploadManager();
export default mediaUploadManager;
