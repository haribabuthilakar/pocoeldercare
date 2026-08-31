import { z } from 'zod';

export const olaRideBookingReqSchema = z.object({
  householdId: z.string().min(1),
  seniorId: z.string().min(1),
  serviceRequestId: z.string().optional(),
  pickupAddress: z.string().min(1),
  pickupCoordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  dropAddress: z.string().min(1),
  dropCoordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  cabCategory: z.enum(['PRIME_SEDAN', 'AUTO', 'MINI', 'RENTAL_ESCORT']).default('PRIME_SEDAN'),
  seniorAssistanceRequired: z.boolean().default(true)
});

export type OlaRideBookingReqDto = z.infer<typeof olaRideBookingReqSchema>;

export const olaRideResSchema = z.object({
  bookingId: z.string(),
  status: z.enum(['CAB_DISPATCHED', 'CAB_ARRIVED', 'TRIP_STARTED', 'TRIP_COMPLETED', 'CANCELLED']),
  driverName: z.string(),
  driverPhone: z.string(),
  vehicleNumber: z.string(),
  vehicleModel: z.string(),
  otp: z.string().length(4),
  etaMinutes: z.number().int().positive(),
  estimatedFarePaise: z.number().int()
});

export type OlaRideResDto = z.infer<typeof olaRideResSchema>;

export const olaRideStatusWebhookSchema = z.object({
  bookingId: z.string(),
  serviceRequestId: z.string().optional(),
  status: z.enum(['CAB_ARRIVED', 'TRIP_STARTED', 'TRIP_COMPLETED', 'CANCELLED']),
  currentLocation: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  finalFarePaise: z.number().int().optional(),
  completedAt: z.coerce.date().optional(),
  timestamp: z.coerce.date()
});

export type OlaRideStatusWebhookDto = z.infer<typeof olaRideStatusWebhookSchema>;
