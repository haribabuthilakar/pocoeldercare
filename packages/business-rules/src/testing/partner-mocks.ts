import { createHmac } from 'node:crypto';

export function createMockRazorpayWebhook(amountPaise: number, secret = 'rzp_test_secret_key_12345') {
  const payload = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: `pay_${Date.now()}`,
          amount: amountPaise,
          currency: 'INR',
          status: 'captured'
        }
      }
    }
  };

  const rawBody = JSON.stringify(payload);
  const signature = createHmac('sha256', secret).update(rawBody).digest('hex');

  return { payload, rawBody, signature };
}
