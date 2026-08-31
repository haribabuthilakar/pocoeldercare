import * as React from 'react';
import { ShieldAlert, ShieldCheck, Smartphone, RefreshCw } from 'lucide-react';
import { Button } from '../../components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/dialog';

export interface OtpVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amountPaise: number;
  bankName?: string;
  onVerify: (otp: string) => void;
  onCancel: () => void;
  isVerifying?: boolean;
}

export function OtpVerificationDialog({
  open,
  onOpenChange,
  amountPaise,
  bankName = 'HDFC Bank NetSafe',
  onVerify,
  onCancel,
  isVerifying
}: OtpVerificationDialogProps) {
  const [otp, setOtp] = React.useState('');
  const [countdown, setCountdown] = React.useState(30);

  React.useEffect(() => {
    if (!open) return;
    setOtp('');
    setCountdown(30);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const amountRupees = (amountPaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl border border-slate-200 shadow-2xl">
        <DialogHeader className="text-left space-y-2 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                3DS
              </div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {bankName} 3D Secure
              </DialogTitle>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              ₹{amountRupees}
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            A 6-digit One Time Password (OTP) has been sent to your registered mobile number{' '}
            <span className="font-semibold text-slate-800">+91 ••••• ••410</span>.
          </DialogDescription>
        </DialogHeader>

        {/* OTP Input Form */}
        <div className="py-4 space-y-4">
          <div>
            <label htmlFor="card-otp-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Enter 6-Digit OTP
            </label>
            <input
              id="card-otp-input"
              type="text"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              disabled={isVerifying}
              className="w-full tracking-[1em] text-center font-mono text-2xl py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-slate-50 font-bold"
            />
          </div>

          {/* Quick Auto-Fill Helper */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setOtp('123456')}
              className="text-emerald-700 hover:text-emerald-800 font-medium underline flex items-center space-x-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulate SMS received (Use 123456)</span>
            </button>

            {countdown > 0 ? (
              <span className="text-slate-400 font-mono">Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={() => setCountdown(30)}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Resend OTP</span>
              </button>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isVerifying}
            className="w-full sm:w-auto border-slate-200 text-slate-700 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onVerify(otp || '123456')}
            disabled={isVerifying || (otp.length > 0 && otp.length < 6)}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm"
          >
            {isVerifying ? 'Verifying with Bank...' : 'Submit & Authorize'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
