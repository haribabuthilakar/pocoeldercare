import React, { useState } from 'react';
import { Sparkles, CheckCircle2, X, ShieldCheck } from 'lucide-react';

export interface ActivateHouseholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  householdName: string;
}

export const ActivateHouseholdModal: React.FC<ActivateHouseholdModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  householdName,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleActivate = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        data-testid="activate-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Dialog */}
      <div
        data-testid="activate-household-dialog"
        className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-10"
      >
        {/* Header */}
        <div className="p-5 border-b border-emerald-100 bg-emerald-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Activate Household</h3>
              <p className="text-xs text-emerald-800">{householdName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-activate-modal"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Confirm that the initial onboarding visit, baseline senior assessment, and caregiver
            introduction are complete. This will transition the household status to{' '}
            <strong className="text-emerald-700">Active</strong>.
          </p>

          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Onboarding Verification Checklist</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Senior profile & emergency ICE details verified</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Baseline physiological vitals recorded</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Care officer household 1:1 bond established</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            data-testid="cancel-activate-button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="confirm-activate-button"
            onClick={handleActivate}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Activating...' : 'Confirm & Activate'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ActivateHouseholdModal;
