import mongoose, { Schema, Document } from 'mongoose';

export interface IGrade extends Document {
  student: mongoose.Types.ObjectId;
  subject: string;
  class: mongoose.Types.ObjectId;
  evaluationType: 'Contrôle' | 'Devoir' | 'Examen' | 'Oral' | 'Projet';
  grade: number;
  maxGrade: number;
  coefficient: number;
  date: Date;
  academicYear: string;
  semester: '1' | '2';
  comments?: string;
  teacher: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema: Schema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    evaluationType: {
      type: String,
      enum: ['Contrôle', 'Devoir', 'Examen', 'Oral', 'Projet'],
      required: true,
    },
    grade: {
      type: Number,
      required: true,
      min: 0,
    },
    maxGrade: {
      type: Number,
      required: true,
      default: 20,
    },
    coefficient: {
      type: Number,
      default: 1,
      min: 0.5,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    academicYear: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      enum: ['1', '2'],
      required: true,
    },
    comments: {
      type: String,
      trim: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
GradeSchema.index({ student: 1, academicYear: 1, semester: 1 });
GradeSchema.index({ class: 1, subject: 1, date: -1 });

export default mongoose.model<IGrade>('Grade', GradeSchema);
