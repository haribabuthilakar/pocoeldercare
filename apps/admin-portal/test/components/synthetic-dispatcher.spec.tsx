import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { SyntheticPayloadDispatcher } from '@/app/admin/integrations/components/synthetic-payload-dispatcher';
import { apiClient } from '@/lib/api-client';

describe('SyntheticPayloadDispatcher — Test Scenarios & Webhook Triggers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders synthetic scenario presets with default wearable fall payload', () => {
    render(<SyntheticPayloadDispatcher />);

    expect(screen.getByText('Trigger Wearable Fall Alert (SOS)')).toBeInTheDocument();
    expect(screen.getByText('Trigger Out-of-Quota Emergency Service')).toBeInTheDocument();
    expect(screen.getByText('Trigger Expired BLS Certification')).toBeInTheDocument();
    expect(screen.getByText('/api/webhooks/v1/wearable')).toBeInTheDocument();
  });

  it('switches scenarios and populates corresponding JSON test payload', () => {
    render(<SyntheticPayloadDispatcher />);

    // Click Out-of-Quota Emergency Service scenario
    fireEvent.click(screen.getByText('Trigger Out-of-Quota Emergency Service'));

    expect(screen.getByText('/api/webhooks/v1/emergency')).toBeInTheDocument();
    const textarea = screen.getByLabelText(/JSON Test Payload/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('EMERGENCY_SOS_RESPONSE');
  });

  it('dispatches test payload and renders live HTTP response preview', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      ticketId: 'tkt-synth-001',
      status: 'PENDING_TRIAGE',
      emergency: true,
    });

    render(<SyntheticPayloadDispatcher />);

    const dispatchBtn = screen.getByRole('button', { name: /Dispatch Test Payload/i });
    fireEvent.click(dispatchBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        '/api/webhooks/v1/wearable',
        expect.objectContaining({
          deviceId: 'WB-DEV-9941',
          eventType: 'FALL_DETECTED',
        })
      );
    });

    expect(screen.getByText(/HTTP 200 OK/i)).toBeInTheDocument();
    expect(screen.getByText(/tkt-synth-001/i)).toBeInTheDocument();
  });
});
