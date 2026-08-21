'use client';

import React from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { MonthlyValueDigest } from '@/components/digest/monthly-value-digest';

export default function DigestPage() {
  return (
    <div className="min-h-screen bg-[#f8fbfb] pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <MonthlyValueDigest />
      </main>
    </div>
  );
}
