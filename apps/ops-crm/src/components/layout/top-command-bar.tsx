'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Bell, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { CommandPaletteModal } from './command-palette-modal';

export const TopCommandBar: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState('Bangalore');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Quick City Switcher & Time */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <MapPin size={13} className="text-brand-600 ml-1.5" />
            {['Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi-NCR'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedCity === city
                    ? 'bg-white text-brand-700 shadow-xs border border-slate-200/60 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <Clock size={13} className="text-brand-600" />
            <span>{timeString || '12:00:00 PM'} IST</span>
          </div>
        </div>

        {/* Center/Right: Quick Search Button & Notification Pill */}
        <div className="flex items-center gap-3">
          {/* Quick Search Button triggering Command Palette */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-500 text-xs font-medium transition-all shadow-xs"
          >
            <Search size={14} className="text-slate-400" />
            <span className="hidden sm:inline">Quick Search (Ctrl+K)...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-500">
              Ctrl+K
            </kbd>
          </button>

          {/* Critical Alerts Bell */}
          <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary-500 animate-ping" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary-500" />
          </button>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPaletteModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
};
