import Link from 'next/link';
import { listLeadsAction } from '@/lib/actions/leads';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LEAD_STATUS_LABELS } from '@/lib/constants';
import { normalizeLeadStatus } from '@/lib/crm/constants';
import { formatPriorityLabel, priorityBadgeVariant } from '@/lib/crm/priority-ui';

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; q?: string }>;
}) {
  const params = await searchParams;
  const { items } = await listLeadsAction({ status: params.status, priority: params.priority, q: params.q });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Manage customer requirements and follow-ups</p>
        </div>
        <Button asChild><Link href="/leads/new">Add Lead</Link></Button>
      </div>

      <form className="flex gap-2" action="/leads" method="get">
        <input name="q" placeholder="Search name or phone..." className="h-10 flex-1 rounded-md border px-3 text-sm" defaultValue={params.q ?? ''} />
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg font-medium">No leads yet</p>
            <Button asChild className="mt-4"><Link href="/leads/new">Add First Lead</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((lead) => (
            <Link key={lead._id.toString()} href={`/leads/${lead._id.toString()}`}>
              <Card className="hover:border-teal-200">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.phone} · {lead.preferredArea}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityBadgeVariant(lead.priority)}>
                      {formatPriorityLabel(lead.priority)}
                      {lead.score != null ? ` — ${lead.score}/100` : ''}
                    </Badge>
                    <Badge variant="outline">
                      {LEAD_STATUS_LABELS[normalizeLeadStatus(lead.status)] ?? lead.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
