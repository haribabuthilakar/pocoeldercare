import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import {
  CareOfficerAssignmentModal,
  type OfficerCandidate,
} from '@/app/admin/care-officers/components/assignment-modal';
import { UserRole } from '@poco/constants';
import { apiClient } from '@/lib/api-client';

const mockHouseholdTarget = {
  id: 'hh-001',
  name: 'Rao Household',
  city: 'Bengaluru',
  assignedCareOfficerId: null,
};

const mockEligibleOfficer: OfficerCandidate = {
  id: 'co-eligible-01',
  name: 'Suresh Kumar',
  isAvailable: true,
  cluster: 'BLR-NORTH',
  certifications: [
    {
      certificationCode: 'BLS_CPR',
      expiresAt: new Date('2027-01-01'),
      status: 'ACTIVE',
    },
    {
      certificationCode: 'DEMENTIA_CORE',
      expiresAt: new Date('2027-01-01'),
      status: 'ACTIVE',
    },
  ],
};

const mockIneligibleOfficer: OfficerCandidate = {
  id: 'co-ineligible-02',
  name: 'Ramesh Reddy',
  isAvailable: true,
  cluster: 'BLR-NORTH',
  certifications: [
    {
      certificationCode: 'BLS_CPR',
      expiresAt: new Date('2024-01-01'), // EXPIRED
      status: 'EXPIRED',
    },
  ],
};

describe('CareOfficerAssignmentModal — Compliance Gating & Manager Override', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('allows immediate assignment for fully certified and eligible care officer', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ status: 'ASSIGNED' });

    render(
      <CareOfficerAssignmentModal
        open={true}
        onOpenChange={vi.fn()}
        household={mockHouseholdTarget}
        officers={[mockEligibleOfficer]}
        callerRoles={[UserRole.CARE_MANAGER]}
        requiredCerts={['BLS_CPR', 'DEMENTIA_CORE']}
      />
    );

    expect(screen.getByText('Officer Fully Certified & Eligible')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Assign Care Officer/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/api/admin/v1/care-officers/assign', {
        householdId: 'hh-001',
        careOfficerId: 'co-eligible-01',
        managerOverride: false,
        overrideReason: undefined,
        requiredCerts: ['BLS_CPR', 'DEMENTIA_CORE'],
      });
    });
  });

  it('blocks assignment for officer with expired/missing certifications when viewed by non-manager', () => {
    render(
      <CareOfficerAssignmentModal
        open={true}
        onOpenChange={vi.fn()}
        household={mockHouseholdTarget}
        officers={[mockIneligibleOfficer]}
        callerRoles={[UserRole.CARE_OFFICER]}
        requiredCerts={['BLS_CPR', 'DEMENTIA_CORE']}
      />
    );

    expect(screen.getByText('Officer Ineligible: Compliance Failure')).toBeInTheDocument();

    // Submit button is disabled
    const submitBtn = screen.getByRole('button', { name: /Assign Care Officer/i });
    expect(submitBtn).toBeDisabled();

    // Non-manager cannot see Manager Override checkbox
    expect(
      screen.queryByText(/Manager Override \(Exceptional Temporary Assignment\)/i)
    ).not.toBeInTheDocument();
  });

  it('allows CARE_MANAGER to apply Manager Override with mandatory reason for uncertified officer', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ status: 'ASSIGNED' });

    render(
      <CareOfficerAssignmentModal
        open={true}
        onOpenChange={vi.fn()}
        household={mockHouseholdTarget}
        officers={[mockIneligibleOfficer]}
        callerRoles={[UserRole.CARE_MANAGER]}
        requiredCerts={['BLS_CPR', 'DEMENTIA_CORE']}
      />
    );

    expect(screen.getByText('Officer Ineligible: Compliance Failure')).toBeInTheDocument();

    // Care Manager sees override checkbox
    const overrideCheckbox = screen.getByLabelText(
      /Manager Override \(Exceptional Temporary Assignment\)/i
    );
    expect(overrideCheckbox).toBeInTheDocument();

    // Check the box
    fireEvent.click(overrideCheckbox);

    // Textarea appears
    const reasonTextarea = screen.getByPlaceholderText(
      /Specify emergency reason or scheduled recertification date/i
    );
    expect(reasonTextarea).toBeInTheDocument();

    // Submit still disabled until reason entered
    const submitBtn = screen.getByRole('button', { name: /Assign Care Officer/i });
    expect(submitBtn).toBeDisabled();

    // Provide override rationale
    fireEvent.change(reasonTextarea, {
      target: {
        value: 'Temporary coverage approved while officer CPR renewal is scheduled for tomorrow.',
      },
    });

    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/api/admin/v1/care-officers/assign', {
        householdId: 'hh-001',
        careOfficerId: 'co-ineligible-02',
        managerOverride: true,
        overrideReason:
          'Temporary coverage approved while officer CPR renewal is scheduled for tomorrow.',
        requiredCerts: ['BLS_CPR', 'DEMENTIA_CORE'],
      });
    });
  });
});
