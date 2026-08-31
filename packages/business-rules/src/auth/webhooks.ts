import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Pure HMAC signature verifier with timing-safe equality check per D-116.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha1' = 'sha256'
): boolean {
  if (!rawBody || !signature || !secret) {
    return false;
  }

  try {
    const computedHmac = createHmac(algorithm, secret).update(rawBody).digest('hex');

    const signatureBuffer = Buffer.from(signature);
    const computedBuffer = Buffer.from(computedHmac);

    if (signatureBuffer.length !== computedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, computedBuffer);
  } catch {
    return false;
  }
}
