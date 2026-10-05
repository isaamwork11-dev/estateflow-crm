import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const ProjectSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    developer: String,
    city: String,
    area: String,
    description: String,
    amenities: [String],
    status: { type: String, default: 'ACTIVE' },
    images: [String],
    location: String,
  },
  { timestamps: true }
);

ProjectSchema.index({ organizationId: 1, name: 1 });

export type ProjectDocument = InferSchemaType<typeof ProjectSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Project: Model<ProjectDocument> =
  mongoose.models.Project ?? mongoose.model<ProjectDocument>('Project', ProjectSchema);
