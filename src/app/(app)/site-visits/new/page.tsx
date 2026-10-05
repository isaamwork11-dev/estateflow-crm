'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { scheduleSiteVisitAction } from '@/lib/actions/site-visits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

function ScheduleForm() {
  const router = useRouter();
  const params = useSearchParams();
  const leadId = params.get('leadId') ?? '';
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await scheduleSiteVisitAction({
      leadId: String(form.get('leadId')),
      propertyId: String(form.get('propertyId')),
      date: new Date(String(form.get('date'))),
      time: String(form.get('time') || ''),
      notes: String(form.get('notes') || ''),
      location: String(form.get('location') || ''),
    });
    setLoading(false);
    router.push('/site-visits');
  }

  return (
    <Card>
      <CardHeader><CardTitle>Schedule site visit</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3">
          <div><Label>Lead ID</Label><Input name="leadId" required defaultValue={leadId} /></div>
          <div><Label>Property ID</Label><Input name="propertyId" required placeholder="Paste property ID from property page" /></div>
          <div><Label>Date</Label><Input name="date" type="date" required /></div>
          <div><Label>Time</Label><Input name="time" placeholder="5:00 PM" /></div>
          <div><Label>Location</Label><Input name="location" /></div>
          <div><Label>Notes</Label><Input name="notes" /></div>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Schedule visit'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function NewSiteVisitPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Schedule visit</h1>
      <Suspense><ScheduleForm /></Suspense>
    </div>
  );
}
