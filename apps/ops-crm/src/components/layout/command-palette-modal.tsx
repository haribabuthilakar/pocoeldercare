'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Users, UserCheck, Stethoscope, FileCode2, Wallet, Activity, ArrowRight } from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'HOUSEHOLD' | 'OFFICER' | 'PARTNER' | 'CATALOG' | 'PAGE';
  href: string;
}

const searchItems: SearchItem[] = [
  { id: 's0', title: '24x7 Emergency Dispatcher Command Console', subtitle: 'Live CTI Screen Pop & Tiered Ambulance Dispatch', category: 'PAGE', href: '/dispatcher' },
  { id: 's01', title: 'Emergency Response SLA Performance Analytics', subtitle: 'Golden Hour Metrics & Family Incident Post-Mortems', category: 'PAGE', href: '/dispatcher/analytics' },
  { id: 's1', title: 'Menon Family (Gopalakrishnan Menon, 79)', subtitle: 'Indiranagar, Bangalore East • Active Plan', category: 'HOUSEHOLD', href: '/households/hh-blr-001' },
  { id: 's2', title: 'Raghavan Family (Kalyani Raghavan, 82)', subtitle: 'Jayanagar, Bangalore South • Post-Op Rehab', category: 'HOUSEHOLD', href: '/households/hh-blr-001' },
  { id: 's3', title: 'Ramesh Kumar (Care Officer)', subtitle: 'Bangalore East • 26/35 Families • On-Duty', category: 'OFFICER', href: '/officers' },
  { id: 's4', title: 'Suresh Gowda (Care Officer)', subtitle: 'Bangalore South • 22/35 Families • On-Duty', category: 'OFFICER', href: '/officers' },
  { id: 's5', title: 'Dr. Ananya Sen, MD (Geriatrician)', subtitle: 'Contracted ₹1,200/consult • On-Duty', category: 'PARTNER', href: '/partners' },
  { id: 's6', title: 'Apollo ALS Emergency Ambulance Fleet', subtitle: 'Response <15m • All Clusters', category: 'PARTNER', href: '/partners' },
  { id: 's7', title: 'MED-03: Urgent Geriatrician Home Visit', subtitle: 'Dynamic SOP v1.0.0 • 45m SLA', category: 'CATALOG', href: '/catalog' },
  { id: 's8', title: 'CO-01: Care Officer Bi-Weekly Check-in', subtitle: 'Dynamic SOP v1.2.0 • 30m SLA', category: 'CATALOG', href: '/catalog' },
  { id: 's9', title: 'Partner Payout Ledger & GST Export', subtitle: 'Monthly TDS & Reconciliation', category: 'PAGE', href: '/payouts' },
];

export const CommandPaletteModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filtered = searchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'HOUSEHOLD':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">Household</span>;
      case 'OFFICER':
        return <span className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[10px] font-bold">Officer</span>;
      case 'PARTNER':
        return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">Partner</span>;
      case 'CATALOG':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">SOP</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">Page</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search households, officers, doctors, SOPs, tickets... (Type to filter)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 text-sm font-medium outline-none text-slate-800 placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-500">
            ESC
          </kbd>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 text-slate-600">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No matching records found for "{query}".
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    {item.category === 'HOUSEHOLD' && <Users size={14} />}
                    {item.category === 'OFFICER' && <UserCheck size={14} />}
                    {item.category === 'PARTNER' && <Stethoscope size={14} />}
                    {item.category === 'CATALOG' && <FileCode2 size={14} />}
                    {item.category === 'PAGE' && <Activity size={14} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-slate-800 group-hover:text-brand-700 transition-colors">
                        {item.title}
                      </strong>
                      {getCategoryBadge(item.category)}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium m-0">{item.subtitle}</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Tip: Use arrow keys to navigate or click to jump</span>
          <span className="font-mono">Pococare Fast Navigation</span>
        </div>
      </div>
    </div>
  );
};
