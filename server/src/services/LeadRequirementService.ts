import type { LeadRequirementFields } from '../types/realEstateAI.js';
import { normalizePropertyType } from './ai/validation.js';

function pickDefined<T extends Record<string, unknown>>(partial: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(partial)) {
    if (value !== undefined && value !== null && value !== '') {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}

export function mergeLeadRequirements(
  existing: LeadRequirementFields,
  partial: LeadRequirementFields
): LeadRequirementFields {
  const normalized: LeadRequirementFields = {
    ...partial,
    propertyType: partial.propertyType ? normalizePropertyType(partial.propertyType) : partial.propertyType,
  };

  const updates = pickDefined(normalized as Record<string, unknown>);
  return { ...existing, ...updates };
}

export class LeadRequirementService {
  merge(existing: LeadRequirementFields, partial: LeadRequirementFields): LeadRequirementFields {
    return mergeLeadRequirements(existing, partial);
  }

  fieldsFromExtraction(
    extraction: LeadRequirementFields
  ): LeadRequirementFields {
    return pickDefined(extraction as Record<string, unknown>) as LeadRequirementFields;
  }
}
