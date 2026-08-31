/**
 * Lightweight generic logging interface for domain modules and business rules.
 * Decouples logic from concrete NestJS / Winston / Pino loggers per D-19.
 */
export interface ILogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void;
  debug?(message: string, context?: Record<string, unknown>): void;
}

/**
 * No-op logger implementation for tests and silent contexts.
 */
export class NoopLogger implements ILogger {
  info(_message: string, _context?: Record<string, unknown>): void {}
  warn(_message: string, _context?: Record<string, unknown>): void {}
  error(_message: string, _error?: Error | unknown, _context?: Record<string, unknown>): void {}
  debug(_message: string, _context?: Record<string, unknown>): void {}
}
