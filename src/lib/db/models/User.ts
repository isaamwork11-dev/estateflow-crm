import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';
import type { UserRole } from '@/lib/constants';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: String,
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'COMPANY_OWNER', 'SALES_MANAGER', 'SALES_AGENT'],
      required: true,
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    isActive: { type: Boolean, default: true },
    notificationPrefs: {
      email: { type: Boolean, default: true },
      followUpReminders: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.index({ organizationId: 1, role: 1 });

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
  role: UserRole;
};

export const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>('User', UserSchema);
