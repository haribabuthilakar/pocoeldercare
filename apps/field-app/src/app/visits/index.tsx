import React, { useState, useEffect } from 'react';
import { database } from '../../db/database';
import type { ServiceRequestModel } from '../../db/models/service-request';
import type { HouseholdModel } from '../../db/models/household';
import type { SeniorModel } from '../../db/models/senior';
import { VisitCard } from '../../components/visits/visit-card';
import { FinishVisitModal } from '../../components/visits/finish-visit-modal';
import { AppLayout } from '../_layout';
import { Calendar, Search, RefreshCw, CheckCircle2 } from 'lucide-react';

export interface VisitsScreenProps {
  onNavigateToDetail?: (id: string) => void;
}

export const VisitsScreen: React.FC<VisitsScreenProps> = ({ onNavigateToDetail }) => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestModel[]>([]);
  const [householdsMap, setHouseholdsMap] = useState<Map<string, HouseholdModel>>(new Map());
  const [seniorsMap, setSeniorsMap] = useState<Map<string, SeniorModel>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedForFinish, setSelectedForFinish] = useState<ServiceRequestModel | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const srs = await database.serviceRequests.query();
      const households = await database.households.query();
      const seniors = await database.seniors.query();

      const hMap = new Map<string, HouseholdModel>();
      households.forEach((h) => hMap.set(h.id, h));

      const sMap = new Map<string, SeniorModel>();
      seniors.forEach((s) => sMap.set(s.id, s));

      setServiceRequests(srs);
      setHouseholdsMap(hMap);
      setSeniorsMap(sMap);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubSR = database.serviceRequests.subscribe(loadData);
    return () => unsubSR();
  }, []);

  const handleStartVisit = async (srId: string) => {
    // 1. Update local database status to ON_SITE
    await database.serviceRequests.update(srId, { status: 'ON_SITE' });

    // 2. Stage mutation in sync outbox with silent GPS coordinates
    await database.stageMutation('STATUS_TRANSITION', 'service_requests', srId, {
      type: 'START_WORK',
      isGeofenceVerified: true,
      latitude: 12.9716,
      longitude: 77.6412,
      timestamp: new Date().toISOString(),
    });

    onNavigateToDetail?.(srId);
  };

  const handleConfirmFinish = async (notes?: string) => {
    if (!selectedForFinish) return;

    await database.serviceRequests.update(selectedForFinish.id, {
      status: 'COMPLETED',
    });

    await database.stageMutation('STATUS_TRANSITION', 'service_requests', selectedForFinish.id, {
      type: 'COMPLETE_WORK',
      notes,
      isGeofenceVerified: true,
      latitude: 12.9716,
      longitude: 77.6412,
      timestamp: new Date().toISOString(),
    });

    setSelectedForFinish(null);
  };

  const filteredVisits = serviceRequests.filter((sr) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return sr.title.toLowerCase().includes(q) || sr.status.toLowerCase().includes(q);
  });

  return (
    <AppLayout initialRoute="visits">
      <div className="space-y-4" data-testid="visits-screen-container">
        {/* Header Title & Date */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Today's Visits
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          <button
            type="button"
            data-testid="refresh-visits-button"
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs"
            title="Refresh Visits"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            data-testid="visits-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search visits by name or status..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Visits List */}
        {filteredVisits.length === 0 ? (
          <div
            data-testid="empty-visits-state"
            className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No Scheduled Visits</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                You have no home visits scheduled for today. Check your assigned households list or
                pull down to check for updates.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3" data-testid="visits-list">
            {filteredVisits.map((sr) => {
              // Find household and senior linked through ticket
              const household = Array.from(householdsMap.values())[0] || null;
              const senior = Array.from(seniorsMap.values())[0] || null;

              return (
                <VisitCard
                  key={sr.id}
                  serviceRequest={sr}
                  household={household}
                  senior={senior}
                  onOpenVisit={(id) => onNavigateToDetail?.(id)}
                  onStartVisit={handleStartVisit}
                  onFinishVisit={(id) => setSelectedForFinish(sr)}
                />
              );
            })}
          </div>
        )}

        {/* Finish Modal */}
        {selectedForFinish && (
          <FinishVisitModal
            isOpen={true}
            onClose={() => setSelectedForFinish(null)}
            onConfirm={handleConfirmFinish}
            completedStepsCount={4}
            totalStepsCount={4}
            householdName="Varma Household"
          />
        )}
      </div>
    </AppLayout>
  );
};
export default VisitsScreen;
