'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
} from '@poco/ui';
import { Image as ImageIcon, Volume2, ZoomIn, ZoomOut, RotateCcw, FileText } from 'lucide-react';

export interface MediaAsset {
  id: string;
  title: string;
  type: 'PHOTO' | 'AUDIO' | 'DOCUMENT';
  url: string;
  uploadedAt?: string;
  officerName?: string;
  notes?: string;
}

export interface MediaViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: MediaAsset | null;
}

export function MediaViewerModal({
  open,
  onOpenChange,
  asset,
}: MediaViewerModalProps) {
  const [zoomLevel, setZoomLevel] = React.useState(1);

  React.useEffect(() => {
    setZoomLevel(1);
  }, [asset]);

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base text-slate-900">
            {asset.type === 'PHOTO' && <ImageIcon className="w-4 h-4 text-[#12C395]" />}
            {asset.type === 'AUDIO' && <Volume2 className="w-4 h-4 text-blue-500" />}
            {asset.type === 'DOCUMENT' && <FileText className="w-4 h-4 text-purple-500" />}
            <span>{asset.title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {asset.officerName ? `Uploaded by ${asset.officerName}` : 'Field Media Attachment'}
            {asset.uploadedAt && ` • ${new Date(asset.uploadedAt).toLocaleString()}`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3">
          {asset.type === 'PHOTO' && (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[480px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.title}
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="max-h-[440px] max-w-full object-contain transition-transform duration-200"
                />
              </div>

              {/* Zoom & Pan Controls */}
              <div className="flex items-center justify-center space-x-2 bg-slate-100 p-1.5 rounded-lg">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2"
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                >
                  <ZoomOut className="w-3.5 h-3.5 mr-1" />
                  Zoom Out
                </Button>
                <span className="text-xs font-mono font-bold text-slate-700 px-2">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2"
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                >
                  <ZoomIn className="w-3.5 h-3.5 mr-1" />
                  Zoom In
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs px-2 text-slate-500"
                  onClick={() => setZoomLevel(1)}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          )}

          {asset.type === 'AUDIO' && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Voice Note / Audio Attachment</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{asset.notes || 'No transcription available.'}</div>
              </div>
              <audio controls className="w-full mt-2" src={asset.url}>
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {asset.type === 'DOCUMENT' && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
              <FileText className="w-10 h-10 text-purple-600 mx-auto" />
              <div className="text-xs font-bold text-slate-900">{asset.title}</div>
              <a
                href={asset.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs font-semibold text-[#12C395] hover:underline"
              >
                Open Document in New Tab
              </a>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close Viewer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
