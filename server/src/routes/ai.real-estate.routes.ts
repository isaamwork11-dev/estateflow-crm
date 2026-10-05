import { Router } from 'express';
import { services } from '../services/createServices.js';
import { LeadRequirementService } from '../services/LeadRequirementService.js';
import { sanitizeUserMessage } from '../utils/sanitize.js';

export const aiRealEstateRouter = Router();
const requirementService = new LeadRequirementService();

aiRealEstateRouter.post('/parse', async (req, res) => {
  const message = sanitizeUserMessage(String(req.body?.message ?? ''));
  if (!message) return res.status(400).json({ error: 'message required' });

  const extraction = await services.realEstateAI.extractRequirement(message);
  res.json({ extraction });
});

aiRealEstateRouter.post('/search', async (req, res) => {
  const message = sanitizeUserMessage(String(req.body?.message ?? ''));
  const existingRequirement = (req.body?.requirement ?? {}) as Record<string, unknown>;

  const extraction = message
    ? await services.realEstateAI.extractRequirement(message)
    : null;

  const partial = extraction
    ? requirementService.fieldsFromExtraction(extraction)
    : {};
  const merged = requirementService.merge(existingRequirement, partial);

  const matches = await services.propertyMatching.findMatches(merged, 10);
  res.json({ requirement: merged, extraction, matches });
});
