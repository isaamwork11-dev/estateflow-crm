import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db/mongoose';
import { Activity } from '@/lib/db/models/Activity';
import { Task } from '@/lib/db/models/Task';
import { SiteVisit } from '@/lib/db/models/SiteVisit';
import { Deal } from '@/lib/db/models/Deal';
import { getLeadAction } from '@/lib/actions/leads';
import { matchPropertiesForLeadAction } from '@/lib/actions/properties';
import { requireOrgSession } from '@/lib/auth/session';
import { orgFilter } from '@/lib/auth/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeadMatchPanel } from '@/components/leads/lead-match-panel';
import { LeadOwnerActions } from '@/components/leads/lead-owner-actions';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireOrgSession();
  let lead;
  try {
    lead = await getLeadAction(id);
  } catch {
    notFound();
  }

  await connectDB();
  const [activities, nextTask, matches, visits, deal] = await Promise.all([
    Activity.find({ leadId: id, ...orgFilter(user) }).sort({ createdAt: -1 }).limit(30).lean(),
    Task.findOne({ leadId: id, ...orgFilter(user), status: 'pending' }).sort({ dueAt: 1 }).lean(),
    matchPropertiesForLeadAction(id),
    SiteVisit.find({ leadId: id, ...orgFilter(user) }).sort({ date: -1 }).populate('propertyId', 'title area').lean(),
    Deal.findOne({ leadId: id, ...orgFilter(user) }).sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">{lead.name}</h1>
            <p className="text-muted-foreground">{lead.phone}</p>
          </div>
          <Badge variant={lead.priority === 'HOT' ? 'hot' : lead.priority === 'WARM' ? 'warm' : 'cold'}>
            {lead.priority}
          </Badge>
        </div>

        <Card>
          <CardHeader><CardTitle>Lead score</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {(lead.scoreReasons ?? []).map((r: string) => <p key={r}>{r}</p>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Requirement</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <p>Budget: {lead.budget ? formatCurrency(lead.budget) : '—'}</p>
            <p>Area: {lead.preferredArea || '—'}</p>
            <p>Type: {lead.propertyType || '—'}</p>
            <p>Sale/Rent: {lead.transactionType}</p>
            <p>Status: {lead.status}</p>
            {lead.notes && <p className="sm:col-span-2">Notes: {lead.notes}</p>}
          </CardContent>
        </Card>

        <div id="matching-properties">
          <LeadMatchPanel leadId={id} initialMatches={matches} />
        </div>

        <Card>
          <CardHeader><CardTitle>Site visits</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {visits.length === 0 ? <p className="text-muted-foreground">No visits yet</p> : null}
            {visits.map((v) => {
              const prop = v.propertyId as { title?: string; area?: string } | null;
              return (
                <p key={v._id.toString()}>
                  {new Date(v.date).toLocaleDateString()} {v.time} — {prop?.title || prop?.area} ({v.status})
                </p>
              );
            })}
          </CardContent>
        </Card>

        {deal && (
          <Card>
            <CardHeader><CardTitle>Deal</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <p>Sale: {formatCurrency(deal.salePrice)}</p>
              <p>Commission: {deal.commissionPercent}% ({formatCurrency(deal.commissionAmount)})</p>
              <p>Status: {deal.status}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {activities.map((a) => (
              <div key={a._id.toString()} className="border-l-2 border-teal-200 pl-3">
                <p className="font-medium">{a.summary}</p>
                <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="border-teal-200 shadow-sm">
          <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
          <CardContent>
            <LeadOwnerActions
              leadId={id}
              phone={lead.phone}
              whatsapp={lead.whatsapp ?? undefined}
              currentStatus={lead.status}
              matchCount={matches.length}
            />
          </CardContent>
        </Card>
        {nextTask && (
          <Card>
            <CardHeader><CardTitle>Next follow-up</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{nextTask.title}</p>
              <p className="text-muted-foreground">Due {new Date(nextTask.dueAt).toLocaleString()}</p>
            </CardContent>
          </Card>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href="/leads">Back to leads</Link>
        </Button>
      </div>
    </div>
  );
}
