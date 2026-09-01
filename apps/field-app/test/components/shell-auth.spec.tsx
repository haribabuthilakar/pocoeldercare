import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/context/auth-context';
import { LoginScreen } from '../../src/app/login';
import { PinLockScreen } from '../../src/app/pin-lock';
import { DrawerMenu } from '../../src/components/navigation/drawer-menu';
import { AppLayout } from '../../src/app/_layout';
import { mockFieldSession } from '../fixtures/field-session.fixture';

describe('Field App Shell & Authentication Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('LoginScreen Component', () => {
    it('renders login form with work email and password fields', () => {
      render(
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>,
      );

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('login-email-input')).toHaveValue('care.officer.1@poco.care');
      expect(screen.getByTestId('login-password-input')).toHaveValue('PocoCare123!');
      expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    });

    it('displays error when submitting with empty credentials', async () => {
      render(
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>,
      );

      const emailInput = screen.getByTestId('login-email-input');
      const passwordInput = screen.getByTestId('login-password-input');

      fireEvent.change(emailInput, { target: { value: '' } });
      fireEvent.change(passwordInput, { target: { value: '' } });
      fireEvent.submit(screen.getByTestId('login-form'));

      await waitFor(() => {
        expect(screen.getByTestId('login-error-alert')).toHaveTextContent(
          'Please provide work email and password',
        );
      });
    });

    it('populates demo credentials via quick preset button', () => {
      render(
        <AuthProvider>
          <LoginScreen />
        </AuthProvider>,
      );

      const emailInput = screen.getByTestId('login-email-input');
      fireEvent.change(emailInput, { target: { value: 'custom@poco.care' } });
      expect(emailInput).toHaveValue('custom@poco.care');

      const demoBtn = screen.getByTestId('quick-demo-fill');
      fireEvent.click(demoBtn);

      expect(screen.getByTestId('login-email-input')).toHaveValue('care.officer.1@poco.care');
    });

    it('calls onLoginSuccess callback upon successful authentication', async () => {
      const onSuccess = vi.fn();
      render(
        <AuthProvider>
          <LoginScreen onLoginSuccess={onSuccess} />
        </AuthProvider>,
      );

      fireEvent.click(screen.getByTestId('login-submit-button'));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('PinLockScreen Component', () => {
    it('renders numeric keypad and 4 indicator dots', () => {
      localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));
      localStorage.setItem('poco_field_pin', '1234');
      localStorage.setItem('poco_field_locked', 'true');

      render(
        <AuthProvider>
          <PinLockScreen />
        </AuthProvider>,
      );

      expect(screen.getByTestId('pin-keypad')).toBeInTheDocument();
      expect(screen.getByTestId('pin-dots')).toBeInTheDocument();
      expect(screen.getByTestId('pin-dot-0-empty')).toBeInTheDocument();
      expect(screen.getByTestId('pin-title')).toHaveTextContent('Unlock Session');
    });

    it('fills indicator dots as digits are tapped and unlocks upon correct PIN entry', async () => {
      localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));
      localStorage.setItem('poco_field_pin', '1234');
      localStorage.setItem('poco_field_locked', 'true');

      const onUnlocked = vi.fn();
      render(
        <AuthProvider>
          <PinLockScreen onUnlocked={onUnlocked} />
        </AuthProvider>,
      );

      fireEvent.click(screen.getByTestId('pin-key-1'));
      expect(screen.getByTestId('pin-dot-0-filled')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('pin-key-2'));
      expect(screen.getByTestId('pin-dot-1-filled')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('pin-key-3'));
      expect(screen.getByTestId('pin-dot-2-filled')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('pin-key-4'));

      await waitFor(() => {
        expect(onUnlocked).toHaveBeenCalled();
      });
    });

    it('shows error text and resets dots when wrong PIN is entered', async () => {
      localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));
      localStorage.setItem('poco_field_pin', '1234');
      localStorage.setItem('poco_field_locked', 'true');

      render(
        <AuthProvider>
          <PinLockScreen />
        </AuthProvider>,
      );

      fireEvent.click(screen.getByTestId('pin-key-9'));
      fireEvent.click(screen.getByTestId('pin-key-9'));
      fireEvent.click(screen.getByTestId('pin-key-9'));
      fireEvent.click(screen.getByTestId('pin-key-9'));

      await waitFor(() => {
        expect(screen.getByTestId('pin-error-text')).toHaveTextContent(
          'Incorrect PIN. Please try again',
        );
      });
    });

    it('handles backspace and clear buttons correctly', () => {
      localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));
      localStorage.setItem('poco_field_pin', '1234');

      render(
        <AuthProvider>
          <PinLockScreen />
        </AuthProvider>,
      );

      fireEvent.click(screen.getByTestId('pin-key-5'));
      fireEvent.click(screen.getByTestId('pin-key-6'));
      expect(screen.getByTestId('pin-dot-1-filled')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('pin-key-backspace'));
      expect(screen.getByTestId('pin-dot-1-empty')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('pin-key-clear'));
      expect(screen.getByTestId('pin-dot-0-empty')).toBeInTheDocument();
    });
  });

  describe('DrawerMenu Navigation', () => {
    it('toggles drawer panel open and closed', () => {
      localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));

      render(
        <AuthProvider>
          <DrawerMenu activeRoute="visits" />
        </AuthProvider>,
      );

      const drawerPanel = screen.getByTestId('drawer-panel');
      expect(drawerPanel).toHaveClass('-translate-x-full');

      const menuBtn = screen.getByTestId('drawer-menu-button');
      fireEvent.click(menuBtn);
      expect(drawerPanel).toHaveClass('translate-x-0');

      const closeBtn = screen.getByTestId('drawer-close-button');
      fireEvent.click(closeBtn);
      expect(drawerPanel).toHaveClass('-translate-x-full');
    });

    it('displays officer profile details in drawer header', () => {
      localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));

      render(
        <AuthProvider>
          <DrawerMenu activeRoute="visits" />
        </AuthProvider>,
      );

      fireEvent.click(screen.getByTestId('drawer-menu-button'));
      expect(screen.getByTestId('drawer-officer-name')).toHaveTextContent('Rajesh Kumar');
      expect(screen.getAllByText('Indiranagar Cluster').length).toBeGreaterThan(0);
    });

    it('triggers route navigation when tapping drawer links', () => {
      localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));
      const onRouteChange = vi.fn();

      render(
        <AuthProvider>
          <DrawerMenu activeRoute="visits" onRouteChange={onRouteChange} />
        </AuthProvider>,
      );

      fireEvent.click(screen.getByTestId('drawer-menu-button'));
      fireEvent.click(screen.getByTestId('nav-item-feed'));

      expect(onRouteChange).toHaveBeenCalledWith('feed');
    });
  });

  describe('AppLayout Root Flow', () => {
    it('renders LoginScreen if unauthenticated', async () => {
      render(
        <AppLayout>
          <div>Protected Content</div>
        </AppLayout>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      });
    });

    it('renders PinLockScreen if authenticated but PIN locked', async () => {
      localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));
      localStorage.setItem('poco_field_pin', '1234');
      localStorage.setItem('poco_field_locked', 'true');

      render(
        <AppLayout>
          <div>Protected Content</div>
        </AppLayout>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('pin-keypad')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      });
    });

    it('renders children and drawer header if authenticated and unlocked', async () => {
      localStorage.setItem('poco_field_session', JSON.stringify(mockFieldSession));
      localStorage.setItem('poco_field_pin', '1234');
      localStorage.setItem('poco_field_locked', 'false');

      render(
        <AppLayout>
          <div data-testid="test-child-content">Active Field Content</div>
        </AppLayout>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('test-child-content')).toBeInTheDocument();
        expect(screen.getByTestId('drawer-menu-button')).toBeInTheDocument();
      });
    });
  });
});
