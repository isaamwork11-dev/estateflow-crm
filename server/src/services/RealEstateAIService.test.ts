import { describe, expect, it, vi } from 'vitest';
import type { AIProvider } from './ai/AIProvider.js';
import { RealEstateAIService } from './RealEstateAIService.js';
import type { PropertySummaryForAI } from '../types/realEstateAI.js';

function mockProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    name: 'mock',
    extractPropertyRequirement: vi.fn().mockResolvedValue(null),
    classifyIntent: vi.fn().mockResolvedValue(null),
    generatePropertyResponse: vi.fn().mockResolvedValue(null),
    generatePropertyDetailResponse: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

const sampleProperty: PropertySummaryForAI = {
  id: '1',
  title: '1 Bedroom Apartment',
  propertyType: 'flat',
  purpose: 'sale',
  area: 'DHA Phase 6',
  bedrooms: 1,
  price: 18_500_000,
  areaSize: 850,
  areaUnit: 'sqft',
};

describe('RealEstateAIService without Ollama', () => {
  const ai = new RealEstateAIService(null);

  it('uses rule-based extraction when Ollama unavailable', async () => {
    const r = await ai.extractRequirement('DHA mein flat chahiye');
    expect(r?.intent).toBe('property_search');
    expect(r?.area).toBe('DHA');
  });

  it('no-match reply', async () => {
    const text = await ai.generateNoMatchReply();
    expect(text.toLowerCase()).toContain('requirement');
  });

  it('template search reply uses DB price', async () => {
    const text = await ai.generateSearchReply('search', [sampleProperty]);
    expect(text).toContain('1.85');
    expect(text).not.toContain('2.00');
  });

  it('extraction failure message', () => {
    expect(ai.getExtractionFailureReply()).toContain('budget');
  });
});

describe('RealEstateAIService with mock Ollama', () => {
  it('validates Ollama JSON before use', async () => {
    const provider = mockProvider({
      extractPropertyRequirement: vi.fn().mockResolvedValue({
        intent: 'property_search',
        propertyType: 'flat',
        bedrooms: 1,
        budgetMax: 20_000_000,
        area: 'DHA',
        purpose: 'sale',
      }),
    });
    const ai = new RealEstateAIService(provider);
    const r = await ai.extractRequirement('test');
    expect(r?.budgetMax).toBe(20_000_000);
  });

  it('falls back when Ollama returns invalid JSON', async () => {
    const provider = mockProvider({
      extractPropertyRequirement: vi.fn().mockResolvedValue({ intent: 'not-valid' }),
    });
    const ai = new RealEstateAIService(provider);
    const r = await ai.extractRequirement('2 crore ki property chahiye');
    expect(r?.intent).toBe('property_search');
    expect(r?.budgetMax).toBe(20_000_000);
  });

  it('uses Ollama for property response when available', async () => {
    const provider = mockProvider({
      generatePropertyResponse: vi.fn().mockResolvedValue('Custom Ollama reply'),
    });
    const ai = new RealEstateAIService(provider);
    const text = await ai.generateSearchReply('msg', [sampleProperty]);
    expect(text).toBe('Custom Ollama reply');
  });

  it('property detail via mock provider', async () => {
    const provider = mockProvider({
      generatePropertyDetailResponse: vi.fn().mockResolvedValue('Price is 1.85 crore'),
    });
    const ai = new RealEstateAIService(provider);
    const text = await ai.generatePropertyDetailReply('kitne ki?', sampleProperty);
    expect(text).toBe('Price is 1.85 crore');
  });
});
