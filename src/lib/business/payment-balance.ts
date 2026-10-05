export function calculateDealBalance(dealAmount: number, payments: number[]) {
  const paid = payments.reduce((a, b) => a + b, 0);
  const remaining = Math.max(0, dealAmount - paid);
  return { paid: Math.round(paid), remaining: Math.round(remaining) };
}
