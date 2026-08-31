export type MockErrorMode =
  | 'NONE'
  | 'TIMEOUT_GATEWAY'
  | 'HTTP_500_SERVER_ERROR'
  | 'INVALID_HMAC_SIGNATURE'
  | 'RATE_LIMIT_429';

export interface MockSettings {
  latencyMs: number; // simulated latency delay in ms (0-5000)
  failureRate: number; // 0.0 to 1.0 failure probability
  errorMode: MockErrorMode;
  autoCallbackEnabled?: boolean;
  autoCallbackDelayMs?: number;
  customResponseTemplate?: Record<string, unknown>;
}

export const DEFAULT_MOCK_SETTINGS: MockSettings = {
  latencyMs: 150,
  failureRate: 0,
  errorMode: 'NONE',
  autoCallbackEnabled: true,
  autoCallbackDelayMs: 5000
};
