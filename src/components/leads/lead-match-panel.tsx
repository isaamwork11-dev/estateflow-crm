'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createPresentationAction } from '@/lib/actions/presentations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { formatMatchSummary, type PropertyMatchResult } from '@/lib/matching/property-match';

export function LeadMatchPanel({
  leadId,
  initialMatches,
}: {
  leadId: string;
  initialMatches: PropertyMatchResult[];
}) {
  const [matches] = useState(initialMatches);
  const [shareUrl, setShareUrl] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function sendToClient() {
    if (selected.length === 0) return;
    const { token } = await createPresentationAction(leadId, selected);
    const url = `${window.location.origin}/p/${token}`;
    setShareUrl(url);
    await navigator.clipboard.writeText(url);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{matches.length} matching propert{matches.length === 1 ? 'y' : 'ies'}</CardTitle>
        <Button size="sm" onClick={sendToClient} disabled={selected.length === 0}>Send to Client</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {shareUrl && <p className="rounded-md bg-teal-50 p-2 text-sm">Link copied: {shareUrl}</p>}
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matching properties found. Adjust lead requirements or add inventory.</p>
        ) : (
          matches.map((m) => (
            <div key={m.propertyId} className="rounded-lg border p-3">
              <div className="flex gap-3">
                {m.property.images?.[0] ? (
                  <Image src={m.property.images[0]} alt="" width={96} height={72} className="rounded-md object-cover" />
                ) : (
                  <div className="flex h-[72px] w-24 items-center justify-center rounded-md bg-slate-100 text-xs">No image</div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{m.property.title}</p>
                    <Badge>{m.percent}% MATCH</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{m.property.area || m.property.location} · {formatCurrency(m.property.price)}</p>
                  <p className="text-xs text-teal-800">{formatMatchSummary(m.factors, m.property)}</p>
                  <p className="text-xs text-muted-foreground">{m.property.propertyType} · {m.property.bedrooms ?? '—'} bed</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant={selected.includes(m.propertyId) ? 'default' : 'outline'} onClick={() => toggle(m.propertyId)}>
                      {selected.includes(m.propertyId) ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
