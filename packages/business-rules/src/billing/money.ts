import type { Result } from '../common/result';
import { ok, err } from '../common/result';
import { DomainError, DomainErrorCode } from '../common/errors';

export interface GstCalculation {
  basePaise: number;
  gstRatePercent: number;
  gstPaise: number;
  totalPaise: number;
}

/**
 * Calculates Goods and Services Tax (GST) using deterministic integer paise arithmetic.
 * Default standard GST rate in India is 18%.
 * Uses Math.round for standard half-up rounding per D-55.
 */
export function calculateGst(amountPaise: number, gstRatePercent = 18): GstCalculation {
  const safeAmount = Math.max(0, Math.floor(amountPaise));
  const gstPaise = Math.round((safeAmount * gstRatePercent) / 100);
  const totalPaise = safeAmount + gstPaise;

  return {
    basePaise: safeAmount,
    gstRatePercent,
    gstPaise,
    totalPaise
  };
}

export interface WalletDebitResult {
  previousBalancePaise: number;
  debitPaise: number;
  newBalancePaise: number;
  isOverdrawn: boolean;
}

/**
 * Calculates wallet debit and verifies balance against credit limit per D-55.
 * In emergency scenarios, negative balances beyond credit limit are allowed (emergency overdraft).
 */
export function calculateWalletDebit(
  currentBalancePaise: number,
  debitAmountPaise: number,
  creditLimitPaise = 0,
  isEmergency = false
): Result<WalletDebitResult, DomainError> {
  const safeDebit = Math.floor(debitAmountPaise);
  if (safeDebit <= 0) {
    return err(
      new DomainError(
        DomainErrorCode.INVALID_INPUT,
        `Debit amount must be positive (received ${debitAmountPaise} paise)`
      )
    );
  }

  const effectiveCreditLimit = Math.max(0, Math.floor(creditLimitPaise));
  const newBalance = currentBalancePaise - safeDebit;
  const minimumAllowedBalance = -effectiveCreditLimit;

  if (newBalance < minimumAllowedBalance && !isEmergency) {
    const shortfall = Math.abs(newBalance - minimumAllowedBalance);
    return err(
      new DomainError(
        DomainErrorCode.INSUFFICIENT_FUNDS,
        `Insufficient wallet balance. Shortfall: ${shortfall} paise (Balance: ${currentBalancePaise}, Debit: ${safeDebit}, Limit: ${effectiveCreditLimit})`,
        { currentBalancePaise, debitAmountPaise: safeDebit, creditLimitPaise: effectiveCreditLimit, shortfall }
      )
    );
  }

  return ok({
    previousBalancePaise: currentBalancePaise,
    debitPaise: safeDebit,
    newBalancePaise: newBalance,
    isOverdrawn: newBalance < 0
  });
}

/**
 * Formats integer paise into a human-readable Indian Rupee (INR) string.
 * Example: 1250050 -> "₹12,500.50", 50000 -> "₹500.00", -25000 -> "-₹250.00".
 */
export function formatInr(paise: number): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const remainderPaise = absPaise % 100;

  // Format integer rupees with Indian numbering grouping (lakhs, crores)
  const rupeesFormatted = new Intl.NumberFormat('en-IN').format(rupees);
  const paiseFormatted = remainderPaise.toString().padStart(2, '0');

  const sign = isNegative ? '-' : '';
  return `${sign}₹${rupeesFormatted}.${paiseFormatted}`;
}
