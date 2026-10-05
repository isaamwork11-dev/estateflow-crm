import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const PaymentSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    dealId: { type: Schema.Types.ObjectId, ref: 'Deal', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true, index: true },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE', 'OTHER'],
      default: 'BANK_TRANSFER',
    },
    reference: String,
    notes: String,
  },
  { timestamps: true }
);

export type PaymentDocument = InferSchemaType<typeof PaymentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Payment: Model<PaymentDocument> =
  mongoose.models.Payment ?? mongoose.model<PaymentDocument>('Payment', PaymentSchema);
