import React, { useState, useEffect } from 'react';
import { database } from '../../db/database';
import type { ActivityFeedItemModel } from '../../db/models/activity-feed-item';
import type { HouseholdModel } from '../../db/models/household';
import { ActivityFeedView } from '../../components/feed/activity-feed-view';
import { MessageComposer } from '../../components/feed/message-composer';
import { AppLayout } from '../_layout';
import { MessageSquare, Home, RefreshCw } from 'lucide-react';

export const FeedScreen: React.FC = () => {
  const [households, setHouseholds] = useState<HouseholdModel[]>([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>('hh_blr_001');
  const [feedItems, setFeedItems] = useState<ActivityFeedItemModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const hList = await database.households.query();
      setHouseholds(hList);
      if (hList.length > 0 && !selectedHouseholdId && hList[0]) {
        setSelectedHouseholdId(hList[0].id);
      }

      const activeHId = selectedHouseholdId || (hList.length > 0 && hList[0] ? hList[0].id : 'hh_blr_001');
      const items = await database.activityFeedItems.query(
        (item) => item.household_id === activeHId,
      );
      items.sort((a, b) => a.createdAt - b.createdAt);
      setFeedItems(items);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = database.activityFeedItems.subscribe(loadData);
    return () => unsub();
  }, [selectedHouseholdId]);

  const selectedHousehold = households.find((h) => h.id === selectedHouseholdId);

  return (
    <AppLayout initialRoute="feed">
      <div className="flex flex-col h-[calc(100vh-140px)]" data-testid="feed-screen-container">
        {/* Header & Household Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-3 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Caregiver Activity Feed</h2>
              <p className="text-xs text-slate-500">
                {selectedHousehold?.name || 'Household Care Chat'}
              </p>
            </div>
          </div>

          {households.length > 1 && (
            <select
              data-testid="household-select"
              value={selectedHouseholdId}
              onChange={(e) => setSelectedHouseholdId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Scrollable Feed Area */}
        <div className="flex-1 overflow-y-auto pr-1 pb-3">
          <ActivityFeedView
            items={feedItems}
            householdName={selectedHousehold?.name}
          />
        </div>

        {/* Pinned Bottom Composer */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <MessageComposer
            householdId={selectedHouseholdId}
            onMessageSent={loadData}
          />
        </div>
      </div>
    </AppLayout>
  );
};
export default FeedScreen;
