import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const NotificationSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: String,
    read: { type: Boolean, default: false, index: true },
    refType: String,
    refId: Schema.Types.Mixed,
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ organizationId: 1, userId: 1, read: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<typeof NotificationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Notification: Model<NotificationDocument> =
  mongoose.models.Notification ?? mongoose.model<NotificationDocument>('Notification', NotificationSchema);
