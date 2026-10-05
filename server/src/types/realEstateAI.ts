export const REAL_ESTATE_INTENTS = [
  'property_search',
  'property_detail',
  'general_real_estate_question',
  'greeting',
  'unknown',
] as const;

export type RealEstateIntent = (typeof REAL_ESTATE_INTENTS)[number];

export interface LeadRequirementFields {
  budgetMax?: number | null;
  budgetMin?: number | null;
  propertyType?: string | null;
  purpose?: 'sale' | 'rent' | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  city?: string | null;
  area?: string | null;
}

export interface ExtractedRequirement extends LeadRequirementFields {
  intent: RealEstateIntent;
  rawMessage?: string;
}

export interface PropertySummaryForAI {
  id: string;
  title: string;
  propertyType: string;
  purpose: string;
  city?: string;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  price: number;
  areaSize?: number;
  areaUnit?: string;
  description?: string;
}

export interface ScoredProperty {
  propertyId: string;
  score: number;
  property: PropertySummaryForAI;
}

export interface LeadMatchResult {
  leadId: string;
  score: number;
  leadName?: string;
  phone?: string;
}
