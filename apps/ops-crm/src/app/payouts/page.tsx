'use client';

import React from 'react';
import { PayoutStatementTable } from '../../components/payouts/payout-statement-table';

export default function PayoutsReconciliationPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0">Monthly Partner Payout Reconciliation Ledger</h2>
          <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
            Review completed partner consumption volume, audit automated TDS tax withholding, and execute batch payout approvals
          </p>
        </div>
      </div>

      <PayoutStatementTable />
    </div>
  );
}
