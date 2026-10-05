import { Types } from 'mongoose';
import {
  findPropertyById,
  updatePropertyMatchingLeads,
} from '../repositories/propertyRepository.js';
import { findLeadsWithRequirements } from '../repositories/leadRepository.js';
import type { LeadMatchResult, LeadRequirementFields } from '../types/realEstateAI.js';
import { logger } from '../utils/logger.js';
import { scorePropertyAgainstRequirement } from './PropertyMatchingService.js';

const MIN_REVERSE_MATCH_SCORE = 0.6;

export class PropertyLeadMatchingService {

  async matchPropertyWithLeads(propertyId: string): Promise<LeadMatchResult[]> {
    const property = await findPropertyById(propertyId);
    if (!property) {
      logger.warn('reverse lead matching: property not found', { propertyId });
      return [];
    }

    if (property.status !== 'available') {
      logger.info('reverse lead matching skipped: property not available', { propertyId });
      return [];
    }

    const leads = await findLeadsWithRequirements();
    const results: LeadMatchResult[] = [];

    for (const lead of leads) {
      const req = (lead.requirement ?? {}) as LeadRequirementFields;
      const score = scorePropertyAgainstRequirement(property, req);
      if (score >= MIN_REVERSE_MATCH_SCORE) {
        results.push({
          leadId: lead._id.toString(),
          score,
          leadName: lead.name ?? undefined,
          phone: lead.phone,
        });
      }
    }

    const sorted = results.sort((a, b) => b.score - a.score);

    await updatePropertyMatchingLeads(
      propertyId,
      sorted.map((m) => ({ leadId: new Types.ObjectId(m.leadId), score: m.score }))
    );

    logger.info('reverse lead matching result', {
      propertyId,
      matchCount: sorted.length,
      leadIds: sorted.map((m) => m.leadId),
    });

    return sorted;
  }
}
