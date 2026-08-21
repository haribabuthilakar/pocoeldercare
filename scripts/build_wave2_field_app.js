const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. VISIT CARD & SCHEDULE SCREEN
// -------------------------------------------------------------

writeFile('apps/field-app/src/components/schedule/visit-card.tsx', `
import React from 'react';
import { OfflineVisit } from '../../db/sqlite-client';
import { COLORS } from '../../theme/colors';
import { MapPin, Navigation, Phone, ShieldCheck, ChevronRight, Activity } from 'lucide-react';

interface VisitCardProps {
  visit: OfflineVisit;
  onSelectVisit: (visit: OfflineVisit) => void;
  onRecordVitals: (visit: OfflineVisit) => void;
}

export const VisitCard: React.FC<VisitCardProps> = ({
  visit,
  onSelectVisit,
  onRecordVitals,
}) => {
  const isCompleted = visit.status === 'COMPLETED';

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        border: \`1px solid \${isCompleted ? COLORS.primaryBorder : COLORS.border}\`,
        padding: '18px',
        marginBottom: '14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: COLORS.textMain }}>
              {visit.seniorName}
            </h3>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                backgroundColor: COLORS.primaryLight,
                color: COLORS.primaryDark,
                padding: '2px 8px',
                borderRadius: '8px',
                border: \`1px solid \${COLORS.primaryBorder}\`,
              }}
            >
              {visit.planName} Plan
            </span>
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: COLORS.textMuted, fontWeight: 500 }}>
            Age: {visit.seniorAge} • Shift Slot: <strong style={{ color: COLORS.textMain }}>{visit.scheduledTimeIST}</strong>
          </p>
        </div>

        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '12px',
            backgroundColor: isCompleted ? COLORS.primaryLight : '#f1f5f9',
            color: isCompleted ? COLORS.primaryDark : '#475569',
            border: \`1px solid \${isCompleted ? COLORS.primaryBorder : '#cbd5e1'}\`,
          }}
        >
          {visit.status}
        </span>
      </div>

      {/* Address & Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
          padding: '10px 12px',
          borderRadius: '14px',
          marginBottom: '14px',
          border: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, paddingRight: '8px' }}>
          <MapPin size={15} color={COLORS.secondary} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: '#334155', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {visit.address}
          </span>
        </div>
        <a
          href={\`https://maps.google.com/?q=\${visit.gpsCoords.lat},\${visit.gpsCoords.lng}\`}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: COLORS.primaryDark,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <Navigation size={13} />
          <span>Maps</span>
        </a>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => onRecordVitals(visit)}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '14px',
            backgroundColor: '#fee5f2',
            border: \`1px solid \${COLORS.secondaryBorder}\`,
            color: COLORS.secondaryDark,
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Activity size={14} color={COLORS.secondary} />
          <span>Capture Vitals</span>
        </button>

        <button
          onClick={() => onSelectVisit(visit)}
          style={{
            flex: 1.3,
            padding: '10px',
            borderRadius: '14px',
            background: isCompleted ? '#334155' : \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.primaryDark})\`,
            border: 'none',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: isCompleted ? 'none' : '0 4px 12px rgba(18,195,149,0.3)',
          }}
        >
          <span>{isCompleted ? 'Review SOP' : 'Start 5-Min SOP'}</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
`);

writeFile('apps/field-app/src/screens/schedule-screen.tsx', `
import React, { useState } from 'react';
import { localStore, OfflineVisit } from '../db/sqlite-client';
import { VisitCard } from '../components/schedule/visit-card';
import { OfflineStatusBanner } from '../components/common/offline-status-banner';
import { COLORS } from '../theme/colors';
import { Calendar, User, ShieldAlert, AlertTriangle } from 'lucide-react';

interface ScheduleScreenProps {
  onStartSop: (visit: OfflineVisit) => void;
  onOpenVitals: (visit: OfflineVisit) => void;
  onOpenDrill: () => void;
  onOpenIncident: () => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  onStartSop,
  onOpenVitals,
  onOpenDrill,
  onOpenIncident,
}) => {
  const [visits] = useState<OfflineVisit[]>(localStore.getVisits());

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.slateBg, fontFamily: 'Poppins, sans-serif', paddingBottom: '32px' }}>
      <OfflineStatusBanner />

      {/* Shift Header */}
      <div style={{ backgroundColor: COLORS.navy, color: '#fff', padding: '20px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: COLORS.primary, letterSpacing: '1px', textTransform: 'uppercase' }}>
                Active Shift • Bangalore East
              </span>
              <h1 style={{ fontSize: '18px', fontWeight: 900, margin: '2px 0 0' }}>Officer Daily Route</h1>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onOpenIncident}
                style={{
                  backgroundColor: '#fee5f2',
                  border: \`1px solid \${COLORS.secondaryBorder}\`,
                  color: COLORS.secondaryDark,
                  borderRadius: '12px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <AlertTriangle size={13} color={COLORS.secondary} />
                <span>Incident</span>
              </button>

              <button
                onClick={onOpenDrill}
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#d97706',
                  borderRadius: '12px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ShieldAlert size={13} color="#d97706" />
                <span>Drill Mode</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Schedule Container */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
            Today's In-Person Visits ({visits.length})
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: COLORS.primaryDark }}>
            Caseload: 35 Max
          </span>
        </div>

        {visits.map((visit) => (
          <VisitCard
            key={visit.id}
            visit={visit}
            onSelectVisit={onStartSop}
            onRecordVitals={onOpenVitals}
          />
        ))}
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 2. MULTIMEDIA UPLOADERS & RAPID DYNAMIC SOP WIZARD
// -------------------------------------------------------------

writeFile('apps/field-app/src/components/sop/photo-proof-uploader.tsx', `
import React, { useState } from 'react';
import { Camera, Check, Image as ImageIcon } from 'lucide-react';
import { COLORS } from '../../theme/colors';

export const PhotoProofUploader: React.FC<{
  label: string;
  onPhotoCaptured: (uri: string) => void;
}> = ({ label, onPhotoCaptured }) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleSimulateCapture = () => {
    const mockUri = \`file:///photos/proof-\${Date.now()}.jpg\`;
    setPhotoUri(mockUri);
    onPhotoCaptured(mockUri);
  };

  return (
    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
      <button
        type="button"
        onClick={handleSimulateCapture}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '14px',
          backgroundColor: photoUri ? COLORS.primaryLight : '#f8fafc',
          border: \`1px dashed \${photoUri ? COLORS.primary : '#cbd5e1'}\`,
          color: photoUri ? COLORS.primaryDark : '#475569',
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {photoUri ? <Check size={14} color={COLORS.primary} /> : <Camera size={14} />}
        <span>{photoUri ? \`Photo Attached (\${label})\` : \`Attach Mandatory Photo (\${label})\`}</span>
      </button>
    </div>
  );
};
`);

writeFile('apps/field-app/src/components/sop/voice-note-recorder.tsx', `
import React, { useState } from 'react';
import { Mic, Square, Check, Play } from 'lucide-react';
import { COLORS } from '../../theme/colors';

export const VoiceNoteRecorder: React.FC<{
  onAudioRecorded: (uri: string) => void;
}> = ({ onAudioRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        const mockAudio = \`file:///audio/note-\${Date.now()}.m4a\`;
        setAudioUri(mockAudio);
        onAudioRecorded(mockAudio);
      }, 1500);
    }
  };

  return (
    <div style={{ marginTop: '8px' }}>
      <button
        type="button"
        onClick={handleToggleRecord}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: '14px',
          backgroundColor: audioUri ? '#fee5f2' : isRecording ? '#ffe4e6' : '#f8fafc',
          border: \`1px dashed \${audioUri ? COLORS.secondary : isRecording ? '#f43f5e' : '#cbd5e1'}\`,
          color: audioUri ? COLORS.secondaryDark : isRecording ? '#e11d48' : '#475569',
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {audioUri ? (
          <Check size={14} color={COLORS.secondary} />
        ) : isRecording ? (
          <Square size={14} color="#e11d48" className="animate-pulse" />
        ) : (
          <Mic size={14} />
        )}
        <span>{audioUri ? 'Voice Memo Attached (0:15)' : isRecording ? 'Recording Voice Memo...' : 'Record Voice Observation'}</span>
      </button>
    </div>
  );
};
`);

writeFile('apps/field-app/src/screens/sop-wizard-screen.tsx', `
import React, { useState, useEffect } from 'react';
import { OfflineVisit, localStore } from '../db/sqlite-client';
import { PhotoProofUploader } from '../components/sop/photo-proof-uploader';
import { VoiceNoteRecorder } from '../components/sop/voice-note-recorder';
import { COLORS } from '../theme/colors';
import { Check, X, Clock, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

const sopSteps = [
  { id: 'step-1', name: 'Elder Identification & Orientation Check', category: 'General', requiresPhoto: false },
  { id: 'step-2', name: 'Pillbox Medicine Refill & Adherence Audit', category: 'Clinical', requiresPhoto: true, photoLabel: 'Pillbox' },
  { id: 'step-3', name: 'Bathroom Anti-Slip Mat & Grab Bar Inspection', category: 'Safety', requiresPhoto: true, photoLabel: 'Grab Bars' },
  { id: 'step-4', name: 'Dietary, Hydration & Appetite Assessment', category: 'Nutrition', requiresPhoto: false },
  { id: 'step-5', name: 'Emergency SOS Pendant Battery Test', category: 'Emergency', requiresPhoto: false },
];

export const SopWizardScreen: React.FC<{
  visit: OfflineVisit;
  onBack: () => void;
  onFinish: () => void;
}> = ({ visit, onBack, onFinish }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepResults, setStepResults] = useState<{ [key: string]: any }>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStep = sopSteps[currentStepIndex];
  const isLastStep = currentStepIndex === sopSteps.length - 1;
  const isWithin5Min = elapsedSeconds <= 300;

  const handleStepAction = (status: 'PASSED' | 'FAILED') => {
    const updated = {
      ...stepResults,
      [currentStep.id]: {
        stepId: currentStep.id,
        stepName: currentStep.name,
        category: currentStep.category,
        status,
        photoUri: stepResults[currentStep.id]?.photoUri,
        audioUri: stepResults[currentStep.id]?.audioUri,
      },
    };
    setStepResults(updated);

    if (!isLastStep) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Save entire execution to offline store
      localStore.saveSopExecution({
        id: \`sop-exec-\${Date.now()}\`,
        visitId: visit.id,
        sopTemplateCode: 'SOP-CARE-01',
        stepResults: Object.values(updated),
        durationSeconds: elapsedSeconds,
        completedAt: new Date().toISOString(),
      });
      onFinish();
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return \`\${m}:\${s < 10 ? '0' : ''}\${s}\`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.slateBg, fontFamily: 'Poppins, sans-serif', padding: '16px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: COLORS.textMain }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          {/* 5-Min Target Progress Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isWithin5Min ? COLORS.primaryLight : '#fee5f2',
              padding: '6px 12px',
              borderRadius: '16px',
              border: \`1px solid \${isWithin5Min ? COLORS.primaryBorder : COLORS.secondaryBorder}\`,
            }}
          >
            <Clock size={14} color={isWithin5Min ? COLORS.primaryDark : COLORS.secondaryDark} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: isWithin5Min ? COLORS.primaryDark : COLORS.secondaryDark }}>
              {formatTimer(elapsedSeconds)} / 5:00 min target
            </span>
          </div>
        </div>

        {/* Senior & Step Progress */}
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '20px', border: \`1px solid \${COLORS.border}\`, marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: COLORS.textMuted }}>Visit Checklist For:</span>
          <h2 style={{ margin: '2px 0 6px', fontSize: '16px', fontWeight: 900, color: COLORS.textMain }}>
            {visit.seniorName}
          </h2>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: \`\${((currentStepIndex + 1) / sopSteps.length) * 100}%\`,
                height: '100%',
                background: \`linear-gradient(90deg, \${COLORS.primary}, \${COLORS.secondary})\`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', fontWeight: 700, color: COLORS.textMuted }}>
            <span>Step {currentStepIndex + 1} of {sopSteps.length}</span>
            <span>{currentStep.category} Protocol</span>
          </div>
        </div>

        {/* Step Card */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '24px',
            border: \`1px solid \${COLORS.border}\`,
            padding: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              color: COLORS.primaryDark,
              backgroundColor: COLORS.primaryLight,
              padding: '3px 8px',
              borderRadius: '8px',
              border: \`1px solid \${COLORS.primaryBorder}\`,
            }}
          >
            {currentStep.category}
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: COLORS.textMain, margin: '12px 0 16px', lineHeight: 1.3 }}>
            {currentStep.name}
          </h3>

          {/* Conditional Photo Proof */}
          {currentStep.requiresPhoto && (
            <PhotoProofUploader
              label={currentStep.photoLabel || 'Proof'}
              onPhotoCaptured={(uri) => {
                setStepResults((prev) => ({
                  ...prev,
                  [currentStep.id]: { ...prev[currentStep.id], photoUri: uri },
                }));
              }}
            />
          )}

          {/* Optional Voice Note */}
          <VoiceNoteRecorder
            onAudioRecorded={(uri) => {
              setStepResults((prev) => ({
                ...prev,
                [currentStep.id]: { ...prev[currentStep.id], audioUri: uri },
              }));
            }}
          />
        </div>

        {/* Big Thumb Touch Action Buttons (Min 48x48dp) */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => handleStepAction('FAILED')}
            style={{
              flex: 1,
              minHeight: '54px',
              borderRadius: '18px',
              backgroundColor: '#fee5f2',
              border: \`1px solid \${COLORS.secondaryBorder}\`,
              color: COLORS.secondaryDark,
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <X size={18} color={COLORS.secondary} />
            <span>Issue / Fail</span>
          </button>

          <button
            onClick={() => handleStepAction('PASSED')}
            style={{
              flex: 1.5,
              minHeight: '54px',
              borderRadius: '18px',
              background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.primaryDark})\`,
              border: 'none',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 8px 20px rgba(18,195,149,0.35)',
            }}
          >
            <Check size={18} />
            <span>{isLastStep ? 'Complete Protocol' : 'Verified & Next'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
`);

console.log('Finished generating Wave 2 Schedule & Rapid SOP Wizard components');

