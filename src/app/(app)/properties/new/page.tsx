'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPropertyAction } from '@/lib/actions/properties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const image = String(form.get('image') || '');
    const result = await createPropertyAction({
      propertyCode: String(form.get('propertyCode')),
      title: String(form.get('title')),
      transactionType: form.get('transactionType') as 'sale' | 'rent',
      price: Number(form.get('price')),
      propertyType: String(form.get('propertyType')),
      area: String(form.get('area') || ''),
      size: form.get('size') ? Number(form.get('size')) : undefined,
      bedrooms: form.get('bedrooms') ? Number(form.get('bedrooms')) : undefined,
      location: String(form.get('location') || ''),
      society: String(form.get('society') || ''),
      city: String(form.get('city') || ''),
      description: String(form.get('description') || ''),
      images: image ? [image] : [],
    });
    setLoading(false);
    router.push('/properties');
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-3xl font-bold">Add Property</h1>
      <Card>
        <CardHeader><CardTitle>Property details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><Label>Property ID</Label><Input name="propertyCode" required /></div>
            <div className="space-y-1"><Label>Title</Label><Input name="title" required /></div>
            <div className="space-y-1"><Label>Price</Label><Input name="price" type="number" required /></div>
            <div className="space-y-1"><Label>Type</Label><Input name="propertyType" required /></div>
            <div className="space-y-1"><Label>Area</Label><Input name="area" /></div>
            <div className="space-y-1"><Label>Bedrooms</Label><Input name="bedrooms" type="number" /></div>
            <div className="space-y-1"><Label>Size</Label><Input name="size" type="number" /></div>
            <div className="space-y-1"><Label>Sale/Rent</Label>
              <select name="transactionType" className="h-10 w-full rounded-md border px-3 text-sm"><option value="sale">Sale</option><option value="rent">Rent</option></select>
            </div>
            <div className="space-y-1 sm:col-span-2"><Label>Image URL</Label><Input name="image" placeholder="https://..." /></div>
            <div className="space-y-1 sm:col-span-2"><Label>Description</Label><Input name="description" /></div>
            <div className="sm:col-span-2"><Button type="submit" disabled={loading}>Save Property</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
