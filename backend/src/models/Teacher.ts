import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  userId: mongoose.Types.ObjectId;
  teacherId: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  hireDate: Date;
  subjects: mongoose.Types.ObjectId[];
  qualification: string;
  salary?: number;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema = new Schema<ITeacher>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherId: {
      type: String,
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
    subjects: [{
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    }],
    qualification: {
      type: String,
      required: true,
    },
    salary: Number,
    photo: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITeacher>('Teacher', teacherSchema);
