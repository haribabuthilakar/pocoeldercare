'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, AlertTriangle, ShieldCheck, MapPin, User, Star } from 'lucide-react';
import { ServiceTicket } from '../dashboard/live-request-table';

interface CandidateOfficer {
  id: string;
  name: string;
  phone: string;
  proximityKm: number;
  transitTimeMins: number;
  currentCaseload: number;
  maxCaseload: number;
  languages: string[];
  rating: number;
  isAiTopMatch: boolean;
  score: number;
}

const mockCandidates: CandidateOfficer[] = [
  {
    id: 'off-001',
    name: 'Ramesh Kumar',
    phone: '+91 98450 99888',
    proximityKm: 2.1,
    transitTimeMins: 8,
    currentCaseload: 26,
    maxCaseload: 35,
    languages: ['Kannada', 'English', 'Tamil'],
    rating: 4.9,
    isAiTopMatch: true,
    score: 94,
  },
  {
    id: 'off-002',
    name: 'Suresh Gowda',
    phone: '+91 98450 11223',
    proximityKm: 4.8,
    transitTimeMins: 16,
    currentCaseload: 22,
    maxCaseload: 35,
    languages: ['Kannada', 'Telugu'],
    rating: 4.7,
    isAiTopMatch: false,
    score: 82,
  },
  {
    id: 'off-003',
    name: 'Anand Varma',
    phone: '+91 98450 33445',
    proximityKm: 7.2,
    transitTimeMins: 24,
    currentCaseload: 31,
    maxCaseload: 35,
    languages: ['Malayalam', 'English', 'Tamil'],
    rating: 4.85,
    isAiTopMatch: false,
    score: 68,
  },
];

export const AutoAssignModal: React.FC<{
  ticket: ServiceTicket;
  onClose: () => void;
  onAssign: (officerName: string) => void;
}> = ({ ticket, onClose, onAssign }) => {
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(mockCandidates[0].id);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('FAMILY_PREFERENCE');
  const [overrideNotes, setOverrideNotes] = useState('');

  const topMatch = mockCandidates.find((c) => c.isAiTopMatch)!;
  const isOverriding = selectedOfficerId !== topMatch.id;

  const handleConfirmAssignment = () => {
    if (isOverriding && !isOverrideModalOpen) {
      setIsOverrideModalOpen(true);
      return;
    }

    const officer = mockCandidates.find((c) => c.id === selectedOfficerId);
    if (officer) {
      onAssign(officer.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-brand-50 text-brand-600">
                <Sparkles size={16} />
              </span>
              <h2 className="text-lg font-black text-slate-900 m-0">Intelligent Field Auto-Assignment</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
              Multi-factor match for <strong className="text-slate-700">{ticket.householdName}</strong> ({ticket.zone})
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Candidate List */}
        <div className="space-y-2.5">
          {mockCandidates.map((candidate) => {
            const isSelected = selectedOfficerId === candidate.id;

            return (
              <div
                key={candidate.id}
                onClick={() => setSelectedOfficerId(candidate.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-50/70 border-brand-400 ring-2 ring-brand-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                      {candidate.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-slate-900">{candidate.name}</strong>
                        {candidate.isAiTopMatch && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-500 text-white shadow-sm glow-primary">
                            AI TOP MATCH (94%)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium m-0 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1"><MapPin size={12} className="text-brand-600" /> {candidate.proximityKm} km ({candidate.transitTimeMins} mins)</span>
                        <span>•</span>
                        <span>Load: {candidate.currentCaseload}/{candidate.maxCaseload} Families</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1 justify-end">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      {candidate.rating}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold block mt-0.5">{candidate.score} pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Override Modal Overlay if Manual Selection */}
        {isOverrideModalOpen && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs">
              <AlertTriangle size={15} />
              <span>Mandatory Override Audit Prompt (OPS-07)</span>
            </div>
            <p className="text-[11px] text-amber-700 m-0">
              You are manually overriding the AI recommended candidate. Please specify a justification:
            </p>

            <select
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-amber-300 bg-white text-slate-800 outline-none"
            >
              <option value="FAMILY_PREFERENCE">Senior / Family specifically requested this officer</option>
              <option value="TRAFFIC_PROXIMITY_ANOMALY">Local road closure or real-time transit advantage</option>
              <option value="SPECIALIZED_CLINICAL_SKILL">Officer has specialized clinical / language rapport</option>
              <option value="OFFICER_EMERGENCY_REASSIGNMENT">Emergency re-route for load balancing</option>
            </select>

            <textarea
              placeholder="Enter mandatory audit notes (min 10 characters)..."
              value={overrideNotes}
              onChange={(e) => setOverrideNotes(e.target.value)}
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-amber-300 bg-white text-slate-800 outline-none"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAssignment}
            disabled={isOverrideModalOpen && overrideNotes.trim().length < 10}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-sm glow-primary transition-all flex items-center gap-2"
          >
            <Check size={15} />
            <span>{isOverriding ? 'Confirm Override & Dispatch' : '1-Click Auto-Dispatch'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
