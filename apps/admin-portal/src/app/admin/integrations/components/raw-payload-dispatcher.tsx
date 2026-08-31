import * as React from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Code2 } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@poco/ui';
import { PartnerCode } from '@poco/constants';

export function RawPayloadDispatcher() {
  const [partnerCode, setPartnerCode] = React.useState<PartnerCode>(PartnerCode.RAZORPAY);
  const [endpoint, setEndpoint] = React.useState('/api/webhooks/v1/razorpay');
  const [payloadText, setPayloadText] = React.useState(
    JSON.stringify(
      {
        entity: 'event',
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_custom_test_123',
              amount: 500000,
              currency: 'INR',
              status: 'captured',
              method: 'upi'
            }
          }
        }
      },
      null,
      2
    )
  );
  const [isSending, setIsSending] = React.useState(false);
  const [responseLog, setResponseLog] = React.useState<{ status: number; data: unknown } | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handlePartnerChange = (code: PartnerCode) => {
    setPartnerCode(code);
    setEndpoint(`/api/webhooks/v1/${code.toLowerCase().replace(/_/g, '-')}`);
  };

  const handleSend = async () => {
    setIsSending(true);
    setErrorMsg(null);
    setResponseLog(null);

    try {
      const parsedBody = JSON.parse(payloadText);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bypass-Hmac': 'true',
          'X-Idempotency-Key': `raw_${Date.now()}`
        },
        body: JSON.stringify(parsedBody)
      });

      const data = await res.json().catch(() => ({ statusText: res.statusText }));
      setResponseLog({ status: res.status, data });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send payload');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-emerald-600" />
          <CardTitle className="text-base font-bold text-slate-900">
            Raw Webhook Payload Dispatcher
          </CardTitle>
        </div>
        <p className="text-xs text-slate-500">
          Construct and send custom signed JSON payloads to test webhook handlers and validation schemas.
        </p>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="raw-partner-select" className="block text-xs font-bold text-slate-700 mb-1">
              Select Partner
            </label>
            <select
              id="raw-partner-select"
              value={partnerCode}
              onChange={(e) => handlePartnerChange(e.target.value as PartnerCode)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            >
              {Object.values(PartnerCode).map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="raw-target-endpoint" className="block text-xs font-bold text-slate-700 mb-1">
              Target Webhook Endpoint Path
            </label>
            <input
              id="raw-target-endpoint"
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full text-xs p-2.5 font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="raw-json-textarea" className="block text-xs font-bold text-slate-700 mb-1">
            JSON Request Body
          </label>
          <textarea
            id="raw-json-textarea"
            rows={8}
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            className="w-full font-mono text-xs p-3 border border-slate-200 rounded-xl bg-slate-900 text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            disabled={isSending}
            onClick={handleSend}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-5 h-9 flex items-center space-x-2 shadow-xs"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isSending ? 'Sending...' : 'Send Custom Webhook'}</span>
          </Button>

          {errorMsg && (
            <span className="text-xs text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </span>
          )}
        </div>

        {responseLog && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Response Status</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                responseLog.status === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                HTTP {responseLog.status}
              </span>
            </div>
            <pre className="text-[11px] font-mono p-2.5 bg-slate-900 text-slate-200 rounded-lg overflow-x-auto max-h-48 overflow-y-auto">
              {JSON.stringify(responseLog.data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
