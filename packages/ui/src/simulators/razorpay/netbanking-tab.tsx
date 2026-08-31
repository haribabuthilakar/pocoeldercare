import * as React from 'react';
import { Building2, Check, Search } from 'lucide-react';
import { Button } from '../../components/button';

export interface NetbankingTabProps {
  amountPaise: number;
  onAuthorize: (bankCode: string) => void;
  disabled?: boolean;
}

const POPULAR_BANKS = [
  { code: 'HDFC', name: 'HDFC Bank', badge: 'HDFC' },
  { code: 'ICIC', name: 'ICICI Bank', badge: 'ICICI' },
  { code: 'SBIN', name: 'State Bank of India', badge: 'SBI' },
  { code: 'UTIB', name: 'Axis Bank', badge: 'AXIS' },
  { code: 'KKBK', name: 'Kotak Mahindra Bank', badge: 'KOTAK' },
  { code: 'PUNB', name: 'Punjab National Bank', badge: 'PNB' }
];

const ALL_BANKS = [
  ...POPULAR_BANKS,
  { code: 'BARB', name: 'Bank of Baroda', badge: 'BOB' },
  { code: 'CNRB', name: 'Canara Bank', badge: 'CANARA' },
  { code: 'UBIN', name: 'Union Bank of India', badge: 'UNION' },
  { code: 'IDFB', name: 'IDFC FIRST Bank', badge: 'IDFC' },
  { code: 'YESB', name: 'Yes Bank', badge: 'YES' },
  { code: 'INDB', name: 'IndusInd Bank', badge: 'INDUS' }
];

export function NetbankingTab({ amountPaise, onAuthorize, disabled }: NetbankingTabProps) {
  const [selectedBank, setSelectedBank] = React.useState<string>('HDFC');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredBanks = ALL_BANKS.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const amountRupees = (amountPaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="space-y-4">
      {/* Popular Banks Grid */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Popular Banks
        </label>
        <div className="grid grid-cols-3 gap-2">
          {POPULAR_BANKS.map((bank) => (
            <button
              key={bank.code}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedBank(bank.code)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all text-center ${
                selectedBank === bank.code
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-800">
                {bank.badge.slice(0, 3)}
              </div>
              <span className="text-xs truncate w-full">{bank.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* All Banks Search / Select */}
      <div>
        <label htmlFor="all-banks-search" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          All Other Banks
        </label>
        <div className="relative mb-2">
          <input
            id="all-banks-search"
            type="text"
            placeholder="Search bank name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 pl-9 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {searchQuery && (
          <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white shadow-sm">
            {filteredBanks.map((bank) => (
              <button
                key={bank.code}
                type="button"
                onClick={() => {
                  setSelectedBank(bank.code);
                  setSearchQuery('');
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex justify-between items-center text-slate-700"
              >
                <span>{bank.name}</span>
                {selectedBank === bank.code && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        disabled={disabled || !selectedBank}
        onClick={() => onAuthorize(selectedBank)}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium shadow-sm transition-all"
      >
        Proceed to {ALL_BANKS.find((b) => b.code === selectedBank)?.name || 'Bank'} (₹{amountRupees})
      </Button>
    </div>
  );
}
