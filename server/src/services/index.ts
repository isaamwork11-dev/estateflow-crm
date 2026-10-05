import { createAIProvider } from './ai/createAIProvider.js';
import { RealEstateAIService } from './RealEstateAIService.js';
import { RealEstateLeadFlowService } from './RealEstateLeadFlowService.js';
import { PropertyLeadMatchingService } from './PropertyLeadMatchingService.js';
import { PropertyMatchingService } from './PropertyMatchingService.js';
import { LeadRequirementService } from './LeadRequirementService.js';

const aiProvider = createAIProvider();
export const realEstateAIService = new RealEstateAIService(aiProvider);
export const realEstateLeadFlowService = new RealEstateLeadFlowService(realEstateAIService);
export const propertyLeadMatchingService = new PropertyLeadMatchingService();
export const propertyMatchingService = new PropertyMatchingService();
export const leadRequirementService = new LeadRequirementService();
