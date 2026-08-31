import { z } from 'zod';

export const whatsappTemplateParameterSchema = z.object({
  type: z.enum(['text', 'currency', 'date_time', 'image', 'document']),
  text: z.string().optional(),
  currency: z.object({
    code: z.string(),
    amount_1000: z.number().int()
  }).optional(),
  date_time: z.object({
    fallback_value: z.string()
  }).optional()
});

export const whatsappTemplateComponentSchema = z.object({
  type: z.enum(['header', 'body', 'button']),
  parameters: z.array(whatsappTemplateParameterSchema).default([])
});

export const whatsappSendTemplateReqSchema = z.object({
  to: z.string().regex(/^\+?91\d{10}$/, 'Must be a valid Indian phone number'),
  templateName: z.enum([
    'family_escalation_alert',
    'payment_reminder',
    'visit_report',
    'emergency_broadcast',
    'service_scheduled'
  ]),
  languageCode: z.string().default('en'),
  components: z.array(whatsappTemplateComponentSchema).default([])
});

export type WhatsappSendTemplateReqDto = z.infer<typeof whatsappSendTemplateReqSchema>;

export const whatsappMessageResSchema = z.object({
  messagingProduct: z.literal('whatsapp').default('whatsapp'),
  contacts: z.array(
    z.object({
      input: z.string(),
      waId: z.string()
    })
  ).default([]),
  messages: z.array(
    z.object({
      id: z.string() // e.g. "wamid.HBgLMTIzNDU2..."
    })
  )
});

export type WhatsappMessageResDto = z.infer<typeof whatsappMessageResSchema>;

export const whatsappStatusWebhookSchema = z.object({
  id: z.string(), // message ID
  status: z.enum(['sent', 'delivered', 'read', 'failed']),
  timestamp: z.string(),
  recipientId: z.string(),
  errors: z.array(
    z.object({
      code: z.number(),
      title: z.string(),
      message: z.string().optional()
    })
  ).optional()
});

export type WhatsappStatusWebhookDto = z.infer<typeof whatsappStatusWebhookSchema>;

export const whatsappInboundChatWebhookSchema = z.object({
  from: z.string(),
  id: z.string(),
  timestamp: z.string(),
  type: z.enum(['text', 'button', 'interactive', 'location']),
  text: z.object({
    body: z.string()
  }).optional(),
  householdId: z.string().optional()
});

export type WhatsappInboundChatWebhookDto = z.infer<typeof whatsappInboundChatWebhookSchema>;
