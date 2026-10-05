import { describe, expect, it } from 'vitest';
import { mergeLeadRequirements } from './LeadRequirementService.js';

describe('mergeLeadRequirements', () => {
  it('updates bedrooms while preserving budget', () => {
    const merged = mergeLeadRequirements(
      { budgetMax: 20_000_000, propertyType: 'flat', area: 'DHA' },
      { bedrooms: 2 }
    );
    expect(merged.budgetMax).toBe(20_000_000);
    expect(merged.bedrooms).toBe(2);
    expect(merged.area).toBe('DHA');
  });

  it('updates budgetMax when user sends new budget', () => {
    const merged = mergeLeadRequirements(
      { bedrooms: 2, area: 'Clifton' },
      { budgetMax: 25_000_000 }
    );
    expect(merged.bedrooms).toBe(2);
    expect(merged.budgetMax).toBe(25_000_000);
  });
});
