import React from 'react';
import { AppLayout } from '../_layout';
import { ConflictReviewDrawer } from '../../components/sync/conflict-review-drawer';

export const ConflictsScreen: React.FC = () => {
  return (
    <AppLayout initialRoute="conflicts">
      <div className="space-y-4" data-testid="conflicts-screen-container">
        <ConflictReviewDrawer />
      </div>
    </AppLayout>
  );
};
export default ConflictsScreen;
