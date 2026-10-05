import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const TaskSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    type: {
      type: String,
      enum: [
        'call',
        'send_properties',
        'site_visit',
        'follow_up',
        'payment_plan',
        'negotiate',
        'feedback',
        'close',
        'note',
      ],
      required: true,
    },
    title: { type: String, required: true },
    dueAt: { type: Date, required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending', index: true },
    completedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

TaskSchema.index({ organizationId: 1, assignedTo: 1, dueAt: 1, status: 1 });

export type TaskDocument = InferSchemaType<typeof TaskSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Task: Model<TaskDocument> =
  mongoose.models.Task ?? mongoose.model<TaskDocument>('Task', TaskSchema);
