import React, { useState, useEffect } from 'react';
import { COLORS } from '../theme/colors';
import { ShieldAlert, ArrowLeft, Timer, Check, AlertCircle, Sparkles } from 'lucide-react';

export const DrillModeScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [drillStep, setDrillStep] = useState(0);
  const [countdown, setCountdown] = useState(180); // 3-minute SLA response drill
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (countdown > 0 && !isDone) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, isDone]);

  const drillSteps = [
    'Simulate SOS Trigger Ingestion from Dispatcher',
    'Verify Senior ICE Sheet & Known Drug Allergies',
    'Simulate Hospital Trauma ER Pre-Notification',
    'Confirm Nearest Ambulance Live Dispatch Coordinates',
  ];

  const handleNextStep = () => {
    if (drillStep < drillSteps.length - 1) {
      setDrillStep((s) => s + 1);
    } else {
      setIsDone(true);
    }
  };

  const formatSecs = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fffbeb', fontFamily: 'Poppins, sans-serif', padding: '16px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Hazard Watermark Header */}
        <div
          style={{
            backgroundColor: '#f59e0b',
            color: '#78350f',
            padding: '10px 16px',
            borderRadius: '16px',
            marginBottom: '16px',
            border: '2px dashed #b45309',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} />
            <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '1px' }}>
              SIMULATION / DRILL ACTIVE
            </span>
          </div>
          <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#fff', padding: '2px 8px', borderRadius: '8px' }}>
            NO LIVE DISPATCH
          </span>
        </div>

        {/* Back navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#92400e' }}
          >
            <ArrowLeft size={16} />
            <span>Exit Drill</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#b45309' }}>
            <Timer size={16} />
            <span>SLA Countdown: {formatSecs(countdown)}</span>
          </div>
        </div>

        {/* Drill Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', border: '2px solid #fde68a', boxShadow: '0 8px 24px rgba(245,158,11,0.1)' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '8px' }}>
            Phase 3 Drill Protocol #{drillStep + 1}
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#78350f', margin: '14px 0 20px', lineHeight: 1.3 }}>
            {drillSteps[drillStep]}
          </h3>

          <div style={{ backgroundColor: '#fefce8', padding: '14px', borderRadius: '16px', border: '1px solid #fef08a', marginBottom: '20px', fontSize: '11px', color: '#854d0e', fontWeight: 600 }}>
            Mock Emergency Scenario: Senior reported acute chest discomfort. Protocol requires hospital pre-brief in &lt;180s.
          </div>

          {isDone ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '20px', backgroundColor: COLORS.primaryLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <Check size={28} color={COLORS.primary} />
              </div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: COLORS.textMain }}>Drill Completed Cleanly!</h4>
              <p style={{ margin: '4px 0 16px', fontSize: '11px', color: COLORS.textMuted }}>Officer scored 100% SLA readiness.</p>
              <button
                onClick={onBack}
                style={{ padding: '12px 24px', borderRadius: '14px', backgroundColor: COLORS.navy, color: '#fff', border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
              >
                Return to Daily Shift
              </button>
            </div>
          ) : (
            <button
              onClick={handleNextStep}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                backgroundColor: '#f59e0b',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
              }}
            >
              <Check size={16} />
              <span>{drillStep === drillSteps.length - 1 ? 'Finish Simulation' : 'Execute & Next Drill Step'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
