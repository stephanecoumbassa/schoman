import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  level: string;
  academicYear: string;
  maxCapacity: number;
  currentEnrollment: number;
  mainTeacher?: mongoose.Types.ObjectId;
  schedule?: string;
  room?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    maxCapacity: {
      type: Number,
      required: true,
      default: 30,
    },
    currentEnrollment: {
      type: Number,
      default: 0,
    },
    mainTeacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    schedule: {
      type: String,
    },
    room: {
      type: String,
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

export default mongoose.model<IClass>('Class', ClassSchema);
