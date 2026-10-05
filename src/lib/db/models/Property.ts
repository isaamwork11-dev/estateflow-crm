import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const PropertySchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    propertyCode: { type: String, required: true, trim: true },
    referenceNumber: { type: String, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    transactionType: { type: String, enum: ['sale', 'rent'], required: true, index: true },
    price: { type: Number, required: true, index: true },
    propertyType: { type: String, required: true, index: true },
    area: String,
    size: Number,
    sizeUnit: { type: String, default: 'sqft' },
    bedrooms: Number,
    bathrooms: Number,
    location: String,
    society: String,
    city: { type: String, index: true },
    address: String,
    latitude: Number,
    longitude: Number,
    priceType: { type: String, default: 'fixed' },
    features: { type: [String], default: [] },
    description: String,
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    source: String,
    availability: {
      type: String,
      enum: ['available', 'reserved', 'sold', 'rented', 'archived'],
      default: 'available',
      index: true,
    },
    ownerName: String,
    ownerPhone: String,
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PropertySchema.index({ organizationId: 1, propertyCode: 1 }, { unique: true });
PropertySchema.index({ organizationId: 1, price: 1, propertyType: 1, availability: 1 });

export type PropertyDocument = InferSchemaType<typeof PropertySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Property: Model<PropertyDocument> =
  mongoose.models.Property ?? mongoose.model<PropertyDocument>('Property', PropertySchema);
