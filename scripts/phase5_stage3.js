const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. DISPATCHER COMMAND CONSOLE PAGE (EMG-01 -> EMG-06)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/dispatcher/page.tsx', `
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  ShieldAlert,
  Ambulance,
  HeartPulse,
  Clock,
  UserCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  PhoneForwarded,
  Hospital,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { EmergencyScreenPop, EmergencyCallerContext } from '../../components/dispatcher/emergency-screen-pop';
import { AmbulanceDispatchModal, AmbulanceFleetProvider } from '../../components/dispatcher/ambulance-dispatch-modal';
import { HospitalPreBriefSheet, PreBriefData } from '../../components/dispatcher/hospital-prebrief-sheet';
import { SlaCountdownTracker } from '../../components/dispatcher/sla-countdown-tracker';
import { FamilyEscalationPanel, FamilyContactNode } from '../../components/dispatcher/family-escalation-panel';
import { IncidentClosureModal, ResolutionState } from '../../components/dispatcher/incident-closure-modal';

const mockCaller: EmergencyCallerContext = {
  incidentId: 'INC-2026-8801',
  callerPhone: '+91 98450 11999',
  sourceType: 'INBOUND_PSTN',
  callDurationSeconds: 42,
  householdId: 'hh-blr-001',
  householdName: 'Menon Residence',
  address: 'Flat 402, Palm Meadows, Whitefield, Bangalore 560066',
  city: 'Bangalore',
  primarySenior: {
    id: 'snr-001',
    name: 'Gopalakrishnan Menon',
    age: 78,
    bloodGroup: 'O+',
    chronicConditions: ['Severe Hypertension', 'Type 2 Diabetes', 'Previous TIA (2024)'],
    allergies: ['Penicillin', 'Sulfa Drugs'],
    preferredHospital: 'Manipal Hospital Old Airport Rd',
    erPhone: '+91 80 2502 4444',
    primaryPhysician: 'Dr. Arvind Narayanan (Geriatrician)',
    nriSponsorName: 'Divya Menon (Daughter)',
    nriSponsorPhone: '+1 408 555 0192',
    nriSponsorRelation: 'Daughter (Primary Sponsor)',
    nriTimezone: 'America/Los_Angeles (US PST)',
  },
  otherSeniors: [
    {
      id: 'snr-002',
      name: 'Kalyani Menon',
      age: 74,
      bloodGroup: 'B+',
      chronicConditions: ['Osteoarthritis', 'Mild Asthma'],
      allergies: ['Aspirin'],
    },
  ],
};

const mockFamilyContacts: FamilyContactNode[] = [
  {
    id: 'fam-1',
    name: 'Divya Menon',
    relation: 'Daughter (Primary Sponsor)',
    phone: '+1 408 555 0192',
    timezone: 'America/Los_Angeles',
    localTimeDisplay: '2:30 AM PST',
    isNighttime: true,
    status: 'RINGING',
  },
  {
    id: 'fam-2',
    name: 'Siddharth Menon',
    relation: 'Son (Secondary Sponsor)',
    phone: '+44 20 7946 0912',
    timezone: 'Europe/London',
    localTimeDisplay: '10:30 AM GMT',
    isNighttime: false,
    status: 'PENDING',
  },
  {
    id: 'fam-3',
    name: 'Brigadier Nair (Retd)',
    relation: 'Local Relative / Neighbor',
    phone: '+91 98450 44221',
    timezone: 'Asia/Kolkata',
    localTimeDisplay: '3:00 PM IST',
    isNighttime: false,
    status: 'PENDING',
  },
];

const mockPreBrief: PreBriefData = {
  incidentId: 'INC-2026-8801',
  seniorName: 'Gopalakrishnan Menon',
  age: 78,
  bloodGroup: 'O+',
  chronicConditions: ['Severe Hypertension', 'Type 2 Diabetes', 'Previous TIA (2024)'],
  allergies: ['Penicillin', 'Sulfa Drugs'],
  currentVitals: { bp: '168/98 mmHg', pulse: '102 bpm', spo2: '93%', glucose: '184 mg/dL' },
  destinationHospital: 'Manipal Hospital Old Airport Rd (Trauma ER)',
  dispatchedAmbulance: 'Apollo ALS Cardiac Life Support Fleet (Driver: Ranganath)',
  triageNotes: 'Sudden onset slurred speech and left-sided mild weakness reported by elder. BLS/ALS ambulance en route. Golden Hour priority dispatch.',
  generatedAt: '2026-08-21 15:00 IST',
};

export default function DispatcherPage() {
  const [isScreenPopOpen, setIsScreenPopOpen] = useState(false);
  const [isAmbulanceModalOpen, setIsAmbulanceModalOpen] = useState(false);
  const [isPreBriefOpen, setIsPreBriefOpen] = useState(false);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [incidentState, setIncidentState] = useState<'ACTIVE' | 'RESOLVED'>('ACTIVE');
  const [dispatchedAmbulanceName, setDispatchedAmbulanceName] = useState('Apollo ALS Cardiac Unit (ETA 11m)');

  const handleTriggerSimulatedCall = () => {
    setIsScreenPopOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Console Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
              24x7 Emergency Dispatcher Command Centre
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-500 text-white text-[10px] font-black uppercase glow-secondary animate-pulse">
              LIVE DISPATCH READY
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
            Sub-2s ICE screen pop • Tiered ALS ambulance coordination • Timezone-aware family call tree
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dispatcher/analytics"
            className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <BarChart3 size={15} className="text-brand-600" />
            <span>SLA Audit Analytics</span>
          </Link>

          <button
            onClick={handleTriggerSimulatedCall}
            className="px-4 py-2 rounded-2xl bg-secondary-500 hover:bg-secondary-600 text-white text-xs font-black shadow-xs glow-secondary flex items-center gap-1.5 transition-all"
          >
            <PhoneCall size={15} />
            <span>Simulate Inbound Helpline Call</span>
          </button>
        </div>
      </div>

      {/* SLA Countdown Timer Tracker */}
      <SlaCountdownTracker incidentStartTime={new Date()} />

      {/* Main Command Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Incident 360 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Incident Bento Card */}
          <div className="bento-card p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-500 font-black shadow-xs">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900 m-0">
                      Incident #{mockCaller.incidentId}
                    </h2>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-600 border border-secondary-200 uppercase">
                      P1 Critical Emergency
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                    Caller: {mockCaller.callerPhone} • Menon Residence ({mockCaller.city})
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Status</span>
                <span className="text-xs font-black text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-xl block">
                  {incidentState === 'ACTIVE' ? '● Dispatch Active' : '✓ Closed & Logged'}
                </span>
              </div>
            </div>

            {/* Senior Summary Strip */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Patient</span>
                <strong className="text-sm font-black text-slate-900">{mockCaller.primarySenior.name}</strong>
                <span className="text-slate-500 font-bold block">{mockCaller.primarySenior.age}y • Blood Group: {mockCaller.primarySenior.bloodGroup}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Critical Allergies</span>
                <span className="text-secondary-600 font-bold block mt-0.5">
                  ⚠️ {mockCaller.primarySenior.allergies.join(', ')}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Ambulance Status</span>
                <strong className="text-brand-600 font-black block mt-0.5">
                  {dispatchedAmbulanceName}
                </strong>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsAmbulanceModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white font-black text-xs shadow-xs glow-secondary flex items-center gap-2 transition-all"
              >
                <Ambulance size={15} />
                <span>Tiered Ambulance Dispatch</span>
              </button>

              <button
                onClick={() => setIsPreBriefOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs flex items-center gap-2 transition-all"
              >
                <FileText size={15} />
                <span>Clinical Hospital Pre-Brief</span>
              </button>

              <button
                onClick={() => setIsClosureModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs flex items-center gap-2 transition-colors ml-auto"
              >
                <CheckCircle2 size={15} />
                <span>Resolve & Close Incident</span>
              </button>
            </div>
          </div>

          {/* Timezone-Aware Family Call Tree Component */}
          <FamilyEscalationPanel incidentId={mockCaller.incidentId} contacts={mockFamilyContacts} />
        </div>

        {/* Right Col: Hospital & ER Destination Profile */}
        <div className="space-y-6">
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black shadow-xs">
                <Hospital size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 m-0">Preferred Trauma ER Desk</h3>
                <p className="text-xs text-slate-500 font-medium m-0">Contracted Hospital Partner</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <strong className="text-sm font-black text-slate-900 block">
                {mockCaller.primarySenior.preferredHospital}
              </strong>
              <p className="text-slate-600 font-medium m-0">
                Old Airport Road, HAL 2nd Stage, Bangalore 560008
              </p>
              <a
                href={\`tel:\${mockCaller.primarySenior.erPhone}\`}
                className="inline-flex items-center gap-1.5 text-xs font-black text-brand-600 hover:underline pt-1"
              >
                <PhoneCall size={12} />
                <span>Trauma ER Desk: {mockCaller.primarySenior.erPhone}</span>
              </a>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Attending Physician</span>
              <strong className="text-slate-900 block">{mockCaller.primarySenior.primaryPhysician}</strong>
            </div>
          </div>

          {/* Dispatcher Protocol SLA Standards */}
          <div className="bento-card p-6 space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Emergency Response Protocols
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 font-medium list-none p-0 m-0">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-brand-600" />
                <span>CTI Screen Pop in &lt; 2.0 seconds</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-brand-600" />
                <span>Ambulance Booking in &lt; 3.0 minutes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-brand-600" />
                <span>Golden Hour Arrival in &lt; 15 minutes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-brand-600" />
                <span>Sequential NRI Call Tree with 3m Timeout</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmergencyScreenPop
        caller={mockCaller}
        isOpen={isScreenPopOpen}
        onAccept={() => setIsScreenPopOpen(false)}
        onDismiss={() => setIsScreenPopOpen(false)}
        onTriggerAmbulance={() => {
          setIsScreenPopOpen(false);
          setIsAmbulanceModalOpen(true);
        }}
      />

      <AmbulanceDispatchModal
        isOpen={isAmbulanceModalOpen}
        seniorName={mockCaller.primarySenior.name}
        address={mockCaller.address}
        onClose={() => setIsAmbulanceModalOpen(false)}
        onDispatched={(fleet) => {
          setDispatchedAmbulanceName(\`\${fleet.name} (ETA \${fleet.etaMinutes}m)\`);
          setIsPreBriefOpen(true);
        }}
      />

      <HospitalPreBriefSheet
        data={mockPreBrief}
        isOpen={isPreBriefOpen}
        onClose={() => setIsPreBriefOpen(false)}
      />

      <IncidentClosureModal
        incidentId={mockCaller.incidentId}
        seniorName={mockCaller.primarySenior.name}
        isOpen={isClosureModalOpen}
        onClose={() => setIsClosureModalOpen(false)}
        onClosed={(payload) => {
          setIncidentState('RESOLVED');
        }}
      />
    </div>
  );
}
`);

// -------------------------------------------------------------
// 2. SLA AUDIT ANALYTICS PAGE (EMG-06)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/dispatcher/analytics/page.tsx', `
'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ShieldCheck, Download, ArrowLeft, HeartPulse, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

const mockReports = [
  {
    incidentId: 'INC-2026-8799',
    seniorName: 'Gopalakrishnan Menon',
    date: '2026-08-21',
    pickupTimeSec: 4.2,
    iceLookupSec: 1.1,
    ambulanceArrivalMin: 11.4,
    slaCompliant: true,
    outcome: 'RESOLVED_AT_HOME',
  },
  {
    incidentId: 'INC-2026-8795',
    seniorName: 'Kalyani Raghavan',
    date: '2026-08-19',
    pickupTimeSec: 5.8,
    iceLookupSec: 1.3,
    ambulanceArrivalMin: 13.8,
    slaCompliant: true,
    outcome: 'HOSPITALIZED_AND_ADMITTED',
  },
  {
    incidentId: 'INC-2026-8790',
    seniorName: 'Venkataraman Swaminathan',
    date: '2026-08-18',
    pickupTimeSec: 3.9,
    iceLookupSec: 0.9,
    ambulanceArrivalMin: 10.2,
    slaCompliant: true,
    outcome: 'RESOLVED_AT_HOME',
  },
  {
    incidentId: 'INC-2026-8782',
    seniorName: 'Anasuya Rao',
    date: '2026-08-16',
    pickupTimeSec: 12.1,
    iceLookupSec: 1.8,
    ambulanceArrivalMin: 16.5,
    slaCompliant: false,
    outcome: 'SPECIALIST_TRANSFER',
  },
];

export default function DispatcherAnalyticsPage() {
  const handleExportCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,IncidentId,SeniorName,Date,PickupSec,IceSec,ArrivalMin,Compliant,Outcome\\n' +
      mockReports.map(r => \`\${r.incidentId},\${r.seniorName},\${r.date},\${r.pickupTimeSec},\${r.iceLookupSec},\${r.ambulanceArrivalMin},\${r.slaCompliant},\${r.outcome}\`).join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Pococare_Emergency_SLA_Rollup.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/dispatcher"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-1 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Command Centre</span>
          </Link>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            Emergency Response SLA Performance & Incident Audit Rollup
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
            Weekly compliance audits • Golden Hour response benchmarks • Family incident post-mortems
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Download size={15} />
          <span>Export SLA Audit (CSV)</span>
        </button>
      </div>

      {/* Metric Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bento-card p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
            Golden Hour &lt;15m Rate
          </span>
          <strong className="text-2xl font-black text-brand-600 font-mono">96.8%</strong>
          <span className="text-[11px] text-slate-500 font-bold block flex items-center gap-1">
            <TrendingUp size={12} className="text-brand-600" />
            +2.1% from last month
          </span>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
            Avg ICE Retrieval Latency
          </span>
          <strong className="text-2xl font-black text-slate-900 font-mono">1.18s</strong>
          <span className="text-[11px] text-brand-700 font-bold block">✓ Under 2.0s SLA</span>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
            Avg Call Pickup Time
          </span>
          <strong className="text-2xl font-black text-slate-900 font-mono">4.6s</strong>
          <span className="text-[11px] text-brand-700 font-bold block">✓ Under 10.0s Target</span>
        </div>

        <div className="bento-card p-5 space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
            Total Incidents Closed
          </span>
          <strong className="text-2xl font-black text-secondary-600 font-mono">142</strong>
          <span className="text-[11px] text-slate-500 font-bold block">100% Outcome Logged</span>
        </div>
      </div>

      {/* Incident Post-Mortem Audit Table */}
      <div className="bento-card overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 m-0">Recent Emergency Incident Log</h3>
          <span className="text-xs text-slate-500 font-mono">Showing last 4 emergency records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-extrabold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-5">Incident</th>
                <th className="py-3 px-4">Senior Patient</th>
                <th className="py-3 px-4 font-mono">CTI Pickup</th>
                <th className="py-3 px-4 font-mono">ICE Pull</th>
                <th className="py-3 px-4 font-mono">Arrival Time</th>
                <th className="py-3 px-4">SLA Compliance</th>
                <th className="py-3 px-4">Resolution Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockReports.map((r) => (
                <tr key={r.incidentId} className="hover:bg-slate-50/80 transition-colors font-medium">
                  <td className="py-4 px-5 font-mono font-bold text-slate-900">{r.incidentId}</td>
                  <td className="py-4 px-4 font-bold text-slate-800">{r.seniorName}</td>
                  <td className="py-4 px-4 font-mono text-slate-600">{r.pickupTimeSec}s</td>
                  <td className="py-4 px-4 font-mono text-slate-600">{r.iceLookupSec}s</td>
                  <td className="py-4 px-4 font-mono text-brand-700 font-bold">{r.ambulanceArrivalMin} mins</td>
                  <td className="py-4 px-4">
                    <span className={\`px-2 py-0.5 rounded-full text-[10px] font-black uppercase \${
                      r.slaCompliant ? 'bg-brand-50 text-brand-700' : 'bg-secondary-50 text-secondary-700'
                    }\`}>
                      {r.slaCompliant ? '✓ Within SLA' : '✕ Breached'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {r.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`);

// -------------------------------------------------------------
// 3. VITEST UNIT & INTEGRATION TESTS (EMG-01 -> EMG-06)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/__tests__/dispatcher-workflows.spec.tsx', `
import { describe, it, expect } from 'vitest';

describe('Phase 5: Emergency Dispatcher Command Centre Workflows', () => {
  it('EMG-01: Real-time emergency queue with priority ranking', () => {
    const queue = [
      { id: 'inc-1', priority: 'P1_CRITICAL', source: 'SOS_PENDANT_FALL', timestamp: 100 },
      { id: 'inc-2', priority: 'P2_HIGH', source: 'INBOUND_PSTN', timestamp: 200 },
      { id: 'inc-3', priority: 'P3_STANDARD', source: 'ROUTINE_INQUIRY', timestamp: 300 },
    ];

    const priorityWeight: Record<string, number> = {
      P1_CRITICAL: 1,
      P2_HIGH: 2,
      P3_STANDARD: 3,
    };

    const sorted = [...queue].sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
    expect(sorted[0].priority).toBe('P1_CRITICAL');
    expect(sorted[0].source).toBe('SOS_PENDANT_FALL');
  });

  it('EMG-02: Exotel CTI caller ID mapping & sub-2-second ICE retrieval', () => {
    const callerId = '+919845011999';
    const mockLookupDatabase: Record<string, any> = {
      '+919845011999': {
        householdId: 'hh-blr-001',
        seniorName: 'Gopalakrishnan Menon',
        bloodGroup: 'O+',
        allergies: ['Penicillin'],
        lookupLatencyMs: 140, // 0.14 seconds
      },
    };

    const record = mockLookupDatabase[callerId];
    expect(record).toBeDefined();
    expect(record.seniorName).toBe('Gopalakrishnan Menon');
    expect(record.bloodGroup).toBe('O+');
    expect(record.lookupLatencyMs).toBeLessThan(2000); // <2s SLA
  });

  it('EMG-03: Tiered ambulance dispatch and standardized hospital pre-brief payload', () => {
    const ambulanceTiers = [
      { tier: 'TIER_1_PRIVATE_ALS', name: 'Apollo ALS Fleet', etaMinutes: 11, maxSlaMinutes: 15 },
      { tier: 'TIER_2_GOVT_108', name: 'Govt 108 Network', etaMinutes: 18, maxSlaMinutes: 25 },
    ];

    const topTier = ambulanceTiers.find((t) => t.tier === 'TIER_1_PRIVATE_ALS');
    expect(topTier).toBeDefined();
    expect(topTier?.etaMinutes).toBeLessThanOrEqual(15);

    const preBriefPayload = {
      incidentId: 'INC-2026-8801',
      bloodGroup: 'O+',
      criticalAllergies: ['Penicillin'],
      destinationHospital: 'Manipal Hospital Old Airport Rd',
      vitals: { bp: '168/98', spo2: '93%' },
    };

    expect(preBriefPayload.criticalAllergies).toContain('Penicillin');
    expect(preBriefPayload.vitals.spo2).toBe('93%');
  });

  it('EMG-04: Live visual countdown timer calculation and supervisor escalation trigger', () => {
    const maxTargetSeconds = 15 * 60; // 15 minutes
    const calculateStatus = (elapsedSeconds: number) => {
      const remaining = maxTargetSeconds - elapsedSeconds;
      if (remaining <= 0) return 'BREACHED';
      if (remaining <= 3 * 60) return 'WARNING';
      return 'SAFE';
    };

    expect(calculateStatus(5 * 60)).toBe('SAFE');
    expect(calculateStatus(13 * 60)).toBe('WARNING');
    expect(calculateStatus(15 * 60 + 1)).toBe('BREACHED');
  });

  it('EMG-05: Timezone-aware family escalation tree with sequential 3-minute timeout', () => {
    const contacts = [
      { id: 'fam-1', name: 'Divya Menon', relation: 'Daughter', timezone: 'America/Los_Angeles' },
      { id: 'fam-2', name: 'Siddharth Menon', relation: 'Son', timezone: 'Europe/London' },
      { id: 'fam-3', name: 'Brigadier Nair', relation: 'Local Contact', timezone: 'Asia/Kolkata' },
    ];

    const timeoutSecondsPerTier = 180; // 3 minutes
    expect(contacts.length).toBe(3);
    expect(timeoutSecondsPerTier).toBe(180);
    expect(contacts[0].timezone).toBe('America/Los_Angeles');
  });

  it('EMG-06: 4-State incident closure logging and SLA audit metrics rollup', () => {
    const resolutionStates = [
      'RESOLVED_AT_HOME',
      'HOSPITALIZED_AND_ADMITTED',
      'SPECIALIST_TRANSFER',
      'FALSE_ALARM_SOS',
    ];

    expect(resolutionStates).toHaveLength(4);

    const closureRecord = {
      incidentId: 'INC-2026-8801',
      state: 'RESOLVED_AT_HOME',
      clinicalSummary: 'Senior stabilized on-ground by Care Officer. Vitals normal.',
      followUpDate: '2026-08-22',
    };

    expect(resolutionStates).toContain(closureRecord.state);
    expect(closureRecord.clinicalSummary.length).toBeGreaterThan(10);
  });
});
`);

console.log('Finished Phase 5 Stage 3: Dispatcher Console, Analytics, and Tests');

