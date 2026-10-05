import { NextRequest, NextResponse } from 'next/server';
import { runFollowUpMaintenanceCron } from '@/lib/services/follow-up-cron';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 });
  }

  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runFollowUpMaintenanceCron();
  return NextResponse.json({ ok: true, ...result });
}
