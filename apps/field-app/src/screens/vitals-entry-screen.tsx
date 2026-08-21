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
  if (systolicBp >= 160) abnormalReasons.push(`Elevated Systolic BP: ${systolicBp} mmHg (Threshold >= 160)`);
  if (systolicBp < 90) abnormalReasons.push(`Hypotension: Systolic BP ${systolicBp} mmHg (Threshold < 90)`);
  if (spo2Percent < 94) abnormalReasons.push(`Hypoxia Alert: SpO2 ${spo2Percent}% (Threshold < 94%)`);
  if (pulseBpm > 100) abnormalReasons.push(`Tachycardia: Pulse ${pulseBpm} BPM (Threshold > 100)`);
  if (pulseBpm < 55) abnormalReasons.push(`Bradycardia: Pulse ${pulseBpm} BPM (Threshold < 55)`);
  if (glucoseMgDl > 180) abnormalReasons.push(`Hyperglycemia: Glucose ${glucoseMgDl} mg/dL (Threshold > 180)`);
  if (glucoseMgDl < 70) abnormalReasons.push(`Hypoglycemia: Glucose ${glucoseMgDl} mg/dL (Threshold < 70)`);

  const isAbnormal = abnormalReasons.length > 0;

  const handleSave = () => {
    localStore.saveVitals({
      id: `vit-${Date.now()}`,
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
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '20px', border: `1px solid ${COLORS.border}`, marginBottom: '16px' }}>
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
        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '20px', border: `1px solid ${COLORS.border}`, marginBottom: '20px' }}>
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
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
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
