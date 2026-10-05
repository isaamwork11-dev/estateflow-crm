import { describe, expect, it } from 'vitest';
import { validateAndNormalizeExtraction } from './validation.js';

describe('validateAndNormalizeExtraction', () => {
  it('accepts valid property_search payload', () => {
    const result = validateAndNormalizeExtraction({
      intent: 'property_search',
      propertyType: 'flat',
      bedrooms: 1,
      budgetMax: 20_000_000,
      area: 'DHA',
      purpose: 'sale',
    });
    expect(result?.intent).toBe('property_search');
    expect(result?.propertyType).toBe('flat');
  });

  it('rejects invalid JSON shape', () => {
    expect(validateAndNormalizeExtraction({ intent: 'not-an-intent' })).toBeNull();
    expect(validateAndNormalizeExtraction(null)).toBeNull();
  });
});
