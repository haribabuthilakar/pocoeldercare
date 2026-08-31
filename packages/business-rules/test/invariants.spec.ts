import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { TicketStatus } from '@poco/constants';
import {
  calculateGst,
  calculateWalletDebit,
  calculateDistanceMeters,
  transitionTicket
} from '../src';

describe('Property-Based Domain Invariants (fast-check) (D-125)', () => {
  it('Invariant: GST arithmetic always satisfies basePaise + gstPaise === totalPaise', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100000000 }), (amountPaise) => {
        const gst = calculateGst(amountPaise);
        expect(Number.isInteger(gst.basePaise)).toBe(true);
        expect(Number.isInteger(gst.gstPaise)).toBe(true);
        expect(Number.isInteger(gst.totalPaise)).toBe(true);
        expect(gst.basePaise + gst.gstPaise).toBe(gst.totalPaise);
      }),
      { numRuns: 500 }
    );
  });

  it('Invariant: Successful wallet debit perfectly conserves money (newBalance === oldBalance - debit)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 10000000 }),
        fc.integer({ min: 1, max: 1000 }),
        (balance, debit) => {
          const result = calculateWalletDebit(balance, debit, 0, false);
          if (result.ok) {
            expect(result.value.newBalancePaise).toBe(balance - debit);
            expect(result.value.debitPaise).toBe(debit);
          }
        }
      ),
      { numRuns: 500 }
    );
  });

  it('Invariant: Haversine distance is symmetric (dist(A, B) === dist(B, A)) and non-negative', () => {
    fc.assert(
      fc.property(
        fc.float({ noNaN: true, min: -89, max: 89 }),
        fc.float({ noNaN: true, min: -179, max: 179 }),
        fc.float({ noNaN: true, min: -89, max: 89 }),
        fc.float({ noNaN: true, min: -179, max: 179 }),
        (lat1, lon1, lat2, lon2) => {
          const d1 = calculateDistanceMeters(lat1, lon1, lat2, lon2);
          const d2 = calculateDistanceMeters(lat2, lon2, lat1, lon1);

          expect(d1).toBeGreaterThanOrEqual(0);
          expect(Math.abs(d1 - d2)).toBeLessThan(0.001); // Symmetry within sub-millimeter precision
        }
      ),
      { numRuns: 500 }
    );
  });

  it('Invariant: State machine transitions never throw uncaught exceptions on arbitrary inputs', () => {
    const allStatuses = Object.values(TicketStatus);

    fc.assert(
      fc.property(
        fc.constantFrom(...allStatuses),
        fc.string(),
        (status, eventType) => {
          expect(() => {
            transitionTicket(status, { type: eventType as any });
          }).not.toThrow();
        }
      ),
      { numRuns: 500 }
    );
  });
});
