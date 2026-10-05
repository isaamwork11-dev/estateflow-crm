import { Types, type FilterQuery } from 'mongoose';
import { PropertyModel, type PropertyDocument } from '../models/Property.js';
import type { LeadRequirementFields } from '../types/realEstateAI.js';

export function buildPropertyFilter(requirement: LeadRequirementFields): FilterQuery<PropertyDocument> {
  const filter: FilterQuery<PropertyDocument> = { status: 'available' };

  if (requirement.propertyType) {
    filter.propertyType = requirement.propertyType;
  }
  if (requirement.purpose) {
    filter.purpose = requirement.purpose;
  }
  if (requirement.bedrooms != null) {
    filter.bedrooms = requirement.bedrooms;
  }
  if (requirement.bathrooms != null) {
    filter.bathrooms = requirement.bathrooms;
  }
  if (requirement.budgetMax != null) {
    filter.price = { ...(filter.price as object), $lte: requirement.budgetMax };
  }
  if (requirement.budgetMin != null) {
    filter.price = { ...(filter.price as object), $gte: requirement.budgetMin };
  }
  if (requirement.city) {
    filter.city = new RegExp(requirement.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
  if (requirement.area) {
    filter.area = new RegExp(requirement.area.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }

  return filter;
}

export async function findAvailableByFilter(
  filter: FilterQuery<PropertyDocument>,
  limit = 20
): Promise<PropertyDocument[]> {
  return PropertyModel.find(filter).sort({ updatedAt: -1 }).limit(limit).exec();
}

export async function findPropertyById(id: string): Promise<PropertyDocument | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  return PropertyModel.findById(id).exec();
}

export async function createProperty(data: Partial<PropertyDocument>): Promise<PropertyDocument> {
  return PropertyModel.create(data);
}

export async function updatePropertyMatchingLeads(
  propertyId: string,
  matches: Array<{ leadId: Types.ObjectId; score: number }>
): Promise<void> {
  await PropertyModel.findByIdAndUpdate(propertyId, {
    matchingLeads: matches.map((m) => ({
      leadId: m.leadId,
      score: m.score,
      matchedAt: new Date(),
    })),
  });
}
