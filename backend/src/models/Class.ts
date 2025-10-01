import mongoose, { Document, Schema } from 'mongoose';

export interface IClass extends Document {
  name: string;
  level: string;
  academicYear: string;
  classTeacher?: mongoose.Types.ObjectId;
  capacity: number;
  room?: string;
  createdAt: Date;
  updatedAt: Date;
}

const classSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    classTeacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
    },
    capacity: {
      type: Number,
      required: true,
      default: 30,
    },
    room: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClass>('Class', classSchema);
