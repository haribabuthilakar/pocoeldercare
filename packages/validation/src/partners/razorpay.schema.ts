import { z } from 'zod';

export const razorpayCreateOrderReqSchema = z.object({
  amount: z.number().int().positive(), // in integer paise (e.g. 50000 = ₹500)
  currency: z.literal('INR').default('INR'),
  receipt: z.string().min(1),
  notes: z.record(z.string(), z.string()).optional()
});

export type RazorpayCreateOrderReqDto = z.infer<typeof razorpayCreateOrderReqSchema>;

export const razorpayOrderResSchema = z.object({
  id: z.string(),
  entity: z.literal('order'),
  amount: z.number().int().positive(),
  amount_paid: z.number().int().default(0),
  amount_due: z.number().int(),
  currency: z.literal('INR'),
  receipt: z.string(),
  status: z.enum(['created', 'attempted', 'paid']),
  attempts: z.number().int().default(0),
  notes: z.record(z.string(), z.string()).optional(),
  created_at: z.number().int()
});

export type RazorpayOrderResDto = z.infer<typeof razorpayOrderResSchema>;

export const razorpayRefundReqSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().int().positive(), // paise
  reverseAll: z.boolean().default(false),
  notes: z.record(z.string(), z.string()).optional()
});

export type RazorpayRefundReqDto = z.infer<typeof razorpayRefundReqSchema>;

export const razorpayRefundResSchema = z.object({
  id: z.string(),
  entity: z.literal('refund'),
  amount: z.number().int().positive(),
  currency: z.literal('INR'),
  payment_id: z.string(),
  status: z.enum(['pending', 'processed', 'failed']),
  speed_processed: z.string().optional(),
  created_at: z.number().int()
});

export type RazorpayRefundResDto = z.infer<typeof razorpayRefundResSchema>;

export const razorpayWebhookPayloadSchema = z.object({
  entity: z.literal('event'),
  account_id: z.string().optional(),
  event: z.enum([
    'payment.captured',
    'payment.failed',
    'refund.processed',
    'order.paid'
  ]),
  contains: z.array(z.string()).optional(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        entity: z.literal('payment'),
        amount: z.number().int(),
        currency: z.literal('INR'),
        status: z.string(),
        order_id: z.string().optional(),
        method: z.string().optional(),
        email: z.string().optional(),
        contact: z.string().optional(),
        notes: z.record(z.string(), z.any()).optional(),
        error_code: z.string().nullable().optional(),
        error_description: z.string().nullable().optional(),
        created_at: z.number().int().optional()
      })
    }).optional(),
    order: z.object({
      entity: z.object({
        id: z.string(),
        entity: z.literal('order'),
        amount: z.number().int(),
        status: z.string(),
        notes: z.record(z.string(), z.any()).optional()
      })
    }).optional(),
    refund: z.object({
      entity: z.object({
        id: z.string(),
        entity: z.literal('refund'),
        amount: z.number().int(),
        payment_id: z.string(),
        status: z.string()
      })
    }).optional()
  }),
  created_at: z.number().int().optional()
});

export type RazorpayWebhookPayloadDto = z.infer<typeof razorpayWebhookPayloadSchema>;
