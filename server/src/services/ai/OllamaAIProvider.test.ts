import { describe, expect, it, vi } from 'vitest';
import { OllamaAIProvider } from './OllamaAIProvider.js';
import type { OllamaClient } from './OllamaClient.js';

function mockClient(chatImpl: ReturnType<typeof vi.fn>): OllamaClient {
  return { chat: chatImpl } as unknown as OllamaClient;
}

describe('OllamaAIProvider', () => {
  it('parses extraction JSON from Ollama text', async () => {
    const chat = vi.fn().mockResolvedValue(
      JSON.stringify({
        intent: 'property_search',
        propertyType: 'flat',
        bedrooms: 1,
        budgetMax: 20_000_000,
        area: 'DHA',
        purpose: 'sale',
      })
    );
    const provider = new OllamaAIProvider(mockClient(chat), 'test-model', 5000);
    const raw = await provider.extractPropertyRequirement('DHA flat');
    expect(raw).toMatchObject({ intent: 'property_search', area: 'DHA' });
    expect(chat).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'test-model', format: 'json' })
    );
  });

  it('returns null when Ollama unavailable', async () => {
    const chat = vi.fn().mockResolvedValue(null);
    const provider = new OllamaAIProvider(mockClient(chat), 'test-model');
    const raw = await provider.extractPropertyRequirement('hello');
    expect(raw).toBeNull();
  });
});
