import { connectDB } from '@/lib/db/mongoose';
import { SiteVisit } from '@/lib/db/models/SiteVisit';
import { requireOrgSession } from '@/lib/auth/session';
import { orgFilter } from '@/lib/auth/tenant';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function SiteVisitsPage() {
  const user = await requireOrgSession();
  await connectDB();
  const visits = await SiteVisit.find(orgFilter(user)).sort({ date: 1 }).limit(50).populate('leadId', 'name').populate('propertyId', 'title').lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Site Visits</h1>
        <Button asChild><Link href="/site-visits/new">Schedule visit</Link></Button>
      </div>
      {visits.length === 0 ? (
        <Card><CardContent className="p-8 text-center">No site visits scheduled</CardContent></Card>
      ) : (
        visits.map((v) => {
          const lead = v.leadId as { name?: string } | null;
          const property = v.propertyId as { title?: string } | null;
          return (
            <Card key={v._id.toString()}>
              <CardContent className="p-4">
                <p className="font-semibold">{lead?.name} → {property?.title}</p>
                <p className="text-sm text-muted-foreground">{new Date(v.date).toLocaleDateString()} {v.time} · {v.status}</p>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
