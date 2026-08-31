import * as React from 'react';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Ambulance,
  CreditCard,
  PhoneCall,
  FileCheck,
  Pill,
  FlaskConical,
  Activity,
  Radio
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Badge, Button } from '@poco/ui';
import { dispatchScenarioPreset } from '../actions';

interface ScenarioPreset {
  key: string;
  title: string;
  partner: string;
  icon: React.ElementType;
  description: string;
  badge: string;
  badgeColor: string;
}

const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    key: 'pococare_ambulance',
    title: 'Ambulance 4-Stage Dispatch',
    partner: 'POCOCARE',
    icon: Ambulance,
    description: 'Dispatches emergency ambulance and triggers live progression callbacks (Paramedic -> Scene -> Hospital).',
    badge: 'EMERGENCY',
    badgeColor: 'bg-red-100 text-red-700'
  },
  {
    key: 'razorpay_payment_success',
    title: 'Wallet Top-up Success (₹5,000)',
    partner: 'RAZORPAY',
    icon: CreditCard,
    description: 'Simulates payment.captured webhook, credits digital wallet balance in paise, and creates ledger entry.',
    badge: 'PAYMENT',
    badgeColor: 'bg-emerald-100 text-emerald-700'
  },
  {
    key: 'razorpay_payment_failed',
    title: 'Payment Declined (Bank Error)',
    partner: 'RAZORPAY',
    icon: CreditCard,
    description: 'Simulates payment.failed webhook with bank decline code and failure notification.',
    badge: 'PAYMENT',
    badgeColor: 'bg-amber-100 text-amber-700'
  },
  {
    key: 'exotel_emergency_call',
    title: 'Senior Emergency Hotline Call',
    partner: 'EXOTEL',
    icon: PhoneCall,
    description: 'Simulates inbound Exotel call with IVR Option 1 pressed, auto-creating Emergency ambulance ticket.',
    badge: 'TELEPHONY',
    badgeColor: 'bg-purple-100 text-purple-700'
  },
  {
    key: 'abha_consent_granted',
    title: 'ABDM Consent Auto-Grant',
    partner: 'ABHA',
    icon: FileCheck,
    description: 'Simulates ABDM M2 consent artifact generation and auto-pushing FHIR R4 clinical bundles.',
    badge: 'ABDM',
    badgeColor: 'bg-blue-100 text-blue-700'
  },
  {
    key: 'one_mg_out_for_delivery',
    title: 'Prescription Out for Delivery',
    partner: 'ONE_MG',
    icon: Pill,
    description: 'Simulates pharmacy packing, dispatch, and delivery progression callbacks with rider tracking.',
    badge: 'PHARMACY',
    badgeColor: 'bg-teal-100 text-teal-700'
  },
  {
    key: 'orange_labs_report_ready',
    title: 'Lab Report Ready with PDF',
    partner: 'ORANGE_LABS',
    icon: FlaskConical,
    description: 'Simulates phlebotomy sample collection and returns structured lipid panel biomarkers + PDF report link.',
    badge: 'DIAGNOSTICS',
    badgeColor: 'bg-orange-100 text-orange-700'
  },
  {
    key: 'wearable_fall_detected',
    title: 'Sudden Fall Alert (3.8g Impact)',
    partner: 'WEARABLE_IOT',
    icon: Activity,
    description: 'Simulates IoT wearable fall detection alert, immediately spawning Emergency Ticket and ambulance request.',
    badge: 'IOT ALERT',
    badgeColor: 'bg-rose-100 text-rose-700'
  },
  {
    key: 'wearable_heartbeat_ping',
    title: 'Silent Telemetry Heartbeat',
    partner: 'WEARABLE_IOT',
    icon: Radio,
    description: 'Simulates hourly silent wearable ping updating SeniorMedicalProfile.lastWearablePingAt.',
    badge: 'IOT TELEMETRY',
    badgeColor: 'bg-slate-100 text-slate-700'
  }
];

export function ScenarioPresetRunner() {
  const [runningKey, setRunningKey] = React.useState<string | null>(null);
  const [lastResults, setLastResults] = React.useState<Record<string, { success: boolean; msg: string }>>({});

  const handleRunPreset = async (preset: ScenarioPreset) => {
    setRunningKey(preset.key);
    try {
      const res = await dispatchScenarioPreset(preset.key);
      if (res.success) {
        setLastResults((prev) => ({
          ...prev,
          [preset.key]: { success: true, msg: 'Scenario dispatched successfully!' }
        }));
      } else {
        setLastResults((prev) => ({
          ...prev,
          [preset.key]: { success: false, msg: res.error || 'Scenario execution failed' }
        }));
      }
    } finally {
      setRunningKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900">Pre-Populated Test Scenarios</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Trigger 1-click end-to-end integration flows to test ticket creation, billing debits, and notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRESET_SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const isRunning = runningKey === scenario.key;
          const result = lastResults[scenario.key];

          return (
            <Card key={scenario.key} className="rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900 leading-tight">
                        {scenario.title}
                      </CardTitle>
                      <span className="text-[10px] font-mono text-slate-400">{scenario.partner}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scenario.badgeColor}`}>
                    {scenario.badge}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {scenario.description}
                </p>

                {result && (
                  <div className={`p-2 rounded-lg text-xs flex items-center space-x-1.5 ${
                    result.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {result.success ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    <span className="truncate">{result.msg}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  size="sm"
                  disabled={isRunning}
                  onClick={() => handleRunPreset(scenario)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold h-8 flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  {isRunning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{isRunning ? 'Dispatching...' : 'Dispatch Scenario'}</span>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
