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

        <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', border: `1px solid ${COLORS.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
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
                        border: `1px solid ${severity === sev ? COLORS.secondary : '#e2e8f0'}`,
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
                  background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.secondaryDark})`,
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
