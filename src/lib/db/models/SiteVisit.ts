import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const SiteVisitSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true, index: true },
    time: String,
    location: String,
    notes: String,
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'],
      default: 'Scheduled',
      index: true,
    },
    feedback: {
      interest: { type: String, enum: ['Hot', 'Warm', 'Cold'] },
      rating: Number,
      customerFeedback: String,
      nextActionType: String,
    },
  },
  { timestamps: true }
);

export type SiteVisitDocument = InferSchemaType<typeof SiteVisitSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SiteVisit: Model<SiteVisitDocument> =
  mongoose.models.SiteVisit ?? mongoose.model<SiteVisitDocument>('SiteVisit', SiteVisitSchema);
