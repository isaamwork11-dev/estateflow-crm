import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const ActivitySchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal' },
    type: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    metadata: Schema.Types.Mixed,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ActivitySchema.index({ organizationId: 1, leadId: 1, createdAt: -1 });

export type ActivityDocument = InferSchemaType<typeof ActivitySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Activity: Model<ActivityDocument> =
  mongoose.models.Activity ?? mongoose.model<ActivityDocument>('Activity', ActivitySchema);
