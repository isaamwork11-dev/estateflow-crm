'use server';

import { z } from 'zod';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongoose';
import { Property } from '@/lib/db/models/Property';
import { requireOrgSession } from '@/lib/auth/session';
import { orgFilter } from '@/lib/auth/tenant';
import { matchPropertiesForLead } from '@/lib/matching/property-match';
import { Lead } from '@/lib/db/models/Lead';

const propertySchema = z.object({
  propertyCode: z.string().min(2),
  title: z.string().min(2),
  transactionType: z.enum(['sale', 'rent']),
  price: z.coerce.number().positive(),
  propertyType: z.string(),
  area: z.string().optional(),
  size: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  location: z.string().optional(),
  society: z.string().optional(),
  city: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export async function listPropertiesAction(filters?: { q?: string; page?: number }) {
  const user = await requireOrgSession();
  await connectDB();
  const page = filters?.page ?? 1;
  const limit = 20;
  const query: Record<string, unknown> = { ...orgFilter(user), availability: { $ne: 'archived' } };
  if (filters?.q) {
    query.$or = [
      { title: new RegExp(filters.q, 'i') },
      { propertyCode: new RegExp(filters.q, 'i') },
      { area: new RegExp(filters.q, 'i') },
    ];
  }
  const [items, total] = await Promise.all([
    Property.find(query).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Property.countDocuments(query),
  ]);
  return { items, total, page };
}

export async function createPropertyAction(input: z.infer<typeof propertySchema>) {
  const user = await requireOrgSession();
  const data = propertySchema.parse(input);
  await connectDB();
  const property = await Property.create({
    organizationId: new mongoose.Types.ObjectId(user.organizationId!),
    ...data,
    assignedTo: new mongoose.Types.ObjectId(user.id),
  });

  const { findMatchingLeadsForProperty, summarizeReverseMatches } = await import(
    '@/lib/matching/reverse-match'
  );
  const leads = await Lead.find({
    ...orgFilter(user),
    status: { $nin: ['WON', 'LOST', 'Won', 'Lost'] },
  }).limit(500);
  const reverseMatches = findMatchingLeadsForProperty(property, leads);
  const reverseSummary = summarizeReverseMatches(reverseMatches);

  return {
    id: property._id.toString(),
    reverseMatchSummary: reverseSummary,
  };
}

export async function matchPropertiesForLeadAction(leadId: string) {
  const user = await requireOrgSession();
  await connectDB();
  const lead = await Lead.findOne({ _id: leadId, ...orgFilter(user) });
  if (!lead) throw new Error('Lead not found');
  const properties = await Property.find({ ...orgFilter(user), availability: 'available' }).limit(300);
  return matchPropertiesForLead(properties, {
    budget: lead.budgetMax ?? lead.budget ?? undefined,
    preferredArea: lead.preferredArea ?? undefined,
    city: lead.preferredCity ?? undefined,
    propertyType: lead.propertyType ?? undefined,
    transactionType: lead.transactionType,
    bedrooms: lead.bedrooms ?? undefined,
    purpose:
      lead.purpose === 'living' || lead.purpose === 'investment' ? lead.purpose : undefined,
  });
}

export async function getReverseMatchesForPropertyAction(propertyId: string) {
  const user = await requireOrgSession();
  await connectDB();
  const property = await Property.findOne({ _id: propertyId, ...orgFilter(user) });
  if (!property) throw new Error('Property not found');
  const { findMatchingLeadsForProperty, summarizeReverseMatches } = await import(
    '@/lib/matching/reverse-match'
  );
  const leads = await Lead.find({
    ...orgFilter(user),
    status: { $nin: ['WON', 'LOST', 'Won', 'Lost'] },
  }).limit(500);
  const matches = findMatchingLeadsForProperty(property, leads);
  return { matches, summary: summarizeReverseMatches(matches) };
}

export async function getPropertyAction(id: string) {
  const user = await requireOrgSession();
  await connectDB();
  const property = await Property.findOne({ _id: id, ...orgFilter(user) }).lean();
  if (!property) throw new Error('Not found');
  return property;
}

export async function updatePropertyAction(id: string, input: Record<string, unknown>) {
  const user = await requireOrgSession();
  await connectDB();
  const property = await Property.findOneAndUpdate(
    { _id: id, ...orgFilter(user) },
    { $set: input },
    { new: true }
  );
  if (!property) throw new Error('Not found');
  return { id: property._id.toString() };
}

export async function archivePropertyAction(id: string) {
  return updatePropertyAction(id, { availability: 'archived' });
}
