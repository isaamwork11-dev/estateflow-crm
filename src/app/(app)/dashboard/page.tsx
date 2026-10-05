import Link from 'next/link';
import { getOwnerDashboardAction } from '@/lib/actions/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default async function DashboardPage() {
  const data = await getOwnerDashboardAction();
  const m = data.metrics;

  const statCards = [
    { label: 'Total Leads', value: m.totalLeads, href: '/leads' },
    { label: 'New Leads', value: m.newLeads, href: '/leads?status=New' },
    { label: 'Hot Leads', value: m.hotLeads, href: '/leads?priority=HOT' },
    { label: 'Follow-ups Today', value: m.followUpsToday, href: '/leads' },
    { label: 'Upcoming Visits', value: m.upcomingVisits, href: '/site-visits' },
    { label: 'Active Deals', value: m.activeDeals, href: '/deals' },
    { label: 'Closed Deals', value: m.closedDeals, href: '/deals' },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-700 to-teal-600 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold md:text-3xl">
          {greeting()}, {data.userName.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-teal-50">Your business today — leads, visits, and revenue at a glance</p>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-xs text-teal-100">Leads</p>
            <p className="text-2xl font-bold">{m.totalLeads}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-xs text-teal-100">Hot</p>
            <p className="text-2xl font-bold">{m.hotLeads}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-xs text-teal-100">Follow-ups</p>
            <p className="text-2xl font-bold">{m.followUpsToday}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-xs text-teal-100">Site visits</p>
            <p className="text-2xl font-bold">{m.upcomingVisits}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="transition hover:border-teal-200 hover:shadow-md">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
                <p className="text-3xl font-bold text-slate-900">{c.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.todaysActions.length === 0 ? (
              <p className="text-sm text-muted-foreground">You&apos;re all caught up for today.</p>
            ) : (
              data.todaysActions.map((line) => (
                <p key={line} className="flex gap-2 text-sm">
                  <span className="text-teal-600">→</span>
                  {line}
                </p>
              ))
            )}
            <Button asChild size="sm" className="mt-3">
              <Link href="/leads/new">Add Lead</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-teal-100 bg-teal-50/30">
          <CardHeader>
            <CardTitle>Revenue This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Total sale value</p>
            <p className="text-2xl font-bold">{formatCurrency(m.totalSaleValue)}</p>
            <p className="text-sm text-muted-foreground">Expected commission</p>
            <p className="text-xl font-semibold text-teal-800">{formatCurrency(m.expectedCommission)}</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/reports">View reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Leads</CardTitle>
            <Link href="/leads" className="text-sm text-teal-700">View all</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentLeads.map((lead) => (
              <Link
                key={lead._id.toString()}
                href={`/leads/${lead._id.toString()}`}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-slate-50"
              >
                <span className="font-medium">{lead.name}</span>
                <Badge variant={lead.priority === 'HOT' ? 'hot' : lead.priority === 'WARM' ? 'warm' : 'cold'}>
                  {lead.priority}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Properties (Interest)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topProperties.length === 0 ? (
              <p className="text-sm text-muted-foreground">Share property links with clients to track interest here.</p>
            ) : (
              data.topProperties.map((p) => (
                <div key={p.id} className="flex justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.area}</p>
                  </div>
                  <Badge variant="outline">{p.interestCount} interested</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
