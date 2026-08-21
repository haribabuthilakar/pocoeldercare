'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, ShieldCheck, Activity, Headphones, Share2, ArrowRight } from 'lucide-react';
import { AbhaSyncPanel } from '../../components/integrations/abha-sync-panel';
import { DiagnosticLabWebhookPanel } from '../../components/integrations/diagnostic-lab-webhook-panel';

export default function IntegrationsOverviewPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            External Integrations & Telehealth Gateway
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
            ABDM/ABHA Health Accounts • Diagnostic Lab Webhooks • Exotel Telephony Voice Hub
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/voice-tickets"
            className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-black shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Headphones size={15} className="text-brand-600" />
            <span>Vernacular Voice Tickets</span>
          </Link>
          <Link
            href="/community"
            className="px-4 py-2 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-black shadow-xs glow-primary flex items-center gap-1.5 transition-all"
          >
            <Share2 size={15} />
            <span>Community Mobile Logger</span>
          </Link>
        </div>
      </div>

      {/* ABHA ABDM Sync Panel */}
      <AbhaSyncPanel />

      {/* Diagnostic Lab Webhook Panel */}
      <DiagnosticLabWebhookPanel />
    </div>
  );
}
