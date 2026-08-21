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
        border: `1px solid ${isCompleted ? COLORS.primaryBorder : COLORS.border}`,
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
                border: `1px solid ${COLORS.primaryBorder}`,
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
            border: `1px solid ${isCompleted ? COLORS.primaryBorder : '#cbd5e1'}`,
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
          href={`https://maps.google.com/?q=${visit.gpsCoords.lat},${visit.gpsCoords.lng}`}
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
            border: `1px solid ${COLORS.secondaryBorder}`,
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
            background: isCompleted ? '#334155' : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
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
