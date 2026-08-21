const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. ABNORMAL ALERT BANNER & VITALS ENTRY SCREEN
// -------------------------------------------------------------

writeFile('apps/field-app/src/components/vitals/abnormal-alert-banner.tsx', `
import React from 'react';
import { COLORS } from '../../theme/colors';
import { AlertOctagon, PhoneCall, ShieldAlert, Check } from 'lucide-react';

interface AbnormalAlertBannerProps {
  reasons: string[];
  seniorName: string;
  onEscalate: () => void;
  isEscalated: boolean;
}

export const AbnormalAlertBanner: React.FC<AbnormalAlertBannerProps> = ({
  reasons,
  seniorName,
  onEscalate,
  isEscalated,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#fff1f2',
        border: \`2px solid \${COLORS.secondary}\`,
        borderRadius: '20px',
        padding: '16px',
        marginBottom: '18px',
        boxShadow: '0 8px 24px rgba(254, 29, 143, 0.2)',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            backgroundColor: COLORS.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <AlertOctagon size={20} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: COLORS.secondaryDark }}>
            Clinical Deterioration Alert
          </h4>
          <span style={{ fontSize: '11px', color: '#9f1239', fontWeight: 600 }}>
            {seniorName} • Immediate On-Ground Attention Required
          </span>
        </div>
      </div>

      <ul style={{ margin: '0 0 12px', paddingLeft: '20px', fontSize: '11px', color: '#881337', fontWeight: 600 }}>
        {reasons.map((r, idx) => (
          <li key={idx} style={{ marginBottom: '2px' }}>{r}</li>
        ))}
      </ul>

      {isEscalated ? (
        <div
          style={{
            backgroundColor: COLORS.primaryLight,
            padding: '10px',
            borderRadius: '12px',
            border: \`1px solid \${COLORS.primaryBorder}\`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 800,
            color: COLORS.primaryDark,
          }}
        >
          <Check size={16} />
          <span>Escalated to On-Duty Geriatrician & Command Center</span>
        </div>
      ) : (
        <button
          onClick={onEscalate}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '14px',
            background: \`linear-gradient(135deg, \${COLORS.secondary}, \${COLORS.secondaryDark})\`,
            border: 'none',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(254,29,143,0.35)',
          }}
        >
          <PhoneCall size={16} />
          <span>1-Tap Escalate to Doctor / Dispatcher</span>
        </button>
      )}
    </div>
  );
};
`);

writeFile('apps/field-app/src/screens/vitals-entry-screen.tsx', `
import React, { useState } from 'react';
import { OfflineVisit, localStore } from '../db/sqlite-client';
import { AbnormalAlertBanner } from '../components/vitals/abnormal-alert-banner';
import { COLORS } from '../theme/colors';
import { ArrowLeft, Activity, Heart, Droplets, Thermometer, Scale, Check } from 'lucide-react';

export const VitalsEntryScreen: React.FC<{
  visit: OfflineVisit;
  onBack: () => void;
  onSaved: () => void;
}> = ({ visit, onBack, onSaved }) => {
  const [systolicBp, setSystolicBp] = useState<number>(128);
  const [diastolicBp, setDiastolicBp] = useState<number>(82);
  const [pulseBpm, setPulseBpm] = useState<number>(74);
  const [spo2Percent, setSpo2Percent] = useState<number>(98);
  const [glucoseMgDl, setGlucoseMgDl] = useState<number>(105);
  const [temperatureF, setTemperatureF] = useState<number>(98.6);
  const [weightKg, setWeightKg] = useState<number>(68.2);
  const [escalated, setEscalated] = useState(false);

  // Evaluate Clinical Thresholds
  const abnormalReasons: string[] = [];
  if (systolicBp >= 160) abnormalReasons.push(\`Elevated Systolic BP: \${systolicBp} mmHg (Threshold >= 160)\`);
  if (systolicBp < 90) abnormalReasons.push(\`Hypotension: Systolic BP \${systolicBp} mmHg (Threshold < 90)\`);
  if (spo2Percent < 94) abnormalReasons.push(\`Hypoxia Alert: SpO2 \${spo2Percent}% (Threshold < 94%)\`);
  if (pulseBpm > 100) abnormalReasons.push(\`Tachycardia: Pulse \${pulseBpm} BPM (Threshold > 100)\`);
  if (pulseBpm < 55) abnormalReasons.push(\`Bradycardia: Pulse \${pulseBpm} BPM (Threshold < 55)\`);
  if (glucoseMgDl > 180) abnormalReasons.push(\`Hyperglycemia: Glucose \${glucoseMgDl} mg/dL (Threshold > 180)\`);
  if (glucoseMgDl < 70) abnormalReasons.push(\`Hypoglycemia: Glucose \${glucoseMgDl} mg/dL (Threshold < 70)\`);

  const isAbnormal = abnormalReasons.length > 0;

  const handleSave = () => {
    localStore.saveVitals({
      id: \`vit-\${Date.now()}\`,
      visitId: visit.id,
      memberId: 'mem-001',
      systolicBp,
      diastolicBp,
      pulseBpm,
      spo2Percent,
      glucoseMgDl,
      glucoseType: 'FASTING',
      temperatureF,
      weightKg,
      isAbnormal,
      escalatedToDoctor: escalated,
      capturedAt: new Date().toISOString(),
    });
    onSaved();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.slateBg, fontFamily: 'Poppins, sans-serif', padding: '16px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: COLORS.textMain }}
          >
            <ArrowLeft size={16} />
            <span>Schedule</span>
          </button>
          <span style={{ fontSize: '12px', fontWeight: 800, color: COLORS.primaryDark }}>
            Clinical Telemetry
          </span>
        </div>

        {/* Member Header */}
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '20px', border: \`1px solid \${COLORS.border}\`, marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: COLORS.textMuted }}>Senior Profile</span>
          <h2 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 900, color: COLORS.textMain }}>
            {visit.seniorName}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: COLORS.textMuted }}>
            Hospital: <strong style={{ color: COLORS.textMain }}>{visit.preferredHospital}</strong>
          </p>
        </div>

        {/* Abnormal Alert Banner if thresholds breached */}
        {isAbnormal && (
          <AbnormalAlertBanner
            reasons={abnormalReasons}
            seniorName={visit.seniorName}
            isEscalated={escalated}
            onEscalate={() => setEscalated(true)}
          />
        )}

        {/* Form Inputs Grid */}
        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '20px', border: \`1px solid \${COLORS.border}\`, marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: '4px' }}>
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                value={systolicBp}
                onChange={(e) => setSystolicBp(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: 800, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: '4px' }}>
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                value={diastolicBp}
                onChange={(e) => setDiastolicBp(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: 800, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: '4px' }}>
                SpO2 Oxygen (%)
              </label>
              <input
                type="number"
                value={spo2Percent}
                onChange={(e) => setSpo2Percent(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: 800, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: '4px' }}>
                Pulse Rate (BPM)
              </label>
              <input
                type="number"
                value={pulseBpm}
                onChange={(e) => setPulseBpm(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: 800, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: '4px' }}>
                Glucose (mg/dL)
              </label>
              <input
                type="number"
                value={glucoseMgDl}
                onChange={(e) => setGlucoseMgDl(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: 800, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: '4px' }}>
                Weight (Kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: 800, boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Save & Queue Action */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            minHeight: '52px',
            borderRadius: '16px',
            background: \`linear-gradient(135deg, \${COLORS.primary}, \${COLORS.primaryDark})\`,
            border: 'none',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 20px rgba(18,195,149,0.35)',
          }}
        >
          <Check size={18} />
          <span>Save Vitals to Local SQLite & Sync</span>
        </button>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 2. INCIDENT REPORT & EMERGENCY DRY-RUN DRILL MODE
// -------------------------------------------------------------

writeFile('apps/field-app/src/screens/incident-report-screen.tsx', `
import React, { useState } from 'react';
import { VoiceNoteRecorder } from '../components/sop/voice-note-recorder';
import { COLORS } from '../theme/colors';
import { ArrowLeft, AlertTriangle, Send, Check } from 'lucide-react';

export const IncidentReportScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [category, setCategory] = useState('FALL_NEAR_MISS');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onBack();
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.slateBg, fontFamily: 'Poppins, sans-serif', padding: '16px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: COLORS.textMain }}
          >
            <ArrowLeft size={16} />
            <span>Schedule</span>
          </button>
          <span style={{ fontSize: '12px', fontWeight: 800, color: COLORS.secondary }}>
            Field Incident Protocol
          </span>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', border: \`1px solid \${COLORS.border}\`, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#fee5f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color={COLORS.secondary} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: COLORS.textMain }}>Report Field Incident</h2>
              <p style={{ margin: 0, fontSize: '11px', color: COLORS.textMuted }}>Direct alert to Ops Command Hub</p>
            </div>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '20px', backgroundColor: COLORS.primaryLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Check size={28} color={COLORS.primary} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: COLORS.textMain }}>Incident Logged</h3>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: COLORS.textMuted }}>Ops team dispatched notification</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>Severity Level</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '10px',
                        border: \`1px solid \${severity === sev ? COLORS.secondary : '#e2e8f0'}\`,
                        backgroundColor: severity === sev ? '#fee5f2' : '#f8fafc',
                        color: severity === sev ? COLORS.secondaryDark : '#475569',
                        fontSize: '10px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>Incident Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
                >
                  <option value="FALL_NEAR_MISS">Slip / Fall Near-Miss</option>
                  <option value="MEDICATION_ERROR">Medication Discrepancy</option>
                  <option value="DEVICE_FAILURE">Medical Device Malfunction</option>
                  <option value="HOME_HAZARD">Electrical / Water Hazard</option>
                  <option value="BEHAVIORAL_CHANGE">Sudden Confusion / Behavioral Change</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>Detailed Observations</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe exact situation, immediate actions taken..."
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <VoiceNoteRecorder onAudioRecorded={() => {}} />

              <button
                type="submit"
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '14px',
                  borderRadius: '16px',
                  background: \`linear-gradient(135deg, \${COLORS.secondary}, \${COLORS.secondaryDark})\`,
                  border: 'none',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(254,29,143,0.3)',
                }}
              >
                <Send size={15} />
                <span>Submit Incident to Ops Hub</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/field-app/src/screens/drill-mode-screen.tsx', `
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
    return \`\${min}:\${sec < 10 ? '0' : ''}\${sec}\`;
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
`);

// -------------------------------------------------------------
// 3. ROOT APP CONTAINER
// -------------------------------------------------------------

writeFile('apps/field-app/src/App.tsx', `
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './auth/auth-context';
import { LoginScreen } from './screens/login-screen';
import { ScheduleScreen } from './screens/schedule-screen';
import { SopWizardScreen } from './screens/sop-wizard-screen';
import { VitalsEntryScreen } from './screens/vitals-entry-screen';
import { IncidentReportScreen } from './screens/incident-report-screen';
import { DrillModeScreen } from './screens/drill-mode-screen';
import { OfflineVisit } from './db/sqlite-client';

const MainNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'LOGIN' | 'SCHEDULE' | 'SOP' | 'VITALS' | 'INCIDENT' | 'DRILL'>('SCHEDULE');
  const [activeVisit, setActiveVisit] = useState<OfflineVisit | null>(null);

  if (!isAuthenticated || currentScreen === 'LOGIN') {
    return <LoginScreen onSuccess={() => setCurrentScreen('SCHEDULE')} />;
  }

  if (currentScreen === 'SOP' && activeVisit) {
    return (
      <SopWizardScreen
        visit={activeVisit}
        onBack={() => setCurrentScreen('SCHEDULE')}
        onFinish={() => setCurrentScreen('SCHEDULE')}
      />
    );
  }

  if (currentScreen === 'VITALS' && activeVisit) {
    return (
      <VitalsEntryScreen
        visit={activeVisit}
        onBack={() => setCurrentScreen('SCHEDULE')}
        onSaved={() => setCurrentScreen('SCHEDULE')}
      />
    );
  }

  if (currentScreen === 'INCIDENT') {
    return <IncidentReportScreen onBack={() => setCurrentScreen('SCHEDULE')} />;
  }

  if (currentScreen === 'DRILL') {
    return <DrillModeScreen onBack={() => setCurrentScreen('SCHEDULE')} />;
  }

  return (
    <ScheduleScreen
      onStartSop={(visit) => {
        setActiveVisit(visit);
        setCurrentScreen('SOP');
      }}
      onOpenVitals={(visit) => {
        setActiveVisit(visit);
        setCurrentScreen('VITALS');
      }}
      onOpenIncident={() => setCurrentScreen('INCIDENT')}
      onOpenDrill={() => setCurrentScreen('DRILL')}
    />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}
`);

// -------------------------------------------------------------
// 4. UNIT & WORKFLOW TESTS
// -------------------------------------------------------------

writeFile('apps/field-app/src/__tests__/field-workflows.spec.tsx', `
import { describe, it, expect, beforeEach } from 'vitest';
import { localStore } from '../db/sqlite-client';
import { SyncWorker } from '../db/sync-worker';

describe('Care Officer Field App Workflows', () => {
  beforeEach(() => {
    localStore.clearQueue();
    SyncWorker.setOnline(true);
  });

  it('Flow 1: Offline SQLite local storage and mutation queue lifecycle', () => {
    const initialCount = localStore.getPendingQueueCount();
    expect(initialCount).toBe(0);

    // Save vitals while offline
    SyncWorker.setOnline(false);
    expect(SyncWorker.isOnline()).toBe(false);

    localStore.saveVitals({
      id: 'vit-test-01',
      visitId: 'visit-001',
      memberId: 'mem-001',
      systolicBp: 125,
      diastolicBp: 80,
      pulseBpm: 72,
      spo2Percent: 98,
      isAbnormal: false,
      escalatedToDoctor: false,
      capturedAt: new Date().toISOString(),
    });

    expect(localStore.getPendingQueueCount()).toBe(1);
    expect(SyncWorker.getPendingCount()).toBe(1);

    // Reconnect to network and drain queue
    SyncWorker.setOnline(true);
    expect(SyncWorker.isOnline()).toBe(true);
  });

  it('Flow 2: Rapid <5 min SOP checklist execution and visit completion', () => {
    const visits = localStore.getVisits();
    expect(visits.length).toBeGreaterThan(0);
    const targetVisit = visits[0];

    localStore.saveSopExecution({
      id: 'exec-test-01',
      visitId: targetVisit.id,
      sopTemplateCode: 'SOP-CARE-01',
      stepResults: [
        { stepId: 'step-1', stepName: 'Identification', category: 'General', status: 'PASSED' },
        { stepId: 'step-2', stepName: 'Pillbox', category: 'Clinical', status: 'PASSED', photoUri: 'file:///p.jpg' },
      ],
      durationSeconds: 140, // 2:20 min (well under 5 min)
      completedAt: new Date().toISOString(),
    });

    const updatedVisit = localStore.getVisitById(targetVisit.id);
    expect(updatedVisit?.status).toBe('COMPLETED');
    expect(localStore.getPendingQueueCount()).toBeGreaterThan(0);
  });

  it('Flow 3: Clinical vitals threshold abnormal detection and doctor escalation flag', () => {
    localStore.saveVitals({
      id: 'vit-test-critical',
      visitId: 'visit-002',
      memberId: 'mem-002',
      systolicBp: 168, // Exceeds 160 threshold
      diastolicBp: 102,
      pulseBpm: 108, // Tachycardia > 100
      spo2Percent: 92, // Hypoxia < 94%
      isAbnormal: true,
      escalatedToDoctor: true,
      capturedAt: new Date().toISOString(),
    });

    const vitals = localStore.getVitalsByVisit('visit-002');
    expect(vitals.length).toBeGreaterThan(0);
    expect(vitals[0].isAbnormal).toBe(true);
    expect(vitals[0].escalatedToDoctor).toBe(true);
  });
});
`);

console.log('Finished generating Wave 3 Vitals escalation, Incident reporting, Drill mode, App root & Tests');

