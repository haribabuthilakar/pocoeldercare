import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, AlertCircle } from 'lucide-react';

export interface ExceptionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes?: string) => Promise<void>;
  householdName?: string;
}

export const EXCEPTION_REASONS = [
  { id: 'SENIOR_HOSPITALIZED', label: 'Senior Hospitalized / Away' },
  { id: 'ACCESS_DENIED', label: 'Access Denied / Door Locked' },
  { id: 'EQUIPMENT_MISSING', label: 'Clinical Equipment / Kit Missing' },
  { id: 'EMERGENCY_ESCALATION', label: 'Emergency Medical Escalation Required' },
  { id: 'OTHER', label: 'Other Operational Blocker' },
];

export const ExceptionReportModal: React.FC<ExceptionReportModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  householdName = 'Household',
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('SENIOR_HOSPITALIZED');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(selectedReason, notes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        data-testid="exception-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Dialog */}
      <div
        data-testid="exception-report-dialog"
        className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-red-100 overflow-hidden z-10"
      >
        {/* Header */}
        <div className="p-5 border-b border-red-100 bg-red-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Report Visit Exception</h3>
              <p className="text-xs text-red-700">{householdName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-exception-modal"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-red-50/50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
            <p>
              Flagging an exception will pause this visit and transition the ticket to{' '}
              <strong>Waiting Ops Update</strong> for Operations Executive review.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Exception Category:
            </label>
            <div className="space-y-1.5" data-testid="exception-reasons-list">
              {EXCEPTION_REASONS.map((r) => (
                <label
                  key={r.id}
                  data-testid={`exception-reason-${r.id}`}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                    selectedReason === r.id
                      ? 'bg-red-50/70 border-red-300 text-red-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="exceptionReason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={() => setSelectedReason(r.id)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="exceptionNotes" className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description / Incident Notes:
            </label>
            <textarea
              id="exceptionNotes"
              data-testid="exception-notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide exact context for the operations team..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            data-testid="cancel-exception-button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="confirm-exception-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 shadow-sm shadow-red-600/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Flagging Exception...' : 'Report & Pause Visit'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ExceptionReportModal;
