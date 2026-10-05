import 'dotenv/config';

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  port: num(process.env.PORT, 4000),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/ai-real-estate',
  ollama: {
    baseUrl: (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/$/, ''),
    model: process.env.OLLAMA_MODEL ?? '',
    timeoutMs: num(process.env.OLLAMA_TIMEOUT_MS, 30_000),
  },
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL ?? 'https://graph.facebook.com/v21.0',
    token: process.env.WHATSAPP_API_TOKEN ?? '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? '',
  },
};

export function isOllamaConfigured(): boolean {
  return Boolean(env.ollama.model);
}
