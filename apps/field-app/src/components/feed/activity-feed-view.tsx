import React from 'react';
import type { ActivityFeedItemModel } from '../../db/models/activity-feed-item';
import {
  User,
  ShieldCheck,
  Heart,
  Bot,
  Clock,
  CheckCircle2,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';

export interface ActivityFeedViewProps {
  items: ActivityFeedItemModel[];
  householdName?: string;
}

export const ActivityFeedView: React.FC<ActivityFeedViewProps> = ({
  items,
  householdName = 'Household',
}) => {
  const getRoleMeta = (role: ActivityFeedItemModel['authorRole']) => {
    switch (role) {
      case 'CARE_OFFICER':
        return {
          label: 'Care Officer',
          icon: ShieldCheck,
          bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          avatarBg: 'bg-emerald-500 text-white',
        };
      case 'FAMILY':
        return {
          label: 'Family Member',
          icon: Heart,
          bgColor: 'bg-blue-50 text-blue-800 border-blue-200',
          avatarBg: 'bg-blue-500 text-white',
        };
      case 'SYSTEM':
        return {
          label: 'Poco System',
          icon: Bot,
          bgColor: 'bg-slate-100 text-slate-800 border-slate-200',
          avatarBg: 'bg-slate-700 text-white',
        };
      default:
        return {
          label: 'Author',
          icon: User,
          bgColor: 'bg-slate-50 text-slate-700 border-slate-200',
          avatarBg: 'bg-slate-500 text-white',
        };
    }
  };

  if (items.length === 0) {
    return (
      <div
        data-testid="empty-feed-state"
        className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center space-y-3"
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">No Care Notes Yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            There are no previous care notes for this household. Write an update below to log visit
            remarks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="activity-feed-container">
      {items.map((item) => {
        const meta = getRoleMeta(item.authorRole);
        const Icon = meta.icon;

        return (
          <div
            key={item.id}
            data-testid={`feed-item-${item.id}`}
            className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2.5"
          >
            {/* Author Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${meta.avatarBg}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{meta.label}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Sync Status Badge */}
              <div>
                {item.isSynced ? (
                  <span
                    data-testid={`feed-synced-${item.id}`}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Synced
                  </span>
                ) : (
                  <span
                    data-testid={`feed-pending-${item.id}`}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded animate-pulse"
                  >
                    <Clock className="w-3 h-3 text-amber-600" />
                    Pending Sync
                  </span>
                )}
              </div>
            </div>

            {/* Note Content */}
            <p className="text-xs text-slate-700 leading-relaxed font-normal">{item.content}</p>

            {/* Optional Photo Attachment */}
            {item.mediaUrl && (
              <div className="pt-1">
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center gap-2 text-xs text-slate-600">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span className="truncate">Photo attached</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
export default ActivityFeedView;
