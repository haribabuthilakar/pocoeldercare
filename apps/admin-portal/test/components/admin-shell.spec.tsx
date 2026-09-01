import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { AdminShellView } from '@/app/admin/layout';
import { AdminProviders } from '@/app/admin/providers';
import {
  mockSuperAdmin,
  mockOpsManager,
  mockCareManager,
  mockSalesLead,
  mockMultiRoleStaff,
} from '../fixtures/staff-session.fixture';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/triage',
}));

describe('AdminShellView — Omni-Role Navigation Layout', () => {
  it('renders only operations navigation links for an OPS_MANAGER', () => {
    render(
      <AdminProviders initialUser={mockOpsManager}>
        <AdminShellView>
          <div>Ops Content</div>
        </AdminShellView>
      </AdminProviders>
    );

    // Operations queues and management are present
    expect(screen.getByText('Pending Triage')).toBeInTheDocument();
    expect(screen.getByText('Rollup Exceptions')).toBeInTheDocument();
    expect(screen.getByText('SLA At Risk')).toBeInTheDocument();
    expect(screen.getByText('Service Catalog')).toBeInTheDocument();
    expect(screen.getByText('Billing & Overdrafts')).toBeInTheDocument();

    // Care Manager and Super Admin exclusive links should NOT be present
    expect(screen.queryByText('Care Officers Roster')).not.toBeInTheDocument();
    expect(screen.queryByText('Database Explorer')).not.toBeInTheDocument();

    // Active role badge rendered in header
    expect(screen.getByText('OPS MANAGER')).toBeInTheDocument();
  });

  it('renders only care management links for a CARE_MANAGER', () => {
    render(
      <AdminProviders initialUser={mockCareManager}>
        <AdminShellView>
          <div>Care Content</div>
        </AdminShellView>
      </AdminProviders>
    );

    expect(screen.getByText('Care Officers Roster')).toBeInTheDocument();

    expect(screen.queryByText('Pending Triage')).not.toBeInTheDocument();
    expect(screen.queryByText('Rollup Exceptions')).not.toBeInTheDocument();
    expect(screen.queryByText('Billing & Overdrafts')).not.toBeInTheDocument();
    expect(screen.queryByText('Database Explorer')).not.toBeInTheDocument();

    expect(screen.getByText('CARE MANAGER')).toBeInTheDocument();
  });

  it('renders only lead pipeline links for a SALES_LEAD', () => {
    render(
      <AdminProviders initialUser={mockSalesLead}>
        <AdminShellView>
          <div>Sales Content</div>
        </AdminShellView>
      </AdminProviders>
    );

    expect(screen.getByText('Lead Pipeline')).toBeInTheDocument();
    expect(screen.queryByText('Pending Triage')).not.toBeInTheDocument();
    expect(screen.queryByText('Care Officers Roster')).not.toBeInTheDocument();
    expect(screen.queryByText('Database Explorer')).not.toBeInTheDocument();

    expect(screen.getByText('SALES LEAD')).toBeInTheDocument();
  });

  it('renders full merged union of navigation without duplicates for multi-role staff', () => {
    render(
      <AdminProviders initialUser={mockMultiRoleStaff}>
        <AdminShellView>
          <div>Multi Role Content</div>
        </AdminShellView>
      </AdminProviders>
    );

    // Multi-role user has OPS_MANAGER, CARE_MANAGER, SALES_LEAD
    expect(screen.getByText('Pending Triage')).toBeInTheDocument();
    expect(screen.getByText('Rollup Exceptions')).toBeInTheDocument();
    expect(screen.getByText('Care Officers Roster')).toBeInTheDocument();
    expect(screen.getByText('Lead Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Billing & Overdrafts')).toBeInTheDocument();

    // Super Admin exclusive link is still hidden
    expect(screen.queryByText('Database Explorer')).not.toBeInTheDocument();

    // Merged role badges in header
    expect(screen.getByText('OPS MANAGER')).toBeInTheDocument();
    expect(screen.getByText('CARE MANAGER')).toBeInTheDocument();
    expect(screen.getByText('SALES LEAD')).toBeInTheDocument();
  });

  it('renders all navigation items for SUPER_ADMIN', () => {
    render(
      <AdminProviders initialUser={mockSuperAdmin}>
        <AdminShellView>
          <div>Admin Content</div>
        </AdminShellView>
      </AdminProviders>
    );

    expect(screen.getByText('Pending Triage')).toBeInTheDocument();
    expect(screen.getByText('Rollup Exceptions')).toBeInTheDocument();
    expect(screen.getByText('SLA At Risk')).toBeInTheDocument();
    expect(screen.getByText('Care Officers Roster')).toBeInTheDocument();
    expect(screen.getByText('Service Catalog')).toBeInTheDocument();
    expect(screen.getByText('Lead Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Billing & Overdrafts')).toBeInTheDocument();
    expect(screen.getByText('Database Explorer')).toBeInTheDocument();
    expect(screen.getByText('Partner Integrations')).toBeInTheDocument();

    expect(screen.getByText('SUPER ADMIN')).toBeInTheDocument();
  });
});
