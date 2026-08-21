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
                  border: `1px solid ${COLORS.secondaryBorder}`,
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
