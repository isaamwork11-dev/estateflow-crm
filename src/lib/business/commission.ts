import { z } from 'zod';

export const commissionInputSchema = z.object({
  salePrice: z.number().positive(),
  commissionPercent: z.number().min(0).max(100),
  agentSharePercent: z.number().min(0).max(100),
});

export function calculateCommission(input: z.infer<typeof commissionInputSchema>) {
  const commissionAmount = (input.salePrice * input.commissionPercent) / 100;
  const agentCommission = (commissionAmount * input.agentSharePercent) / 100;
  const companyCommission = commissionAmount - agentCommission;
  return {
    commissionAmount: Math.round(commissionAmount),
    agentCommission: Math.round(agentCommission),
    companyCommission: Math.round(companyCommission),
  };
}

export const paymentPlanSchema = z.object({
  propertyPrice: z.number().positive(),
  downPaymentPercent: z.number().min(0).max(100).optional(),
  downPaymentAmount: z.number().min(0).optional(),
  durationMonths: z.number().int().positive(),
});

export function calculatePaymentPlan(input: z.infer<typeof paymentPlanSchema>) {
  const down =
    input.downPaymentAmount ??
    (input.downPaymentPercent != null
      ? (input.propertyPrice * input.downPaymentPercent) / 100
      : 0);
  const remaining = input.propertyPrice - down;
  const monthly = remaining / input.durationMonths;
  return {
    downPayment: Math.round(down),
    remainingBalance: Math.round(remaining),
    monthlyInstallment: Math.round(monthly),
    quarterlyInstallment: Math.round(monthly * 3),
    yearlyInstallment: Math.round(monthly * 12),
  };
}
