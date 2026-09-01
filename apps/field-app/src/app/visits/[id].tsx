import React, { useState, useEffect } from 'react';
import { database } from '../../db/database';
import type { ServiceRequestModel } from '../../db/models/service-request';
import type { HouseholdModel } from '../../db/models/household';
import type { SeniorModel } from '../../db/models/senior';
import { GeofenceStatus } from '../../components/visits/geofence-status';
import { SopChecklistWizard } from '../../components/sop/sop-checklist-wizard';
import { FinishVisitModal } from '../../components/visits/finish-visit-modal';
import { AppLayout } from '../_layout';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
} from 'lucide-react';

export interface VisitDetailScreenProps {
  visitId?: string;
  onBack?: () => void;
}

export const VisitDetailScreen: React.FC<VisitDetailScreenProps> = ({
  visitId = 'sr_field_001',
  onBack,
}) => {
  const [serviceRequest, setServiceRequest] = useState<ServiceRequestModel | null>(null);
  const [household, setHousehold] = useState<HouseholdModel | null>(null);
  const [senior, setSenior] = useState<SeniorModel | null>(null);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sr = await database.serviceRequests.find(visitId);
      const households = await database.households.query();
      const seniors = await database.seniors.query();

      setServiceRequest(sr);
      if (households.length > 0) setHousehold(households[0]);
      if (seniors.length > 0) setSenior(seniors[0]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = database.serviceRequests.subscribe(loadData);
    return () => unsub();
  }, [visitId]);

  const handleStartVisit = async () => {
    if (!serviceRequest) return;
    await database.serviceRequests.update(serviceRequest.id, { status: 'ON_SITE' });
    await database.stageMutation('STATUS_TRANSITION', 'service_requests', serviceRequest.id, {
      type: 'START_WORK',
      isGeofenceVerified: true,
      timestamp: new Date().toISOString(),
    });
    await loadData();
  };

  const handleFinishVisit = async (notes?: string) => {
    if (!serviceRequest) return;
    await database.serviceRequests.update(serviceRequest.id, { status: 'COMPLETED' });
    await database.stageMutation('STATUS_TRANSITION', 'service_requests', serviceRequest.id, {
      type: 'COMPLETE_WORK',
      notes,
      timestamp: new Date().toISOString(),
    });
    await loadData();
    onBack?.();
  };

  if (isLoading || !serviceRequest) {
    return (
      <AppLayout initialRoute="visits">
        <div className="p-8 text-center text-xs text-slate-500">Loading visit details...</div>
      </AppLayout>
    );
  }

  const isInProgress =
    serviceRequest.status === 'IN_PROGRESS' || serviceRequest.status === 'ON_SITE';
  const isScheduled =
    serviceRequest.status === 'SCHEDULED' || serviceRequest.status === 'ASSIGNED';
  const isOnboarding = household?.status === 'PENDING_ONBOARDING';

  return (
    <AppLayout initialRoute="visits">
      <div className="space-y-4" data-testid="visit-detail-container">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            data-testid="visit-back-button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Visits
          </button>

          {isScheduled && (
            <button
              type="button"
              data-testid="detail-start-visit-btn"
              onClick={handleStartVisit}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-emerald-600"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Visit
            </button>
          )}

          {isInProgress && (
            <button
              type="button"
              data-testid="detail-finish-visit-btn"
              onClick={() => setIsFinishModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Finish Visit
            </button>
          )}
        </div>

        {/* Household & Senior Banner Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                {serviceRequest.title}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {senior?.fullName || 'Senior Client'}
              </h2>
              <p className="text-xs text-slate-500">{household?.name}</p>
            </div>

            {senior?.emergencyContactPhone && (
              <a
                href={`tel:${senior.emergencyContactPhone}`}
                data-testid="call-senior-button"
                className="p-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1.5 text-xs font-semibold"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
            )}
          </div>

          <div className="flex items-start gap-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span>{household?.fullAddress || 'Address on file'}</span>
          </div>
        </div>

        {/* GPS Geofence Banner */}
        <GeofenceStatus
          deviceCoords={{ latitude: 12.9716, longitude: 77.6412 }}
          targetCoords={{
            latitude: household?.latitude || 12.9716,
            longitude: household?.longitude || 77.6412,
          }}
        />

        {/* SOP Checklist Wizard */}
        <SopChecklistWizard
          serviceRequestId={serviceRequest.id}
          sopVersionId={serviceRequest.sopVersionId || 'sop_vitals_v1'}
          isOnboardingVisit={isOnboarding}
          householdName={household?.name}
          onFinishVisit={() => setIsFinishModalOpen(true)}
        />

        {/* Finish Modal */}
        <FinishVisitModal
          isOpen={isFinishModalOpen}
          onClose={() => setIsFinishModalOpen(false)}
          onConfirm={handleFinishVisit}
          completedStepsCount={4}
          totalStepsCount={4}
          householdName={household?.name || 'Household'}
        />
      </div>
    </AppLayout>
  );
};
export default VisitDetailScreen;
