import { z } from 'zod';
import { REAL_ESTATE_INTENTS, type ExtractedRequirement } from '../../types/realEstateAI.js';

const purposeSchema = z.enum(['sale', 'rent']).nullable().optional();

export const extractionSchema = z.object({
  intent: z.enum(REAL_ESTATE_INTENTS),
  propertyType: z.string().max(64).nullable().optional(),
  purpose: purposeSchema,
  bedrooms: z.number().int().min(0).max(50).nullable().optional(),
  bathrooms: z.number().int().min(0).max(50).nullable().optional(),
  budgetMax: z.number().nonnegative().nullable().optional(),
  budgetMin: z.number().nonnegative().nullable().optional(),
  city: z.string().max(128).nullable().optional(),
  area: z.string().max(128).nullable().optional(),
});

export function normalizePropertyType(value?: string | null): string | null {
  if (!value) return null;
  const v = value.toLowerCase().trim();
  if (['flat', 'apartment', 'apt'].includes(v)) return 'flat';
  if (['house', 'home', 'villa'].includes(v)) return 'house';
  if (['plot', 'land'].includes(v)) return 'plot';
  if (['commercial', 'shop', 'office'].includes(v)) return 'commercial';
  return v;
}

export function validateAndNormalizeExtraction(raw: unknown): ExtractedRequirement | null {
  const parsed = extractionSchema.safeParse(raw);
  if (!parsed.success) return null;

  const data = parsed.data;
  return {
    intent: data.intent,
    propertyType: normalizePropertyType(data.propertyType ?? null),
    purpose: data.purpose ?? null,
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    budgetMax: data.budgetMax ?? null,
    budgetMin: data.budgetMin ?? null,
    city: data.city?.trim() || null,
    area: data.area?.trim() || null,
  };
}
