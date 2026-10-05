import { describe, expect, it } from 'vitest';
import { calculateLeadScore } from './lead-score';

describe('calculateLeadScore', () => {
  it('caps at 100 and labels VERY HOT', () => {
    const r = calculateLeadScore({
      budgetMax: 2_000_000,
      preferredCity: 'Karachi',
      propertyType: 'apartment',
      selectedPropertyId: 'abc',
      phoneVerified: true,
      lastContactAt: new Date(),
      hasSiteVisit: true,
      status: 'NEGOTIATION',
    });
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.band).toBe('VERY HOT');
    expect(r.priority).toBe('VERY_HOT');
  });

  it('returns COLD for empty lead', () => {
    const r = calculateLeadScore({});
    expect(r.score).toBe(0);
    expect(r.band).toBe('COLD');
  });
});
