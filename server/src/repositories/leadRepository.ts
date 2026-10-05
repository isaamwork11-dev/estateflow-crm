import { Types } from 'mongoose';
import { LeadModel, type LeadDocument } from '../models/Lead.js';
import { ConversationMessageModel } from '../models/ConversationMessage.js';
import type { LeadRequirementFields } from '../types/realEstateAI.js';

export async function findLeadByPhoneOrWhatsapp(phone: string, whatsappId?: string): Promise<LeadDocument | null> {
  const or: Array<Record<string, string>> = [{ phone }];
  if (whatsappId) or.push({ whatsappId });
  return LeadModel.findOne({ $or: or }).exec();
}

export async function createLead(data: {
  phone: string;
  whatsappId?: string;
  name?: string;
}): Promise<LeadDocument> {
  return LeadModel.create(data);
}

export async function updateLeadRequirement(
  leadId: string,
  requirement: LeadRequirementFields
): Promise<LeadDocument | null> {
  if (!Types.ObjectId.isValid(leadId)) return null;
  return LeadModel.findByIdAndUpdate(
    leadId,
    {
      requirement: { ...requirement, updatedAt: new Date() },
    },
    { new: true }
  ).exec();
}

export async function setLeadContext(
  leadId: string,
  ctx: {
    lastDiscussedPropertyIds?: Types.ObjectId[];
    lastMatchingPropertyIds?: Types.ObjectId[];
  }
): Promise<void> {
  if (!Types.ObjectId.isValid(leadId)) return;
  await LeadModel.findByIdAndUpdate(leadId, ctx);
}

export async function findLeadsWithRequirements(limit = 500): Promise<LeadDocument[]> {
  return LeadModel.find({
    $or: [
      { 'requirement.budgetMax': { $exists: true, $ne: null } },
      { 'requirement.propertyType': { $exists: true, $ne: null } },
      { 'requirement.bedrooms': { $exists: true, $ne: null } },
      { 'requirement.area': { $exists: true, $ne: null } },
      { 'requirement.city': { $exists: true, $ne: null } },
    ],
  })
    .limit(limit)
    .exec();
}

export async function saveConversationMessage(input: {
  leadId: string;
  direction: 'inbound' | 'outbound';
  body: string;
  whatsappMessageId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!Types.ObjectId.isValid(input.leadId)) return;
  await ConversationMessageModel.create({
    leadId: input.leadId,
    direction: input.direction,
    body: input.body,
    whatsappMessageId: input.whatsappMessageId,
    metadata: input.metadata,
  });
}

export async function findLeadById(id: string): Promise<LeadDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return LeadModel.findById(id).exec();
}
