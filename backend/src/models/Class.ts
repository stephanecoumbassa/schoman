import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  level: string;
  academicYear: string;
  teacherId?: mongoose.Types.ObjectId;
  capacity: number;
  schoolId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
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
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    capacity: {
      type: Number,
      required: true,
      default: 30,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClass>('Class', classSchema);
