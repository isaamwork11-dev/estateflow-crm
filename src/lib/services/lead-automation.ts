import { addDays } from 'date-fns';
import { Activity } from '@/lib/db/models/Activity';
import { Lead } from '@/lib/db/models/Lead';
import { Property } from '@/lib/db/models/Property';
import { SiteVisit } from '@/lib/db/models/SiteVisit';
import { Task } from '@/lib/db/models/Task';
import type { LeadDocument } from '@/lib/db/models/Lead';
import { matchPropertiesForLead } from '@/lib/matching/property-match';
import { calculateLeadScore } from '@/lib/scoring/lead-score';
import mongoose from 'mongoose';

export async function runLeadAutomation(params: {
  organizationId: mongoose.Types.ObjectId;
  lead: LeadDocument;
  createdBy: mongoose.Types.ObjectId;
  followUpDays: number;
}) {
  const properties = await Property.find({
    organizationId: params.organizationId,
    availability: 'available',
  }).limit(200);

  const matches = matchPropertiesForLead(properties, {
    budget: params.lead.budgetMax ?? params.lead.budget ?? undefined,
    preferredArea: params.lead.preferredArea ?? undefined,
    city: params.lead.preferredCity ?? undefined,
    propertyType: params.lead.propertyType ?? undefined,
    transactionType: params.lead.transactionType,
    bedrooms: params.lead.bedrooms ?? undefined,
    purpose:
      params.lead.purpose === 'living' || params.lead.purpose === 'investment'
        ? params.lead.purpose
        : undefined,
  });

  const siteVisit = await SiteVisit.findOne({
    organizationId: params.organizationId,
    leadId: params.lead._id,
    status: { $in: ['Scheduled', 'Confirmed'] },
  });

  const scoreResult = calculateLeadScore({
    budgetMax: params.lead.budgetMax ?? params.lead.budget,
    budgetMin: params.lead.budgetMin,
    preferredCity: params.lead.preferredCity,
    preferredArea: params.lead.preferredArea,
    propertyType: params.lead.propertyType,
    selectedPropertyId: params.lead.selectedPropertyId?.toString(),
    phoneVerified: params.lead.phoneVerified,
    status: params.lead.status,
    lastContactAt: params.lead.lastContactAt,
    hasSiteVisit: Boolean(siteVisit),
  });

  const reasons = [...scoreResult.reasons];
  if (matches.length > 0) {
    reasons.push(`Budget matches ${matches.length} propert${matches.length === 1 ? 'y' : 'ies'}`);
  }
  if (siteVisit) reasons.push('Site visit scheduled ✓');

  await Lead.findByIdAndUpdate(params.lead._id, {
    score: scoreResult.score,
    priority: scoreResult.priority,
    scoreReasons: reasons,
  });

  const dueAt = addDays(new Date(), params.followUpDays);
  const nextTitle =
    matches.length > 0 ? 'Send matching properties to customer' : 'Call customer to qualify requirement';

  await Task.create({
    organizationId: params.organizationId,
    leadId: params.lead._id,
    type: matches.length > 0 ? 'send_properties' : 'call',
    title: nextTitle,
    dueAt,
    assignedTo: params.lead.assignedTo ?? params.createdBy,
    status: 'pending',
  });

  await Activity.create({
    organizationId: params.organizationId,
    leadId: params.lead._id,
    type: 'lead_created',
    summary: 'Lead created',
    createdBy: params.createdBy,
    metadata: { matchingCount: matches.length, priority: scoreResult.priority },
  });

  return { matches, scoreResult };
}
