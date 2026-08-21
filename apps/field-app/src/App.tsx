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
