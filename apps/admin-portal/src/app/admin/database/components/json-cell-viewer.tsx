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
} from '@poco/ui';
import { Code, Copy, Check, Eye } from 'lucide-react';

/**
 * Sanitizes sensitive PII data:
 * - 12-digit Aadhaar: masks first 8 digits -> XXXX-XXXX-1234
 * - PAN Card: masks characters 3-7
 * - Auth tokens / passwords / secrets
 */
export function sanitizePii(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    // Check for 12-digit Aadhaar numbers (with or without dashes/spaces)
    const aadhaarMatch = data.match(/\b(\d{4})[- ]?(\d{4})[- ]?(\d{4})\b/);
    if (aadhaarMatch) {
      return data.replace(/\b(\d{4})[- ]?(\d{4})[- ]?(\d{4})\b/, 'XXXX-XXXX-$3');
    }
    // Check for PAN format (5 letters, 4 numbers, 1 letter)
    const panMatch = data.match(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/);
    if (panMatch) {
      return data.replace(/\b([A-Z]{2})[A-Z]{3}[0-9]{3}([0-9][A-Z])\b/, '$1***$2');
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizePii);
  }
  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('token') ||
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('hash')
      ) {
        sanitized[key] = '***REDACTED***';
      } else if (lowerKey.includes('aadhaar') || lowerKey.includes('abha')) {
        sanitized[key] = typeof value === 'string' ? sanitizePii(value) : 'XXXX-XXXX-****';
      } else {
        sanitized[key] = sanitizePii(value);
      }
    }
    return sanitized;
  }
  return data;
}

export function JsonCellViewer({
  value,
  title = 'Raw JSON Inspector',
}: {
  value: any;
  title?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const sanitized = React.useMemo(() => sanitizePii(value), [value]);
  const formattedString = React.useMemo(() => {
    try {
      return JSON.stringify(sanitized, null, 2);
    } catch {
      return String(sanitized);
    }
  }, [sanitized]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(formattedString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!value) return <span className="text-slate-400 font-mono text-[10px]">null</span>;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center space-x-1 font-mono text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-300 transition-colors"
      >
        <Code className="w-3 h-3 text-slate-500" />
        <span className="truncate max-w-[120px]">
          {typeof value === 'object' ? `{${Object.keys(value).length} keys}` : String(value)}
        </span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-sm text-slate-900">
              <Code className="w-4 h-4 text-[#12C395]" />
              <span>{title} (PII Sanitized)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Sensitive identifiers (Aadhaar, passwords, secrets) are automatically redacted.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto my-2 rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 border border-slate-800 select-text">
            <pre className="whitespace-pre-wrap">{formattedString}</pre>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-[#12C395]" />
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy JSON
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
