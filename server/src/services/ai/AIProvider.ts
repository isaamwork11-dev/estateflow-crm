import type { LeadRequirementFields, PropertySummaryForAI, RealEstateIntent } from '../../types/realEstateAI.js';

export interface PropertyResponseContext {
  userMessage: string;
  userRequirement?: LeadRequirementFields;
  matchingProperties: PropertySummaryForAI[];
}

export interface PropertyDetailContext {
  userMessage: string;
  property: PropertySummaryForAI;
}

export interface AIProvider {
  readonly name: string;
  extractPropertyRequirement(
    message: string,
    options?: { recentMessages?: string[] }
  ): Promise<unknown | null>;
  classifyIntent(message: string): Promise<RealEstateIntent | null>;
  generatePropertyResponse(context: PropertyResponseContext): Promise<string | null>;
  generatePropertyDetailResponse(context: PropertyDetailContext): Promise<string | null>;
}
