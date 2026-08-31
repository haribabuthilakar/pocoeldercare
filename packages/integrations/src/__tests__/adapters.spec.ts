import { describe, it, expect } from 'vitest';
import {
  PococareAdapter,
  RazorpayAdapter,
  AbhaAdapter,
  ExotelAdapter,
  WhatsAppAdapter,
  OneMgAdapter,
  OrangeLabsAdapter,
  HealthServicesAdapter,
  InstamartAdapter,
  SwiggyAdapter,
  UrbanCompanyAdapter,
  OlaAdapter,
  WearableIotAdapter
} from '../index';
import { FaultInjectorService } from '../core/fault-injector.service';
import { OutboundLoggerService } from '../core/outbound-logger.service';

describe('Integration Partner Adapters Suite (All 12 Partners + Wearable IoT)', () => {
  const faultInjector = new FaultInjectorService();
  const outboundLogger = new OutboundLoggerService();

  it('PococareAdapter: should execute ambulance dispatch', async () => {
    const adapter = new PococareAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/api/v1/dispatch', {
      householdId: 'hh-001',
      seniorId: '11111111-2222-3333-4444-555555555555',
      patientName: 'Gopal Krishna Sharma',
      callerPhone: '+919845012345',
      pickupLocation: {
        address: '42, 4th Main, Indiranagar, Bengaluru',
        latitude: 12.9716,
        longitude: 77.5946
      },
      destinationHospital: 'Apollo Hospital'
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect((res.data as any).dispatchId).toMatch(/^DISP-/);
      expect((res.data as any).status).toBe('AMBULANCE_DISPATCHED');
      expect((res.data as any).etaMinutes).toBeGreaterThan(0);
    }
  });

  it('RazorpayAdapter: should create payment order', async () => {
    const adapter = new RazorpayAdapter(faultInjector, outboundLogger);
    const orderRes = await adapter.execute('/v1/orders', {
      amount: 500000,
      currency: 'INR',
      receipt: 'rcpt_test_001',
      notes: { householdId: 'hh-001' }
    });

    expect(orderRes.success).toBe(true);
    if (orderRes.success) {
      expect((orderRes.data as any).id).toMatch(/^order_/);
      expect((orderRes.data as any).amount).toBe(500000);
      expect((orderRes.data as any).currency).toBe('INR');
      expect((orderRes.data as any).status).toBe('created');
    }
  });

  it('AbhaAdapter: should generate Aadhaar OTP session', async () => {
    const adapter = new AbhaAdapter(faultInjector, outboundLogger);
    const otpRes = await adapter.execute('/v1/registration/aadhaar/generateOtp', { aadhaarNumber: '123456789012' });
    expect(otpRes.success).toBe(true);
    if (otpRes.success) {
      expect((otpRes.data as any).txnId).toBeDefined();
    }
  });

  it('ExotelAdapter: should initiate click-to-call connection', async () => {
    const adapter = new ExotelAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/v1/Accounts/call', {
      from: '+919845012345',
      to: '+918069007626',
      callerId: '08069007626',
      timeLimit: 300
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect((res.data as any).callSid).toMatch(/^call_/);
      expect((res.data as any).status).toBe('in-progress');
    }
  });

  it('WhatsAppAdapter: should validate template and return message ID', async () => {
    const adapter = new WhatsAppAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/v1/messages', {
      to: '+919876543210',
      templateName: 'elder_care_visit_summary',
      languageCode: 'en_IN',
      parameters: ['Gopal Sharma', 'Routine Vitals Checkup', 'Normal BP']
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect((res.data as any).messagingProduct).toBe('whatsapp');
      expect((res.data as any).messages[0].id).toMatch(/^wamid\./);
    }
  });

  it('OneMgAdapter: should place prescription fulfillment order', async () => {
    const adapter = new OneMgAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/v1/orders', {
      patientId: '11111111-2222-3333-4444-555555555555',
      prescriptionId: 'rx-001',
      deliveryAddress: {
        addressLine1: '42, 4th Main, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038'
      },
      items: [{ medicineName: 'Metformin 500mg', quantity: 60, unitPricePaise: 1400 }]
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect((res.data as any).orderId).toMatch(/^1MG-ORD-/);
      expect((res.data as any).status).toBe('ORDER_PLACED');
    }
  });

  it('OrangeLabsAdapter: should book home diagnostic phlebotomy slot', async () => {
    const adapter = new OrangeLabsAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/api/v1/bookings', {
      householdId: 'hh-001',
      seniorId: '11111111-2222-3333-4444-555555555555',
      patientName: 'Gopal Krishna Sharma',
      patientAge: 78,
      patientGender: 'M',
      testCodes: ['LIPID_PROFILE', 'HBA1C'],
      appointmentSlot: new Date(Date.now() + 86400000),
      address: '42, 4th Main, Indiranagar, Bengaluru'
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect((res.data as any).bookingId).toMatch(/^OL-BKG-/);
      expect((res.data as any).status).toBe('CONFIRMED');
    }
  });

  it('HealthServicesAdapter: should book nursing attendant shift', async () => {
    const adapter = new HealthServicesAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/v1/bookings', {
      patientId: '11111111-2222-3333-4444-555555555555',
      serviceType: 'NURSING_ATTENDANT',
      shiftType: 'DAY_12H',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      address: {
        addressLine1: '42, 4th Main, Indiranagar',
        city: 'Bengaluru',
        postalCode: '560038'
      }
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect((res.data as any).bookingId).toMatch(/^HS-TC-/);
      expect((res.data as any).status).toBe('CONFIRMED');
    }
  });

  it('InstamartAdapter: should place 15-min quick commerce delivery order', async () => {
    const adapter = new InstamartAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/v1/orders', {
      householdId: 'hh-001',
      items: [{ itemName: 'Sugar Free Tablets', quantity: 1, pricePaise: 25000 }],
      deliveryAddress: {
        addressLine1: '42, 4th Main, Indiranagar',
        latitude: 12.9716,
        longitude: 77.5946
      }
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect((res.data as any).orderId).toMatch(/^INSTA-/);
      expect((res.data as any).status).toBe('ORDER_PLACED');
    }
  });

  it('SwiggyAdapter: should place diabetic/low-sodium meal order', async () => {
    const adapter = new SwiggyAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/v1/orders', {
      householdId: 'hh-001',
      seniorId: '11111111-2222-3333-4444-555555555555',
      items: [
        {
          itemId: 'item-1',
          name: 'Millet Khichdi & Steamed Veggies',
          quantity: 1,
          dietaryTags: ['LOW_SODIUM', 'DIABETIC_FRIENDLY'],
          unitPricePaise: 42000
        }
      ],
      deliveryAddress: '42, 4th Main, Indiranagar, Bengaluru',
      coordinates: { lat: 12.9716, lng: 77.5946 }
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect((res.data as any).orderId).toMatch(/^SWIG-/);
      expect((res.data as any).status).toBe('ORDER_ACCEPTED');
    }
  });

  it('UrbanCompanyAdapter: should book home safety grab bar installation', async () => {
    const adapter = new UrbanCompanyAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/v1/jobs', {
      householdId: 'hh-001',
      serviceType: 'BATHROOM_GRAB_BAR_INSTALL',
      address: {
        addressLine1: '42, 4th Main, Indiranagar',
        city: 'Bengaluru'
      }
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect((res.data as any).jobId).toMatch(/^UC-JOB-/);
      expect((res.data as any).status).toBe('PROFESSIONAL_ASSIGNED');
    }
  });

  it('OlaAdapter: should book senior hospital ride transit', async () => {
    const adapter = new OlaAdapter(faultInjector, outboundLogger);
    const res = await adapter.execute('/v1/bookings', {
      passengerName: 'Gopal Krishna Sharma',
      passengerPhone: '+919845012345',
      pickupLocation: {
        address: '42, 4th Main, Indiranagar',
        latitude: 12.9716,
        longitude: 77.5946
      },
      dropoffLocation: {
        address: 'Apollo Hospital Indiranagar',
        latitude: 12.9780,
        longitude: 77.6400
      },
      category: 'PRIME_SEDAN'
    });

    expect(res.success).toBe(true);
    if (res.success) {
      expect((res.data as any).bookingId).toMatch(/^CRN-/);
      expect((res.data as any).status).toBe('CAB_DISPATCHED');
    }
  });

  it('WearableIotAdapter: should ingest telemetry ping and process fall detection alert', async () => {
    const adapter = new WearableIotAdapter(faultInjector, outboundLogger);
    const pingRes = await adapter.execute('/v1/telemetry', {
      deviceId: 'WR-SENIOR-1092',
      seniorId: '11111111-2222-3333-4444-555555555555',
      timestamp: new Date(),
      batteryPercentage: 88,
      stepCountToday: 4120,
      restingHeartRate: 74,
      spo2: 98
    });

    expect(pingRes.success).toBe(true);
    if (pingRes.success) {
      expect((pingRes.data as any).acknowledged).toBe(true);
    }

    const fallRes = await adapter.execute('/api/webhooks/v1/wearable/fall-alert', {
      deviceId: 'WR-SENIOR-1092',
      seniorId: '11111111-2222-3333-4444-555555555555',
      alertType: 'FALL_DETECTED',
      timestamp: new Date(),
      metrics: {
        impactGForce: 3.8,
        heartRateBpm: 125,
        spo2: 95
      }
    });

    expect(fallRes.success).toBe(true);
    if (fallRes.success) {
      expect((fallRes.data as any).acknowledged).toBe(true);
      expect((fallRes.data as any).eventType).toBe('FALL_ALERT');
    }
  });
});
