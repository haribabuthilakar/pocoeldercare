import { vi } from 'vitest';

// Global test setup for mock adapters
process.env.NODE_ENV = 'test';
process.env.WEBHOOK_SECRET = 'test_webhook_secret_key_12345';
