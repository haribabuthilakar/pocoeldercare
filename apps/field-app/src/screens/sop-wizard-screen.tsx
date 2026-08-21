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
        id: `sop-exec-${Date.now()}`,
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
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
              border: `1px solid ${isWithin5Min ? COLORS.primaryBorder : COLORS.secondaryBorder}`,
            }}
          >
            <Clock size={14} color={isWithin5Min ? COLORS.primaryDark : COLORS.secondaryDark} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: isWithin5Min ? COLORS.primaryDark : COLORS.secondaryDark }}>
              {formatTimer(elapsedSeconds)} / 5:00 min target
            </span>
          </div>
        </div>

        {/* Senior & Step Progress */}
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: COLORS.textMuted }}>Visit Checklist For:</span>
          <h2 style={{ margin: '2px 0 6px', fontSize: '16px', fontWeight: 900, color: COLORS.textMain }}>
            {visit.seniorName}
          </h2>
          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${((currentStepIndex + 1) / sopSteps.length) * 100}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
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
            border: `1px solid ${COLORS.border}`,
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
              border: `1px solid ${COLORS.primaryBorder}`,
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
              border: `1px solid ${COLORS.secondaryBorder}`,
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
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
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
