import * as React from 'react';
import { Phone, PhoneCall, Volume2, Sparkles, User, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/button';
import { CallWorkspace } from './call-workspace';
import type { CallerInfo } from './call-workspace';
import { SoftphoneFloatingWidget } from './softphone-floating-widget';
import { CallRecordingPlayer } from './call-recording-player';
import { DtmfToneGenerator } from './dtmf-tone-generator';

export interface ExotelTelephonySimulatorProps {
  initialCaller?: CallerInfo;
  onCallCompleted?: (callData: { caller: CallerInfo; durationSeconds: number; notes?: string }) => void;
}

const DEFAULT_CALLER: CallerInfo = {
  callerName: 'Gopal Sharma (Senior)',
  callerPhone: '+919845012345',
  seniorName: 'Gopal Krishna Sharma (78 yrs)',
  householdAddress: '42, 4th Main, Indiranagar, Bengaluru',
  bloodGroup: 'B+',
  chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
  iceContactName: 'Rahul Sharma (Son)',
  iceContactPhone: '+919876543210'
};

export function ExotelTelephonySimulator({
  initialCaller = DEFAULT_CALLER,
  onCallCompleted
}: ExotelTelephonySimulatorProps) {
  const [caller, setCaller] = React.useState<CallerInfo>(initialCaller);
  const [simulatedIncoming, setSimulatedIncoming] = React.useState<CallerInfo | null>(null);
  const [lastRecording, setLastRecording] = React.useState<{ url: string; duration: number } | null>(null);

  const dtmfGenerator = React.useMemo(() => new DtmfToneGenerator(), []);

  const triggerIncomingCall = () => {
    setSimulatedIncoming(caller);
  };

  const handleCallFinished = (callData: CallerInfo, notes?: string) => {
    setSimulatedIncoming(null);
    setLastRecording({
      url: 'https://media.exotel.com/recordings/mock-call-123.mp3',
      duration: 145
    });

    onCallCompleted?.({
      caller: callData,
      durationSeconds: 145,
      notes
    });
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h4 className="text-sm font-bold text-slate-900">Exotel Cloud Telephony Simulator</h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulate incoming emergency & routine hotline calls with Web Audio DTMF & speech synthesis.
          </p>
        </div>

        <Button
          type="button"
          onClick={triggerIncomingCall}
          disabled={!!simulatedIncoming}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Simulate Senior Incoming Call</span>
        </Button>
      </div>

      {/* Embedded Softphone Floating Alert */}
      <SoftphoneFloatingWidget
        incomingCall={simulatedIncoming}
        onCompleteCall={handleCallFinished}
        onDeclineCall={() => setSimulatedIncoming(null)}
      />

      {/* Recording Player (if last call completed) */}
      {lastRecording && (
        <div className="space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Last Call Recording & Waveform
          </h5>
          <CallRecordingPlayer
            recordingUrl={lastRecording.url}
            durationSeconds={lastRecording.duration}
            callerName={caller.seniorName}
          />
        </div>
      )}
    </div>
  );
}
