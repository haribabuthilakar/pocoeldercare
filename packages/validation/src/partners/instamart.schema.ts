import { z } from 'zod';

export const instamartItemSchema = z.object({
  skuId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPricePaise: z.number().int().positive()
});

export const instamartOrderReqSchema = z.object({
  householdId: z.string().min(1),
  seniorId: z.string().min(1),
  serviceRequestId: z.string().optional(),
  deliveryAddress: z.string().min(1),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  items: z.array(instamartItemSchema).min(1),
  deliveryInstructions: z.string().optional()
});

export type InstamartOrderReqDto = z.infer<typeof instamartOrderReqSchema>;

export const instamartOrderResSchema = z.object({
  orderId: z.string(),
  status: z.enum(['ORDER_PLACED', 'PACKING', 'PICKED_UP', 'DELIVERED', 'CANCELLED']),
  etaMinutes: z.number().int().positive(),
  deliveryPartnerName: z.string(),
  deliveryPartnerPhone: z.string(),
  totalPaise: z.number().int()
});

export type InstamartOrderResDto = z.infer<typeof instamartOrderResSchema>;

export const instamartTrackingWebhookSchema = z.object({
  orderId: z.string(),
  serviceRequestId: z.string().optional(),
  status: z.enum(['PICKED_UP', 'ARRIVED_NEARBY', 'DELIVERED', 'CANCELLED']),
  deliveryPartnerName: z.string().optional(),
  deliveredAt: z.coerce.date().optional(),
  timestamp: z.coerce.date()
});

export type InstamartTrackingWebhookDto = z.infer<typeof instamartTrackingWebhookSchema>;
