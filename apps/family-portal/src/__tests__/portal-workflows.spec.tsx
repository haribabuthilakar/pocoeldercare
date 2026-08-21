import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DualTimezoneBadge } from '../components/calendar/dual-timezone-badge';
import { QuotaPricingBadge } from '../components/services/quota-pricing-badge';
import { HealthSummaryBadge } from '../components/vitals/health-summary-badge';

describe('Family Portal UI Component Workflows', () => {
  it('should format dual timezone dates in both IST and viewer local time', () => {
    render(
      <DualTimezoneBadge
        scheduledAt="2026-08-25T10:30:00.000Z"
        viewerTimezone="America/Los_Angeles"
      />
    );
    expect(screen.getByText(/IST/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Time:/i)).toBeInTheDocument();
  });

  it('should render ₹0 included badge for subscription quota services', () => {
    render(
      <QuotaPricingBadge
        isIncludedInPlan={true}
        quotaRemaining={2}
        pricePaise={150000}
      />
    );
    expect(screen.getByText(/Included in Plan/i)).toBeInTheDocument();
  });

  it('should render pay-per-use badge with transparent INR pricing when not in plan', () => {
    render(
      <QuotaPricingBadge
        isIncludedInPlan={false}
        pricePaise={80000}
      />
    );
    expect(screen.getByText(/Pay-Per-Use: ₹800.00/i)).toBeInTheDocument();
  });

  it('should render health summary badge with doctor review attribution', () => {
    render(
      <HealthSummaryBadge
        status="STABLE"
        label="Overall Vitals: Controlled"
        doctorReviewed="Dr. Anand Kulkarni"
      />
    );
    expect(screen.getByText(/Overall Vitals: Controlled/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Anand Kulkarni/i)).toBeInTheDocument();
  });
});
