import { env, isOllamaConfigured } from '../../config/env.js';
import type { AIProvider } from './AIProvider.js';
import { OllamaAIProvider } from './OllamaAIProvider.js';
import { OllamaClient } from './OllamaClient.js';

export function createAIProvider(): AIProvider | null {
  if (!isOllamaConfigured()) return null;

  const client = new OllamaClient({
    baseUrl: env.ollama.baseUrl,
    defaultTimeoutMs: env.ollama.timeoutMs,
  });

  return new OllamaAIProvider(client);
}
