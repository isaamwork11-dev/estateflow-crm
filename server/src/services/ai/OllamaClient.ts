import { logger } from '../../utils/logger.js';

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaClientOptions {
  baseUrl: string;
  defaultTimeoutMs: number;
}

export class OllamaClient {
  constructor(private readonly options: OllamaClientOptions) {}

  async chat(params: {
    model: string;
    messages: OllamaChatMessage[];
    format?: 'json';
    timeoutMs?: number;
  }): Promise<string | null> {
    const timeoutMs = params.timeoutMs ?? this.options.defaultTimeoutMs;
    const url = `${this.options.baseUrl}/api/chat`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: params.model,
          messages: params.messages,
          stream: false,
          ...(params.format === 'json' ? { format: 'json' } : {}),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text();
        logger.error('Ollama HTTP error', { status: res.status, body: body.slice(0, 200) });
        return null;
      }

      const data = (await res.json()) as { message?: { content?: string } };
      const content = data.message?.content?.trim();
      return content || null;
    } catch (err) {
      const message = String(err);
      if (message.includes('abort') || message.includes('AbortError')) {
        logger.error('Ollama request timed out');
      } else if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
        logger.error('Ollama connection refused — is the server running?');
      } else {
        logger.error('Ollama request failed', { error: message });
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}
