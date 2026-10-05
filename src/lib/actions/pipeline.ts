'use server';

import { connectDB } from '@/lib/db/mongoose';
import { Lead } from '@/lib/db/models/Lead';
import { requireOrgSession } from '@/lib/auth/session';
import { agentFilter } from '@/lib/auth/tenant';
import { LEAD_STATUSES, normalizeLeadStatus, type LeadStatus } from '@/lib/crm/constants';

const LEGACY_STATUS_MAP: Record<LeadStatus, string[]> = {
  NEW: ['NEW', 'New'],
  CONTACTED: ['CONTACTED', 'Contacted'],
  QUALIFIED: ['QUALIFIED', 'Qualified'],
  PROPERTY_SHARED: ['PROPERTY_SHARED', 'Property Sent'],
  SITE_VISIT: ['SITE_VISIT', 'Site Visit'],
  NEGOTIATION: ['NEGOTIATION', 'Negotiation'],
  BOOKED: ['BOOKED', 'Booked'],
  WON: ['WON', 'Won'],
  LOST: ['LOST', 'Lost'],
  NURTURE: ['NURTURE', 'Follow-up Later'],
};

export async function getPipelineCountsAction() {
  const user = await requireOrgSession();
  await connectDB();
  const base = agentFilter(user);

  const rows = await Lead.aggregate<{ _id: string; count: number }>([
    { $match: base },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const byRaw = new Map(rows.map((r) => [r._id, r.count]));

  const stages = LEAD_STATUSES.map((stage) => {
    const aliases = LEGACY_STATUS_MAP[stage];
    const count = aliases.reduce((sum, alias) => sum + (byRaw.get(alias) ?? 0), 0);
    return { stage, label: stage.replace(/_/g, ' '), count };
  });

  const total = stages.reduce((a, s) => a + s.count, 0);
  return { stages, total };
}

export async function listLeadsByPipelineStageAction(stage: string) {
  const user = await requireOrgSession();
  await connectDB();
  const canonical = normalizeLeadStatus(stage);
  const statuses = LEGACY_STATUS_MAP[canonical] ?? [canonical];
  const items = await Lead.find({ ...agentFilter(user), status: { $in: statuses } })
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();
  return { stage: canonical, items };
}
