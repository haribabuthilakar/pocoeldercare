import type {
  PococareDispatchReqDto,
  PococareDispatchResDto,
  PococareAmbulanceWebhookDto
} from './pococare.schema';
import type {
  RazorpayCreateOrderReqDto,
  RazorpayOrderResDto,
  RazorpayRefundReqDto,
  RazorpayRefundResDto,
  RazorpayWebhookPayloadDto
} from './razorpay.schema';
import type {
  AbhaGenerateOtpResDto,
  AbhaProfileResDto,
  AbhaConsentStatusDto,
  AbhaFhirRecordDto
} from './abha.schema';
import type {
  ExotelConnectCallReqDto,
  ExotelCallResDto,
  ExotelPassthruCallbackDto
} from './exotel.schema';
import type {
  WhatsappSendTemplateReqDto,
  WhatsappMessageResDto,
  WhatsappStatusWebhookDto
} from './whatsapp.schema';
import type {
  OneMgOrderCreateReqDto,
  OneMgOrderResDto,
  OneMgDeliveryWebhookDto
} from './one-mg.schema';
import type {
  OrangeLabsPhlebotomyReqDto,
  OrangeLabsBookingResDto,
  OrangeLabsReportWebhookDto
} from './orange-labs.schema';
import type {
  HealthServicesAttendantReqDto,
  HealthServicesBookingResDto,
  HealthServicesShiftWebhookDto
} from './health-services.schema';
import type {
  InstamartOrderReqDto,
  InstamartOrderResDto,
  InstamartTrackingWebhookDto
} from './instamart.schema';
import type {
  SwiggyMealOrderReqDto,
  SwiggyOrderResDto,
  SwiggyDeliveryWebhookDto
} from './swiggy.schema';
import type {
  UrbanCompanyJobReqDto,
  UrbanCompanyJobResDto,
  UrbanCompanyJobStatusWebhookDto
} from './urban-company.schema';
import type {
  OlaRideBookingReqDto,
  OlaRideResDto,
  OlaRideStatusWebhookDto
} from './ola.schema';
import type {
  WearableTelemetryPingDto,
  WearableAlertWebhookDto
} from './wearable-iot.schema';

export function createMockPococareDispatch(overrides?: Partial<PococareDispatchResDto>): PococareDispatchResDto {
  return {
    dispatchId: `DISP-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'AMBULANCE_DISPATCHED',
    etaMinutes: 12,
    vehicleNumber: 'KA-01-EA-9911',
    paramedicName: 'Ramesh Kumar',
    paramedicPhone: '+919876543210',
    ...overrides
  };
}

export function createMockPococareWebhook(overrides?: Partial<PococareAmbulanceWebhookDto>): PococareAmbulanceWebhookDto {
  return {
    dispatchId: 'DISP-882190',
    patientId: 'patient-senior-001',
    stage: 'AMBULANCE_DISPATCHED',
    etaMinutes: 12,
    currentLocation: { lat: 12.9716, lng: 77.5946 },
    hospitalAdmissionId: 'ADM-88219',
    hospitalName: 'Apollo Hospital Indiranagar',
    timestamp: new Date(),
    ...overrides
  };
}

export function createMockRazorpayOrder(overrides?: Partial<RazorpayOrderResDto>): RazorpayOrderResDto {
  const amount = overrides?.amount ?? 500000;
  return {
    id: `order_${Math.random().toString(36).substring(2, 16)}`,
    entity: 'order',
    amount,
    amount_paid: 0,
    amount_due: amount,
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    status: 'created',
    attempts: 0,
    created_at: Math.floor(Date.now() / 1000),
    ...overrides
  };
}

export function createMockRazorpayWebhook(overrides?: Partial<RazorpayWebhookPayloadDto>): RazorpayWebhookPayloadDto {
  const paymentId = `pay_${Math.random().toString(36).substring(2, 16)}`;
  const orderId = `order_${Math.random().toString(36).substring(2, 16)}`;
  return {
    entity: 'event',
    account_id: 'acc_PocoEldercare01',
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: paymentId,
          entity: 'payment',
          amount: 500000,
          currency: 'INR',
          status: 'captured',
          order_id: orderId,
          method: 'upi',
          email: 'family@pocoeldercare.in',
          contact: '+919876543210',
          created_at: Math.floor(Date.now() / 1000)
        }
      },
      order: {
        entity: {
          id: orderId,
          entity: 'order',
          amount: 500000,
          status: 'paid'
        }
      }
    },
    created_at: Math.floor(Date.now() / 1000),
    ...overrides
  };
}

export function createMockAbhaProfile(overrides?: Partial<AbhaProfileResDto>): AbhaProfileResDto {
  return {
    abhaNumber: '91-4821-9921-0012',
    abhaAddress: 'senior.sharma@abdm',
    name: 'Gopal Krishna Sharma',
    gender: 'M',
    dateOfBirth: '1948-05-15',
    mobile: '+919845012345',
    address: '42, 4th Main, Indiranagar',
    stateName: 'Karnataka',
    districtName: 'Bengaluru Urban',
    jwtToken: 'mock-jwt-token-abdm-session-xyz',
    ...overrides
  };
}

export function createMockAbhaFhirRecord(overrides?: Partial<AbhaFhirRecordDto>): AbhaFhirRecordDto {
  return {
    resourceType: 'Bundle',
    id: 'bundle-fhir-mock-001',
    type: 'collection',
    entry: [
      {
        fullUrl: 'urn:uuid:diagnostic-report-001',
        resource: {
          resourceType: 'DiagnosticReport',
          id: 'dr-lipid-001',
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '24331-1',
                display: 'Lipid Panel'
              }
            ]
          },
          subject: {
            reference: 'Patient/91-4821-9921-0012',
            display: 'Gopal Krishna Sharma'
          },
          effectiveDateTime: '2026-08-30T08:00:00Z',
          issued: '2026-08-30T14:30:00Z',
          conclusion: 'Mild hyperlipidemia observed. Continue statin therapy.',
          results: [
            {
              testName: 'Total Cholesterol',
              value: 215,
              unit: 'mg/dL',
              referenceRange: '< 200 mg/dL',
              interpretation: 'HIGH'
            },
            {
              testName: 'Triglycerides',
              value: 160,
              unit: 'mg/dL',
              referenceRange: '< 150 mg/dL',
              interpretation: 'HIGH'
            },
            {
              testName: 'HDL Cholesterol',
              value: 48,
              unit: 'mg/dL',
              referenceRange: '> 40 mg/dL',
              interpretation: 'NORMAL'
            },
            {
              testName: 'LDL Cholesterol',
              value: 135,
              unit: 'mg/dL',
              referenceRange: '< 100 mg/dL',
              interpretation: 'HIGH'
            }
          ]
        }
      },
      {
        fullUrl: 'urn:uuid:medication-request-001',
        resource: {
          resourceType: 'MedicationRequest',
          id: 'med-rx-001',
          status: 'active',
          intent: 'order',
          medicationCodeableConcept: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '316866002',
                display: 'Metformin hydrochloride 500mg tablet'
              }
            ],
            text: 'Metformin 500mg'
          },
          subject: {
            reference: 'Patient/91-4821-9921-0012',
            display: 'Gopal Krishna Sharma'
          },
          authoredOn: '2026-08-15',
          requester: {
            agentName: 'Dr. Priya Srinivasan, MD',
            registrationNumber: 'KMC-48291'
          },
          dosageInstruction: [
            {
              text: '1 tablet twice daily after meals',
              timing: 'BID',
              route: 'Oral'
            }
          ]
        }
      }
    ],
    ...overrides
  };
}

export function createMockExotelCall(overrides?: Partial<ExotelCallResDto>): ExotelCallResDto {
  return {
    callSid: `call_${Math.random().toString(36).substring(2, 12)}`,
    status: 'in-progress',
    from: '+919845012345',
    to: '+918069007626',
    dateCreated: new Date().toISOString(),
    ...overrides
  };
}

export function createMockExotelPassthruCallback(overrides?: Partial<ExotelPassthruCallbackDto>): ExotelPassthruCallbackDto {
  return {
    CallSid: `call_${Math.random().toString(36).substring(2, 12)}`,
    From: '+919845012345',
    To: '08069007626',
    Digits: '1',
    Direction: 'inbound',
    Status: 'completed',
    CallDuration: 180,
    DialCallDuration: 175,
    RecordingUrl: 'https://media.exotel.com/recordings/mock-call-123.mp3',
    ...overrides
  };
}

export function createMockWhatsappMessage(overrides?: Partial<WhatsappMessageResDto>): WhatsappMessageResDto {
  return {
    messagingProduct: 'whatsapp',
    contacts: [{ input: '+919876543210', waId: '919876543210' }],
    messages: [{ id: `wamid.HBgL${Math.random().toString(36).substring(2, 14)}` }],
    ...overrides
  };
}

export function createMockOneMgOrder(overrides?: Partial<OneMgOrderResDto>): OneMgOrderResDto {
  return {
    orderId: `1MG-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'ORDER_PLACED',
    totalAmountPaise: 84000,
    estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
    trackingUrl: 'https://1mg.com/track/1MG-ORD-84920',
    ...overrides
  };
}

export function createMockOrangeLabsBooking(overrides?: Partial<OrangeLabsBookingResDto>): OrangeLabsBookingResDto {
  return {
    bookingId: `OL-BKG-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'CONFIRMED',
    appointmentSlot: new Date(Date.now() + 86400000).toISOString(),
    phlebotomistName: 'Anil Deshmukh',
    phlebotomistPhone: '+919811223344',
    totalCostPaise: 125000,
    ...overrides
  };
}

export function createMockHealthServicesBooking(overrides?: Partial<HealthServicesBookingResDto>): HealthServicesBookingResDto {
  return {
    bookingId: `HS-TC-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'CONFIRMED',
    providerName: 'Dr. Priya Srinivasan, MD',
    providerPhone: '+919822334455',
    providerQualification: 'Consultant Geriatrician',
    meetingUrl: 'https://telehealth.pococare.in/room/9912',
    chargePaise: 80000,
    ...overrides
  };
}

export function createMockInstamartOrder(overrides?: Partial<InstamartOrderResDto>): InstamartOrderResDto {
  return {
    orderId: `INSTA-${Math.floor(10000 + Math.random() * 90000)}`,
    status: 'ORDER_PLACED',
    etaMinutes: 18,
    deliveryPartnerName: 'Santosh',
    deliveryPartnerPhone: '+919744112233',
    totalPaise: 34500,
    ...overrides
  };
}

export function createMockSwiggyOrder(overrides?: Partial<SwiggyOrderResDto>): SwiggyOrderResDto {
  return {
    orderId: `SWIG-${Math.floor(10000 + Math.random() * 90000)}`,
    status: 'ORDER_ACCEPTED',
    etaMinutes: 28,
    totalPaise: 42000,
    restaurantName: 'Poco Healthy Diet Kitchen',
    ...overrides
  };
}

export function createMockUrbanCompanyJob(overrides?: Partial<UrbanCompanyJobResDto>): UrbanCompanyJobResDto {
  return {
    jobId: `UC-JOB-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'PROFESSIONAL_ASSIGNED',
    professionalName: 'Kavitha R',
    professionalPhone: '+919633221100',
    rating: 4.9,
    totalChargePaise: 65000,
    ...overrides
  };
}

export function createMockOlaRide(overrides?: Partial<OlaRideResDto>): OlaRideResDto {
  return {
    bookingId: `CRN-${Math.floor(1000000 + Math.random() * 9000000)}`,
    status: 'CAB_DISPATCHED',
    driverName: 'Murugan',
    driverPhone: '+919500112233',
    vehicleNumber: 'KA-04-E-1234',
    vehicleModel: 'Maruti Suzuki Dzire',
    otp: '4891',
    etaMinutes: 4,
    estimatedFarePaise: 38000,
    ...overrides
  };
}

export function createMockWearablePing(seniorId: string, overrides?: Partial<WearableTelemetryPingDto>): WearableTelemetryPingDto {
  return {
    deviceId: 'WR-SENIOR-1092',
    seniorId,
    timestamp: new Date(),
    batteryPercentage: 82,
    stepCountToday: 3420,
    restingHeartRate: 72,
    spo2: 98,
    firmwareVersion: 'v2.4.1',
    ...overrides
  };
}

export function createMockWearableAlert(seniorId: string, overrides?: Partial<WearableAlertWebhookDto>): WearableAlertWebhookDto {
  return {
    deviceId: 'WR-SENIOR-1092',
    seniorId,
    alertType: 'FALL_DETECTED',
    timestamp: new Date(),
    metrics: {
      impactGForce: 3.8,
      heartRateBpm: 128,
      spo2: 94,
      motionDetectedAfterSeconds: 0
    },
    location: {
      lat: 12.9716,
      lng: 77.5946,
      accuracyMeters: 5
    },
    batteryPercentage: 78,
    ...overrides
  };
}
