import Link from 'next/link';
import { listPropertiesAction } from '@/lib/actions/properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default async function PropertiesPage() {
  const { items } = await listPropertiesAction();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Properties</h1>
        <Button asChild><Link href="/properties/new">Add Property</Link></Button>
      </div>
      {items.length === 0 ? (
        <Card><CardContent className="p-8 text-center">No properties yet. <Link href="/properties/new" className="text-teal-700 underline">Add property</Link></CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((p) => (
            <Card key={p._id.toString()}>
              <CardContent className="p-4">
                <Link href={`/properties/${p._id.toString()}`} className="font-semibold hover:text-teal-700">{p.title}</Link>
                <p className="text-sm text-muted-foreground">{p.propertyCode} · {p.area}</p>
                <p className="mt-2 text-lg font-bold">{formatCurrency(p.price)}</p>
                <p className="text-sm capitalize">{p.availability}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
