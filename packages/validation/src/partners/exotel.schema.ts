import { z } from 'zod';

export const exotelConnectCallReqSchema = z.object({
  from: z.string().regex(/^\+?91\d{10}$/, 'Must be a valid Indian phone number'),
  to: z.string().regex(/^\+?91\d{10}$/, 'Must be a valid Indian phone number'),
  callerId: z.string().default('0806900POCO'),
  url: z.string().url().optional(),
  timeLimit: z.number().int().positive().optional(),
  customField: z.string().optional()
});

export type ExotelConnectCallReqDto = z.infer<typeof exotelConnectCallReqSchema>;

export const exotelCallResSchema = z.object({
  callSid: z.string(),
  status: z.enum(['queued', 'in-progress', 'completed', 'busy', 'failed', 'no-answer']),
  from: z.string(),
  to: z.string(),
  startTime: z.string().optional(),
  dateCreated: z.string()
});

export type ExotelCallResDto = z.infer<typeof exotelCallResSchema>;

export const exotelPassthruCallbackSchema = z.object({
  CallSid: z.string(),
  From: z.string(),
  To: z.string(),
  Digits: z.string().optional(), // DTMF digits pressed, e.g. "1"
  Direction: z.enum(['inbound', 'outbound-dial']).default('inbound'),
  CallType: z.string().optional(),
  CallDuration: z.coerce.number().int().optional(),
  DialCallDuration: z.coerce.number().int().optional(),
  Status: z.enum(['ringing', 'in-progress', 'completed', 'busy', 'failed', 'no-answer']),
  RecordingUrl: z.string().url().optional()
});

export type ExotelPassthruCallbackDto = z.infer<typeof exotelPassthruCallbackSchema>;

export const exotelCallRecordSchema = z.object({
  callSid: z.string(),
  from: z.string(),
  to: z.string(),
  seniorId: z.string().optional(),
  householdId: z.string().optional(),
  durationSeconds: z.number().int().default(0),
  ivrPathTaken: z.string().optional(),
  status: z.enum(['COMPLETED', 'MISSED', 'FAILED', 'TRANSFERRED']),
  recordingUrl: z.string().url().optional(),
  notes: z.string().optional()
});

export type ExotelCallRecordDto = z.infer<typeof exotelCallRecordSchema>;
