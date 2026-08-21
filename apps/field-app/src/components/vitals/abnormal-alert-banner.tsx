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
        border: `2px solid ${COLORS.secondary}`,
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
            border: `1px solid ${COLORS.primaryBorder}`,
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
            background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.secondaryDark})`,
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
