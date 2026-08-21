const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

writeFile('apps/ops-crm/src/components/dashboard/live-request-table.tsx', `'use client';

import React, { useState } from 'react';
import { AutoAssignModal, OverrideAuditLog } from '../assignment/auto-assign-modal';
import { Clock, AlertTriangle, UserCheck, ShieldCheck, Search, Filter } from 'lucide-react';

interface ServiceRequest {
  id: string;
  householdName: string;
  seniorName: string;
  city: string;
  serviceCategory: 'EMERGENCY' | 'HOME_VISIT' | 'TELECONSULT' | 'DIAGNOSTICS';
  serviceName: string;
  slaTargetMin: number;
  elapsedSec: number;
  assignedOfficerName?: string;
  status: 'UNASSIGNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
}

const initialRequests: ServiceRequest[] = [
  {
    id: 'req-001',
    householdName: 'Menon Family (Indiranagar)',
    seniorName: 'Gopalakrishnan Menon (79)',
    city: 'Bangalore',
    serviceCategory: 'EMERGENCY',
    serviceName: 'SOS Emergency Response Trigger',
    slaTargetMin: 15,
    elapsedSec: 120,
    status: 'UNASSIGNED',
  },
  {
    id: 'req-002',
    householdName: 'Raghavan Family (Whitefield)',
    seniorName: 'Kalyani Raghavan (82)',
    city: 'Bangalore',
    serviceCategory: 'HOME_VISIT',
    serviceName: 'Dedicated Care Officer Monthly Visit',
    slaTargetMin: 120,
    elapsedSec: 4200,
    assignedOfficerName: 'Ramesh Kumar',
    status: 'IN_PROGRESS',
  },
  {
    id: 'req-003',
    householdName: 'Deshmukh Household (Bandra)',
    seniorName: 'Suresh Deshmukh (81)',
    city: 'Mumbai',
    serviceCategory: 'TELECONSULT',
    serviceName: 'Geriatric Specialist Teleconsult (MED-04)',
    slaTargetMin: 30,
    elapsedSec: 2100,
    status: 'UNASSIGNED',
  },
  {
    id: 'req-004',
    householdName: 'Sundaram Residence (Adyar)',
    seniorName: 'Padma Sundaram (76)',
    city: 'Chennai',
    serviceCategory: 'DIAGNOSTICS',
    serviceName: 'Home Blood Sample Collection (MED-06)',
    slaTargetMin: 60,
    elapsedSec: 1500,
    assignedOfficerName: 'Kavitha R',
    status: 'ASSIGNED',
  },
];

export const LiveRequestTable: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeModalRequest, setActiveModalRequest] = useState<ServiceRequest | null>(null);
  const [auditLogs, setAuditLogs] = useState<OverrideAuditLog[]>([]);

  const filteredRequests = requests.filter((r) => {
    if (selectedCategory !== 'ALL' && r.serviceCategory !== selectedCategory) return false;
    return true;
  });

  const handleAssignConfirm = (officerId: string, overrideLog?: OverrideAuditLog) => {
    if (!activeModalRequest) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === activeModalRequest.id
          ? { ...r, status: 'ASSIGNED', assignedOfficerName: 'Assigned Officer' }
          : r
      )
    );
    if (overrideLog) {
      setAuditLogs((prev) => [overrideLog, ...prev]);
    }
    setActiveModalRequest(null);
  };

  return (
    <div className="space-y-4">
      {/* Category Filter & Live Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'EMERGENCY', 'HOME_VISIT', 'TELECONSULT', 'DIAGNOSTICS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-sm glow-primary font-extrabold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1.5 text-brand-600">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            Live Dispatch Telemetry
          </span>
          {auditLogs.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-50 text-secondary-600 border border-secondary-200 text-[11px] font-extrabold">
              {auditLogs.length} Audit Overrides Logged
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Household & Senior</th>
              <th className="py-3.5 px-4">City</th>
              <th className="py-3.5 px-4">Service Required</th>
              <th className="py-3.5 px-4">SLA Countdown</th>
              <th className="py-3.5 px-4">Assigned Personnel</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredRequests.map((req) => {
              const remainingSec = req.slaTargetMin * 60 - req.elapsedSec;
              const isBreached = remainingSec <= 0;
              const formatTime = (s: number) => {
                const abs = Math.abs(s);
                const m = Math.floor(abs / 60);
                const sec = abs % 60;
                return \`\${m}m \${sec}s\`;
              };

              return (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-slate-900 block">{req.householdName}</span>
                    <span className="text-[11px] text-slate-500 font-semibold">{req.seniorName}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[11px]">
                      {req.city}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={\`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1 \${
                        req.serviceCategory === 'EMERGENCY'
                          ? 'bg-secondary-50 text-secondary-600 border border-secondary-200'
                          : 'bg-brand-50 text-brand-700 border border-brand-200'
                      }\`}
                    >
                      {req.serviceCategory}
                    </span>
                    <span className="block font-bold text-slate-800">{req.serviceName}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={\`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-extrabold \${
                        isBreached
                          ? 'bg-secondary-50 text-secondary-600 border border-secondary-200 animate-pulse'
                          : 'bg-brand-50 text-brand-700 border border-brand-200'
                      }\`}
                    >
                      <Clock size={12} />
                      <span>{isBreached ? \`+\${formatTime(remainingSec)} (BREACH)\` : formatTime(remainingSec)}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {req.assignedOfficerName ? (
                      <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand-500" />
                        {req.assignedOfficerName}
                      </span>
                    ) : (
                      <span className="text-secondary-600 font-extrabold">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setActiveModalRequest(req)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold transition-all shadow-sm glow-primary"
                    >
                      {req.assignedOfficerName ? 'Reassign' : 'Auto-Assign'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeModalRequest && (
        <AutoAssignModal
          serviceRequestId={activeModalRequest.id}
          householdName={activeModalRequest.householdName}
          serviceName={activeModalRequest.serviceName}
          onClose={() => setActiveModalRequest(null)}
          onConfirmAssign={handleAssignConfirm}
        />
      )}
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/components/assignment/auto-assign-modal.tsx', `'use client';

import React, { useState } from 'react';
import { UserCheck, ShieldAlert, ArrowRight, X, Sparkles, Check } from 'lucide-react';

interface CandidateOfficer {
  id: string;
  name: string;
  phone: string;
  score: number;
  proximityKm: number;
  currentCaseload: number;
  maxCaseload: number;
  languages: string[];
  rating: number;
}

export interface OverrideAuditLog {
  id: string;
  serviceRequestId: string;
  originalOfficerId: string;
  selectedOfficerId: string;
  reasonCategory: string;
  notes: string;
  managerEmail: string;
  timestamp: string;
}

interface AutoAssignModalProps {
  serviceRequestId: string;
  householdName: string;
  serviceName: string;
  onClose: () => void;
  onConfirmAssign: (officerId: string, overrideLog?: OverrideAuditLog) => void;
}

const mockCandidates: CandidateOfficer[] = [
  {
    id: 'off-001',
    name: 'Ramesh Kumar (Top Match)',
    phone: '+91 98450 99888',
    score: 96,
    proximityKm: 2.1,
    currentCaseload: 28,
    maxCaseload: 35,
    languages: ['Kannada', 'English', 'Tamil'],
    rating: 4.9,
  },
  {
    id: 'off-002',
    name: 'Suresh Gowda',
    phone: '+91 98450 11223',
    score: 84,
    proximityKm: 4.8,
    currentCaseload: 22,
    maxCaseload: 35,
    languages: ['Kannada', 'Telugu'],
    rating: 4.7,
  },
  {
    id: 'off-003',
    name: 'Meenakshi Iyer',
    phone: '+91 98450 44556',
    score: 79,
    proximityKm: 6.2,
    currentCaseload: 31,
    maxCaseload: 35,
    languages: ['Tamil', 'Hindi', 'English'],
    rating: 4.8,
  },
];

export const AutoAssignModal: React.FC<AutoAssignModalProps> = ({
  serviceRequestId,
  householdName,
  serviceName,
  onClose,
  onConfirmAssign,
}) => {
  const topCandidate = mockCandidates[0];
  const [selectedOfficerId, setSelectedOfficerId] = useState(topCandidate.id);
  const [overrideReason, setOverrideReason] = useState('FAMILY_PREFERENCE');
  const [overrideNotes, setOverrideNotes] = useState('');

  const isManualOverride = selectedOfficerId !== topCandidate.id;

  const handleAssign = () => {
    if (isManualOverride) {
      if (!overrideNotes.trim()) {
        alert('Mandatory Audit Policy: Free-text justification note is required for manual assignment overrides.');
        return;
      }
      const log: OverrideAuditLog = {
        id: \`audit-\${Date.now()}\`,
        serviceRequestId,
        originalOfficerId: topCandidate.id,
        selectedOfficerId,
        reasonCategory: overrideReason,
        notes: overrideNotes,
        managerEmail: 'ops.lead@pococare.in',
        timestamp: new Date().toISOString(),
      };
      onConfirmAssign(selectedOfficerId, log);
    } else {
      onConfirmAssign(selectedOfficerId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl bg-slate-100"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 m-0">Intelligent Auto-Assignment</h3>
            <p className="text-xs text-slate-500 m-0">
              {householdName} • <strong className="text-slate-800">{serviceName}</strong>
            </p>
          </div>
        </div>

        {/* Candidates */}
        <div className="space-y-3 mb-5">
          {mockCandidates.map((cand) => {
            const isSelected = selectedOfficerId === cand.id;
            const isTop = cand.id === topCandidate.id;
            return (
              <div
                key={cand.id}
                onClick={() => setSelectedOfficerId(cand.id)}
                className={\`p-4 rounded-2xl border cursor-pointer transition-all \${
                  isSelected
                    ? 'bg-brand-50/70 border-brand-500 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{cand.name}</span>
                    {isTop && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-500 text-white">
                        AI Top Match
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-brand-600">{cand.score}/100</span>
                    <span className="block text-[10px] text-slate-500 font-semibold">Match Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200/60 font-medium">
                  <div>📍 {cand.proximityKm} km away</div>
                  <div>👥 {cand.currentCaseload}/{cand.maxCaseload} Families</div>
                  <div>⭐ {cand.rating} Rating</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mandatory Override Prompt */}
        {isManualOverride && (
          <div className="p-4 rounded-2xl bg-secondary-50 border border-secondary-200 mb-5">
            <div className="flex items-center gap-2 mb-2 text-secondary-700">
              <ShieldAlert size={16} />
              <span className="text-xs font-black uppercase tracking-wider">
                Mandatory Override Justification (OPS-07)
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Override Reason Category
                </label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                >
                  <option value="FAMILY_PREFERENCE">Family Requested Specific Officer</option>
                  <option value="TRAFFIC_PROXIMITY_ANOMALY">Local Traffic / Route Bottleneck</option>
                  <option value="SPECIALIZED_CLINICAL_SKILL">Specialized Clinical / Language Need</option>
                  <option value="OFFICER_EMERGENCY_REASSIGNMENT">Shift Overrun / Emergency Handover</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Manager Justification Notes
                </label>
                <textarea
                  rows={2}
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Provide context for audit log..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 outline-none"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            className="flex-1.5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md glow-primary"
          >
            <span>{isManualOverride ? 'Confirm Override & Log Audit' : 'Confirm Assignment'}</span>
            <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/households/[id]/page.tsx', `'use client';

import React, { useState } from 'react';
import { TimelineFeed } from '../../../components/households/timeline-feed';
import { IceQuickDrawer } from '../../../components/households/ice-quick-drawer';
import { ShieldAlert, Phone, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HouseholdDetailPage({ params }: { params: { id: string } }) {
  const [showIceDrawer, setShowIceDrawer] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900">
          <ArrowLeft size={14} />
          <span>Back to Live Command</span>
        </Link>

        <button
          onClick={() => setShowIceDrawer(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white text-xs font-extrabold shadow-sm glow-secondary transition-all"
        >
          <ShieldAlert size={16} />
          <span>1-Click Senior ICE Emergency Sheet</span>
        </button>
      </div>

      {/* Household Profile Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 m-0">Menon Household</h2>
              <span className="px-3 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-extrabold">
                Sampoorna Plan (Active)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-0 flex items-center gap-1.5 font-medium">
              <MapPin size={13} className="text-brand-600" />
              #402, 12th Main, HAL 2nd Stage, Indiranagar, Bangalore 560038
            </p>
          </div>

          <div className="flex gap-6 text-right">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Officer</span>
              <span className="text-sm font-black text-slate-900">Ramesh Kumar</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Wallet Balance</span>
              <span className="text-sm font-black text-brand-600">₹14,500.00</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block font-semibold">Senior Resident:</span>
            <strong className="text-slate-900">Gopalakrishnan Menon (79 yrs)</strong>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Primary Emergency Sponsor:</span>
            <strong className="text-slate-900">Divya Menon (Daughter • California, USA)</strong>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold">Preferred Trauma Center:</span>
            <strong className="text-slate-900">Manipal Hospital Old Airport Rd (1.8 km)</strong>
          </div>
        </div>
      </div>

      {/* 360 Timeline Feed */}
      <TimelineFeed />

      {/* ICE Drawer Modal */}
      {showIceDrawer && (
        <IceQuickDrawer
          onClose={() => setShowIceDrawer(false)}
          seniorName="Gopalakrishnan Menon"
          age={79}
          bloodGroup="O+ Positive"
          conditions={['Hypertension', 'Type 2 Diabetes', 'Mild Osteoarthritis']}
          allergies={['Penicillin / Amoxicillin', 'Sulfa Drugs']}
          preferredHospital="Manipal Hospital Old Airport Rd"
          erPhone="+91 80 2502 4444"
          nriContact={{
            name: 'Divya Menon',
            relation: 'Daughter (NRI)',
            phone: '+1 408 555 0192',
            timezone: 'PST (UTC-8)',
          }}
          localNeighborContact={{
            name: 'Col. K. R. Sharma (Retd.)',
            phone: '+91 98450 77112',
          }}
        />
      )}
    </div>
  );
}
`);

writeFile('apps/ops-crm/src/components/households/ice-quick-drawer.tsx', `'use client';

import React from 'react';
import { ShieldAlert, X, Phone, Heart, Hospital, AlertOctagon } from 'lucide-react';

interface IceQuickDrawerProps {
  onClose: () => void;
  seniorName: string;
  age: number;
  bloodGroup: string;
  conditions: string[];
  allergies: string[];
  preferredHospital: string;
  erPhone: string;
  nriContact: { name: string; relation: string; phone: string; timezone: string };
  localNeighborContact: { name: string; phone: string };
}

export const IceQuickDrawer: React.FC<IceQuickDrawerProps> = ({
  onClose,
  seniorName,
  age,
  bloodGroup,
  conditions,
  allergies,
  preferredHospital,
  erPhone,
  nriContact,
  localNeighborContact,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 overflow-y-auto shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-secondary-600">
            <ShieldAlert size={22} />
            <div>
              <h3 className="text-base font-black text-slate-900 m-0">Verified Senior ICE Emergency Sheet</h3>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sub-2s Query Encrypted Store</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* Vital Snapshot */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-base font-extrabold text-slate-900 m-0">{seniorName}</h4>
              <span className="text-xs text-slate-500 font-medium">Age: {age} • Blood Group: <strong className="text-brand-600">{bloodGroup}</strong></span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-[10px] font-black">
              ICE ACTIVE
            </span>
          </div>
        </div>

        {/* Chronic Conditions & Allergies */}
        <div className="space-y-3">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
              Chronic Medical Conditions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {conditions.map((c, i) => (
                <span key={i} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white text-slate-800 border border-slate-200">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-secondary-50 border border-secondary-200 p-4 rounded-2xl">
            <span className="text-[11px] font-extrabold text-secondary-700 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <AlertOctagon size={14} />
              Known Drug Allergies & Contraindications
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allergies.map((a, i) => (
                <span key={i} className="text-xs font-black px-2.5 py-1 rounded-lg bg-white text-secondary-700 border border-secondary-200">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Trauma Hospital */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
          <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
            Preferred Hospital & Trauma ER
          </span>
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
            <Hospital size={16} className="text-brand-600" />
            <span>{preferredHospital}</span>
          </div>
          <a
            href={\`tel:\${erPhone}\`}
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:underline pt-1"
          >
            <Phone size={12} />
            <span>Direct ER Line: {erPhone}</span>
          </a>
        </div>

        {/* Emergency Call Trees */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
          <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
            Emergency Call Escalation Tree
          </span>
          
          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">{nriContact.name} ({nriContact.relation})</span>
              <span className="text-[10px] text-slate-500">{nriContact.timezone} • {nriContact.phone}</span>
            </div>
            <a href={\`tel:\${nriContact.phone}\`} className="p-2 rounded-lg bg-brand-500 text-white">
              <Phone size={13} />
            </a>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-slate-900 block">{localNeighborContact.name} (Key Holder Neighbor)</span>
              <span className="text-[10px] text-slate-500">{localNeighborContact.phone}</span>
            </div>
            <a href={\`tel:\${localNeighborContact.phone}\`} className="p-2 rounded-lg bg-brand-500 text-white">
              <Phone size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/components/households/timeline-feed.tsx', `'use client';

import React from 'react';
import { PhoneCall, MapPin, Stethoscope, AlertTriangle, Wallet, Camera, Mic, CheckCircle2, Clock } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'TELEPHONY_CALL' | 'CARE_VISIT' | 'TELECONSULT' | 'INCIDENT' | 'WALLET_TOPUP';
  title: string;
  timestamp: string;
  officerOrDoctorName: string;
  summary: string;
  audioRecordingUrl?: string;
  photoProofs?: string[];
  metrics?: { [key: string]: string | number };
  status: 'COMPLETED' | 'ACTION_REQUIRED' | 'LOGGED';
}

const mockEvents: TimelineEvent[] = [
  {
    id: 'evt-001',
    type: 'CARE_VISIT',
    title: 'In-Person Care Officer Monthly Safety & Adherence Visit',
    timestamp: 'Today at 10:30 AM',
    officerOrDoctorName: 'Ramesh Kumar (Care Officer)',
    summary: 'Completed 5-minute dynamic SOP. Pillbox refilled for 14 days, bathroom grab bars verified stable, senior cheerful.',
    photoProofs: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300'],
    metrics: { 'BP': '128/82 mmHg', 'SpO2': '98%', 'Pulse': '74 bpm', 'SOP Speed': '2m 45s' },
    status: 'COMPLETED',
  },
  {
    id: 'evt-002',
    type: 'TELEPHONY_CALL',
    title: 'IVR Telephony Check-in Call (Exotel)',
    timestamp: 'Yesterday at 04:15 PM',
    officerOrDoctorName: 'Automated Elder Voice Tree',
    summary: 'Senior pressed 1 to confirm evening BP medication taken. Transcription sentiment: Positive, calm.',
    audioRecordingUrl: 'mock-audio-recording.mp3',
    status: 'COMPLETED',
  },
  {
    id: 'evt-003',
    type: 'TELECONSULT',
    title: 'Geriatric Specialist Teleconsultation (MED-04)',
    timestamp: '18 Aug 2026 at 11:00 AM',
    officerOrDoctorName: 'Dr. Arvind Swamy (Geriatrician)',
    summary: 'Reviewed quarterly HbA1c and lipid profiles. Adjusted metformin dosage, requested follow-up in 90 days.',
    metrics: { 'Prescription': 'Rx Issued (3 items)', 'Follow-up': '18 Nov 2026' },
    status: 'COMPLETED',
  },
  {
    id: 'evt-004',
    type: 'WALLET_TOPUP',
    title: 'In-App INR Wallet Auto-Topup by NRI Daughter',
    timestamp: '15 Aug 2026 at 02:00 PM',
    officerOrDoctorName: 'Divya Menon (California, USA)',
    summary: 'Auto-replenishment of ₹10,000 for emergency dispatch holds and pay-per-use diagnostic requests.',
    metrics: { 'Amount': '+₹10,000.00', 'Balance': '₹14,500.00' },
    status: 'LOGGED',
  },
];

export const TimelineFeed: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-slate-900 m-0">360° Unified Timeline</h3>
        <span className="text-xs text-slate-500 font-semibold">Chronological Multi-Channel Ledger</span>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
        {mockEvents.map((evt) => {
          const getIcon = () => {
            switch (evt.type) {
              case 'CARE_VISIT': return <MapPin size={16} className="text-brand-600" />;
              case 'TELEPHONY_CALL': return <PhoneCall size={16} className="text-sky-600" />;
              case 'TELECONSULT': return <Stethoscope size={16} className="text-secondary-600" />;
              case 'WALLET_TOPUP': return <Wallet size={16} className="text-emerald-600" />;
              default: return <Clock size={16} className="text-slate-400" />;
            }
          };

          return (
            <div key={evt.id} className="relative group">
              {/* Pin */}
              <div className="absolute -left-[35px] top-1 w-8 h-8 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-sm group-hover:border-brand-500 transition-colors">
                {getIcon()}
              </div>

              {/* Event Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 m-0">{evt.title}</h4>
                    <span className="text-xs text-slate-500 font-semibold">{evt.officerOrDoctorName}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                    {evt.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed my-3 font-normal">
                  {evt.summary}
                </p>

                {/* Metrics Pill Grid */}
                {evt.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {Object.entries(evt.metrics).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">{k}</span>
                        <span className="text-xs font-black text-slate-900">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Photo Proof Gallery */}
                {evt.photoProofs && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Camera size={13} className="text-brand-600" />
                      Verified Visit Photos:
                    </span>
                    <div className="flex gap-2">
                      {evt.photoProofs.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt="Proof"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 hover:scale-105 transition-transform"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio Recorder Link */}
                {evt.audioRecordingUrl && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs text-slate-700">
                    <Mic size={14} className="text-sky-600" />
                    <span className="font-bold">Call Audio Recording Attached (1:12)</span>
                    <button className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px]">
                      Play Audio
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
`);

console.log('Finished retheme part 2');

