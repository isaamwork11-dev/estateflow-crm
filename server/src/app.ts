import express from 'express';
import { aiRealEstateRouter } from './routes/ai.real-estate.routes.js';
import { leadsRouter } from './routes/leads.routes.js';
import { propertiesRouter } from './routes/properties.routes.js';
import { whatsappRouter } from './routes/whatsapp.routes.js';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/whatsapp', whatsappRouter);
  app.use('/ai/real-estate', aiRealEstateRouter);
  app.use('/properties', propertiesRouter);
  app.use('/leads', leadsRouter);

  return app;
}
