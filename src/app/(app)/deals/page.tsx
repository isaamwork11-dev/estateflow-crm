import Link from 'next/link';
import { listDealsAction } from '@/lib/actions/deals';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { getAppSession, canViewFinancials } from '@/lib/auth/session';

export default async function DealsPage() {
  const user = await getAppSession();
  const deals = await listDealsAction();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Deals</h1>
        <Button asChild><Link href="/deals/new">Record deal</Link></Button>
      </div>
      {deals.length === 0 ? (
        <Card><CardContent className="p-8 text-center">No deals yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <Card key={deal._id.toString()}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{formatCurrency(deal.salePrice)}</p>
                  <p className="text-sm text-muted-foreground">{new Date(deal.dealDate).toLocaleDateString()} · {deal.status}</p>
                </div>
                {user && canViewFinancials(user.role) && deal.commissionAmount != null && (
                  <p className="text-sm">Commission: {formatCurrency(deal.commissionAmount)}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
