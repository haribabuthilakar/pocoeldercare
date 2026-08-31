import * as React from 'react';
import { Sliders, Zap, AlertTriangle, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@poco/ui';
import type { MockSettings } from '@poco/integrations';

export interface MockSettingsEditorProps {
  initialSettings: MockSettings;
  partnerName: string;
  partnerCode: string;
  onSave: (settings: MockSettings) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function MockSettingsEditor({
  initialSettings,
  partnerName,
  partnerCode,
  onSave,
  onCancel,
  isSaving
}: MockSettingsEditorProps) {
  const [latencyMs, setLatencyMs] = React.useState(initialSettings.latencyMs ?? 150);
  const [failureRate, setFailureRate] = React.useState(initialSettings.failureRate ?? 0);
  const [errorMode, setErrorMode] = React.useState(initialSettings.errorMode ?? 'NONE');
  const [enableMockCallbacks, setEnableMockCallbacks] = React.useState(initialSettings.autoCallbackEnabled ?? true);
  const [autoCallbackDelayMs, setAutoCallbackDelayMs] = React.useState(initialSettings.autoCallbackDelayMs ?? 2000);
  const [rawJson, setRawJson] = React.useState(
    JSON.stringify(initialSettings.customResponseTemplate ?? {}, null, 2)
  );
  const [jsonError, setJsonError] = React.useState<string | null>(null);

  const handleSave = async () => {
    let parsedCustomResponse: Record<string, unknown> | undefined;
    if (rawJson.trim()) {
      try {
        parsedCustomResponse = JSON.parse(rawJson);
        setJsonError(null);
      } catch (err: unknown) {
        setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
        return;
      }
    }

    await onSave({
      latencyMs,
      failureRate,
      errorMode: errorMode as any,
      autoCallbackEnabled: enableMockCallbacks,
      autoCallbackDelayMs,
      customResponseTemplate: parsedCustomResponse
    });
  };


  const handleResetToDefault = () => {
    setLatencyMs(150);
    setFailureRate(0);
    setErrorMode('NONE');
    setEnableMockCallbacks(true);
    setAutoCallbackDelayMs(2000);
    setRawJson('{}');
    setJsonError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900">{partnerName}</h3>
        <p className="text-xs font-mono text-slate-400 mt-0.5">{partnerCode} • Fault Injection & Mock Parameters</p>
      </div>

      {/* Latency Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor="latency-range" className="font-bold text-slate-700 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Simulated Network Latency (ms)</span>
          </label>
          <div className="flex items-center space-x-1">
            <input
              id="latency-number"
              type="number"
              min={0}
              max={5000}
              step={50}
              value={latencyMs}
              onChange={(e) => setLatencyMs(Number(e.target.value))}
              className="w-16 px-1.5 py-0.5 text-xs font-mono text-right border border-slate-200 rounded font-bold"
            />
            <span className="text-slate-400 text-xs">ms</span>
          </div>
        </div>
        <input
          id="latency-range"
          type="range"
          min={0}
          max={3000}
          step={50}
          value={latencyMs}
          onChange={(e) => setLatencyMs(Number(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>0ms (Instant)</span>
          <span>150ms (Normal)</span>
          <span>1000ms (Slow)</span>
          <span>3000ms (Lagging)</span>
        </div>
      </div>

      {/* Failure Rate Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor="failure-range" className="font-bold text-slate-700 flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-red-600" />
            <span>Simulated Failure Rate (%)</span>
          </label>
          <span className="font-mono font-bold text-xs text-red-600">{failureRate}%</span>
        </div>
        <input
          id="failure-range"
          type="range"
          min={0}
          max={100}
          step={5}
          value={failureRate}
          onChange={(e) => setFailureRate(Number(e.target.value))}
          className="w-full accent-red-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>0% (100% Success)</span>
          <span>25% (Flaky)</span>
          <span>50% (Degraded)</span>
          <span>100% (Full Outage)</span>
        </div>
      </div>

      {/* Error Mode Dropdown */}
      <div className="space-y-1.5">
        <label htmlFor="error-mode-select" className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Error Mode Injection</span>
        </label>
        <select
          id="error-mode-select"
          value={errorMode}
          onChange={(e) => setErrorMode(e.target.value as any)}
          className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-800"
        >
          <option value="NONE">NONE (Normal mock responses)</option>
          <option value="TIMEOUT_GATEWAY">TIMEOUT_GATEWAY (Simulate 504 Gateway Timeout)</option>
          <option value="HTTP_500_SERVER_ERROR">HTTP_500_SERVER_ERROR (Internal Partner Error)</option>
          <option value="RATE_LIMIT_429">RATE_LIMIT_429 (Simulate Partner 429 Throttle)</option>
          <option value="INVALID_HMAC_SIGNATURE">INVALID_HMAC_SIGNATURE (Corrupt Webhook Signature)</option>
        </select>
      </div>

      {/* Auto-Callback Delay */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="auto-callback-check" className="text-xs font-bold text-slate-800 cursor-pointer">
            Enable Asynchronous Progression Callbacks
          </label>
          <input
            type="checkbox"
            id="auto-callback-check"
            checked={enableMockCallbacks}
            onChange={(e) => setEnableMockCallbacks(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
          />
        </div>

        {enableMockCallbacks && (
          <div className="space-y-1 pt-1 border-t border-slate-200">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Callback Stage Delay:</span>
              <span className="font-mono font-bold">{(autoCallbackDelayMs / 1000).toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min={500}
              max={10000}
              step={500}
              value={autoCallbackDelayMs}
              onChange={(e) => setAutoCallbackDelayMs(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Custom JSON Response Override */}
      <div className="space-y-1.5">
        <label htmlFor="custom-json-textarea" className="block text-xs font-bold text-slate-700">
          Custom JSON Response Template (Optional Override)
        </label>
        <textarea
          id="custom-json-textarea"
          rows={3}
          value={rawJson}
          onChange={(e) => {
            setRawJson(e.target.value);
            setJsonError(null);
          }}
          className="w-full font-mono text-xs p-2.5 border border-slate-200 rounded-xl bg-slate-900 text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        {jsonError && <p className="text-xs text-red-600 font-medium">{jsonError}</p>}
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetToDefault}
          className="border-slate-200 text-slate-600 rounded-xl text-xs flex items-center space-x-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="border-slate-200 text-slate-700 rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs px-4"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </div>
  );
}
