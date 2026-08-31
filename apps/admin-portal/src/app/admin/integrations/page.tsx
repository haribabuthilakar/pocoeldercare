import * as React from 'react';
import {
  Activity,
  AlertTriangle,
  Code2,
  FileText,
  Play,
  RefreshCw,
  Sliders,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button, Badge, Card } from '@poco/ui';
import {
  getPartnerHealthList,
  updatePartnerMockSettings,
  resetAllMockSettings,
  triggerTestPing,
  getOutboundCallLogs,
  getWebhookEventLogs
} from './actions';
import type { PartnerHealthItem } from './actions';
import { PartnerHealthGrid } from './components/partner-health-grid';
import { FaultInjectionDrawer } from './components/fault-injection-drawer';
import { ScenarioPresetRunner } from './components/scenario-preset-runner';
import { RawPayloadDispatcher } from './components/raw-payload-dispatcher';
import { OutboundCallAuditTable } from './components/outbound-call-audit-table';
import type { OutboundCallLog } from './components/outbound-call-audit-table';
import { WebhookEventLogTable } from './components/webhook-event-log-table';
import type { WebhookEventLog } from './components/webhook-event-log-table';

import type { MockSettings } from '@poco/integrations';

type ActiveTab = 'scenarios' | 'raw_dispatcher' | 'outbound_logs' | 'webhook_events';

export function IntegrationsDashboardPage() {
  const [partners, setPartners] = React.useState<PartnerHealthItem[]>([]);
  const [selectedPartner, setSelectedPartner] = React.useState<PartnerHealthItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('scenarios');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isResetting, setIsResetting] = React.useState(false);
  const [pingingCode, setPingingCode] = React.useState<string | null>(null);
  const [outboundLogs, setOutboundLogs] = React.useState<OutboundCallLog[]>([]);
  const [webhookEvents, setWebhookEvents] = React.useState<WebhookEventLog[]>([]);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [healthData, outLogs, inLogs] = await Promise.all([
        getPartnerHealthList(),
        getOutboundCallLogs(25),
        getWebhookEventLogs(25)
      ]);
      setPartners(healthData);
      setOutboundLogs(outLogs as OutboundCallLog[]);
      setWebhookEvents(inLogs as WebhookEventLog[]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfigureMocks = (partner: PartnerHealthItem) => {
    setSelectedPartner(partner);
    setIsDrawerOpen(true);
  };

  const handleSaveSettings = async (partnerCode: string, settings: MockSettings) => {
    await updatePartnerMockSettings(partnerCode as any, settings);
    await loadData();
  };

  const handleResetAll = async () => {
    if (confirm('Reset all 13 integration partner mocks to baseline default settings?')) {
      setIsResetting(true);
      try {
        await resetAllMockSettings();
        await loadData();
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleTestPing = async (partnerCode: string) => {
    setPingingCode(partnerCode);
    try {
      const res = await triggerTestPing(partnerCode as any);
      if (res.success) {
        alert(`✅ Test Ping Success! Latency: ${res.latencyMs}ms\n\nResponse:\n${JSON.stringify(res.response, null, 2)}`);
      } else {
        alert(`❌ Test Ping Failed (${res.latencyMs}ms): ${res.error}`);
      }
      await loadData();
    } finally {
      setPingingCode(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Integration Partners & Mock Testbench
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor partner health, simulate latency and network failures, and dispatch end-to-end webhook scenarios.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            disabled={isResetting}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs h-9"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Reset All Mocks</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold h-9 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Health</span>
          </Button>
        </div>
      </div>

      {/* Partner Health Status Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Partner Health & Mock Configurations ({partners.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">In-Process TypeScript Adapters</span>
        </div>

        <PartnerHealthGrid
          partners={partners}
          onConfigureMocks={handleConfigureMocks}
          onTestPing={handleTestPing}
          pingingCode={pingingCode}
        />
      </div>

      {/* Testbench & Audit Tabs */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('scenarios')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'scenarios' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scenario Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('raw_dispatcher')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'raw_dispatcher' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Raw Webhook Dispatcher</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outbound_logs')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'outbound_logs' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Outbound Call Audit ({outboundLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('webhook_events')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all ${
              activeTab === 'webhook_events' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Inbound Webhooks ({webhookEvents.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'scenarios' && <ScenarioPresetRunner />}
        {activeTab === 'raw_dispatcher' && <RawPayloadDispatcher />}
        {activeTab === 'outbound_logs' && (
          <OutboundCallAuditTable logs={outboundLogs} onRefresh={loadData} />
        )}
        {activeTab === 'webhook_events' && (
          <WebhookEventLogTable events={webhookEvents} onRefresh={loadData} />
        )}
      </div>

      {/* Fault Injection Drawer */}
      <FaultInjectionDrawer
        partner={selectedPartner}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}

export default IntegrationsDashboardPage;
