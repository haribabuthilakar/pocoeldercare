import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { LeadPipelineView } from '@/app/admin/leads/page';
import { AdminProviders } from '@/app/admin/providers';
import { apiClient } from '@/lib/api-client';
import { LeadStage } from '@poco/constants';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/leads',
}));

const mockLeadsData = [
  {
    id: 'lead-001',
    contactName: 'Sunita Deshmukh',
    phone: '+919876543210',
    email: 'sunita.d@gmail.com',
    city: 'Pune',
    stage: LeadStage.NEW,
    assignedSalesExecutive: 'Rajesh Sharma',
    createdAt: new Date('2026-08-30').toISOString(),
  },
  {
    id: 'lead-002',
    contactName: 'Amitabh Sengupta',
    phone: '+919830123456',
    email: 'amitabh.s@yahoo.com',
    city: 'Kolkata',
    stage: LeadStage.CONVERTED,
    assignedCsExecutive: 'Kavita Roy',
    createdAt: new Date('2026-08-25').toISOString(),
  },
];

describe('LeadPipelineView — Inline Stage Transitions & Handoff', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders lead pipeline table with contact details and stage dropdowns', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockLeadsData);

    render(
      <AdminProviders>
        <LeadPipelineView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Sunita Deshmukh')).toBeInTheDocument();
    });

    expect(screen.getByText('Amitabh Sengupta')).toBeInTheDocument();
    expect(screen.getByText('Pune')).toBeInTheDocument();
    expect(screen.getByText('Kolkata')).toBeInTheDocument();

    // Verify Sales Executive vs CS team ownership
    expect(screen.getByText('Rajesh Sharma')).toBeInTheDocument();
    expect(screen.getByText('Kavita Roy')).toBeInTheDocument();
  });

  it('transitions lead stage inline and calls stage update API', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockLeadsData);
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({ status: 'UPDATED' });

    render(
      <AdminProviders>
        <LeadPipelineView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Sunita Deshmukh')).toBeInTheDocument();
    });

    // Find the stage dropdown for lead-001
    const stageSelect = screen.getByLabelText(/Lead stage for lead-001/i);
    fireEvent.change(stageSelect, { target: { value: LeadStage.VISIT_SCHEDULED } });

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith(
        '/api/admin/v1/leads/lead-001/stage',
        expect.objectContaining({
          stage: LeadStage.VISIT_SCHEDULED,
        })
      );
    });
  });

  it('dispatches payment reminder on button click', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockLeadsData);
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ status: 'DISPATCHED' });

    render(
      <AdminProviders>
        <LeadPipelineView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Send Reminder')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Send Reminder'));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        '/api/admin/v1/leads/lead-001/remind',
        { channel: 'SMS_WHATSAPP' }
      );
    });
  });

  it('renders exact copywriting contract for empty leads queue', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue([]);

    render(
      <AdminProviders>
        <LeadPipelineView />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('No Active Leads')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'No new leads awaiting outreach or onboarding. New signups will automatically appear here.'
      )
    ).toBeInTheDocument();
  });
});
