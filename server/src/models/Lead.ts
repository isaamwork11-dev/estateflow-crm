import mongoose, { Schema, type InferSchemaType, type Types } from 'mongoose';

const LeadRequirementSchema = new Schema(
  {
    budgetMax: { type: Number, min: 0 },
    budgetMin: { type: Number, min: 0 },
    propertyType: { type: String, trim: true, lowercase: true },
    purpose: { type: String, enum: ['sale', 'rent'] },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    city: { type: String, trim: true },
    area: { type: String, trim: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const LeadSchema = new Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    whatsappId: { type: String, trim: true, index: true },
    requirement: { type: LeadRequirementSchema, default: () => ({}) },
    lastDiscussedPropertyIds: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    lastMatchingPropertyIds: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    source: { type: String, default: 'whatsapp' },
  },
  { timestamps: true }
);

LeadSchema.index({ 'requirement.propertyType': 1, 'requirement.bedrooms': 1 });

export type LeadDocument = InferSchemaType<typeof LeadSchema> & {
  _id: Types.ObjectId;
};

export const LeadModel = mongoose.model('Lead', LeadSchema);
