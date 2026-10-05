import type { PropertyDocument } from '../models/Property.js';
import { buildPropertyFilter, findAvailableByFilter } from '../repositories/propertyRepository.js';
import type { LeadRequirementFields, PropertySummaryForAI, ScoredProperty } from '../types/realEstateAI.js';

export interface MatchScoreWeights {
  propertyType: number;
  bedrooms: number;
  budget: number;
  area: number;
  city: number;
  purpose: number;
}

export const DEFAULT_MATCH_WEIGHTS: MatchScoreWeights = {
  propertyType: 20,
  bedrooms: 20,
  budget: 25,
  area: 20,
  city: 10,
  purpose: 5,
};

function toSummary(doc: PropertyDocument): PropertySummaryForAI {
  return {
    id: doc._id.toString(),
    title: doc.title,
    propertyType: doc.propertyType,
    purpose: doc.purpose,
    city: doc.city ?? undefined,
    area: doc.area ?? undefined,
    bedrooms: doc.bedrooms ?? undefined,
    bathrooms: doc.bathrooms ?? undefined,
    price: doc.price,
    areaSize: doc.areaSize ?? undefined,
    areaUnit: doc.areaUnit ?? undefined,
    description: doc.description ?? undefined,
  };
}

function areaMatches(propertyArea?: string, requirementArea?: string | null): boolean {
  if (!requirementArea || !propertyArea) return false;
  const a = requirementArea.toLowerCase();
  const p = propertyArea.toLowerCase();
  return p.includes(a) || a.includes(p);
}

export function scorePropertyAgainstRequirement(
  property: PropertyDocument,
  requirement: LeadRequirementFields,
  weights: MatchScoreWeights = DEFAULT_MATCH_WEIGHTS
): number {
  let score = 0;
  let maxScore = 0;

  if (requirement.propertyType) {
    maxScore += weights.propertyType;
    if (property.propertyType === requirement.propertyType) score += weights.propertyType;
  }
  if (requirement.bedrooms != null) {
    maxScore += weights.bedrooms;
    if (property.bedrooms === requirement.bedrooms) score += weights.bedrooms;
  }
  if (requirement.purpose) {
    maxScore += weights.purpose;
    if (property.purpose === requirement.purpose) score += weights.purpose;
  }
  if (requirement.area) {
    maxScore += weights.area;
    if (areaMatches(property.area ?? undefined, requirement.area)) score += weights.area;
  }
  if (requirement.city) {
    maxScore += weights.city;
    if (
      property.city &&
      property.city.toLowerCase().includes(requirement.city.toLowerCase())
    ) {
      score += weights.city;
    }
  }
  if (requirement.budgetMax != null) {
    maxScore += weights.budget;
    if (property.price <= requirement.budgetMax) score += weights.budget;
  }

  if (maxScore === 0) return 1;
  return score / maxScore;
}

export class PropertyMatchingService {
  constructor(private readonly weights: MatchScoreWeights = DEFAULT_MATCH_WEIGHTS) {}

  async findMatches(requirement: LeadRequirementFields, limit = 5): Promise<ScoredProperty[]> {
    const filter = buildPropertyFilter(requirement);
    const candidates = await findAvailableByFilter(filter, Math.max(limit * 3, 15));

    const scored = candidates
      .map((p) => ({
        propertyId: p._id.toString(),
        score: scorePropertyAgainstRequirement(p, requirement, this.weights),
        property: toSummary(p),
      }))
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit);
  }

  propertyMatchesLeadRequirement(
    property: PropertyDocument,
    requirement: LeadRequirementFields,
    minScore = 0.6
  ): boolean {
    const score = scorePropertyAgainstRequirement(property, requirement, this.weights);
    return score >= minScore;
  }
}
