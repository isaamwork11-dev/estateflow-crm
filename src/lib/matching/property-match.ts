import type { PropertyDocument } from '@/lib/db/models/Property';

export interface LeadMatchCriteria {
  budget?: number;
  preferredArea?: string;
  city?: string;
  propertyType?: string;
  transactionType?: 'sale' | 'rent';
  bedrooms?: number;
  purpose?: 'living' | 'investment';
}

export interface MatchFactor {
  key: string;
  label: string;
  matched: boolean;
  weight: number;
}

export interface PropertyMatchResult {
  propertyId: string;
  percent: number;
  factors: MatchFactor[];
  property: PropertyDocument;
}

const WEIGHTS = {
  budget: 25,
  area: 20,
  propertyType: 20,
  bedrooms: 15,
  transactionType: 10,
  purpose: 10,
};

function areaMatches(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x.includes(y) || y.includes(x);
}

export function formatMatchSummary(
  factors: MatchFactor[],
  property?: { bedrooms?: number | null }
): string {
  const parts: string[] = [];
  for (const f of factors) {
    if (!f.matched) continue;
    if (f.key === 'budget') parts.push('Within budget');
    if (f.key === 'area') parts.push('Preferred area');
    if (f.key === 'propertyType') parts.push('Property type');
    if (f.key === 'bedrooms' && property?.bedrooms != null) {
      parts.push(`${property.bedrooms} bedroom${property.bedrooms > 1 ? 's' : ''}`);
    }
    if (f.key === 'transactionType') parts.push('Sale/Rent match');
  }
  return parts.join(' • ') || 'Good match';
}

export function scorePropertyForLead(
  property: PropertyDocument,
  criteria: LeadMatchCriteria
): { percent: number; factors: MatchFactor[] } {
  const factors: MatchFactor[] = [];
  let earned = 0;
  let total = 0;

  if (criteria.budget != null && criteria.budget > 0) {
    total += WEIGHTS.budget;
    const matched = property.price <= criteria.budget;
    if (matched) earned += WEIGHTS.budget;
    factors.push({ key: 'budget', label: 'Budget', matched, weight: WEIGHTS.budget });
  }

  if (criteria.preferredArea) {
    total += WEIGHTS.area;
    const matched =
      areaMatches(property.area ?? undefined, criteria.preferredArea) ||
      areaMatches(property.location ?? undefined, criteria.preferredArea) ||
      areaMatches(property.society ?? undefined, criteria.preferredArea);
    if (matched) earned += WEIGHTS.area;
    factors.push({ key: 'area', label: 'Area', matched, weight: WEIGHTS.area });
  }

  if (criteria.propertyType) {
    total += WEIGHTS.propertyType;
    const matched = property.propertyType === criteria.propertyType;
    if (matched) earned += WEIGHTS.propertyType;
    factors.push({ key: 'propertyType', label: 'Property Type', matched, weight: WEIGHTS.propertyType });
  }

  if (criteria.bedrooms != null) {
    total += WEIGHTS.bedrooms;
    const matched = property.bedrooms === criteria.bedrooms;
    if (matched) earned += WEIGHTS.bedrooms;
    factors.push({ key: 'bedrooms', label: 'Bedrooms', matched, weight: WEIGHTS.bedrooms });
  }

  if (criteria.transactionType) {
    total += WEIGHTS.transactionType;
    const matched = property.transactionType === criteria.transactionType;
    if (matched) earned += WEIGHTS.transactionType;
    factors.push({ key: 'transactionType', label: 'Sale/Rent', matched, weight: WEIGHTS.transactionType });
  }

  if (criteria.purpose) {
    total += WEIGHTS.purpose;
    earned += WEIGHTS.purpose;
    factors.push({ key: 'purpose', label: 'Purpose noted', matched: true, weight: WEIGHTS.purpose });
  }

  const percent = total === 0 ? 0 : Math.round((earned / total) * 100);
  return { percent, factors };
}

export function matchPropertiesForLead(
  properties: PropertyDocument[],
  criteria: LeadMatchCriteria,
  minPercent = 40
): PropertyMatchResult[] {
  return properties
    .filter((p) => p.availability === 'available')
    .map((property) => {
      const { percent, factors } = scorePropertyForLead(property, criteria);
      return {
        propertyId: property._id.toString(),
        percent,
        factors,
        property,
      };
    })
    .filter((r) => r.percent >= minPercent)
    .sort((a, b) => b.percent - a.percent);
}
