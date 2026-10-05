import { Router } from 'express';
import { env } from '../config/env.js';
import { services } from '../services/createServices.js';
import { logger } from '../utils/logger.js';

export const whatsappRouter = Router();

whatsappRouter.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.whatsapp.verifyToken) {
    res.status(200).send(challenge);
    return;
  }
  res.status(403).send('Forbidden');
});

whatsappRouter.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;
    if (!messages?.length) return;

    const msg = messages[0];
    if (msg.type !== 'text' || !msg.text?.body) return;

    const from = msg.from as string;
    const contact = value.contacts?.[0];

    await services.leadFlow.handleInbound({
      from,
      whatsappId: from,
      name: contact?.profile?.name,
      messageId: msg.id,
      text: msg.text.body,
    });
  } catch (err) {
    logger.error('WhatsApp webhook processing error', { error: String(err) });
  }
});
