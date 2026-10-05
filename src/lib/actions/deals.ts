'use server';

import { z } from 'zod';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongoose';
import { Deal } from '@/lib/db/models/Deal';
import { Lead } from '@/lib/db/models/Lead';
import { Activity } from '@/lib/db/models/Activity';
import { requireOrgSession, canViewFinancials } from '@/lib/auth/session';
import { orgFilter } from '@/lib/auth/tenant';
import { calculateCommission } from '@/lib/business/commission';
import { Organization } from '@/lib/db/models/Organization';

const dealSchema = z.object({
  leadId: z.string(),
  propertyId: z.string(),
  salePrice: z.coerce.number().positive(),
  commissionPercent: z.coerce.number().min(0).max(100).optional(),
  agentSharePercent: z.coerce.number().min(0).max(100).optional(),
  dealDate: z.coerce.date(),
  notes: z.string().optional(),
});

export async function createDealAction(input: z.infer<typeof dealSchema>) {
  const user = await requireOrgSession();
  if (!canViewFinancials(user.role) && user.role !== 'SALES_AGENT') {
    // agents can create deals for their leads
  }
  const data = dealSchema.parse(input);
  await connectDB();

  const org = await Organization.findById(user.organizationId);
  const commissionPercent = data.commissionPercent ?? org?.defaults?.commissionPercent ?? 2;
  const agentSharePercent = data.agentSharePercent ?? org?.defaults?.agentSharePercent ?? 40;
  const amounts = calculateCommission({
    salePrice: data.salePrice,
    commissionPercent,
    agentSharePercent,
  });

  const existing = await Deal.findOne({
    ...orgFilter(user),
    leadId: data.leadId,
    propertyId: data.propertyId,
    status: { $ne: 'cancelled' },
  });
  if (existing) throw new Error('Deal already exists for this lead and property');

  const deal = await Deal.create({
    organizationId: new mongoose.Types.ObjectId(user.organizationId!),
    leadId: new mongoose.Types.ObjectId(data.leadId),
    propertyId: new mongoose.Types.ObjectId(data.propertyId),
    agentId: new mongoose.Types.ObjectId(user.id),
    salePrice: data.salePrice,
    commissionPercent,
    agentSharePercent,
    ...amounts,
    dealDate: data.dealDate,
    notes: data.notes,
    status: 'open',
  });

  await Lead.findOneAndUpdate(
    { _id: data.leadId, ...orgFilter(user) },
    { status: 'Negotiation' }
  );

  await Activity.create({
    organizationId: deal.organizationId,
    leadId: deal.leadId,
    dealId: deal._id,
    type: 'deal_created',
    summary: 'Deal created',
    createdBy: new mongoose.Types.ObjectId(user.id),
  });

  return { id: deal._id.toString() };
}

export async function listDealsAction() {
  const user = await requireOrgSession();
  await connectDB();
  const deals = await Deal.find(orgFilter(user)).sort({ dealDate: -1 }).limit(100).lean();
  if (!canViewFinancials(user.role)) {
    return deals.map((d) => ({ ...d, companyCommission: undefined, commissionAmount: undefined }));
  }
  return deals;
}
