import React, { useState, useEffect } from 'react';
import { SyncWorker } from '../../db/sync-worker';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { COLORS } from '../../theme/colors';

export const OfflineStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(SyncWorker.isOnline());
  const [pendingCount, setPendingCount] = useState(SyncWorker.getPendingCount());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    return SyncWorker.subscribe((online, count) => {
      setIsOnline(online);
      setPendingCount(count);
    });
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await SyncWorker.drainQueue();
    setIsSyncing(false);
  };

  const toggleOnline = () => {
    SyncWorker.setOnline(!isOnline);
  };

  return (
    <div
      style={{
        backgroundColor: isOnline ? COLORS.primaryLight : '#fff1f2',
        borderBottom: `1px solid ${isOnline ? COLORS.primaryBorder : '#fecdd3'}`,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={toggleOnline}
          title="Click to toggle offline mode simulation"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isOnline ? (
            <Wifi size={16} color={COLORS.primary} />
          ) : (
            <WifiOff size={16} color="#e11d48" />
          )}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: isOnline ? COLORS.primaryDark : '#be123c',
            }}
          >
            {isOnline ? 'Online (Field Sync Active)' : 'Offline (Local SQLite Cache)'}
          </span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {pendingCount > 0 && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#fee5f2',
              color: COLORS.secondary,
              padding: '2px 8px',
              borderRadius: '12px',
              border: `1px solid ${COLORS.secondaryBorder}`,
            }}
          >
            {pendingCount} Pending Sync
          </span>
        )}

        {isOnline && (
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: COLORS.primaryDark,
            }}
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
