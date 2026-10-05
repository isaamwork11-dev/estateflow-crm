import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db/mongoose';
import { getPropertyAction, getReverseMatchesForPropertyAction } from '@/lib/actions/properties';
import { propertyCompleteness } from '@/lib/properties/completeness';
import { SiteVisit } from '@/lib/db/models/SiteVisit';
import { Deal } from '@/lib/db/models/Deal';
import { Activity } from '@/lib/db/models/Activity';
import { requireOrgSession } from '@/lib/auth/session';
import { orgFilter } from '@/lib/auth/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireOrgSession();
  let property;
  try {
    property = await getPropertyAction(id);
  } catch {
    notFound();
  }

  const { summary: reverseSummary } = await getReverseMatchesForPropertyAction(id);
  const completeness = propertyCompleteness(property);

  await connectDB();
  const [visits, deal, interestActivities] = await Promise.all([
    SiteVisit.find({ propertyId: id, ...orgFilter(user) }).countDocuments(),
    Deal.findOne({ propertyId: id, ...orgFilter(user) }).lean(),
    Activity.countDocuments({
      ...orgFilter(user),
      propertyId: id,
      type: { $in: ['presentation_interested', 'presentation_site_visit_request'] },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <h1 className="text-3xl font-bold">{property.title}</h1>
        <Button asChild variant="outline"><Link href={`/properties/${id}/edit`}>Edit</Link></Button>
      </div>
      {property.images?.[0] && (
        <Image src={property.images[0]} alt="" width={900} height={400} className="h-56 w-full rounded-xl object-cover" />
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Price</p><p className="text-xl font-bold">{formatCurrency(property.price)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Interest signals</p><p className="text-xl font-bold">{interestActivities}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Site visits</p><p className="text-xl font-bold">{visits}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Matching leads</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <p className="text-lg font-semibold text-teal-700">{reverseSummary.total} matching leads</p>
          <p className="text-muted-foreground">
            {reverseSummary.hot} hot · {reverseSummary.warm} warm · {reverseSummary.cold} cold
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Listing quality</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <p className="font-medium">Completeness: {completeness.percent}%</p>
          {completeness.missing.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-muted-foreground">
              {completeness.missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1">
          <p>{property.area} · {property.bedrooms} bed · {property.propertyType}</p>
          <p>Status: {property.availability}</p>
          <p>{property.description}</p>
          {deal && <p className="pt-2 font-medium">Deal: {formatCurrency(deal.salePrice)} ({deal.status})</p>}
        </CardContent>
      </Card>
    </div>
  );
}
