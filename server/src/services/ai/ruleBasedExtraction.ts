import type { ExtractedRequirement } from '../../types/realEstateAI.js';

/** Deterministic fallback when Ollama is unavailable or returns invalid JSON */
export function ruleBasedExtraction(message: string): ExtractedRequirement | null {
  const lower = message.toLowerCase().trim();
  if (/^(hello|hi|hey|salam|assalam|thanks|shukriya)\b/.test(lower)) {
    return { intent: 'greeting' };
  }
  if (
    /kitne ki|kitni ki|size kya|property ka size|ye property|iska size|location kya|aur details/.test(
      lower
    )
  ) {
    return { intent: 'property_detail' };
  }

  const req: ExtractedRequirement = { intent: 'unknown' };
  const crore = lower.match(/(\d+(?:\.\d+)?)\s*crore/);
  const lakh = lower.match(/(\d+(?:\.\d+)?)\s*lakh/);
  if (crore) req.budgetMax = Math.round(parseFloat(crore[1]) * 1e7);
  else if (lakh) req.budgetMax = Math.round(parseFloat(lakh[1]) * 1e5);

  const bed = lower.match(/(\d+)\s*(?:bed|bedroom|bhk|br)\b/);
  if (bed) req.bedrooms = parseInt(bed[1], 10);

  const oneBed = lower.match(/\b1\s*bed\b/);
  if (oneBed) req.bedrooms = 1;

  if (/\bflat\b|\bapartment\b/.test(lower)) req.propertyType = 'flat';
  if (/\bhouse\b|\bvilla\b/.test(lower)) req.propertyType = 'house';
  if (/\bdha\b/.test(lower)) req.area = 'DHA';
  if (/\bclifton\b/.test(lower)) req.area = 'Clifton';
  if (/\brent\b|\bkiraye\b|\brent pe\b/.test(lower)) req.purpose = 'rent';
  else if (/\bchahiye\b|\bproperty\b|\bflat\b|\bhouse\b|\bbudget\b/.test(lower)) {
    req.purpose = 'sale';
  }

  const hasSignal =
    req.budgetMax != null ||
    req.bedrooms != null ||
    req.propertyType ||
    req.area ||
    req.city;

  if (hasSignal) {
    req.intent = 'property_search';
    return req;
  }

  return { intent: 'unknown' };
}

export const EXTRACTION_FAILURE_REPLY =
  'Ji, aapki requirement samajhne mein thori difficulty hui. Please budget, location aur property type bata dein.';
