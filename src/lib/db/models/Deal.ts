import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const DealSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    salePrice: { type: Number, required: true },
    commissionPercent: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    agentSharePercent: { type: Number, required: true },
    agentCommission: { type: Number, required: true },
    companyCommission: { type: Number, required: true },
    dealDate: { type: Date, required: true, index: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending',
    },
    notes: String,
    status: { type: String, enum: ['open', 'closed', 'cancelled'], default: 'open', index: true },
  },
  { timestamps: true }
);

DealSchema.index({ organizationId: 1, leadId: 1, propertyId: 1 }, { unique: true });

export type DealDocument = InferSchemaType<typeof DealSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Deal: Model<DealDocument> =
  mongoose.models.Deal ?? mongoose.model<DealDocument>('Deal', DealSchema);
