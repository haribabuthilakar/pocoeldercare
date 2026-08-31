import * as React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Play,
  Settings2,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@poco/ui';
import { Badge } from '@poco/ui';
import { Button } from '@poco/ui';
import type { PartnerHealthItem } from '../actions';

export interface PartnerHealthCardProps {
  partner: PartnerHealthItem;
  onConfigureMocks: (partner: PartnerHealthItem) => void;
  onTestPing: (partnerCode: string) => Promise<void>;
  isPinging?: boolean;
}

export function PartnerHealthCard({
  partner,
  onConfigureMocks,
  onTestPing,
  isPinging
}: PartnerHealthCardProps) {
  const getStatusBadge = (status: PartnerHealthItem['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">ACTIVE</Badge>;
      case 'MOCK_ONLY':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-semibold">MOCK STUB</Badge>;
      case 'DEGRADED':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">DEGRADED</Badge>;
      case 'DOWN':
        return <Badge variant="destructive">DOWN / ERROR</Badge>;
    }
  };

  const hasFaultInjection =
    (partner.mockSettings.latencyMs ?? 0) > 300 ||
    (partner.mockSettings.failureRate ?? 0) > 0 ||
    partner.mockSettings.errorMode !== 'NONE';

  return (
    <Card className="rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-xs hover:shadow-md bg-white flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 pr-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <CardTitle className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[200px]">
                {partner.name}
              </CardTitle>
            </div>
            <p className="text-[11px] font-mono text-slate-400">{partner.partnerCode}</p>
          </div>
          {getStatusBadge(partner.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Fault Injection Alert Tag */}
        {hasFaultInjection && (
          <div className="flex items-center space-x-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-medium">
            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
            <span>
              Fault Active: {partner.mockSettings.errorMode !== 'NONE' ? partner.mockSettings.errorMode : `${partner.mockSettings.failureRate}% Fail`}
            </span>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Latency</div>
            <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">
              {partner.mockSettings.latencyMs ?? partner.averageLatencyMs}ms
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Fail Rate</div>
            <div className={`text-xs font-bold font-mono mt-0.5 ${partner.failureRatePercent > 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {partner.failureRatePercent}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Calls 24h</div>
            <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">
              {partner.totalCallsToday}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onConfigureMocks(partner)}
          className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs flex items-center justify-center space-x-1.5 h-8"
        >
          <Settings2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Mocks</span>
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={isPinging}
          onClick={() => onTestPing(partner.partnerCode)}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs flex items-center justify-center space-x-1.5 h-8 font-semibold shadow-xs"
        >
          {isPinging ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3 h-3 text-emerald-400" />
          )}
          <span>{isPinging ? 'Pinging...' : 'Test Ping'}</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
