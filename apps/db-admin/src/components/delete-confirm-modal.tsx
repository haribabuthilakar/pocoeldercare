'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { TableDefinition } from '../lib/table-schemas';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  definition: TableDefinition;
  row: Record<string, any> | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  definition,
  row,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !row) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-600 font-black shadow-xs mx-auto">
          <AlertTriangle size={24} />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-base font-black text-slate-900 m-0">
            Confirm Record Deletion
          </h3>
          <p className="text-xs text-slate-500 font-medium m-0">
            Are you sure you want to delete this record from table <strong className="text-slate-800">{definition.name}</strong>?
          </p>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-800">
            {definition.primaryKey}: {row[definition.primaryKey]}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white font-black text-xs shadow-xs flex items-center gap-1.5 transition-all glow-secondary"
          >
            <Trash2 size={14} />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
