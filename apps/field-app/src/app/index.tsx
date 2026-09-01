import React from 'react';
import { AppLayout } from './_layout';

export const HomeScreen: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-4" data-testid="field-home-container">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Welcome to Poco Field</h2>
          <p className="text-sm text-slate-600 mt-1">
            Offline-first Care Officer workspace. Select an assigned visit or check households.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};
export default HomeScreen;
