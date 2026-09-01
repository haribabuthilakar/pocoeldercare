import React, { useState, useEffect } from 'react';
import { syncEngine, type SyncConflict, type SyncEngineState } from '../../sync/sync-engine';
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Server,
  Smartphone,
  Check,
  RotateCcw,
  X,
} from 'lucide-react';

export interface ConflictReviewDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ConflictReviewDrawer: React.FC<ConflictReviewDrawerProps> = ({
  isOpen = true,
  onClose,
}) => {
  const [state, setState] = useState<SyncEngineState>(syncEngine.getState());
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  useEffect(() => {
    return syncEngine.subscribe(setState);
  }, []);

  const handleResolve = async (
    conflictId: string,
    resolution: 'RELOAD_SERVER' | 'FORCE_OVERRIDE',
  ) => {
    setResolvingId(conflictId);
    try {
      await syncEngine.resolveConflict(conflictId, resolution);
    } finally {
      setResolvingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="conflict-review-container"
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900" data-testid="conflict-header-title">
              Sync Conflict Review
            </h2>
            <p className="text-xs text-amber-800">
              {state.conflicts.length > 0
                ? `${state.conflicts.length} rejected mutation(s) require your resolution`
                : 'All changes synchronized'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            data-testid="close-conflicts-button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-amber-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {state.conflicts.length === 0 ? (
          <div
            data-testid="empty-conflicts-state"
            className="py-10 text-center flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No Sync Conflicts</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                All local changes have been successfully committed and synced to the Poco server.
              </p>
            </div>
          </div>
        ) : (
          state.conflicts.map((conflict: SyncConflict) => (
            <div
              key={conflict.id}
              data-testid={`conflict-card-${conflict.id}`}
              className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  {conflict.entityName} • {conflict.mutationType}
                </span>
                <span className="text-[11px] text-slate-400">
                  ID: {conflict.entityId.slice(0, 8)}...
                </span>
              </div>

              {/* Error Explanation */}
              <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg text-xs text-red-700 font-medium">
                {conflict.errorMessage}
              </div>

              {/* Side-by-side Diff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Local Change */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1 text-slate-700 font-semibold mb-1">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Your Local Changes</span>
                  </div>
                  <pre className="text-[11px] text-slate-600 font-mono overflow-x-auto bg-slate-50 p-2 rounded">
                    {JSON.stringify(conflict.clientPayload, null, 2)}
                  </pre>
                </div>

                {/* Server State */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1 text-slate-700 font-semibold mb-1">
                    <Server className="w-3.5 h-3.5 text-blue-600" />
                    <span>Current Server State</span>
                  </div>
                  <pre className="text-[11px] text-slate-600 font-mono overflow-x-auto bg-slate-50 p-2 rounded">
                    {JSON.stringify(conflict.serverState || { status: 'MODIFIED_ON_SERVER' }, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Resolution Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  data-testid={`resolve-reload-${conflict.id}`}
                  disabled={resolvingId === conflict.id}
                  onClick={() => handleResolve(conflict.id, 'RELOAD_SERVER')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Keep Server Version
                </button>
                <button
                  type="button"
                  data-testid={`resolve-override-${conflict.id}`}
                  disabled={resolvingId === conflict.id}
                  onClick={() => handleResolve(conflict.id, 'FORCE_OVERRIDE')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Override Server
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default ConflictReviewDrawer;
