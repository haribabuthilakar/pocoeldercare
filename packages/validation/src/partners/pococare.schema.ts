import { z } from 'zod';

export const pococareDispatchReqSchema = z.object({
  patientId: z.string().min(1),
  seniorName: z.string().min(1),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  address: z.string().min(1),
  iceContacts: z.array(
    z.object({
      name: z.string(),
      relationship: z.string(),
      phone: z.string()
    })
  ).default([]),
  medicalConditions: z.array(z.string()).default([])
});

export type PococareDispatchReqDto = z.infer<typeof pococareDispatchReqSchema>;

export const pococareDispatchResSchema = z.object({
  dispatchId: z.string(),
  status: z.enum([
    'AMBULANCE_DISPATCHED',
    'PARAMEDIC_ASSIGNED',
    'ARRIVED_AT_SCENE',
    'HOSPITAL_ADMITTED',
    'CANCELLED'
  ]),
  etaMinutes: z.number().int().nonnegative(),
  vehicleNumber: z.string(),
  paramedicName: z.string(),
  paramedicPhone: z.string()
});

export type PococareDispatchResDto = z.infer<typeof pococareDispatchResSchema>;

export const pococareMedicalProfileSyncSchema = z.object({
  patientId: z.string(),
  bloodGroup: z.string().optional(),
  chronicConditions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  preferredHospital: z.string().optional(),
  currentMedications: z.array(z.string()).default([])
});

export type PococareMedicalProfileSyncDto = z.infer<typeof pococareMedicalProfileSyncSchema>;

export const pococareAmbulanceWebhookSchema = z.object({
  dispatchId: z.string(),
  patientId: z.string(),
  stage: z.enum([
    'AMBULANCE_DISPATCHED',
    'PARAMEDIC_ASSIGNED',
    'ARRIVED_AT_SCENE',
    'HOSPITAL_ADMITTED'
  ]),
  etaMinutes: z.number().int().nonnegative(),
  currentLocation: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  hospitalAdmissionId: z.string().optional(),
  hospitalName: z.string().optional(),
  timestamp: z.coerce.date()
});

export type PococareAmbulanceWebhookDto = z.infer<typeof pococareAmbulanceWebhookSchema>;
