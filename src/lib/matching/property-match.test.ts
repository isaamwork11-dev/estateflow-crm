import { describe, expect, it } from 'vitest';
import { scorePropertyForLead } from './property-match';
import type { PropertyDocument } from '@/lib/db/models/Property';

function mockProperty(overrides: Partial<PropertyDocument> = {}): PropertyDocument {
  return {
    _id: { toString: () => 'p1' } as PropertyDocument['_id'],
    organizationId: {} as PropertyDocument['organizationId'],
    propertyCode: 'TEST-1',
    title: 'Test',
    transactionType: 'sale',
    price: 1_850_000,
    propertyType: 'flat',
    area: 'DHA Phase 6',
    city: 'Karachi',
    bedrooms: 1,
    availability: 'available',
    ...overrides,
  } as PropertyDocument;
}

describe('property matching', () => {
  it('scores high when budget and area match', () => {
    const { percent, factors } = scorePropertyForLead(mockProperty(), {
      budget: 2_000_000,
      preferredArea: 'DHA',
      propertyType: 'flat',
      transactionType: 'sale',
      bedrooms: 1,
    });
    expect(percent).toBeGreaterThanOrEqual(70);
    expect(factors.some((f) => f.key === 'budget' && f.matched)).toBe(true);
  });
});
