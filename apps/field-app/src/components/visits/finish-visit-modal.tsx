import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, X, Clock, MapPin } from 'lucide-react';

export interface FinishVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => Promise<void>;
  completedStepsCount: number;
  totalStepsCount: number;
  householdName: string;
}

export const FinishVisitModal: React.FC<FinishVisitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  completedStepsCount,
  totalStepsCount,
  householdName,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const allDone = completedStepsCount >= totalStepsCount;

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(notes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        data-testid="finish-visit-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        data-testid="finish-visit-dialog"
        className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Finish Visit</h3>
              <p className="text-xs text-slate-500">{householdName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-finish-modal"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 text-xs ${
              allDone
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {allDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {completedStepsCount} of {totalStepsCount} SOP Steps Completed
              </span>
              <p className="text-[11px] opacity-90 mt-0.5">
                {allDone
                  ? 'All mandatory checklist requirements verified.'
                  : 'Some checklist steps remain incomplete. You can still complete the visit.'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Checkout GPS location will be captured automatically.</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Visit completion will be saved to local database and synchronized when online.
            </p>
          </div>

          <div>
            <label htmlFor="closingNotes" className="block text-xs font-semibold text-slate-700 mb-1">
              Closing Visit Remarks (Optional)
            </label>
            <textarea
              id="closingNotes"
              data-testid="finish-visit-notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional caregiver observations or family notes..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            data-testid="cancel-finish-button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="confirm-finish-button"
            onClick={handleFinish}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Confirm & Finish Visit'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default FinishVisitModal;
