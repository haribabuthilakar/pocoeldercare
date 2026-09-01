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
  FormField,
  cn,
} from '@poco/ui';
import { AlertTriangle, GitMerge, FileText } from 'lucide-react';
import { ServiceRequestStatus } from '@poco/constants';
import { apiClient } from '@/lib/api-client';

export interface ChildRequestNode {
  id: string;
  title?: string;
  serviceName: string;
  status: ServiceRequestStatus;
  notes?: string;
}

export interface RollupResolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  ticketTitle: string;
  stallReason?: string;
  childRequests: ChildRequestNode[];
  onSuccess?: () => void;
}

export function RollupResolutionModal({
  open,
  onOpenChange,
  ticketId,
  ticketTitle,
  stallReason,
  childRequests,
  onSuccess,
}: RollupResolutionModalProps) {
  const [selectedAction, setSelectedAction] = React.useState<
    'RESUME_IN_PROGRESS' | 'RESOLVE' | 'CANCEL'
  >('RESOLVE');
  const [resolutionNotes, setResolutionNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      setError('A resolution audit note is mandatory.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.patch(`/api/admin/v1/tickets/${ticketId}/resolve-ops`, {
        action: selectedAction,
        notes: resolutionNotes.trim(),
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to reconcile rollup exception.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base text-slate-900">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Reconcile Rollup Exception</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Ticket #{ticketId.slice(0, 8)} — {ticketTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {stallReason && (
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start space-x-2">
              <FileText className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Stall / Exception Reason: </span>
                <span>{stallReason}</span>
              </div>
            </div>
          )}

          {/* Hierarchical Child Request Status Tree */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
              <span>Child Service Requests ({childRequests.length})</span>
              <span className="text-[10px] text-slate-400 font-normal">State Decomposition</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {childRequests.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        child.status === ServiceRequestStatus.COMPLETED
                          ? 'bg-emerald-500'
                          : child.status === ServiceRequestStatus.EXCEPTION
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      )}
                    />
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {child.serviceName || child.title || child.id}
                    </span>
                  </div>

                  <Badge
                    variant={
                      child.status === ServiceRequestStatus.COMPLETED
                        ? 'primary'
                        : child.status === ServiceRequestStatus.EXCEPTION
                        ? 'warning'
                        : 'destructive'
                    }
                    className="text-[10px] font-bold shrink-0 ml-2"
                  >
                    {child.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Rollup Resolution Action Selector */}
          <FormField label="Target Rollup Transition" required>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedAction('RESOLVE')}
                className={cn(
                  'p-2.5 text-xs font-bold rounded-xl border transition-all text-center flex flex-col items-center justify-center space-y-1',
                  selectedAction === 'RESOLVE'
                    ? 'border-[#12C395] bg-emerald-50 text-[#0E8164] ring-2 ring-[#12C395]/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                <span>Resolve Ticket</span>
                <span className="text-[10px] opacity-70 font-normal">Close as Reconciled</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('RESUME_IN_PROGRESS')}
                className={cn(
                  'p-2.5 text-xs font-bold rounded-xl border transition-all text-center flex flex-col items-center justify-center space-y-1',
                  selectedAction === 'RESUME_IN_PROGRESS'
                    ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                <span>Resume Progress</span>
                <span className="text-[10px] opacity-70 font-normal">Re-dispatch Tasks</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction('CANCEL')}
                className={cn(
                  'p-2.5 text-xs font-bold rounded-xl border transition-all text-center flex flex-col items-center justify-center space-y-1',
                  selectedAction === 'CANCEL'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                <span>Cancel Ticket</span>
                <span className="text-[10px] opacity-70 font-normal">Abort & Restore Quota</span>
              </button>
            </div>
          </FormField>

          {/* Mandatory Resolution Note */}
          <FormField label="Operations Resolution Audit Note" required>
            <textarea
              required
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Explain the exception reconciliation rationale (recorded in immutable audit log)..."
              className="w-full text-xs rounded-xl border border-slate-300 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#12C395]"
            />
          </FormField>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              disabled={!resolutionNotes.trim()}
              className="bg-[#12C395] hover:bg-[#0ea880] text-slate-950 font-bold"
            >
              Resolve Rollup Exception
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
