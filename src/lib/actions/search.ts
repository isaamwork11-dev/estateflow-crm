'use server';

import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongoose';
import { Lead } from '@/lib/db/models/Lead';
import { Property } from '@/lib/db/models/Property';
import { Deal } from '@/lib/db/models/Deal';
import { User } from '@/lib/db/models/User';
import { requireOrgSession } from '@/lib/auth/session';
import { orgFilter } from '@/lib/auth/tenant';

export async function globalSearchAction(q: string) {
  const user = await requireOrgSession();
  const term = q.trim();
  if (term.length < 2) {
    return { leads: [], properties: [], deals: [], agents: [] };
  }
  await connectDB();
  const base = orgFilter(user);
  const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const orgId = new mongoose.Types.ObjectId(user.organizationId!);

  const [leads, properties, deals, agents] = await Promise.all([
    Lead.find({
      ...base,
      $or: [{ name: regex }, { phone: regex }, { email: regex }, { preferredArea: regex }],
    })
      .limit(8)
      .select('name phone status priority')
      .lean(),
    Property.find({
      ...base,
      $or: [
        { title: regex },
        { propertyCode: regex },
        { referenceNumber: regex },
        { area: regex },
        { city: regex },
      ],
    })
      .limit(8)
      .select('title propertyCode area price')
      .lean(),
    Deal.find({
      ...base,
      $or: [{ salePrice: Number(term) || -1 }, { status: regex }],
    })
      .limit(6)
      .select('status salePrice leadId')
      .lean(),
    User.find({ organizationId: orgId, name: regex })
      .limit(6)
      .select('name email role')
      .lean(),
  ]);

  return { leads, properties, deals, agents };
}
