'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Code } from 'lucide-react';
import { TableDefinition } from '../lib/table-schemas';

interface JsonRawDrawerProps {
  isOpen: boolean;
  definition: TableDefinition;
  row: Record<string, any> | null;
  onClose: () => void;
}

export const JsonRawDrawer: React.FC<JsonRawDrawerProps> = ({
  isOpen,
  definition,
  row,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !row) return null;

  const jsonString = JSON.stringify(row, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 text-slate-100 w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-800">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code size={16} className="text-brand-400" />
            <h3 className="text-sm font-black text-white m-0">
              Raw Record JSON: {definition.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={13} className="text-brand-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* JSON Viewer */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-brand-300 leading-relaxed bg-slate-950/80">
          <pre>{jsonString}</pre>
        </div>
      </div>
    </div>
  );
};
