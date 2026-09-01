'use client';

import * as React from 'react';
import { Button, FormField, Badge, Card, CardHeader, CardTitle, CardContent } from '@poco/ui';
import { Send, Zap, CheckCircle, AlertTriangle, Sparkles, Terminal } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export interface SyntheticScenario {
  id: string;
  name: string;
  endpoint: string;
  method: 'POST' | 'PATCH';
  description: string;
  defaultPayload: Record<string, any>;
}

export const SYNTHETIC_SCENARIOS: SyntheticScenario[] = [
  {
    id: 'wearable-fall-sos',
    name: 'Trigger Wearable Fall Alert (SOS)',
    endpoint: '/api/webhooks/v1/wearable',
    method: 'POST',
    description: 'Simulates smart wearable accelerometer impact detection with elevated heart rate (132 bpm).',
    defaultPayload: {
      deviceId: 'WB-DEV-9941',
      seniorId: 'a0000000-0000-0000-0000-000000000001',
      householdId: 'hh-001',
      eventType: 'FALL_DETECTED',
      heartRateBpm: 132,
      impactGForce: 4.8,
      location: {
        lat: 12.9716,
        lng: 77.5946,
        address: '14/2 Indiranagar, Bengaluru',
      },
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'out-of-quota-emergency',
    name: 'Trigger Out-of-Quota Emergency Service',
    endpoint: '/api/webhooks/v1/emergency',
    method: 'POST',
    description: 'Dispatches urgent emergency response for a household with 0 remaining package quota, exercising auto-overdraft debits.',
    defaultPayload: {
      householdId: 'hh-002',
      serviceType: 'EMERGENCY_SOS_RESPONSE',
      priority: 'EMERGENCY',
      notes: 'Synthetic automated ambulance dispatch trigger',
      autoDebitOverdraft: true,
    },
  },
  {
    id: 'expired-bls-cert',
    name: 'Trigger Expired BLS Certification',
    endpoint: '/api/admin/v1/care-officers/co-002/certifications',
    method: 'POST',
    description: 'Forces care officer BLS certification into EXPIRED state to test assignment compliance gating.',
    defaultPayload: {
      certificationCode: 'BLS_CPR',
      status: 'EXPIRED',
      expiresAt: new Date(Date.now() - 86400000).toISOString(),
    },
  },
];

export function SyntheticPayloadDispatcher() {
  const [selectedScenarioId, setSelectedScenarioId] = React.useState<string>(
    SYNTHETIC_SCENARIOS[0]!.id
  );
  const [endpoint, setEndpoint] = React.useState(SYNTHETIC_SCENARIOS[0]!.endpoint);
  const [jsonText, setJsonText] = React.useState(
    JSON.stringify(SYNTHETIC_SCENARIOS[0]!.defaultPayload, null, 2)
  );
  const [isDispatching, setIsDispatching] = React.useState(false);
  const [responseLog, setResponseLog] = React.useState<{
    status: number;
    statusText: string;
    body: any;
    dispatchedAt: string;
  } | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);

  const handleSelectScenario = (scenarioId: string) => {
    const sc = SYNTHETIC_SCENARIOS.find((s) => s.id === scenarioId);
    if (sc) {
      setSelectedScenarioId(scenarioId);
      setEndpoint(sc.endpoint);
      setJsonText(JSON.stringify(sc.defaultPayload, null, 2));
      setParseError(null);
    }
  };

  const handleDispatch = async () => {
    let parsedBody;
    try {
      parsedBody = JSON.parse(jsonText);
      setParseError(null);
    } catch (e: any) {
      setParseError(`JSON Syntax Error: ${e.message}`);
      return;
    }

    setIsDispatching(true);
    setResponseLog(null);

    const sc = SYNTHETIC_SCENARIOS.find((s) => s.id === selectedScenarioId);
    const method = sc?.method || 'POST';

    try {
      const res =
        method === 'POST'
          ? await apiClient.post(endpoint, parsedBody)
          : await apiClient.patch(endpoint, parsedBody);

      setResponseLog({
        status: 200,
        statusText: 'OK',
        body: res,
        dispatchedAt: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setResponseLog({
        status: err?.status || 500,
        statusText: err?.statusText || 'Error',
        body: err?.data || { message: err?.message },
        dispatchedAt: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Scenario Picker Cards */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#12C395]" />
          <span>Synthetic Test Scenarios</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SYNTHETIC_SCENARIOS.map((sc) => {
            const isSelected = selectedScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectScenario(sc.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#12C395] bg-emerald-50/50 ring-2 ring-[#12C395]/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{sc.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {sc.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor & Dispatch Surface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payload Editor */}
        <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Target Webhook Endpoint</span>
            <Badge variant="outline" className="font-mono text-[10px]">
              {endpoint}
            </Badge>
          </div>

          {parseError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              JSON Test Payload
            </label>
            <textarea
              aria-label="JSON Test Payload"
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full font-mono text-xs p-3 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#12C395]"
            />
          </div>

          <Button
            type="button"
            variant="primary"
            size="default"
            isLoading={isDispatching}
            onClick={handleDispatch}
            className="w-full bg-[#12C395] hover:bg-[#0ea880] text-slate-950 font-bold"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Dispatch Test Payload
          </Button>
        </div>

        {/* Live Response Viewer */}
        <div className="space-y-3 p-4 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#12C395]" />
              <span>HTTP Response Output</span>
            </span>
            {responseLog && (
              <Badge
                variant={responseLog.status >= 400 ? 'destructive' : 'primary'}
                className="font-mono text-[10px]"
              >
                HTTP {responseLog.status} {responseLog.statusText}
              </Badge>
            )}
          </div>

          <div className="flex-1 min-h-[260px] rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-300 overflow-y-auto border border-slate-800">
            {responseLog ? (
              <pre className="whitespace-pre-wrap text-emerald-400">
                {JSON.stringify(responseLog.body, null, 2)}
              </pre>
            ) : (
              <div className="text-slate-500 italic text-center py-20">
                Click &quot;Dispatch Test Payload&quot; to execute synthetic scenario and view server response.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
