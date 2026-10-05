'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  updateLeadStatusAction,
  addLeadNoteAction,
  addLeadFollowUpAction,
} from '@/lib/actions/leads';
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/constants';
import { normalizeLeadStatus } from '@/lib/crm/constants';

export function LeadOwnerActions({
  leadId,
  phone,
  whatsapp,
  currentStatus,
  matchCount,
}: {
  leadId: string;
  phone: string;
  whatsapp?: string;
  currentStatus: string;
  matchCount: number;
}) {
  const router = useRouter();
  const wa = (whatsapp || phone).replace(/\D/g, '');
  const [note, setNote] = useState('');
  const [followTitle, setFollowTitle] = useState('Follow up with customer');
  const [followDate, setFollowDate] = useState('');

  async function onStatusChange(status: string) {
    await updateLeadStatusAction(leadId, status);
    router.refresh();
  }

  async function onNote() {
    if (!note.trim()) return;
    await addLeadNoteAction(leadId, note);
    setNote('');
    router.refresh();
  }

  async function onFollowUp() {
    if (!followDate) return;
    await addLeadFollowUpAction(leadId, followTitle, followDate);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={`tel:${phone}`}>Call</a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={`#matching-properties`}>Send Properties{matchCount > 0 ? ` (${matchCount})` : ''}</a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={`/site-visits/new?leadId=${leadId}`}>Schedule Visit</a>
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <select
          className="h-10 w-full rounded-md border px-3 text-sm"
          value={normalizeLeadStatus(currentStatus)}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{LEAD_STATUS_LABELS[s] ?? s}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Add note</Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Customer called, wants DHA options..." />
        <Button size="sm" variant="secondary" onClick={onNote}>Save note</Button>
      </div>

      <div className="space-y-2 rounded-lg border bg-slate-50 p-3">
        <Label>Add follow-up</Label>
        <Input value={followTitle} onChange={(e) => setFollowTitle(e.target.value)} />
        <Input type="datetime-local" value={followDate} onChange={(e) => setFollowDate(e.target.value)} />
        <Button size="sm" onClick={onFollowUp}>Schedule follow-up</Button>
      </div>
    </div>
  );
}
