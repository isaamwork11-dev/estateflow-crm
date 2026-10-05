'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPropertyAction, updatePropertyAction, archivePropertyAction } from '@/lib/actions/properties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, string | number>>({});

  useEffect(() => {
    getPropertyAction(id).then((p) => {
      setForm({
        title: p.title,
        price: p.price,
        area: p.area ?? '',
        propertyType: p.propertyType,
        bedrooms: p.bedrooms ?? '',
        availability: p.availability ?? 'available',
        description: p.description ?? '',
        images: p.images?.[0] ?? '',
      });
      setLoading(false);
    });
  }, [id]);

  async function save() {
    await updatePropertyAction(id, {
      title: String(form.title),
      price: Number(form.price),
      area: String(form.area),
      propertyType: String(form.propertyType),
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      availability: String(form.availability),
      description: String(form.description),
      images: form.images ? [String(form.images)] : [],
    });
    router.push(`/properties/${id}`);
  }

  async function archive() {
    await archivePropertyAction(id);
    router.push('/properties');
  }

  if (loading) return <p>Loading...</p>;

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader><CardTitle>Edit property</CardTitle></CardHeader>
      <CardContent className="grid gap-3">
        <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Price</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
        <div><Label>Area</Label><Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} /></div>
        <div><Label>Availability</Label>
          <select className="h-10 w-full rounded-md border px-3" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div><Label>Image URL</Label><Input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} /></div>
        <Button onClick={save}>Save</Button>
        <Button variant="destructive" onClick={archive}>Archive</Button>
      </CardContent>
    </Card>
  );
}
