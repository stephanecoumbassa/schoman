import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  studentNumber: string;
  dateOfBirth: Date;
  placeOfBirth: string;
  gender: 'M' | 'F';
  class?: mongoose.Types.ObjectId;
  level?: string;
  school?: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  parentContact: {
    name: string;
    phone: string;
    email?: string;
    relationship: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
  };
  medicalInfo?: string;
  notes?: string;
  avatar?: string;
  isActive: boolean;
  enrollmentHistory?: {
    schoolYear: mongoose.Types.ObjectId;
    class: mongoose.Types.ObjectId;
    level: string;
    enrolledAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    placeOfBirth: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['M', 'F'],
      required: true,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
    },
    level: {
      type: String,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    parentContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      relationship: { type: String, required: true },
    },
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
    },
    medicalInfo: {
      type: String,
    },
    notes: {
      type: String,
    },
    avatar: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    enrollmentHistory: [
      {
        schoolYear: {
          type: Schema.Types.ObjectId,
          ref: 'SchoolYear',
        },
        class: {
          type: Schema.Types.ObjectId,
          ref: 'Class',
        },
        level: {
          type: String,
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStudent>('Student', StudentSchema);
