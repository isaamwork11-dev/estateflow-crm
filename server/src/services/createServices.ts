import { createAIProvider } from './ai/createAIProvider.js';
import { PropertyLeadMatchingService } from './PropertyLeadMatchingService.js';
import { PropertyMatchingService } from './PropertyMatchingService.js';
import { RealEstateAIService } from './RealEstateAIService.js';
import { RealEstateLeadFlowService } from './RealEstateLeadFlowService.js';

const aiProvider = createAIProvider();
const realEstateAI = new RealEstateAIService(aiProvider);

export const services = {
  realEstateAI,
  propertyMatching: new PropertyMatchingService(),
  propertyLeadMatching: new PropertyLeadMatchingService(),
  leadFlow: new RealEstateLeadFlowService(realEstateAI),
};
