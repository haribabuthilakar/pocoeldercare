import * as React from 'react';
import { QrCode, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/button';

export interface UpiPaymentTabProps {
  amountPaise: number;
  onAuthorize: () => void;
  disabled?: boolean;
}

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'paytm', name: 'Paytm', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'cred', name: 'CRED UPI', color: 'bg-slate-50 text-slate-800 border-slate-200' }
];

export function UpiPaymentTab({ amountPaise, onAuthorize, disabled }: UpiPaymentTabProps) {
  const [selectedApp, setSelectedApp] = React.useState<string | null>(null);
  const [vpaId, setVpaId] = React.useState('');
  const [countdown, setCountdown] = React.useState(300); // 5 mins

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const amountRupees = (amountPaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <div className="space-y-6">
      {/* Dynamic QR Code Simulator */}
      <div className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl bg-slate-50/70">
        <div className="relative p-3 bg-white border border-slate-200 shadow-sm rounded-xl">
          {/* Simulated QR Pattern */}
          <div className="w-36 h-36 bg-slate-900 flex items-center justify-center rounded-lg p-2">
            <div className="w-full h-full border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center text-white space-y-1">
              <QrCode className="w-12 h-12 text-emerald-400" />
              <span className="text-[10px] font-mono tracking-wider text-emerald-300 font-bold">UPI QR CODE</span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500 font-medium">
          Scan with any UPI App • Expires in <span className="font-mono text-emerald-600 font-bold">{formatTime(countdown)}</span>
        </p>
      </div>

      {/* UPI App Intent Selectors */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Or pay directly with UPI App
        </label>
        <div className="grid grid-cols-2 gap-2">
          {UPI_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                setSelectedApp(app.id);
                onAuthorize();
              }}
              className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${app.color} ${
                selectedApp === app.id ? 'ring-2 ring-emerald-500 font-bold' : 'hover:border-slate-400'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4" />
                <span>{app.name}</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          ))}
        </div>
      </div>

      {/* UPI ID Input */}
      <div>
        <label htmlFor="upi-vpa-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          UPI ID / VPA
        </label>
        <div className="flex space-x-2">
          <input
            id="upi-vpa-input"
            type="text"
            placeholder="e.g. senior@okhdfcbank"
            value={vpaId}
            onChange={(e) => setVpaId(e.target.value)}
            disabled={disabled}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
          <Button
            type="button"
            disabled={disabled || !vpaId.includes('@')}
            onClick={onAuthorize}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-xl text-sm"
          >
            Verify & Pay ₹{amountRupees}
          </Button>
        </div>
      </div>
    </div>
  );
}
