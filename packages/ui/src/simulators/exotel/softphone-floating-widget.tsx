import * as React from 'react';
import { Phone, PhoneCall, PhoneOff, User, AlertCircle, X } from 'lucide-react';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { CallWorkspace } from './call-workspace';
import type { CallerInfo } from './call-workspace';
import { DtmfToneGenerator } from './dtmf-tone-generator';
import { IvrSpeechSynthesizer } from './ivr-speech-synthesizer';

export interface SoftphoneFloatingWidgetProps {
  incomingCall?: CallerInfo | null;
  onAcceptCall?: (caller: CallerInfo) => void;
  onDeclineCall?: (caller: CallerInfo) => void;
  onCompleteCall?: (caller: CallerInfo, dispositionNotes?: string) => void;
  triggerWebhookOnCall?: boolean;
}

export function SoftphoneFloatingWidget({
  incomingCall,
  onAcceptCall,
  onDeclineCall,
  onCompleteCall,
  triggerWebhookOnCall = true
}: SoftphoneFloatingWidgetProps) {
  const [activeCall, setActiveCall] = React.useState<CallerInfo | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const dtmfGenerator = React.useMemo(() => new DtmfToneGenerator(), []);
  const ivrSpeech = React.useMemo(() => new IvrSpeechSynthesizer(), []);

  // Ringing effect when incomingCall appears
  React.useEffect(() => {
    if (incomingCall && !activeCall) {
      dtmfGenerator.playRingtone();
      ivrSpeech.speak('Incoming call from senior hotline');
    }
  }, [incomingCall, activeCall, dtmfGenerator, ivrSpeech]);

  const handleAccept = (caller: CallerInfo) => {
    ivrSpeech.stop();
    setActiveCall(caller);
    setIsExpanded(true);
    onAcceptCall?.(caller);

    // Speak initial IVR welcome prompt
    setTimeout(() => {
      ivrSpeech.speak(
        'Welcome to Poco Care. Press 1 for Emergency Ambulance, 2 for Care Officer, 3 for Routine Requests.'
      );
    }, 600);

    // Dispatch webhook to backend
    if (triggerWebhookOnCall && typeof fetch === 'function') {
      fetch('/api/webhooks/v1/exotel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bypass-Hmac': 'true'
        },
        body: JSON.stringify({
          CallSid: `call_${Math.random().toString(36).substring(2, 12)}`,
          From: caller.callerPhone,
          To: '08069007626',
          Digits: '1',
          Direction: 'inbound',
          Status: 'in-progress'
        })
      }).catch(() => {});
    }
  };

  const handleDecline = (caller: CallerInfo) => {
    ivrSpeech.stop();
    onDeclineCall?.(caller);
  };

  const handleEnd = (dispositionNotes?: string) => {
    if (activeCall) {
      onCompleteCall?.(activeCall, dispositionNotes);
      setActiveCall(null);
      setIsExpanded(false);
      ivrSpeech.stop();
    }
  };

  return (
    <>
      {/* Floating Incoming Call Banner */}
      {incomingCall && !activeCall && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-400 max-w-sm w-full space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center animate-bounce">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Incoming Hotline Call
                  </span>
                  <h4 className="text-sm font-bold text-white">{incomingCall.seniorName}</h4>
                  <p className="text-xs text-slate-400 font-mono">{incomingCall.callerPhone}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 truncate bg-slate-800/80 p-2 rounded-lg border border-slate-700">
              {incomingCall.householdAddress}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={() => handleDecline(incomingCall)}
                className="bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 rounded-xl text-xs font-semibold"
              >
                <PhoneOff className="w-3.5 h-3.5 mr-1" />
                Decline
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleAccept(incomingCall)}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20"
              >
                <Phone className="w-3.5 h-3.5 mr-1" />
                Answer Call
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Workspace Modal */}
      {activeCall && isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <CallWorkspace
            caller={activeCall}
            onEndCall={handleEnd}
            onTransferCall={(target) => console.log('Transferred to', target)}
            dtmfGenerator={dtmfGenerator}
          />
        </div>
      )}
    </>
  );
}
