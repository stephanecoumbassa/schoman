import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  parentInfo: {
    parentId?: mongoose.Types.ObjectId;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
  };
  enrollmentDate: Date;
  classId?: mongoose.Types.ObjectId;
  photo?: string;
  medicalInfo?: string;
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
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
    parentInfo: {
      parentId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      parentName: String,
      parentPhone: String,
      parentEmail: String,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
    photo: String,
    medicalInfo: String,
    emergencyContact: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStudent>('Student', studentSchema);
