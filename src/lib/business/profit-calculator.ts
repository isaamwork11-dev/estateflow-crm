import { z } from 'zod';

export const profitInputSchema = z.object({
  purchasePrice: z.number().nonnegative(),
  renovationCost: z.number().nonnegative().default(0),
  taxesAndFees: z.number().nonnegative().default(0),
  otherCosts: z.number().nonnegative().default(0),
  expectedSalePrice: z.number().positive(),
});

export function calculateInvestmentProfit(input: z.infer<typeof profitInputSchema>) {
  const totalInvestment =
    input.purchasePrice + input.renovationCost + input.taxesAndFees + input.otherCosts;
  const profit = input.expectedSalePrice - totalInvestment;
  const roiPercent = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
  return {
    totalInvestment: Math.round(totalInvestment),
    expectedProfit: Math.round(profit),
    roiPercent: Math.round(roiPercent * 100) / 100,
  };
}
