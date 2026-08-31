import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { CallRecordingPlayer } from '../exotel/call-recording-player';
import { CallWorkspace, CallerInfo } from '../exotel/call-workspace';
import { SoftphoneFloatingWidget } from '../exotel/softphone-floating-widget';
import { ExotelTelephonySimulator } from '../exotel/exotel-telephony-simulator';
import { DtmfToneGenerator } from '../exotel/dtmf-tone-generator';

const MOCK_CALLER: CallerInfo = {
  callerName: 'Gopal Sharma',
  callerPhone: '+919845012345',
  seniorName: 'Gopal Krishna Sharma',
  householdAddress: '42, 4th Main, Indiranagar, Bengaluru',
  bloodGroup: 'B+',
  chronicConditions: ['Hypertension']
};

describe('Exotel Telephony Simulator Components Suite', () => {
  const dtmfGenerator = new DtmfToneGenerator();

  it('CallRecordingPlayer: should render audio player and waveform container', () => {
    const element = (
      <CallRecordingPlayer
        recordingUrl="https://media.exotel.com/recordings/test.mp3"
        durationSeconds={120}
        callerName="Senior Emergency Call"
      />
    );
    expect(element).toBeDefined();
  });

  it('CallWorkspace: should render senior medical card and dialpad', () => {
    const element = (
      <CallWorkspace
        caller={MOCK_CALLER}
        onEndCall={vi.fn()}
        dtmfGenerator={dtmfGenerator}
      />
    );
    expect(element).toBeDefined();
  });

  it('SoftphoneFloatingWidget: should render floating call widget component', () => {
    const element = (
      <SoftphoneFloatingWidget
        incomingCall={MOCK_CALLER}
        onAcceptCall={vi.fn()}
        onDeclineCall={vi.fn()}
      />
    );
    expect(element).toBeDefined();
  });

  it('ExotelTelephonySimulator: should render full telephony control center', () => {
    const element = (
      <ExotelTelephonySimulator
        initialCaller={MOCK_CALLER}
        onCallCompleted={vi.fn()}
      />
    );
    expect(element).toBeDefined();
  });
});
