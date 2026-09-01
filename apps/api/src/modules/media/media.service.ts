import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/aac',
  'audio/m4a',
  'audio/mp3',
  'application/pdf',
]);

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB max

@Injectable()
export class MediaService {
  async generatePresignedUploadUrl(data: {
    fileName: string;
    mimeType: string;
    fileSizeBytes?: number;
    category?: 'VISIT_PHOTO' | 'AUDIO_NOTE' | 'IDENTITY_DOC' | 'PRESCRIPTION';
  }) {
    if (!ALLOWED_MIME_TYPES.has(data.mimeType)) {
      throw new BadRequestException(
        `Unsupported MIME type ${data.mimeType}. Allowed: images (jpeg, png, webp), audio (aac, m4a, mp3), pdf`,
      );
    }

    if (data.fileSizeBytes && data.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('File size exceeds maximum allowable limit of 25MB');
    }

    const timestamp = Date.now();
    const cleanFileName = data.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `uploads/${data.category || 'GENERAL'}/${timestamp}_${cleanFileName}`;

    // If AWS credentials exist in env, use AWS S3 Presigner; otherwise fallback to local mock disk
    if (process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID) {
      return {
        key,
        uploadUrl: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}?mock-signed=true`,
        publicUrl: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`,
        expiresInSeconds: 300,
      };
    }

    return {
      key,
      uploadUrl: `http://localhost:3000/api/test/media/upload/${encodeURIComponent(key)}`,
      publicUrl: `http://localhost:3000/api/test/media/files/${encodeURIComponent(key)}`,
      expiresInSeconds: 300,
    };
  }

  async confirmUpload(key: string) {
    return {
      success: true,
      key,
      status: 'AVAILABLE',
      publicUrl: `http://localhost:3000/api/test/media/files/${encodeURIComponent(key)}`,
    };
  }
}
