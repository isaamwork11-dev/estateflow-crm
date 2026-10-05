import mongoose, { Schema, type InferSchemaType, type Types } from 'mongoose';

const ConversationMessageSchema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    body: { type: String, required: true },
    whatsappMessageId: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export type ConversationMessageDocument = InferSchemaType<typeof ConversationMessageSchema> & {
  _id: Types.ObjectId;
};

export const ConversationMessageModel = mongoose.model('ConversationMessage', ConversationMessageSchema);
