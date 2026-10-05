import { Router } from 'express';
import { findLeadById } from '../repositories/leadRepository.js';
import { PropertyMatchingService } from '../services/PropertyMatchingService.js';

export const leadsRouter = Router();
const matching = new PropertyMatchingService();

leadsRouter.get('/:id', async (req, res) => {
  const lead = await findLeadById(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Not found' });

  const requirement = lead.requirement ?? {};
  const matches = await matching.findMatches(requirement, 10);

  res.json({
    lead,
    requirement,
    matchingProperties: matches,
  });
});
