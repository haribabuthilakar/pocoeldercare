import type { Result } from '../common/result';
import { ok, err } from '../common/result';
import { DomainError, DomainErrorCode } from '../common/errors';

export interface WalletHoldResult {
  holdAmountPaise: number;
  remainingAvailablePaise: number;
}

/**
 * Calculates pre-authorization wallet hold per D-67.
 */
export function calculateWalletHold(
  currentBalancePaise: number,
  requestedHoldPaise: number,
  existingHoldsPaise = 0
): Result<WalletHoldResult, DomainError> {
  const safeHold = Math.floor(requestedHoldPaise);
  if (safeHold <= 0) {
    return err(
      new DomainError(
        DomainErrorCode.INVALID_INPUT,
        `Requested hold amount must be positive (${requestedHoldPaise} paise)`
      )
    );
  }

  const availableBalance = currentBalancePaise - existingHoldsPaise;

  if (availableBalance < safeHold) {
    return err(
      new DomainError(
        DomainErrorCode.INSUFFICIENT_FUNDS,
        `Cannot place hold: insufficient available balance (${availableBalance} paise available, ${safeHold} paise requested)`
      )
    );
  }

  return ok({
    holdAmountPaise: safeHold,
    remainingAvailablePaise: availableBalance - safeHold
  });
}

export interface HoldSettlementResult {
  holdPaise: number;
  finalCostPaise: number;
  debitPaise: number;
  refundPaise: number;
  additionalDebitPaise: number;
}

/**
 * Calculates settlement of a pre-authorized hold against final invoice cost per D-67.
 */
export function calculateHoldSettlement(
  holdPaise: number,
  finalCostPaise: number
): HoldSettlementResult {
  const safeHold = Math.max(0, Math.floor(holdPaise));
  const safeCost = Math.max(0, Math.floor(finalCostPaise));

  if (safeCost <= safeHold) {
    // Final cost is within hold -> debit cost, refund unused hold
    return {
      holdPaise: safeHold,
      finalCostPaise: safeCost,
      debitPaise: safeCost,
      refundPaise: safeHold - safeCost,
      additionalDebitPaise: 0
    };
  }

  // Final cost exceeded hold -> debit entire hold + additional debit
  return {
    holdPaise: safeHold,
    finalCostPaise: safeCost,
    debitPaise: safeHold,
    refundPaise: 0,
    additionalDebitPaise: safeCost - safeHold
  };
}
