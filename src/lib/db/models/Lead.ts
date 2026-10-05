import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const LeadSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    whatsapp: String,
    email: { type: String, trim: true, lowercase: true, index: true },
    source: { type: String, default: 'Manual' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    status: { type: String, default: 'NEW', index: true },
    priority: { type: String, default: 'COLD', index: true },
    score: { type: Number, default: 0, min: 0, max: 100 },
    scoreReasons: { type: [String], default: [] },
    budget: Number,
    budgetMin: Number,
    budgetMax: Number,
    preferredCity: String,
    preferredArea: String,
    preferredAreas: [String],
    propertyType: String,
    transactionType: { type: String, enum: ['sale', 'rent'], default: 'sale' },
    purpose: { type: String, enum: ['living', 'investment'], default: 'living' },
    bedrooms: Number,
    bathrooms: Number,
    size: Number,
    sizeUnit: { type: String, default: 'sqft' },
    purchaseTimeline: String,
    buyingTimeline: String,
    notes: String,
    phoneVerified: { type: Boolean, default: false },
    selectedPropertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    lastContactAt: { type: Date, index: true },
    nextFollowUpAt: { type: Date, index: true },
    isStale: { type: Boolean, default: false, index: true },
    shortlistedPropertyIds: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LeadSchema.index({ organizationId: 1, status: 1, priority: 1 });
LeadSchema.index({ organizationId: 1, phone: 1 });
LeadSchema.index({ organizationId: 1, email: 1 });
LeadSchema.index({ organizationId: 1, assignedTo: 1, nextFollowUpAt: 1 });
LeadSchema.index({ organizationId: 1, name: 'text', phone: 'text', preferredArea: 'text' });

export type LeadDocument = InferSchemaType<typeof LeadSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Lead: Model<LeadDocument> =
  mongoose.models.Lead ?? mongoose.model<LeadDocument>('Lead', LeadSchema);
