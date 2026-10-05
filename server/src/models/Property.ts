import mongoose, { Schema, type InferSchemaType, type Types } from 'mongoose';

const PropertyLeadMatchSchema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    score: { type: Number, required: true },
    matchedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PropertySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    propertyType: { type: String, required: true, trim: true, lowercase: true },
    purpose: { type: String, enum: ['sale', 'rent'], required: true },
    city: { type: String, trim: true },
    area: { type: String, trim: true },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    price: { type: Number, required: true, min: 0 },
    areaSize: { type: Number, min: 0 },
    areaUnit: { type: String, trim: true, default: 'Sq Ft' },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['available', 'sold', 'rented', 'inactive'],
      default: 'available',
      index: true,
    },
    brokerId: { type: Schema.Types.ObjectId, ref: 'User' },
    matchingLeads: { type: [PropertyLeadMatchSchema], default: [] },
  },
  { timestamps: true }
);

PropertySchema.index({ propertyType: 1, bedrooms: 1, price: 1, status: 1 });
PropertySchema.index({ area: 'text', city: 'text', title: 'text' });

export type PropertyDocument = InferSchemaType<typeof PropertySchema> & {
  _id: Types.ObjectId;
};

export const PropertyModel = mongoose.model('Property', PropertySchema);
