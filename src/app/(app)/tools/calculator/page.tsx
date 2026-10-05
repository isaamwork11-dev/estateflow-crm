'use client';

import { useMemo, useState } from 'react';
import { calculatePaymentPlan } from '@/lib/business/commission';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CalculatorPage() {
  const [price, setPrice] = useState(20000000);
  const [downPercent, setDownPercent] = useState(20);
  const [months, setMonths] = useState(60);

  const plan = useMemo(
    () =>
      calculatePaymentPlan({
        propertyPrice: price,
        downPaymentPercent: downPercent,
        durationMonths: months,
      }),
    [price, downPercent, months]
  );

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Payment / Installment Calculator</h1>
      <Card>
        <CardHeader><CardTitle>Inputs</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div><Label>Property Price</Label><Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
          <div><Label>Down Payment %</Label><Input type="number" value={downPercent} onChange={(e) => setDownPercent(Number(e.target.value))} /></div>
          <div className="sm:col-span-2"><Label>Duration (months)</Label><Input type="number" value={months} onChange={(e) => setMonths(Number(e.target.value))} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Plan</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Down payment: PKR {plan.downPayment.toLocaleString()}</p>
          <p>Remaining: PKR {plan.remainingBalance.toLocaleString()}</p>
          <p>Monthly: PKR {plan.monthlyInstallment.toLocaleString()}</p>
          <p>Quarterly: PKR {plan.quarterlyInstallment.toLocaleString()}</p>
          <p>Yearly: PKR {plan.yearlyInstallment.toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
