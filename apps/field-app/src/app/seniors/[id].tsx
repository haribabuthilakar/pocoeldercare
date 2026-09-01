import React, { useState, useEffect } from 'react';
import { database } from '../../db/database';
import type { SeniorModel } from '../../db/models/senior';
import type { HouseholdModel } from '../../db/models/household';
import { EmergencyProfileCard } from '../../components/seniors/emergency-profile-card';
import { VitalsEntryForm, type VitalsData } from '../../components/seniors/vitals-entry-form';
import { AppLayout } from '../_layout';
import { ArrowLeft, User, Phone, MapPin } from 'lucide-react';

export interface SeniorProfileScreenProps {
  seniorId?: string;
  onBack?: () => void;
}

export const SeniorProfileScreen: React.FC<SeniorProfileScreenProps> = ({
  seniorId = 'snr_blr_001',
  onBack,
}) => {
  const [senior, setSenior] = useState<SeniorModel | null>(null);
  const [household, setHousehold] = useState<HouseholdModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const s = await database.seniors.find(seniorId);
      if (s) {
        setSenior(s);
        const h = await database.households.find(s.householdId);
        setHousehold(h);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [seniorId]);

  const handleSaveVitals = async (vitals: VitalsData) => {
    if (!senior) return;

    // Stage outbox mutation with vitals
    await database.stageMutation('VITALS_RECORD', 'seniors', senior.id, {
      seniorId: senior.id,
      householdId: senior.householdId,
      ...vitals,
      recordedAt: new Date().toISOString(),
    });
  };

  if (isLoading || !senior) {
    return (
      <AppLayout initialRoute="households">
        <div className="p-8 text-center text-xs text-slate-500">Loading senior profile...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout initialRoute="households">
      <div className="space-y-4" data-testid="senior-profile-container">
        {/* Top Back Nav */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            data-testid="senior-back-button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Emergency ICE Card */}
        <EmergencyProfileCard senior={senior} />

        {/* Vitals Entry Form */}
        <VitalsEntryForm onSaveVitals={handleSaveVitals} />
      </div>
    </AppLayout>
  );
};
export default SeniorProfileScreen;
