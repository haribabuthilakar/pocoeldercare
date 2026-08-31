import * as React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  CreditCard,
  Building2,
  Loader2,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../../components/dialog';
import { Button } from '../../components/button';
import { UpiPaymentTab } from './upi-payment-tab';
import { CardPaymentTab } from './card-payment-tab';
import { NetbankingTab } from './netbanking-tab';
import { OtpVerificationDialog } from './otp-verification-dialog';

export interface RazorpayCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  amountPaise: number;
  householdName?: string;
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: string) => void;
  triggerSignedWebhook?: boolean;
}

type PaymentTab = 'upi' | 'card' | 'netbanking';
type CheckoutStatus = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export function RazorpayCheckoutModal({
  open,
  onOpenChange,
  orderId,
  amountPaise,
  householdName = 'Sharma Household',
  onSuccess,
  onFailure,
  triggerSignedWebhook = true
}: RazorpayCheckoutModalProps) {
  const [activeTab, setActiveTab] = React.useState<PaymentTab>('upi');
  const [status, setStatus] = React.useState<CheckoutStatus>('IDLE');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showOtpDialog, setShowOtpDialog] = React.useState(false);
  const [lastPaymentId, setLastPaymentId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setStatus('IDLE');
      setErrorMessage(null);
      setShowOtpDialog(false);
    }
  }, [open]);

  const amountRupees = (amountPaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const handlePaymentSuccess = async (method: string) => {
    setStatus('PROCESSING');
    const paymentId = `pay_${Math.random().toString(36).substring(2, 16)}`;
    setLastPaymentId(paymentId);

    try {
      if (triggerSignedWebhook && typeof fetch === 'function') {
        // Dispatches simulated webhook callback directly to API
        await fetch('/api/webhooks/v1/razorpay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Bypass-Hmac': 'true',
            'X-Idempotency-Key': `pay_${Date.now()}`
          },
          body: JSON.stringify({
            entity: 'event',
            event: 'payment.captured',
            payload: {
              payment: {
                entity: {
                  id: paymentId,
                  entity: 'payment',
                  amount: amountPaise,
                  currency: 'INR',
                  status: 'captured',
                  order_id: orderId,
                  method,
                  notes: { householdName }
                }
              },
              order: {
                entity: {
                  id: orderId,
                  amount: amountPaise,
                  status: 'paid'
                }
              }
            },
            created_at: Math.floor(Date.now() / 1000)
          })
        }).catch(() => {});
      }

      // Simulate short network delay for realism
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStatus('SUCCESS');
      onSuccess(paymentId);

      // Auto close after 2 seconds on success
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment authorization failed';
      setStatus('FAILED');
      setErrorMessage(msg);
      onFailure?.(msg);
    }
  };

  const handleProceedToCardOtp = () => {
    setShowOtpDialog(true);
  };

  const handleOtpVerified = () => {
    setShowOtpDialog(false);
    handlePaymentSuccess('card');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-2xl">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white relative">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center font-bold text-[10px] text-slate-950">
                    ₹
                  </div>
                  <span className="text-sm font-semibold tracking-wide uppercase text-slate-200">
                    Poco Care Checkout
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mt-1">₹{amountRupees}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{householdName} • Order #{orderId.slice(-8)}</p>
              </div>

              <div className="flex items-center space-x-1 text-emerald-400 text-xs bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-medium">256-bit Secure</span>
              </div>
            </div>
          </div>

          {/* Success State */}
          {status === 'SUCCESS' && (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 bg-white">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-in zoom-in-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Payment Successful!</h4>
              <p className="text-sm text-slate-500 max-w-xs">
                ₹{amountRupees} has been credited to {householdName} digital wallet.
              </p>
              <div className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                Ref: {lastPaymentId}
              </div>
            </div>
          )}

          {/* Failed State */}
          {status === 'FAILED' && (
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-bold">Payment Authorization Declined</h5>
                  <p className="text-xs text-red-700 mt-0.5">
                    {errorMessage || 'Your issuing bank declined the transaction. Please try another payment method.'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setStatus('IDLE')}
                className="w-full bg-slate-900 text-white rounded-xl py-2 font-semibold hover:bg-slate-800"
              >
                Try Another Payment Method
              </Button>
            </div>
          )}

          {/* Active Checkout Tabs */}
          {(status === 'IDLE' || status === 'PROCESSING') && (
            <div className="p-5 space-y-5">
              {/* Tab Navigation */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                    activeTab === 'upi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                    activeTab === 'card' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('netbanking')}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                    activeTab === 'netbanking' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Netbanking</span>
                </button>
              </div>

              {status === 'PROCESSING' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-sm font-medium text-slate-700">Connecting with your bank...</p>
                  <p className="text-xs text-slate-400">Please do not refresh or press back.</p>
                </div>
              )}

              {status === 'IDLE' && (
                <>
                  {activeTab === 'upi' && (
                    <UpiPaymentTab
                      amountPaise={amountPaise}
                      onAuthorize={() => handlePaymentSuccess('upi')}
                    />
                  )}

                  {activeTab === 'card' && (
                    <CardPaymentTab
                      amountPaise={amountPaise}
                      onProceedToOtp={handleProceedToCardOtp}
                    />
                  )}

                  {activeTab === 'netbanking' && (
                    <NetbankingTab
                      amountPaise={amountPaise}
                      onAuthorize={(bankCode) => handlePaymentSuccess(`netbanking_${bankCode.toLowerCase()}`)}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Footer Security Badge */}
          <div className="bg-slate-50 p-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI-DSS Level 1 Certified Simulator</span>
            </span>
            <span className="font-semibold text-slate-700">Razorpay Simulation Engine</span>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3D Secure OTP Modal */}
      <OtpVerificationDialog
        open={showOtpDialog}
        onOpenChange={setShowOtpDialog}
        amountPaise={amountPaise}
        onVerify={handleOtpVerified}
        onCancel={() => setShowOtpDialog(false)}
      />
    </>
  );
}
