import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  description?: string;
  level: string;
  defaultCoefficient: number;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      required: true,
    },
    defaultCoefficient: {
      type: Number,
      required: true,
      default: 1,
      min: 0.5,
      max: 5,
    },
    color: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
SubjectSchema.index({ code: 1 });
SubjectSchema.index({ level: 1, isActive: 1 });

export default mongoose.model<ISubject>('Subject', SubjectSchema);
