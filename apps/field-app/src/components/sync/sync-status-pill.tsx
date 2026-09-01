import React, { useState, useEffect } from 'react';
import { syncEngine, SyncEngineState } from '../../sync/sync-engine';
import { RefreshCw, CheckCircle2, AlertTriangle, WifiOff, Clock } from 'lucide-react';

export interface SyncStatusPillProps {
  onOpenConflicts?: () => void;
  compact?: boolean;
}

export const SyncStatusPill: React.FC<SyncStatusPillProps> = ({ onOpenConflicts, compact = false }) => {
  const [state, setState] = useState<SyncEngineState>(syncEngine.getState());

  useEffect(() => {
    return syncEngine.subscribe(setState);
  }, []);

  const handleManualSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await syncEngine.sync();
  };

  if (!state.isOnline) {
    return (
      <div
        data-testid="sync-status-offline"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-600 text-xs font-medium"
      >
        <WifiOff className="w-3.5 h-3.5 text-slate-500" />
        <span>Offline</span>
      </div>
    );
  }

  if (state.isSyncing) {
    return (
      <div
        data-testid="sync-status-syncing"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium"
      >
        <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (state.conflicts.length > 0) {
    return (
      <button
        type="button"
        data-testid="sync-status-conflicts"
        onClick={onOpenConflicts}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>{state.conflicts.length} Conflict{state.conflicts.length > 1 ? 's' : ''}</span>
      </button>
    );
  }

  if (state.pendingCount > 0) {
    return (
      <div
        data-testid="sync-status-pending"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium"
      >
        <Clock className="w-3.5 h-3.5 text-blue-600" />
        <span>{state.pendingCount} Pending</span>
        {!compact && (
          <button
            type="button"
            data-testid="sync-now-button"
            onClick={handleManualSync}
            className="ml-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline"
          >
            Sync Now
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      data-testid="sync-status-synced"
      onClick={handleManualSync}
      title="Click to sync now"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-emerald-700 text-xs font-medium hover:bg-emerald-100/80 transition-colors"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span>Up to date</span>
    </button>
  );
};
export default SyncStatusPill;
