import * as React from 'react';
import { Clock, Eye, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, EmptyState } from '@poco/ui';

export interface WebhookEventLog {
  id: string;
  source: string;
  idempotencyKey: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  payload?: unknown;
  errorMessage?: string | null;
  processedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface WebhookEventLogTableProps {
  events: WebhookEventLog[];
  onRefresh?: () => void;
}

export function WebhookEventLogTable({ events, onRefresh }: WebhookEventLogTableProps) {
  const [selectedEvent, setSelectedEvent] = React.useState<WebhookEventLog | null>(null);

  if (!events || events.length === 0) {
    return (
      <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <EmptyState
          title="No Inbound Webhook Events Logged"
          description="Inbound webhook deliveries and idempotency states will appear here in real-time."
          actionLabel="Refresh Webhooks"
          onAction={onRefresh}
        />
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-slate-900">
            Inbound Webhook Event Log & Idempotency Audit
          </CardTitle>
          <p className="text-xs text-slate-500">
            Transactional idempotency ledger tracking duplicate prevention and execution statuses.
          </p>
        </div>
        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="border-slate-200 text-slate-700 rounded-xl text-xs h-8"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4">Received At</th>
                <th className="py-2.5 px-4">Source Partner</th>
                <th className="py-2.5 px-4">Idempotency Key</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Processed At</th>
                <th className="py-2.5 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((evt) => {
                const ts = new Date(evt.createdAt);
                const timeString = ts.toLocaleTimeString('en-IN', { hour12: false });
                const processedTimeString = evt.processedAt
                  ? new Date(evt.processedAt).toLocaleTimeString('en-IN', { hour12: false })
                  : '—';

                return (
                  <tr key={evt.id} className="hover:bg-slate-50 transition-colors font-mono">
                    <td className="py-2.5 px-4 text-slate-500">{timeString}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{evt.source}</td>
                    <td className="py-2.5 px-4 text-slate-600 truncate max-w-[200px]">
                      {evt.idempotencyKey}
                    </td>
                    <td className="py-2.5 px-4">
                      {evt.status === 'PROCESSED' && (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          PROCESSED
                        </span>
                      )}
                      {evt.status === 'PENDING' && (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          PENDING
                        </span>
                      )}
                      {evt.status === 'FAILED' && (
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          FAILED
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{processedTimeString}</td>
                    <td className="py-2.5 px-4 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(evt)}
                        className="h-7 w-7 p-0 rounded-lg hover:bg-slate-200 text-slate-600"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Event Inspector */}
        {selectedEvent && (
          <div className="p-4 bg-slate-900 text-white border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400">
                Webhook Event Payload ({selectedEvent.source} • Key: {selectedEvent.idempotencyKey})
              </span>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>

            {selectedEvent.errorMessage && (
              <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-300 font-sans">
                <strong>Error:</strong> {selectedEvent.errorMessage}
              </div>
            )}

            <pre className="p-3 bg-slate-950 text-emerald-300 font-mono text-xs rounded-lg max-h-56 overflow-y-auto">
              {JSON.stringify(selectedEvent.payload, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
