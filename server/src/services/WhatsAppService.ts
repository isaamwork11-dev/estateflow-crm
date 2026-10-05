import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export class WhatsAppService {
  isConfigured(): boolean {
    return Boolean(env.whatsapp.token && env.whatsapp.phoneNumberId);
  }

  async sendTextMessage(to: string, body: string): Promise<void> {
    if (!this.isConfigured()) {
      logger.warn('WhatsApp send skipped: not configured', { to });
      return;
    }

    const url = `${env.whatsapp.apiUrl}/${env.whatsapp.phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.whatsapp.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      logger.error('WhatsApp API error', { status: res.status, body: errText.slice(0, 300) });
      throw new Error(`WhatsApp send failed: ${res.status}`);
    }
  }
}
