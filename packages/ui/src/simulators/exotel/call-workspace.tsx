import * as React from 'react';
import {
  PhoneOff,
  PhoneForwarded,
  User,
  MapPin,
  Heart,
  AlertTriangle,
  Mic,
  MicOff,
  Volume2,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { IceBadge } from '../../components/ice-badge';
import { DtmfToneGenerator } from './dtmf-tone-generator';

export interface CallerInfo {
  callerName: string;
  callerPhone: string;
  seniorName: string;
  householdAddress: string;
  bloodGroup?: string;
  chronicConditions?: string[];
  iceContactName?: string;
  iceContactPhone?: string;
}

export interface CallWorkspaceProps {
  caller: CallerInfo;
  onEndCall: (dispositionNotes?: string) => void;
  onTransferCall?: (target: string) => void;
  dtmfGenerator: DtmfToneGenerator;
}

const DIALPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

export function CallWorkspace({
  caller,
  onEndCall,
  onTransferCall,
  dtmfGenerator
}: CallWorkspaceProps) {
  const [callDuration, setCallDuration] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isOnHold, setIsOnHold] = React.useState(false);
  const [dispositionNotes, setDispositionNotes] = React.useState('');
  const [digitsHistory, setDigitsHistory] = React.useState<string[]>([]);
  const [transcriptLog, setTranscriptLog] = React.useState<Array<{ role: 'ivr' | 'senior' | 'agent'; text: string; time: string }>>([
    { role: 'ivr', text: 'Welcome to Poco Care. Press 1 for Emergency Ambulance, 2 for Care Officer, 3 for Routine Requests.', time: '00:01' },
    { role: 'senior', text: '[DTMF 1 Pressed: Emergency Ambulance Assistance]', time: '00:04' }
  ]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleKeyPress = (key: string) => {
    dtmfGenerator.playTone(key, 180);
    setDigitsHistory((prev) => [...prev, key]);

    const formattedTime = formatTimer(callDuration);
    let note = `[DTMF Key ${key}]`;
    if (key === '1') note = '[Option 1 Selected: Emergency Ambulance]';
    if (key === '2') note = '[Option 2 Selected: Assigned Care Officer]';
    if (key === '3') note = '[Option 3 Selected: Routine Service Request]';

    setTranscriptLog((prev) => [...prev, { role: 'senior', text: note, time: formattedTime }]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-w-2xl w-full">
      {/* Active Call Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-wide text-white">Call in Progress</span>
              <span className="text-xs font-mono font-bold bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700">
                {formatTimer(callDuration)}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{caller.callerPhone} • Exotel Cloud PBX</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsMuted(!isMuted)}
            className={`rounded-xl border-slate-700 text-xs ${isMuted ? 'bg-red-900/50 text-red-300' : 'text-slate-300'}`}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5 mr-1" /> : <Mic className="w-3.5 h-3.5 mr-1" />}
            {isMuted ? 'Muted' : 'Mute'}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onEndCall(dispositionNotes)}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Call</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        {/* Left Column: Caller & Senior Health Card */}
        <div className="p-4 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{caller.seniorName}</h4>
                <p className="text-xs text-slate-500 flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Caller: {caller.callerName}</span>
                </p>
              </div>
              <Badge variant={digitsHistory.includes('1') ? 'destructive' : 'outline'}>
                {digitsHistory.includes('1') ? 'EMERGENCY' : 'HOTLINE'}
              </Badge>
            </div>


            <p className="text-xs text-slate-600 flex items-start space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="truncate">{caller.householdAddress}</span>
            </p>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1">
              {caller.bloodGroup && (
                <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                  Blood: {caller.bloodGroup}
                </span>
              )}
              {caller.chronicConditions?.map((c) => (
                <span key={c} className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-medium">
                  {c}
                </span>
              ))}
            </div>

            {caller.iceContactName && (
              <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 flex justify-between">
                <span className="font-semibold text-slate-700">ICE Contact:</span>
                <span>{caller.iceContactName} ({caller.iceContactPhone})</span>
              </div>
            )}
          </div>

          {/* Disposition Notes Form */}
          <div className="space-y-1.5">
            <label htmlFor="call-disposition-notes" className="block text-xs font-bold text-slate-700 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Call Wrap-Up Notes</span>
            </label>
            <textarea
              id="call-disposition-notes"
              rows={3}
              placeholder="e.g. Senior requested blood pressure checkup and ambulance support..."
              value={dispositionNotes}
              onChange={(e) => setDispositionNotes(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {onTransferCall && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onTransferCall('Senior Care Officer Desk')}
              className="w-full border-slate-200 text-slate-700 rounded-xl text-xs flex items-center justify-center space-x-1.5 hover:bg-slate-50"
            >
              <PhoneForwarded className="w-3.5 h-3.5 text-blue-600" />
              <span>Transfer to Senior Care Officer Desk</span>
            </Button>
          )}
        </div>

        {/* Right Column: IVR Dialpad & Live Transcript */}
        <div className="p-4 space-y-4 flex flex-col justify-between">
          {/* Live Transcript Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Live Interactive Transcript</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Speech AI</span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              {transcriptLog.map((t, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span className="font-semibold uppercase text-slate-500">{t.role}</span>
                    <span>{t.time}</span>
                  </div>
                  <p className="text-slate-800 bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                    {t.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 12-Key DTMF Dialpad */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 text-center">
              DTMF Dialpad
            </span>
            <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto">
              {DIALPAD_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleKeyPress(k)}
                  className="h-9 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-emerald-500 active:text-white font-mono font-bold text-sm text-slate-800 border border-slate-200 transition-all flex items-center justify-center shadow-2xs"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
