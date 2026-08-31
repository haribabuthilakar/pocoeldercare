import * as React from 'react';
import { CreditCard, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '../../components/button';

export interface CardPaymentTabProps {
  amountPaise: number;
  onProceedToOtp: (cardDetails: { cardNumber: string; expiry: string; cardHolder: string }) => void;
  disabled?: boolean;
}

export function CardPaymentTab({ amountPaise, onProceedToOtp, disabled }: CardPaymentTabProps) {
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiry, setExpiry] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [cardHolder, setCardHolder] = React.useState('Gopal Krishna Sharma');
  const [saveCard, setSaveCard] = React.useState(true);

  // Format card number as 4-4-4-4
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format expiry as MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiry(raw);
    }
  };

  // Detect card network
  const getCardNetwork = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return { name: 'Visa', color: 'bg-blue-600' };
    if (clean.startsWith('5')) return { name: 'Mastercard', color: 'bg-red-600' };
    if (clean.startsWith('6')) return { name: 'RuPay', color: 'bg-emerald-600' };
    return { name: 'Card', color: 'bg-slate-700' };
  };

  const cardNetwork = getCardNetwork();
  const amountRupees = (amountPaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const isFormValid = cardNumber.replace(/\s/g, '').length >= 15 && expiry.length === 5 && cvv.length >= 3;

  return (
    <div className="space-y-4">
      {/* Card Preview Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span className="text-xs tracking-wider uppercase text-slate-300 font-mono">Debit / Credit Card</span>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded text-white ${cardNetwork.color}`}>
            {cardNetwork.name}
          </span>
        </div>
        <div className="font-mono text-lg tracking-widest text-slate-100 mb-4">
          {cardNumber || '•••• •••• •••• ••••'}
        </div>
        <div className="flex justify-between text-xs text-slate-300 font-mono">
          <div>
            <div className="text-[9px] uppercase text-slate-400">Card Holder</div>
            <div className="truncate max-w-[160px]">{cardHolder || 'NAME ON CARD'}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase text-slate-400">Expires</div>
            <div>{expiry || 'MM/YY'}</div>
          </div>
        </div>
      </div>

      {/* Card Inputs */}
      <div className="space-y-3">
        <div>
          <label htmlFor="card-number-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              id="card-number-input"
              type="text"
              placeholder="4532 8812 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              disabled={disabled}
              className="w-full px-3 py-2 pl-10 text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="expiry-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Expiry Date
            </label>
            <input
              id="expiry-input"
              type="text"
              placeholder="MM/YY"
              value={expiry}
              onChange={handleExpiryChange}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
          <div>
            <label htmlFor="cvv-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              CVV / Security Code
            </label>
            <div className="relative">
              <input
                id="cvv-input"
                type="password"
                maxLength={4}
                placeholder="•••"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                disabled={disabled}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="cardholder-name-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Cardholder Name
          </label>
          <input
            id="cardholder-name-input"
            type="text"
            placeholder="Full Name as on Card"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="save-card-check"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
          />
          <label htmlFor="save-card-check" className="text-xs text-slate-600 cursor-pointer flex items-center space-x-1">
            <span>Save card securely according to RBI guidelines</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </label>
        </div>
      </div>

      <Button
        type="button"
        disabled={disabled || !isFormValid}
        onClick={() => onProceedToOtp({ cardNumber, expiry, cardHolder })}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium shadow-sm transition-all"
      >
        Pay ₹{amountRupees}
      </Button>
    </div>
  );
}
