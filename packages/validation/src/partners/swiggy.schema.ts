import { z } from 'zod';

export const swiggyMealItemSchema = z.object({
  itemId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  dietaryTags: z.array(z.string()).default([]), // e.g. ['LOW_SODIUM', 'DIABETIC_FRIENDLY', 'PURE_VEG']
  unitPricePaise: z.number().int().positive()
});

export const swiggyMealOrderReqSchema = z.object({
  householdId: z.string().min(1),
  seniorId: z.string().min(1),
  serviceRequestId: z.string().optional(),
  restaurantId: z.string().default('SWIG-REST-POCO-KITCHEN'),
  items: z.array(swiggyMealItemSchema).min(1),
  deliveryAddress: z.string().min(1),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  specialInstructions: z.string().default('Deliver directly to senior door, ring bell gently')
});

export type SwiggyMealOrderReqDto = z.infer<typeof swiggyMealOrderReqSchema>;

export const swiggyOrderResSchema = z.object({
  orderId: z.string(),
  status: z.enum(['ORDER_ACCEPTED', 'PREPARING', 'RIDER_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
  etaMinutes: z.number().int().positive(),
  totalPaise: z.number().int(),
  restaurantName: z.string()
});

export type SwiggyOrderResDto = z.infer<typeof swiggyOrderResSchema>;

export const swiggyDeliveryWebhookSchema = z.object({
  orderId: z.string(),
  serviceRequestId: z.string().optional(),
  status: z.enum(['ORDER_ACCEPTED', 'RIDER_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
  riderName: z.string().optional(),
  riderPhone: z.string().optional(),
  deliveredAt: z.coerce.date().optional(),
  timestamp: z.coerce.date()
});

export type SwiggyDeliveryWebhookDto = z.infer<typeof swiggyDeliveryWebhookSchema>;
