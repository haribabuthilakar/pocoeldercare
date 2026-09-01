import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import SlaRiskPage from '@/app/admin/sla-risk/page';
import { AdminProviders } from '@/app/admin/providers';
import { apiClient } from '@/lib/api-client';
import { mockSlaRiskTickets } from '../fixtures/tickets.fixture';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/sla-risk',
}));

describe('SlaRiskQueueView — Dual Timers & Supervisor Fallback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders SLA at-risk and breached tickets with dual timer percentages', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockSlaRiskTickets);

    render(
      <AdminProviders>
        <SlaRiskPage />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Urgent Oxygen Concentrator Delivery')).toBeInTheDocument();
    });

    expect(screen.getByText('Scheduled Escorted Hospital Visit')).toBeInTheDocument();
    expect(screen.getByText('AT RISK')).toBeInTheDocument();
    expect(screen.getByText('BREACHED')).toBeInTheDocument();

    // Verify dual clocks
    expect(screen.getByText('82% elapsed')).toBeInTheDocument();
    expect(screen.getByText('78% elapsed')).toBeInTheDocument();
    expect(screen.getByText('100% elapsed')).toBeInTheDocument();
    expect(screen.getByText('115% elapsed')).toBeInTheDocument();
  });

  it('triggers supervisor fallback escalation mutation on button click', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockSlaRiskTickets);
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      status: 'ESCALATED',
      fallbackCareOfficerId: 'co-supervisor-01',
    });

    render(
      <AdminProviders>
        <SlaRiskPage />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Escalate / Fallback')[0]).toBeInTheDocument();
    });

    const fallbackButtons = screen.getAllByText('Escalate / Fallback');
    fireEvent.click(fallbackButtons[0]!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        '/api/admin/v1/care-officers/tickets/tkt-sla-001-atrisk/fallback'
      );
    });
  });

  it('renders exact copywriting contract for empty SLA risk queue', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue([]);

    render(
      <AdminProviders>
        <SlaRiskPage />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('No At-Risk Clocks')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'All active service response and delivery timers are currently operating within normal thresholds.'
      )
    ).toBeInTheDocument();
  });
});
