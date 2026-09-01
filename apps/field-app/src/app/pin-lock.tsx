import React, { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { Lock, Delete, Shield, CheckCircle2 } from 'lucide-react';

export interface PinLockScreenProps {
  onUnlocked?: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlocked }) => {
  const { session, unlockWithPin, setPin, setupPinRequired, logout } = useAuth();
  const [pin, setPinValue] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [step, setStep] = useState<'enter' | 'create' | 'confirm'>(
    setupPinRequired ? 'create' : 'enter',
  );
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleDigit = async (digit: string) => {
    if (isVerifying) return;
    setError(null);

    if (step === 'enter') {
      const nextPin = pin + digit;
      if (nextPin.length <= 4) {
        setPinValue(nextPin);
        if (nextPin.length === 4) {
          setIsVerifying(true);
          const ok = await unlockWithPin(nextPin);
          if (ok) {
            onUnlocked?.();
          } else {
            setError('Incorrect PIN. Please try again.');
            setPinValue('');
          }
          setIsVerifying(false);
        }
      }
    } else if (step === 'create') {
      const nextPin = pin + digit;
      if (nextPin.length <= 4) {
        setPinValue(nextPin);
        if (nextPin.length === 4) {
          setStep('confirm');
        }
      }
    } else if (step === 'confirm') {
      const nextConfirm = confirmPin + digit;
      if (nextConfirm.length <= 4) {
        setConfirmPin(nextConfirm);
        if (nextConfirm.length === 4) {
          if (nextConfirm === pin) {
            await setPin(pin);
            onUnlocked?.();
          } else {
            setError('PINs do not match. Please re-enter.');
            setPinValue('');
            setConfirmPin('');
            setStep('create');
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'enter' || step === 'create') {
      setPinValue((prev) => prev.slice(0, -1));
    } else if (step === 'confirm') {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
    setError(null);
  };

  const activePinString = step === 'confirm' ? confirmPin : pin;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between py-10 px-6 max-w-md mx-auto">
      {/* Top Header */}
      <div className="text-center pt-6">
        <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
          {step === 'enter' ? <Lock className="w-7 h-7" /> : <Shield className="w-7 h-7" />}
        </div>
        <h2 className="text-xl font-bold tracking-tight" data-testid="pin-title">
          {step === 'enter' && 'Unlock Session'}
          {step === 'create' && 'Create 4-Digit PIN'}
          {step === 'confirm' && 'Confirm Your PIN'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {step === 'enter' && `Officer: ${session?.fullName || 'Care Officer'}`}
          {step === 'create' && 'Set a quick PIN for secure field access'}
          {step === 'confirm' && 'Re-enter the same 4 digits'}
        </p>

        {/* 4 Indicator Dots */}
        <div className="flex justify-center items-center gap-4 my-8" data-testid="pin-dots">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = idx < activePinString.length;
            return (
              <div
                key={idx}
                data-testid={`pin-dot-${idx}-${isFilled ? 'filled' : 'empty'}`}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-500/50'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p data-testid="pin-error-text" className="text-xs text-red-400 font-medium animate-pulse">
            {error}
          </p>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs mx-auto pb-4">
        <div className="grid grid-cols-3 gap-4" data-testid="pin-keypad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              data-testid={`pin-key-${digit}`}
              onClick={() => handleDigit(digit)}
              className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 text-2xl font-semibold text-white flex items-center justify-center border border-slate-700/60 shadow transition-colors"
            >
              {digit}
            </button>
          ))}

          {/* Bottom Row */}
          <button
            type="button"
            data-testid="pin-key-clear"
            onClick={() => {
              setPinValue('');
              setConfirmPin('');
              setError(null);
            }}
            className="h-16 rounded-2xl bg-transparent hover:bg-slate-800/50 text-xs font-semibold text-slate-400 flex items-center justify-center transition-colors uppercase tracking-wider"
          >
            Clear
          </button>

          <button
            type="button"
            data-testid="pin-key-0"
            onClick={() => handleDigit('0')}
            className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 text-2xl font-semibold text-white flex items-center justify-center border border-slate-700/60 shadow transition-colors"
          >
            0
          </button>

          <button
            type="button"
            data-testid="pin-key-backspace"
            onClick={handleBackspace}
            className="h-16 rounded-2xl bg-transparent hover:bg-slate-800/50 text-slate-300 flex items-center justify-center transition-colors"
            aria-label="Backspace"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Footer Fallback */}
      <div className="text-center pt-2">
        <button
          type="button"
          data-testid="pin-switch-account-button"
          onClick={logout}
          className="text-xs text-slate-400 hover:text-white underline font-medium"
        >
          Sign in with password or switch account
        </button>
      </div>
    </div>
  );
};
export default PinLockScreen;
