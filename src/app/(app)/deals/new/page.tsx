'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDealAction } from '@/lib/actions/deals';
import { calculateCommission } from '@/lib/business/commission';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export default function NewDealPage() {
  const router = useRouter();
  const [price, setPrice] = useState(25000000);
  const [commissionPercent, setCommissionPercent] = useState(2);
  const preview = calculateCommission({
    salePrice: price,
    commissionPercent,
    agentSharePercent: 100,
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await createDealAction({
      leadId: String(form.get('leadId')),
      propertyId: String(form.get('propertyId')),
      salePrice: Number(form.get('salePrice')),
      commissionPercent: Number(form.get('commissionPercent')),
      dealDate: new Date(String(form.get('dealDate'))),
      notes: String(form.get('notes') || ''),
    });
    router.push('/deals');
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Record deal</h1>
      <Card>
        <CardHeader><CardTitle>Deal details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3">
            <div><Label>Lead ID</Label><Input name="leadId" required /></div>
            <div><Label>Property ID</Label><Input name="propertyId" required /></div>
            <div><Label>Sale price</Label><Input name="salePrice" type="number" required value={price} onChange={(e) => setPrice(Number(e.target.value))} /></div>
            <div><Label>Commission %</Label><Input name="commissionPercent" type="number" value={commissionPercent} onChange={(e) => setCommissionPercent(Number(e.target.value))} /></div>
            <div><Label>Deal date</Label><Input name="dealDate" type="date" required /></div>
            <div><Label>Notes</Label><Input name="notes" /></div>
            <div className="rounded-lg bg-teal-50 p-3 text-sm">
              <p>Expected commission: <strong>{formatCurrency(preview.commissionAmount)}</strong></p>
            </div>
            <Button type="submit">Save deal</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
