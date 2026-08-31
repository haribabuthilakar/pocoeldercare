import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Generates an HMAC signature for an outbound webhook payload string.
 */
export function signWebhookPayload(
  rawBody: string,
  secret: string,
  algorithm: 'sha256' | 'sha1' = 'sha256'
): string {
  if (!rawBody || !secret) {
    return '';
  }
  return createHmac(algorithm, secret).update(rawBody).digest('hex');
}

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
    const computedHmac = signWebhookPayload(rawBody, secret, algorithm);

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

