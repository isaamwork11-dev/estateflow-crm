import type { AIProvider } from './ai/AIProvider.js';
import { EXTRACTION_FAILURE_REPLY, ruleBasedExtraction } from './ai/ruleBasedExtraction.js';
import { validateAndNormalizeExtraction } from './ai/validation.js';
import type {
  ExtractedRequirement,
  LeadRequirementFields,
  PropertySummaryForAI,
} from '../types/realEstateAI.js';
import { logger } from '../utils/logger.js';

export class RealEstateAIService {
  constructor(private readonly provider: AIProvider | null) {}

  async extractRequirement(
    message: string,
    context?: { recentMessages?: string[] }
  ): Promise<ExtractedRequirement | null> {
    logger.info('AI extraction started');

    if (this.provider) {
      try {
        const raw = await this.provider.extractPropertyRequirement(message, context);
        const validated = validateAndNormalizeExtraction(raw);
        if (validated) {
          logger.info('extracted requirement', { intent: validated.intent, requirement: validated });
          return { ...validated, rawMessage: message };
        }
        logger.warn('Ollama invalid JSON or failed validation');
      } catch (err) {
        logger.error('AI failure during extraction', { error: String(err) });
      }
    } else {
      logger.warn('Ollama not configured — using rule-based extraction');
    }

    const fallback = ruleBasedExtraction(message);
    if (fallback) {
      logger.info('rule-based extracted requirement', { intent: fallback.intent });
      return { ...fallback, rawMessage: message };
    }

    return null;
  }

  async generateSearchReply(
    userMessage: string,
    properties: PropertySummaryForAI[],
    userRequirement?: LeadRequirementFields
  ): Promise<string> {
    if (properties.length === 0) return '';

    if (this.provider) {
      try {
        logger.info('AI response generation', { propertyCount: properties.length });
        const text = await this.provider.generatePropertyResponse({
          userMessage,
          userRequirement,
          matchingProperties: properties,
        });
        if (text?.trim()) return text.trim();
      } catch (err) {
        logger.error('AI failure during response generation', { error: String(err) });
      }
    }

    return this.templateSearchReply(properties);
  }

  async generateNoMatchReply(): Promise<string> {
    return (
      'Ji, abhi hamare available properties mein aapki requirement ke mutabiq exact match nahi hai. ' +
      'Maine aapki requirement save kar di hai. Jaise hi matching property available hogi, aapko inform kiya ja sakta hai.'
    );
  }

  async generatePropertyDetailReply(
    userMessage: string,
    property: PropertySummaryForAI
  ): Promise<string> {
    if (this.provider) {
      try {
        const text = await this.provider.generatePropertyDetailResponse({
          userMessage,
          property,
        });
        if (text?.trim()) return text.trim();
      } catch (err) {
        logger.error('AI failure during property detail', { error: String(err) });
      }
    }

    return this.templatePropertyDetail(property);
  }

  getExtractionFailureReply(): string {
    return EXTRACTION_FAILURE_REPLY;
  }

  /** @deprecated use ruleBasedExtraction module in tests */
  fallbackExtraction(message: string): ExtractedRequirement | null {
    return ruleBasedExtraction(message);
  }

  private templateSearchReply(properties: PropertySummaryForAI[]): string {
    const lines = properties.slice(0, 3).map((p) => {
      const loc = [p.area, p.city].filter(Boolean).join(', ');
      const priceCr = (p.price / 1e7).toFixed(2);
      const size =
        p.areaSize != null ? `📐 ${p.areaSize} ${p.areaUnit ?? 'Sq Ft'}\n` : '';
      return `🏠 ${p.bedrooms ?? '-'} Bedroom ${p.propertyType}\n📍 ${loc || p.title}\n${size}💰 PKR ${priceCr} Crore`;
    });
    return (
      'Ji bilkul. Aapki requirement ke mutabiq hamare paas ye property available hai:\n\n' +
      lines.join('\n\n') +
      '\n\nAgar aap chahein to main iski complete details share kar deta hoon.'
    );
  }

  private templatePropertyDetail(property: PropertySummaryForAI): string {
    const loc = [property.area, property.city].filter(Boolean).join(', ');
    const priceCr = (property.price / 1e7).toFixed(2);
    const size = property.areaSize
      ? `${property.areaSize} ${property.areaUnit ?? 'Sq Ft'}`
      : 'not available';
    return (
      `Property: ${property.title}\n` +
      `Location: ${loc || 'not available'}\n` +
      `Price: PKR ${priceCr} Crore\n` +
      `Size: ${size}\n` +
      `Bedrooms: ${property.bedrooms ?? 'not available'}`
    );
  }
}
