import React, { useState, useEffect } from 'react';
import { mediaUploadManager } from '../../media/media-upload-manager';
import type { MediaUploadModel } from '../../db/models/media-upload';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

export interface PhotoProofCaptureProps {
  entityType: string;
  entityId: string;
  existingPhotoUrl?: string;
  onPhotoCaptured?: (localUri: string) => void;
  label?: string;
}

export const PhotoProofCapture: React.FC<PhotoProofCaptureProps> = ({
  entityType,
  entityId,
  existingPhotoUrl,
  onPhotoCaptured,
  label = 'Capture Proof Photo',
}) => {
  const [localUri, setLocalUri] = useState<string | null>(existingPhotoUrl || null);
  const [activeUpload, setActiveUpload] = useState<MediaUploadModel | null>(null);

  useEffect(() => {
    const unsub = mediaUploadManager.subscribe((uploads) => {
      const current = uploads.find(
        (u) => u.entityType === entityType && u.entityId === entityId,
      );
      if (current) {
        setActiveUpload(current);
        if (current.presignedUrl && !localUri) {
          setLocalUri(current.presignedUrl);
        }
      }
    });

    return () => unsub();
  }, [entityType, entityId, localUri]);

  const handleSimulateCapture = async () => {
    // Generate simulated camera photo local URI
    const mockUri = `file:///data/user/0/care.poco.field/cache/photo_${Date.now()}.jpg`;
    setLocalUri(mockUri);
    onPhotoCaptured?.(mockUri);

    // Queue for background S3 upload
    await mediaUploadManager.queueUpload(entityType, entityId, mockUri);
  };

  const handleRemovePhoto = () => {
    setLocalUri(null);
    setActiveUpload(null);
  };

  const isUploading = activeUpload?.status === 'UPLOADING';
  const isCompleted = activeUpload?.status === 'COMPLETED' || (!!existingPhotoUrl && !activeUpload);
  const isFailed = activeUpload?.status === 'FAILED';

  return (
    <div className="space-y-2.5" data-testid="photo-proof-capture-container">
      {label && (
        <label className="block text-xs font-semibold text-slate-700">{label}</label>
      )}

      {localUri ? (
        <div
          data-testid="photo-preview-card"
          className="relative bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3 overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-400 flex-shrink-0">
              <ImageIcon className="w-8 h-8" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Uploaded to S3
                  </span>
                )}
                {isUploading && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
                    Uploading ({activeUpload?.progress || 0}%)
                  </span>
                )}
                {isFailed && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    Upload Failed
                  </span>
                )}
                {!isCompleted && !isUploading && !isFailed && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                    Cached Locally
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 font-mono truncate mt-1">{localUri}</p>
            </div>

            {/* Remove / Retake Actions */}
            <button
              type="button"
              data-testid="remove-photo-button"
              onClick={handleRemovePhoto}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Remove photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                data-testid="photo-upload-progress"
                className="bg-blue-600 h-full rounded-full transition-all duration-200"
                style={{ width: `${activeUpload?.progress || 0}%` }}
              />
            </div>
          )}

          {isFailed && (
            <button
              type="button"
              data-testid="retry-upload-button"
              onClick={() => activeUpload && mediaUploadManager.retryUpload(activeUpload.id)}
              className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry Upload
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          data-testid="capture-photo-button"
          onClick={handleSimulateCapture}
          className="w-full py-5 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center gap-2 bg-white hover:bg-emerald-50/20 text-slate-600 hover:text-emerald-700 transition-colors shadow-2xs group"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
            <Camera className="w-5 h-5" />
          </div>
          <div className="text-center">
            <span className="text-xs font-bold block">{label}</span>
            <span className="text-[11px] text-slate-400">
              Direct S3 presigned upload (offline queued)
            </span>
          </div>
        </button>
      )}
    </div>
  );
};
export default PhotoProofCapture;
