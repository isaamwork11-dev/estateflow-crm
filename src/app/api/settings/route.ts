import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongoose';
import { Organization } from '@/lib/db/models/Organization';
import { User } from '@/lib/db/models/User';
import { getAppSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getAppSession();
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const [org, user] = await Promise.all([
    Organization.findById(session.organizationId).lean(),
    User.findById(session.id).lean(),
  ]);
  return NextResponse.json({ org, user });
}
