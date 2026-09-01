import React from 'react';
import type { ServiceRequestModel } from '../../db/models/service-request';
import type { HouseholdModel } from '../../db/models/household';
import type { SeniorModel } from '../../db/models/senior';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronRight,
  Play,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export interface VisitCardProps {
  serviceRequest: ServiceRequestModel;
  household?: HouseholdModel | null;
  senior?: SeniorModel | null;
  onOpenVisit?: (id: string) => void;
  onStartVisit?: (id: string) => void;
  onFinishVisit?: (id: string) => void;
}

export const VisitCard: React.FC<VisitCardProps> = ({
  serviceRequest,
  household,
  senior,
  onOpenVisit,
  onStartVisit,
  onFinishVisit,
}) => {
  const isScheduled =
    serviceRequest.status === 'SCHEDULED' || serviceRequest.status === 'ASSIGNED';
  const isInProgress =
    serviceRequest.status === 'IN_PROGRESS' || serviceRequest.status === 'ON_SITE';
  const isCompleted = serviceRequest.status === 'COMPLETED';
  const isException = serviceRequest.status === 'EXCEPTION_FLAGGED';

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    }
    if (isInProgress) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          In Progress
        </span>
      );
    }
    if (isException) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-semibold">
          <AlertCircle className="w-3 h-3" />
          Exception Flagged
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
        <Clock className="w-3 h-3 text-slate-500" />
        Scheduled
      </span>
    );
  };

  return (
    <div
      data-testid={`visit-card-${serviceRequest.id}`}
      onClick={() => onOpenVisit?.(serviceRequest.id)}
      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer space-y-3"
    >
      {/* Top Meta Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            {senior?.fullName?.charAt(0) || <User className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm leading-tight">
              {senior?.fullName || 'Senior Client'}
            </h4>
            <p className="text-xs text-slate-500">{household?.name || 'Household'}</p>
          </div>
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      {/* Service Title & Address */}
      <div className="space-y-1.5 text-xs text-slate-600">
        <p className="font-semibold text-slate-800 text-sm">{serviceRequest.title}</p>
        <div className="flex items-start gap-1.5 text-slate-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
          <span className="line-clamp-1">
            {household?.fullAddress || 'Address recorded on household'}
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Today's Schedule
        </span>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isScheduled && (
            <button
              type="button"
              data-testid={`start-visit-btn-${serviceRequest.id}`}
              onClick={() => onStartVisit?.(serviceRequest.id)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Visit
            </button>
          )}

          {isInProgress && (
            <>
              <button
                type="button"
                data-testid={`resume-visit-btn-${serviceRequest.id}`}
                onClick={() => onOpenVisit?.(serviceRequest.id)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs flex items-center gap-1 hover:bg-emerald-100 transition-colors"
              >
                Resume
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                data-testid={`finish-visit-btn-${serviceRequest.id}`}
                onClick={() => onFinishVisit?.(serviceRequest.id)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
              >
                Finish
              </button>
            </>
          )}

          {isCompleted && (
            <button
              type="button"
              onClick={() => onOpenVisit?.(serviceRequest.id)}
              className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
            >
              View Report
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default VisitCard;
