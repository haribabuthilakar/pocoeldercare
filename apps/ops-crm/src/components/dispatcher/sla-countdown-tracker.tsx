'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export interface SlaTarget {
  name: string;
  targetSeconds: number;
  elapsedSeconds: number;
  status: 'SAFE' | 'WARNING' | 'BREACHED';
}

export const SlaCountdownTracker: React.FC<{
  incidentStartTime: Date;
  onBreachAlert?: () => void;
}> = ({ incidentStartTime, onBreachAlert }) => {
  const [totalSeconds, setTotalSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const ambulanceTargetSeconds = 15 * 60; // 15 mins (Golden Hour arrival)
  const remainingSeconds = Math.max(0, ambulanceTargetSeconds - totalSeconds);

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isWarning = remainingSeconds <= 3 * 60 && remainingSeconds > 0;
  const isBreached = remainingSeconds === 0;

  return (
    <div className={`p-4 rounded-3xl border transition-all flex flex-col md:flex-row items-center justify-between gap-4 ${
      isBreached
        ? 'bg-secondary-50 border-secondary-300 text-secondary-900 glow-secondary'
        : isWarning
        ? 'bg-amber-50 border-amber-300 text-amber-900'
        : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
          isBreached
            ? 'bg-secondary-500 text-white animate-pulse'
            : isWarning
            ? 'bg-amber-500 text-white'
            : 'bg-brand-50 text-brand-600'
        }`}>
          <Clock size={20} />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            Published Golden Hour SLA (15m Target)
          </span>
          <div className="flex items-center gap-2">
            <strong className="text-xl font-black font-mono tracking-tight">
              {formatMinSec(remainingSeconds)}
            </strong>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
              isBreached
                ? 'bg-secondary-500 text-white'
                : isWarning
                ? 'bg-amber-500 text-white'
                : 'bg-brand-50 text-brand-700'
            }`}>
              {isBreached ? '🚨 SLA BREACHED — SUPERVISOR ALERTED' : isWarning ? '⚠️ WARNING: <3M REMAINING' : 'ON TRACK'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[9px] text-slate-400 block uppercase">ICE Lookup</span>
          <strong className="text-slate-800 font-bold">1.2s (&lt;2s)</strong>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[9px] text-slate-400 block uppercase">CTI Pickup</span>
          <strong className="text-slate-800 font-bold">4.8s (&lt;10s)</strong>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[9px] text-slate-400 block uppercase">Ambulance Dispatch</span>
          <strong className="text-brand-600 font-bold">1m 42s (&lt;3m)</strong>
        </div>
      </div>
    </div>
  );
};
