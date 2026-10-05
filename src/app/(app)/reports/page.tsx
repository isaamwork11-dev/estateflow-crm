import { getOwnerReportsAction } from '@/lib/actions/reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default async function ReportsPage() {
  const r = await getOwnerReportsAction();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <p className="text-muted-foreground">Simple overview of your property business this month</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Leads this month</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{r.leadsThisMonth}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Site visits</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{r.visits}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Won / Lost</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{r.won} / {r.lost}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Commission</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatCurrency(r.totalCommission)}</CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Lead priority</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p>Hot: <strong>{r.hot}</strong></p>
            <p>Warm: <strong>{r.warm}</strong></p>
            <p>Cold: <strong>{r.cold}</strong></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Leads by status</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {r.byStatus.map((s) => (
              <p key={s.status} className="flex justify-between"><span>{s.status}</span><strong>{s.count}</strong></p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-teal-100 bg-teal-50/40">
        <CardHeader><CardTitle>Total sales (this month)</CardTitle></CardHeader>
        <CardContent className="text-3xl font-bold">{formatCurrency(r.totalSales)}</CardContent>
      </Card>
    </div>
  );
}
