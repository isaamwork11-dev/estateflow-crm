import { env } from '../../config/env.js';
import type { RealEstateIntent } from '../../types/realEstateAI.js';
import type {
  AIProvider,
  PropertyDetailContext,
  PropertyResponseContext,
} from './AIProvider.js';
import { OllamaClient } from './OllamaClient.js';
import {
  EXTRACTION_SYSTEM_PROMPT,
  INTENT_SYSTEM_PROMPT,
  PROPERTY_DETAIL_SYSTEM_PROMPT,
  RESPONSE_SYSTEM_PROMPT,
} from './prompts.js';
import { validateAndNormalizeExtraction } from './validation.js';

function parseJsonFromText(text: string): unknown | null {
  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export class OllamaAIProvider implements AIProvider {
  readonly name = 'ollama';

  constructor(
    private readonly client: OllamaClient,
    private readonly model: string = env.ollama.model,
    private readonly timeoutMs: number = env.ollama.timeoutMs
  ) {}

  async classifyIntent(message: string): Promise<RealEstateIntent | null> {
    const text = await this.client.chat({
      model: this.model,
      messages: [
        { role: 'system', content: INTENT_SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      format: 'json',
      timeoutMs: this.timeoutMs,
    });
    if (!text) return null;
    const raw = parseJsonFromText(text);
    if (!raw || typeof raw !== 'object' || !('intent' in raw)) return null;
    const validated = validateAndNormalizeExtraction(raw);
    return validated?.intent ?? null;
  }

  async extractPropertyRequirement(
    message: string,
    options?: { recentMessages?: string[] }
  ): Promise<unknown | null> {
    const contextBlock = options?.recentMessages?.length
      ? `Recent messages:\n${options.recentMessages.join('\n')}\n\n`
      : '';

    const text = await this.client.chat({
      model: this.model,
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        { role: 'user', content: `${contextBlock}Latest message:\n${message}` },
      ],
      format: 'json',
      timeoutMs: this.timeoutMs,
    });

    if (!text) return null;
    return parseJsonFromText(text);
  }

  async generatePropertyResponse(context: PropertyResponseContext): Promise<string | null> {
    const payload = {
      userMessage: context.userMessage,
      userRequirement: context.userRequirement ?? {},
      matchingProperties: context.matchingProperties,
    };

    return this.client.chat({
      model: this.model,
      messages: [
        { role: 'system', content: RESPONSE_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(payload) },
      ],
      timeoutMs: this.timeoutMs,
    });
  }

  async generatePropertyDetailResponse(context: PropertyDetailContext): Promise<string | null> {
    return this.client.chat({
      model: this.model,
      messages: [
        { role: 'system', content: PROPERTY_DETAIL_SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            userMessage: context.userMessage,
            property: context.property,
          }),
        },
      ],
      timeoutMs: this.timeoutMs,
    });
  }
}
