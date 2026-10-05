import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const PresentationEventSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['created', 'viewed', 'property_viewed', 'interested', 'site_visit_request', 'contact_agent'],
      required: true,
    },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    at: { type: Date, default: Date.now },
    meta: Schema.Types.Mixed,
  },
  { _id: false }
);

const ClientPresentationSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    propertyIds: [{ type: Schema.Types.ObjectId, ref: 'Property', required: true }],
    agentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true, index: true },
    viewCount: { type: Number, default: 0 },
    events: { type: [PresentationEventSchema], default: [] },
    expiresAt: Date,
  },
  { timestamps: true }
);

export type ClientPresentationDocument = InferSchemaType<typeof ClientPresentationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ClientPresentation: Model<ClientPresentationDocument> =
  mongoose.models.ClientPresentation ??
  mongoose.model<ClientPresentationDocument>('ClientPresentation', ClientPresentationSchema);
