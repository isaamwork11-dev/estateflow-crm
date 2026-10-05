import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    isDemo: { type: Boolean, default: false },
    logoUrl: String,
    phone: String,
    whatsapp: String,
    address: String,
    currency: { type: String, default: 'PKR' },
    branding: {
      primaryColor: { type: String, default: '#0f766e' },
    },
    defaults: {
      commissionPercent: { type: Number, default: 2 },
      agentSharePercent: { type: Number, default: 40 },
      followUpDays: { type: Number, default: 2 },
    },
    leadSources: { type: [String], default: ['Website', 'Referral', 'Walk-in', 'Social Media'] },
    propertyTypes: { type: [String], default: ['flat', 'house', 'plot', 'commercial'] },
    email: String,
    timezone: { type: String, default: 'Asia/Karachi' },
    scoringWeights: { type: Schema.Types.Mixed },
    followUpStaleDays: { type: Number, default: 7 },
  },
  { timestamps: true }
);

export type OrganizationDocument = InferSchemaType<typeof OrganizationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Organization: Model<OrganizationDocument> =
  mongoose.models.Organization ??
  mongoose.model<OrganizationDocument>('Organization', OrganizationSchema);
