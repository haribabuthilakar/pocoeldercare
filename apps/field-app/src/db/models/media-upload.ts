export interface MediaUploadRecord {
  id: string;
  local_uri: string;
  s3_key?: string;
  presigned_url?: string;
  status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  entity_type: string;
  entity_id: string;
  progress: number;
}

export class MediaUploadModel {
  static table = 'media_uploads';

  constructor(public raw: MediaUploadRecord) {}

  get id(): string {
    return this.raw.id;
  }
  get localUri(): string {
    return this.raw.local_uri;
  }
  get s3Key(): string | undefined {
    return this.raw.s3_key;
  }
  get presignedUrl(): string | undefined {
    return this.raw.presigned_url;
  }
  get status(): MediaUploadRecord['status'] {
    return this.raw.status;
  }
  get entityType(): string {
    return this.raw.entity_type;
  }
  get entityId(): string {
    return this.raw.entity_id;
  }
  get progress(): number {
    return this.raw.progress;
  }
}
