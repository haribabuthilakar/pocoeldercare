export type SimulatedFailureType = 'TIMEOUT' | 'BAD_SIGNATURE' | 'HTTP_500' | 'NETWORK_DROP';

export function simulatePartnerResponse<T>(
  successData: T,
  failureType?: SimulatedFailureType
): { status: number; data?: T; error?: string } {
  switch (failureType) {
    case 'TIMEOUT':
      return { status: 504, error: 'Partner API gateway timeout' };
    case 'BAD_SIGNATURE':
      return { status: 401, error: 'Invalid HMAC signature payload' };
    case 'HTTP_500':
      return { status: 500, error: 'Internal partner service error' };
    case 'NETWORK_DROP':
      return { status: 503, error: 'Connection refused / service unavailable' };
    default:
      return { status: 200, data: successData };
  }
}
