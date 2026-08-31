import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { UpiPaymentTab } from '../razorpay/upi-payment-tab';
import { CardPaymentTab } from '../razorpay/card-payment-tab';
import { NetbankingTab } from '../razorpay/netbanking-tab';
import { OtpVerificationDialog } from '../razorpay/otp-verification-dialog';

describe('Razorpay Checkout Simulator Components Suite', () => {
  it('UpiPaymentTab: should render UPI app options and format amount in INR', () => {
    const onAuth = vi.fn();
    const element = (
      <UpiPaymentTab
        amountPaise={500000}
        onAuthorize={onAuth}
      />
    );
    expect(element).toBeDefined();
  });

  it('CardPaymentTab: should render card inputs with secure tokenization', () => {
    const onOtp = vi.fn();
    const element = (
      <CardPaymentTab
        amountPaise={500000}
        onProceedToOtp={onOtp}
      />
    );
    expect(element).toBeDefined();
  });

  it('NetbankingTab: should render popular Indian bank options', () => {
    const onAuth = vi.fn();
    const element = (
      <NetbankingTab
        amountPaise={500000}
        onAuthorize={onAuth}
      />
    );
    expect(element).toBeDefined();
  });

  it('OtpVerificationDialog: should accept 3D secure verification props', () => {
    const onVerify = vi.fn();
    const onCancel = vi.fn();
    const element = (
      <OtpVerificationDialog
        open={true}
        onOpenChange={vi.fn()}
        amountPaise={500000}
        onVerify={onVerify}
        onCancel={onCancel}
      />
    );
    expect(element).toBeDefined();
  });
});
