import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  dateOfBirth: Date;
  classId?: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  medicalInfo?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  schoolId: mongoose.Types.ObjectId;
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
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    medicalInfo: {
      type: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
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

export default mongoose.model<IStudent>('Student', studentSchema);
