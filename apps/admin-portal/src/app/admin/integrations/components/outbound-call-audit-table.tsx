import * as React from 'react';
import { Clock, Eye, Activity, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, EmptyState } from '@poco/ui';

export interface OutboundCallLog {
  id: string;
  partnerCode: string;
  endpoint: string;
  responseStatus: number;
  durationMs: number;
  requestPayload?: unknown;
  errorMessage?: string | null;
  createdAt: Date | string;
}


export interface OutboundCallAuditTableProps {
  logs: OutboundCallLog[];
  onRefresh?: () => void;
}

export function OutboundCallAuditTable({ logs, onRefresh }: OutboundCallAuditTableProps) {
  const [selectedLog, setSelectedLog] = React.useState<OutboundCallLog | null>(null);

  if (!logs || logs.length === 0) {
    return (
      <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <EmptyState
          title="No Outbound Calls Logged"
          description="Outgoing integration partner API requests will appear here with timing and payloads."
          actionLabel="Refresh Logs"
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
            Outbound Integration Call Logs
          </CardTitle>
          <p className="text-xs text-slate-500">
            Real-time audit log of external partner calls with PII masking and timing metrics.
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
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Partner</th>
                <th className="py-2.5 px-4">Method & Endpoint</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Duration</th>
                <th className="py-2.5 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const ts = new Date(log.createdAt);
                const timeString = ts.toLocaleTimeString('en-IN', { hour12: false });
                const isSuccess = log.responseStatus >= 200 && log.responseStatus < 300;

                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors font-mono">
                    <td className="py-2.5 px-4 text-slate-500">{timeString}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{log.partnerCode}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">
                      <span className="truncate">{log.endpoint}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        HTTP {log.responseStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-600 font-bold">{log.durationMs}ms</td>
                    <td className="py-2.5 px-4 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
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

        {/* Selected Log Inspector Modal */}
        {selectedLog && (
          <div className="p-4 bg-slate-900 text-white border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-400">
                Call Payload Inspector ({selectedLog.partnerCode} • {selectedLog.endpoint})
              </span>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 block mb-1">Request Payload (Masked PII):</span>
                <pre className="p-2.5 bg-slate-950 text-slate-300 rounded-lg max-h-48 overflow-y-auto">
                  {JSON.stringify(selectedLog.requestPayload, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Response & Error Details:</span>
                <pre className="p-2.5 bg-slate-950 text-emerald-400 rounded-lg max-h-48 overflow-y-auto">
                  {JSON.stringify({ status: selectedLog.responseStatus, error: selectedLog.errorMessage }, null, 2)}
                </pre>
              </div>

            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
