import { Types } from 'mongoose';
import {
  createLead,
  findLeadByPhoneOrWhatsapp,
  saveConversationMessage,
  setLeadContext,
  updateLeadRequirement,
} from '../repositories/leadRepository.js';
import { findPropertyById } from '../repositories/propertyRepository.js';
import type { LeadRequirementFields } from '../types/realEstateAI.js';
import { sanitizeUserMessage } from '../utils/sanitize.js';
import { logger } from '../utils/logger.js';
import { LeadRequirementService } from './LeadRequirementService.js';
import { PropertyMatchingService } from './PropertyMatchingService.js';
import { RealEstateAIService } from './RealEstateAIService.js';
import { WhatsAppService } from './WhatsAppService.js';

export interface InboundWhatsAppPayload {
  from: string;
  whatsappId?: string;
  name?: string;
  messageId?: string;
  text: string;
}

export class RealEstateLeadFlowService {
  constructor(
    private readonly ai: RealEstateAIService,
    private readonly requirements = new LeadRequirementService(),
    private readonly matching = new PropertyMatchingService(),
    private readonly whatsapp = new WhatsAppService()
  ) {}

  async handleInbound(payload: InboundWhatsAppPayload): Promise<{ replied: boolean; reply?: string }> {
    const text = sanitizeUserMessage(payload.text);
    if (!text) return { replied: false };

    let lead = await findLeadByPhoneOrWhatsapp(payload.from, payload.whatsappId);
    if (!lead) {
      lead = await createLead({
        phone: payload.from,
        whatsappId: payload.whatsappId ?? payload.from,
        name: payload.name,
      });
    }

    await saveConversationMessage({
      leadId: lead._id.toString(),
      direction: 'inbound',
      body: text,
      whatsappMessageId: payload.messageId,
    });

    const extraction = await this.ai.extractRequirement(text);
    if (!extraction) {
      const reply = this.ai.getExtractionFailureReply();
      await this.sendReply(lead, reply, payload.messageId);
      return { replied: true, reply };
    }

    if (extraction.intent === 'greeting') {
      return { replied: false };
    }

    if (extraction.intent === 'unknown') {
      const reply = this.ai.getExtractionFailureReply();
      await this.sendReply(lead, reply, payload.messageId);
      return { replied: true, reply };
    }

    if (extraction.intent === 'property_detail') {
      const propertyId = lead.lastDiscussedPropertyIds?.[0]?.toString();
      if (!propertyId) {
        const reply = 'Kis property ke baare mein pooch rahe hain? Pehle search karein ya property ka naam/share karein.';
        await this.sendReply(lead, reply, payload.messageId);
        return { replied: true, reply };
      }
      const property = await findPropertyById(propertyId);
      if (!property) {
        const reply = 'Is property ki details abhi available nahi hain.';
        await this.sendReply(lead, reply, payload.messageId);
        return { replied: true, reply };
      }
      const summary = {
        id: property._id.toString(),
        title: property.title,
        propertyType: property.propertyType,
        purpose: property.purpose,
        city: property.city ?? undefined,
        area: property.area ?? undefined,
        bedrooms: property.bedrooms ?? undefined,
        bathrooms: property.bathrooms ?? undefined,
        price: property.price,
        areaSize: property.areaSize ?? undefined,
        areaUnit: property.areaUnit ?? undefined,
        description: property.description ?? undefined,
      };
      const reply = await this.ai.generatePropertyDetailReply(text, summary);
      await this.sendReply(lead, reply, payload.messageId);
      return { replied: true, reply };
    }

    if (extraction.intent === 'property_search') {
      const partial = this.requirements.fieldsFromExtraction(extraction);
      const merged = this.requirements.merge(
        (lead.requirement ?? {}) as LeadRequirementFields,
        partial
      );

      await updateLeadRequirement(lead._id.toString(), merged);

      const matches = await this.matching.findMatches(merged, 5);
      logger.info('property matching count', {
        leadId: lead._id.toString(),
        count: matches.length,
        propertyIds: matches.map((m) => m.propertyId),
      });

      let reply: string;
      if (matches.length === 0) {
        reply = await this.ai.generateNoMatchReply();
      } else {
        reply = await this.ai.generateSearchReply(
          text,
          matches.map((m) => m.property),
          merged
        );
        await setLeadContext(lead._id.toString(), {
          lastMatchingPropertyIds: matches.map((m) => new Types.ObjectId(m.propertyId)),
          lastDiscussedPropertyIds: [new Types.ObjectId(matches[0].propertyId)],
        });
      }

      await this.sendReply(lead, reply, payload.messageId);
      return { replied: true, reply };
    }

    return { replied: false };
  }

  private async sendReply(
    lead: { _id: Types.ObjectId; phone: string; whatsappId?: string | null },
    reply: string,
    inboundMessageId?: string
  ): Promise<void> {
    const to = lead.whatsappId || lead.phone;
    try {
      await this.whatsapp.sendTextMessage(to, reply);
    } catch {
      // Logged in WhatsAppService; do not throw to webhook
    }
    await saveConversationMessage({
      leadId: lead._id.toString(),
      direction: 'outbound',
      body: reply,
      metadata: inboundMessageId ? { inReplyTo: inboundMessageId } : undefined,
    });
  }
}
