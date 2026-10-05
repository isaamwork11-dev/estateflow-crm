import { describe, expect, it } from 'vitest';
import { ruleBasedExtraction } from './ruleBasedExtraction.js';

describe('ruleBasedExtraction', () => {
  it('Roman Urdu property search', () => {
    const r = ruleBasedExtraction('mujhe 2 crore tak 1 bedroom flat chahiye DHA mein');
    expect(r?.intent).toBe('property_search');
    expect(r?.budgetMax).toBe(20_000_000);
    expect(r?.bedrooms).toBe(1);
    expect(r?.propertyType).toBe('flat');
    expect(r?.area).toBe('DHA');
  });

  it('English property search', () => {
    const r = ruleBasedExtraction('3 bed house Clifton 5 crore');
    expect(r?.intent).toBe('property_search');
    expect(r?.bedrooms).toBe(3);
    expect(r?.propertyType).toBe('house');
    expect(r?.budgetMax).toBe(50_000_000);
  });

  it('mixed budget line', () => {
    const r = ruleBasedExtraction('2 crore budget hai, DHA mein apartment chahiye');
    expect(r?.intent).toBe('property_search');
    expect(r?.budgetMax).toBe(20_000_000);
    expect(r?.propertyType).toBe('flat');
    expect(r?.area).toBe('DHA');
  });

  it('bedroom only', () => {
    const r = ruleBasedExtraction('mujhe 1 bed ka flat chahiye');
    expect(r?.intent).toBe('property_search');
    expect(r?.bedrooms).toBe(1);
    expect(r?.propertyType).toBe('flat');
  });

  it('rent purpose', () => {
    const r = ruleBasedExtraction('rent pe 2 bedroom apartment chahiye');
    expect(r?.intent).toBe('property_search');
    expect(r?.purpose).toBe('rent');
    expect(r?.bedrooms).toBe(2);
  });

  it('greeting', () => {
    expect(ruleBasedExtraction('hello')?.intent).toBe('greeting');
  });

  it('property detail', () => {
    expect(ruleBasedExtraction('ye property kitne ki hai?')?.intent).toBe('property_detail');
    expect(ruleBasedExtraction('iska size kya hai?')?.intent).toBe('property_detail');
  });
});
