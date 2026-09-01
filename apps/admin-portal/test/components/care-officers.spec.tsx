import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import CareOfficersPage from '@/app/admin/care-officers/page';
import { AdminProviders } from '@/app/admin/providers';
import { apiClient } from '@/lib/api-client';
import { mockOpsManager } from '../fixtures/staff-session.fixture';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/care-officers',
}));

const mockOfficersData = [
  {
    id: 'co-001',
    name: 'Suresh Kumar',
    email: 'suresh.co@pocoeldercare.com',
    phone: '+919876543210',
    cluster: 'BLR-NORTH',
    isAvailable: true,
    activeCaseload: 2,
    assignedHousehold: {
      id: 'hh-001',
      name: 'Rao Household',
      address: '14/2 Indiranagar, Bengaluru',
    },
    supervisor: {
      id: 'usr-sup-01',
      name: 'Pooja Nair',
      role: 'CARE_MANAGER',
    },
    certifications: [
      {
        id: 'cert-01',
        certificationCode: 'BLS_CPR',
        status: 'ACTIVE' as const,
        expiresAt: new Date('2027-01-01').toISOString(),
        documentUrl: 'https://cdn.pocoeldercare.com/certs/cpr.jpg',
      },
      {
        id: 'cert-02',
        certificationCode: 'DEMENTIA_CORE',
        status: 'ACTIVE' as const,
        expiresAt: new Date('2027-06-01').toISOString(),
        documentUrl: 'https://cdn.pocoeldercare.com/certs/dementia.jpg',
      },
    ],
  },
  {
    id: 'co-002',
    name: 'Deepa Varma',
    email: 'deepa.co@pocoeldercare.com',
    phone: '+919876543211',
    cluster: 'BLR-SOUTH',
    isAvailable: false,
    activeCaseload: 4,
    assignedHousehold: null,
    supervisor: {
      id: 'usr-sup-01',
      name: 'Pooja Nair',
      role: 'CARE_MANAGER',
    },
    certifications: [
      {
        id: 'cert-03',
        certificationCode: 'BLS_CPR',
        status: 'EXPIRED' as const,
        expiresAt: new Date('2025-01-01').toISOString(),
        documentUrl: 'https://cdn.pocoeldercare.com/certs/cpr-expired.jpg',
      },
    ],
  },
];

describe('CareOfficersRosterView — Roster, Hierarchy & Media Lightbox', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders care officers roster table with caseload and certification badges', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockOfficersData);

    render(
      <AdminProviders initialUser={mockOpsManager}>
        <CareOfficersPage />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Suresh Kumar')).toBeInTheDocument();
    });

    expect(screen.getByText('Deepa Varma')).toBeInTheDocument();
    expect(screen.getByText('Rao Household')).toBeInTheDocument();
    expect(screen.getByText('Unassigned Household')).toBeInTheDocument();
    expect(screen.getByText('2 Active')).toBeInTheDocument();
    expect(screen.getByText('4 Active')).toBeInTheDocument();
  });

  it('toggles to supervisor reporting tree visualization', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockOfficersData);

    render(
      <AdminProviders initialUser={mockOpsManager}>
        <CareOfficersPage />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Suresh Kumar')).toBeInTheDocument();
    });

    // Click View Reporting Tree button
    const toggleBtn = screen.getByRole('button', { name: /View Reporting Tree/i });
    fireEvent.click(toggleBtn);

    expect(
      screen.getByText('Supervisor Reporting & Escalation Tree')
    ).toBeInTheDocument();
    expect(screen.getByText('2 Supervised')).toBeInTheDocument();
  });

  it('filters officers by search query and cluster dropdown', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue(mockOfficersData);

    render(
      <AdminProviders initialUser={mockOpsManager}>
        <CareOfficersPage />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Suresh Kumar')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search officer by name/i);
    fireEvent.change(searchInput, { target: { value: 'Deepa' } });

    expect(screen.queryByText('Suresh Kumar')).not.toBeInTheDocument();
    expect(screen.getByText('Deepa Varma')).toBeInTheDocument();
  });

  it('renders exact copywriting contract for empty officer results', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue([]);

    render(
      <AdminProviders initialUser={mockOpsManager}>
        <CareOfficersPage />
      </AdminProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('No Officers Found')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'No Care Officers match the active filter criteria. Adjust your search query or clear filters.'
      )
    ).toBeInTheDocument();
  });
});
