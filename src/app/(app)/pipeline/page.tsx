import Link from 'next/link';
import { getPipelineCountsAction } from '@/lib/actions/pipeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LEAD_STATUS_LABELS } from '@/lib/constants';

export default async function PipelinePage() {
  const { stages, total } = await getPipelineCountsAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales pipeline</h1>
        <p className="text-muted-foreground">
          {total} active leads across stages — click a stage to view leads.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage) => (
          <Link key={stage.stage} href={`/leads?status=${stage.stage}`}>
            <Card className="transition hover:border-teal-300 hover:shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-slate-700">
                  {LEAD_STATUS_LABELS[stage.stage] ?? stage.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-teal-700">{stage.count}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
