import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  class: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  dayOfWeek: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  startTime: string; // Format: "08:00"
  endTime: string;   // Format: "09:00"
  room?: string;
  academicYear: string;
  isRecurring: boolean;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema: Schema = new Schema(
  {
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    room: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    isRecurring: {
      type: Boolean,
      default: true,
    },
    notes: {
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
ScheduleSchema.index({ class: 1, dayOfWeek: 1, academicYear: 1 });
ScheduleSchema.index({ teacher: 1, dayOfWeek: 1, academicYear: 1 });
ScheduleSchema.index({ academicYear: 1, isActive: 1 });

// Validate that endTime is after startTime
ScheduleSchema.pre('save', function (next) {
  const startTime = (this as any).startTime as string;
  const endTime = (this as any).endTime as string;
  
  const start = startTime.split(':').map(Number);
  const end = endTime.split(':').map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    return next(new Error('L\'heure de fin doit être après l\'heure de début'));
  }
  
  next();
});

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);
