import Link from 'next/link';
import { listTodayTasksAction } from '@/lib/actions/tasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TodayTaskActions } from '@/components/today/task-actions';

export default async function TodayPage() {
  const tasks = await listTodayTasksAction();

  const hotCount = tasks.filter((t) => {
    const lead = t.leadId as { priority?: string } | null;
    return lead?.priority === 'HOT';
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Today&apos;s Work</h1>
        <p className="text-muted-foreground">Your follow-up queue for today</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-sm">Hot Leads</p><p className="text-2xl font-bold">{hotCount}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm">Follow-ups</p><p className="text-2xl font-bold">{tasks.length}</p></CardContent></Card>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg font-medium">You&apos;re all caught up for today</p>
            <p className="text-muted-foreground">No pending tasks due.</p>
            <Button asChild className="mt-4"><Link href="/leads/new">Add Lead</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const lead = task.leadId as unknown as {
              _id: string;
              name?: string;
              phone?: string;
              preferredArea?: string;
              priority?: string;
            } | null;
            return (
              <Card key={task._id.toString()}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">{lead?.name ?? 'Lead'}</CardTitle>
                    {lead?.priority && (
                      <Badge variant={lead.priority === 'HOT' ? 'hot' : lead.priority === 'WARM' ? 'warm' : 'cold'}>
                        {lead.priority}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{lead?.preferredArea}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-teal-700">Next Action</p>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">Due {new Date(task.dueAt).toLocaleString()}</p>
                  </div>
                  <TodayTaskActions taskId={task._id.toString()} phone={lead?.phone} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
