'use client';

import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Clock, Globe, ShieldAlert, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

export interface FamilyContactNode {
  id: string;
  name: string;
  relation: string;
  phone: string;
  timezone: string; // e.g. "America/Los_Angeles", "Europe/London", "Asia/Kolkata"
  localTimeDisplay: string;
  isNighttime: boolean;
  status: 'PENDING' | 'RINGING' | 'ACKNOWLEDGED' | 'TIMEOUT_ESCALATED';
}

export const FamilyEscalationPanel: React.FC<{
  incidentId: string;
  contacts: FamilyContactNode[];
}> = ({ incidentId, contacts }) => {
  const [contactList, setContactList] = useState<FamilyContactNode[]>(contacts);
  const [activeCallIndex, setActiveCallIndex] = useState(0);
  const [countdown, setCountdown] = useState(180); // 3 minutes timeout

  useEffect(() => {
    if (activeCallIndex >= contactList.length) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          // Timeout: escalate to next
          setContactList((prev) =>
            prev.map((contact, idx) =>
              idx === activeCallIndex ? { ...contact, status: 'TIMEOUT_ESCALATED' } : contact
            )
          );
          setActiveCallIndex((prevIdx) => prevIdx + 1);
          return 180;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCallIndex, contactList.length]);

  const handleAcknowledge = (id: string) => {
    setContactList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'ACKNOWLEDGED' } : c))
    );
  };

  const handleTriggerManualCall = (id: string) => {
    setContactList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'RINGING' } : c))
    );
  };

  return (
    <div className="bento-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-500 font-black shadow-xs">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 m-0">
              Timezone-Aware Family Escalation Call Tree
            </h3>
            <p className="text-xs text-slate-500 font-medium m-0">
              Sequential 3-minute timeout with dual WhatsApp & IVR voice alerts
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-xl bg-brand-50 text-brand-700 font-mono font-bold text-xs flex items-center gap-1.5">
          <MessageSquare size={13} />
          <span>WhatsApp & SMS Dispatched Instantly</span>
        </div>
      </div>

      {/* Contact Tree Nodes */}
      <div className="space-y-3 pt-2">
        {contactList.map((contact, idx) => {
          const isCurrentActive = idx === activeCallIndex && contact.status !== 'ACKNOWLEDGED';

          return (
            <div
              key={contact.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-center justify-between gap-4 ${
                contact.status === 'ACKNOWLEDGED'
                  ? 'bg-brand-50/60 border-brand-200'
                  : isCurrentActive
                  ? 'bg-secondary-50/40 border-secondary-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                    contact.status === 'ACKNOWLEDGED'
                      ? 'bg-brand-500 text-white'
                      : isCurrentActive
                      ? 'bg-secondary-500 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-black text-slate-900">{contact.name}</strong>
                    <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-white border border-slate-200">
                      {contact.relation}
                    </span>
                    {contact.isNighttime && (
                      <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        🌙 Local Nighttime ({contact.localTimeDisplay})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono m-0 mt-0.5">
                    {contact.phone} • {contact.timezone} ({contact.localTimeDisplay})
                  </p>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center gap-3">
                {contact.status === 'ACKNOWLEDGED' && (
                  <span className="text-xs font-black text-brand-600 flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Acknowledged by Family</span>
                  </span>
                )}

                {contact.status === 'TIMEOUT_ESCALATED' && (
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <AlertCircle size={14} />
                    <span>Unanswered (Escalated)</span>
                  </span>
                )}

                {isCurrentActive && (
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-mono font-bold text-secondary-600 flex items-center gap-1">
                      <Clock size={13} className="animate-spin" />
                      <span>Ringing... ({countdown}s left)</span>
                    </div>
                    <button
                      onClick={() => handleAcknowledge(contact.id)}
                      className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold transition-colors shadow-xs"
                    >
                      Mark Acknowledged
                    </button>
                  </div>
                )}

                {contact.status === 'PENDING' && !isCurrentActive && (
                  <button
                    onClick={() => handleTriggerManualCall(contact.id)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Force Dial
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
