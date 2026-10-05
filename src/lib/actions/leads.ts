'use server';

import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { Lead } from '@/lib/db/models/Lead';
import { Organization } from '@/lib/db/models/Organization';
import { requireOrgSession } from '@/lib/auth/session';
import { agentFilter, orgFilter } from '@/lib/auth/tenant';
import { runLeadAutomation } from '@/lib/services/lead-automation';
import { LEAD_STATUSES, normalizeLeadStatus } from '@/lib/crm/constants';
import mongoose from 'mongoose';

const leadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  budget: z.coerce.number().optional(),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  preferredArea: z.string().optional(),
  preferredCity: z.string().optional(),
  propertyType: z.string().optional(),
  transactionType: z.enum(['sale', 'rent']).default('sale'),
  purpose: z.enum(['living', 'investment']).default('living'),
  buyingTimeline: z.string().optional(),
  source: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  forceCreate: z.boolean().optional(),
});

export async function checkDuplicateLeadAction(phone: string, email?: string) {
  const user = await requireOrgSession();
  await connectDB();
  const orgId = new mongoose.Types.ObjectId(user.organizationId!);
  const or: Record<string, unknown>[] = [{ phone: phone.trim() }];
  const em = email?.trim().toLowerCase();
  if (em) or.push({ email: em });

  const existing = await Lead.findOne({ organizationId: orgId, $or: or }).lean();
  if (!existing) return { duplicate: false as const };
  return {
    duplicate: true as const,
    existingId: existing._id.toString(),
    existingName: existing.name,
    existingPhone: existing.phone,
  };
}

export async function createLeadAction(input: z.infer<typeof leadSchema>) {
  const user = await requireOrgSession();
  const data = leadSchema.parse(input);
  await connectDB();

  const org = await Organization.findById(user.organizationId);
  if (!org) throw new Error('Organization not found');

  const orgId = new mongoose.Types.ObjectId(user.organizationId!);
  if (!data.forceCreate) {
    const dup = await checkDuplicateLeadAction(data.phone, data.email || undefined);
    if (dup.duplicate) {
      return {
        duplicate: true,
        existingId: dup.existingId,
        existingName: dup.existingName,
      };
    }
  }

  const budgetMax = data.budgetMax ?? data.budget;
  const lead = await Lead.create({
    organizationId: orgId,
    ...data,
    email: data.email || undefined,
    budgetMax,
    budget: budgetMax ?? data.budget,
    assignedTo: new mongoose.Types.ObjectId(data.assignedTo || user.id),
    status: 'NEW',
    source: data.source || 'Manual',
  });

  await runLeadAutomation({
    organizationId: lead.organizationId,
    lead,
    createdBy: new mongoose.Types.ObjectId(user.id),
    followUpDays: org.defaults?.followUpDays ?? 2,
  });

  return { id: lead._id.toString(), duplicate: false as const };
}

export async function listLeadsAction(filters?: {
  status?: string;
  priority?: string;
  q?: string;
  page?: number;
}) {
  const user = await requireOrgSession();
  await connectDB();
  const page = filters?.page ?? 1;
  const limit = 20;
  const query: Record<string, unknown> = { ...agentFilter(user) };
  if (filters?.status) {
    const canonical = normalizeLeadStatus(filters.status);
    const legacyMap: Record<string, string[]> = {
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
    query.status = { $in: legacyMap[canonical] ?? [canonical] };
  }
  if (filters?.priority) query.priority = filters.priority;
  if (filters?.q) query.$text = { $search: filters.q };

  const [items, total] = await Promise.all([
    Lead.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Lead.countDocuments(query),
  ]);

  return { items, total, page, pages: Math.ceil(total / limit) };
}

export async function getLeadAction(id: string) {
  const user = await requireOrgSession();
  await connectDB();
  const lead = await Lead.findOne({ _id: id, ...orgFilter(user) }).lean();
  if (!lead) throw new Error('Lead not found');
  return lead;
}

export async function updateLeadStatusAction(leadId: string, status: string) {
  const user = await requireOrgSession();
  const normalized = normalizeLeadStatus(status);
  if (!LEAD_STATUSES.includes(normalized)) {
    throw new Error('Invalid status');
  }
  await connectDB();
  const lead = await Lead.findOneAndUpdate(
    { _id: leadId, ...orgFilter(user) },
    { status: normalized },
    { new: true }
  );
  if (!lead) throw new Error('Lead not found');
  const { Activity } = await import('@/lib/db/models/Activity');
  await Activity.create({
    organizationId: lead.organizationId,
    leadId: lead._id,
    type: 'status_change',
    summary: `Status updated to ${normalized}`,
    createdBy: new mongoose.Types.ObjectId(user.id),
  });
  return { ok: true };
}

export async function addLeadNoteAction(leadId: string, note: string) {
  const user = await requireOrgSession();
  const text = note.trim();
  if (!text) throw new Error('Note required');
  await connectDB();
  const lead = await Lead.findOne({ _id: leadId, ...orgFilter(user) });
  if (!lead) throw new Error('Lead not found');
  lead.notes = lead.notes ? `${lead.notes}\n\n${text}` : text;
  lead.lastContactAt = new Date();
  await lead.save();
  const { Activity } = await import('@/lib/db/models/Activity');
  await Activity.create({
    organizationId: lead.organizationId,
    leadId: lead._id,
    type: 'note',
    summary: text,
    createdBy: new mongoose.Types.ObjectId(user.id),
  });
  return { ok: true };
}

export async function addLeadFollowUpAction(leadId: string, title: string, dueAt: string) {
  const user = await requireOrgSession();
  await connectDB();
  const lead = await Lead.findOne({ _id: leadId, ...orgFilter(user) });
  if (!lead) throw new Error('Lead not found');
  const due = new Date(dueAt);
  const { Task } = await import('@/lib/db/models/Task');
  const { Activity } = await import('@/lib/db/models/Activity');
  await Task.create({
    organizationId: lead.organizationId,
    leadId: lead._id,
    type: 'follow_up',
    title: title.trim() || 'Follow up with customer',
    dueAt: due,
    assignedTo: new mongoose.Types.ObjectId(user.id),
    status: 'pending',
  });
  lead.nextFollowUpAt = due;
  await lead.save();
  await Activity.create({
    organizationId: lead.organizationId,
    leadId: lead._id,
    type: 'follow_up_scheduled',
    summary: `Follow-up scheduled: ${title}`,
    createdBy: new mongoose.Types.ObjectId(user.id),
  });
  return { ok: true };
}
