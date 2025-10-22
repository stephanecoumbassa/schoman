import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  date: Date;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  timeIn?: Date;
  timeOut?: Date;
  reason?: string;
  recordedBy: mongoose.Types.ObjectId;
  comments?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      required: true,
      default: 'Present',
    },
    timeIn: {
      type: Date,
    },
    timeOut: {
      type: Date,
    },
    reason: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comments: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
AttendanceSchema.index({ student: 1, date: -1 });
AttendanceSchema.index({ class: 1, date: -1 });
AttendanceSchema.index({ student: 1, class: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
