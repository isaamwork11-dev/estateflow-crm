import { describe, expect, it } from 'vitest';
import { calculateCommission, calculatePaymentPlan } from './commission';
import { calculateInvestmentProfit } from './profit-calculator';
import { calculateDealBalance } from './payment-balance';

describe('commission', () => {
  it('splits agent and company share', () => {
    const r = calculateCommission({
      salePrice: 25_000_000,
      commissionPercent: 1,
      agentSharePercent: 60,
    });
    expect(r.commissionAmount).toBe(250_000);
    expect(r.agentCommission).toBe(150_000);
    expect(r.companyCommission).toBe(100_000);
  });
});

describe('installment plan', () => {
  it('computes monthly installment', () => {
    const r = calculatePaymentPlan({
      propertyPrice: 10_000_000,
      downPaymentPercent: 20,
      durationMonths: 24,
    });
    expect(r.downPayment).toBe(2_000_000);
    expect(r.remainingBalance).toBe(8_000_000);
    expect(r.monthlyInstallment).toBe(Math.round(8_000_000 / 24));
  });
});

describe('profit calculator', () => {
  it('computes ROI', () => {
    const r = calculateInvestmentProfit({
      purchasePrice: 18_000_000,
      renovationCost: 1_000_000,
      taxesAndFees: 0,
      otherCosts: 500_000,
      expectedSalePrice: 23_000_000,
    });
    expect(r.totalInvestment).toBe(19_500_000);
    expect(r.expectedProfit).toBe(3_500_000);
    expect(r.roiPercent).toBeCloseTo(17.95, 1);
  });
});

describe('payment balance', () => {
  it('tracks remaining on deal', () => {
    const r = calculateDealBalance(25_000_000, [10_000_000]);
    expect(r.paid).toBe(10_000_000);
    expect(r.remaining).toBe(15_000_000);
  });
});
