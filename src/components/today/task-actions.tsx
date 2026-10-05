'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { completeTaskAction } from '@/lib/actions/tasks';

export function TodayTaskActions({ taskId, phone }: { taskId: string; phone?: string }) {
  const router = useRouter();

  async function markDone() {
    await completeTaskAction(taskId);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {phone && (
        <Button asChild size="sm" variant="outline">
          <a href={`tel:${phone}`}>Call</a>
        </Button>
      )}
      {phone && (
        <Button asChild size="sm" variant="outline">
          <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </Button>
      )}
      <Button size="sm" onClick={markDone}>Done</Button>
    </div>
  );
}
