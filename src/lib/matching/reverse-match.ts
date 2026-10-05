import type { PropertyDocument } from '@/lib/db/models/Property';
import type { LeadDocument } from '@/lib/db/models/Lead';
import { scorePropertyForLead, type LeadMatchCriteria } from './property-match';
import { calculateLeadScore } from '@/lib/scoring/lead-score';

export interface ReverseMatchLead {
  leadId: string;
  leadName: string;
  matchPercent: number;
  scoreBand: string;
  priority: string;
}

export function leadCriteriaFromDocument(lead: LeadDocument): LeadMatchCriteria {
  return {
    budget: lead.budgetMax ?? lead.budget ?? undefined,
    preferredArea: lead.preferredArea ?? lead.preferredAreas?.[0] ?? undefined,
    city: lead.preferredCity ?? undefined,
    propertyType: normalizePropertyType(lead.propertyType),
    transactionType: lead.transactionType === 'rent' ? 'rent' : 'sale',
    bedrooms: lead.bedrooms ?? undefined,
    purpose:
      lead.purpose === 'living' || lead.purpose === 'investment' ? lead.purpose : undefined,
  };
}

function normalizePropertyType(t?: string | null): string | undefined {
  if (!t) return undefined;
  const v = t.toLowerCase();
  if (v === 'flat' || v === 'apartment') return 'apartment';
  return v;
}

export function findMatchingLeadsForProperty(
  property: PropertyDocument,
  leads: LeadDocument[],
  minPercent = 50
): ReverseMatchLead[] {
  const results: ReverseMatchLead[] = [];

  for (const lead of leads) {
    const criteria = leadCriteriaFromDocument(lead);
    const { percent } = scorePropertyForLead(property, criteria);
    if (percent < minPercent) continue;

    const score = calculateLeadScore({
      budgetMax: lead.budgetMax ?? lead.budget,
      preferredArea: lead.preferredArea,
      preferredCity: lead.preferredCity,
      propertyType: lead.propertyType,
      status: lead.status,
      hasSiteVisit: false,
    });

    results.push({
      leadId: lead._id.toString(),
      leadName: lead.name,
      matchPercent: percent,
      scoreBand: score.band,
      priority: score.priority,
    });
  }

  return results.sort((a, b) => b.matchPercent - a.matchPercent);
}

export function summarizeReverseMatches(matches: ReverseMatchLead[]) {
  const hot = matches.filter((m) => m.priority === 'HOT' || m.priority === 'VERY_HOT').length;
  const warm = matches.filter((m) => m.priority === 'WARM').length;
  const cold = matches.filter((m) => m.priority === 'COLD').length;
  return { total: matches.length, hot, warm, cold };
}
