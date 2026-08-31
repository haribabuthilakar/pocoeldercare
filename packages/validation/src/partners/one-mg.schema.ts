import { z } from 'zod';

export const oneMgOrderItemSchema = z.object({
  skuId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPricePaise: z.number().int().positive()
});

export const oneMgOrderCreateReqSchema = z.object({
  seniorId: z.string().min(1),
  householdId: z.string().min(1),
  serviceRequestId: z.string().optional(),
  patientDetails: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    deliveryAddress: z.string().min(1),
    pincode: z.string().regex(/^\d{6}$/, 'Must be 6-digit Indian PIN')
  }),
  prescriptionUrls: z.array(z.string().url()).default([]),
  items: z.array(oneMgOrderItemSchema).min(1),
  scheduledDeliveryDate: z.string().optional()
});

export type OneMgOrderCreateReqDto = z.infer<typeof oneMgOrderCreateReqSchema>;

export const oneMgOrderResSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    'ORDER_PLACED',
    'PHARMACIST_VERIFIED',
    'PACKED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ]),
  totalAmountPaise: z.number().int(),
  estimatedDelivery: z.string(),
  trackingUrl: z.string().url().optional()
});

export type OneMgOrderResDto = z.infer<typeof oneMgOrderResSchema>;

export const oneMgDeliveryWebhookSchema = z.object({
  orderId: z.string(),
  serviceRequestId: z.string().optional(),
  status: z.enum([
    'ORDER_CONFIRMED',
    'PHARMACIST_VERIFIED',
    'DISPATCHED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ]),
  deliveryRiderName: z.string().optional(),
  deliveryRiderPhone: z.string().optional(),
  deliveredAt: z.coerce.date().optional(),
  timestamp: z.coerce.date()
});

export type OneMgDeliveryWebhookDto = z.infer<typeof oneMgDeliveryWebhookSchema>;
