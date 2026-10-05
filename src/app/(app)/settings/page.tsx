'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    logoUrl: '',
    commissionPercent: 2,
    ownerName: '',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.org) {
          setForm({
            name: data.org.name ?? '',
            phone: data.org.phone ?? '',
            whatsapp: data.org.whatsapp ?? '',
            logoUrl: data.org.logoUrl ?? '',
            commissionPercent: data.org.defaults?.commissionPercent ?? 2,
            ownerName: data.user?.name ?? '',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    const { updateOrganizationSettingsAction, updateProfileAction } = await import('@/lib/actions/settings');
    await updateOrganizationSettingsAction({
      name: form.name,
      phone: form.phone,
      whatsapp: form.whatsapp,
      logoUrl: form.logoUrl,
      commissionPercent: form.commissionPercent,
    });
    await updateProfileAction({ name: form.ownerName, phone: form.phone });
    alert('Settings saved');
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Business profile</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div><Label>Business name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Your name</Label><Input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
          <div><Label>Logo URL</Label><Input value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} /></div>
          <div><Label>Default commission %</Label><Input type="number" value={form.commissionPercent} onChange={(e) => setForm({ ...form, commissionPercent: Number(e.target.value) })} /></div>
          <Button onClick={save}>Save settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
