'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLeadAction } from '@/lib/actions/leads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicate, setDuplicate] = useState<{ existingId: string; existingName?: string } | null>(
    null
  );
  const [forceCreate, setForceCreate] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      const payload = {
        name: String(form.get('name')),
        phone: String(form.get('phone')),
        whatsapp: String(form.get('whatsapp') || ''),
        budget: form.get('budget') ? Number(form.get('budget')) : undefined,
        preferredArea: String(form.get('preferredArea') || ''),
        propertyType: String(form.get('propertyType') || ''),
        transactionType: (form.get('transactionType') as 'sale' | 'rent') || 'sale',
        purpose: (form.get('purpose') as 'living' | 'investment') || 'living',
        buyingTimeline: String(form.get('buyingTimeline') || ''),
        source: String(form.get('source') || 'Walk-in'),
        notes: String(form.get('notes') || ''),
        forceCreate,
      };
      const result = await createLeadAction(payload);
      if (result.duplicate && result.existingId) {
        setDuplicate({ existingId: result.existingId, existingName: result.existingName });
        return;
      }
      if (result.id) router.push(`/leads/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Add Lead</h1>
      <Card>
        <CardHeader><CardTitle>Quick lead capture</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Name</Label><Input name="name" required /></div>
            <div className="space-y-2"><Label>Phone</Label><Input name="phone" required /></div>
            <div className="space-y-2"><Label>WhatsApp</Label><Input name="whatsapp" /></div>
            <div className="space-y-2"><Label>Budget (PKR)</Label><Input name="budget" type="number" /></div>
            <div className="space-y-2"><Label>Preferred Area</Label><Input name="preferredArea" /></div>
            <div className="space-y-2"><Label>Property Type</Label><Input name="propertyType" placeholder="flat, house..." /></div>
            <div className="space-y-2"><Label>Sale/Rent</Label>
              <select name="transactionType" className="h-10 w-full rounded-md border px-3 text-sm">
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Purpose</Label>
              <select name="purpose" className="h-10 w-full rounded-md border px-3 text-sm">
                <option value="living">Living</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Buying Timeline</Label><Input name="buyingTimeline" placeholder="Within 30 days" /></div>
            <div className="space-y-2"><Label>Source</Label><Input name="source" defaultValue="Walk-in" /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Input name="notes" /></div>
            {duplicate && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 sm:col-span-2">
                <p className="font-medium text-amber-900">Possible existing lead found</p>
                <p className="mt-1 text-sm text-amber-800">
                  {duplicate.existingName ? `${duplicate.existingName} — ` : ''}
                  <a className="underline" href={`/leads/${duplicate.existingId}`}>Open existing</a>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/leads/${duplicate.existingId}`)}
                  >
                    Open existing
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setForceCreate(true);
                      setDuplicate(null);
                      setTimeout(() => {
                        document.querySelector<HTMLFormElement>('form')?.requestSubmit();
                      }, 0);
                    }}
                  >
                    Create anyway
                  </Button>
                </div>
              </div>
            )}
            {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2"><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Lead'}</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
