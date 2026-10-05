import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import type { PropertyDocument } from '../models/Property.js';
import { scorePropertyAgainstRequirement } from './PropertyMatchingService.js';

function mockProperty(overrides: Partial<PropertyDocument> = {}): PropertyDocument {
  return {
    _id: new Types.ObjectId(),
    title: 'Test Flat',
    propertyType: 'flat',
    purpose: 'sale',
    city: 'Karachi',
    area: 'DHA Phase 6',
    bedrooms: 1,
    price: 18_500_000,
    status: 'available',
    ...overrides,
  } as PropertyDocument;
}

describe('scorePropertyAgainstRequirement', () => {
  it('scores high for DHA 1BR flat within budget', () => {
    const score = scorePropertyAgainstRequirement(
      mockProperty(),
      {
        propertyType: 'flat',
        bedrooms: 1,
        area: 'DHA',
        budgetMax: 20_000_000,
        purpose: 'sale',
      }
    );
    expect(score).toBeGreaterThan(0.8);
  });

  it('scores low for Clifton 3BR vs DHA 1BR lead', () => {
    const score = scorePropertyAgainstRequirement(
      mockProperty({ area: 'Clifton', bedrooms: 3, price: 50_000_000 }),
      {
        area: 'DHA',
        bedrooms: 1,
        budgetMax: 20_000_000,
      }
    );
    expect(score).toBeLessThan(0.5);
  });
});
