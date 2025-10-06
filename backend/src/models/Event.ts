import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description?: string;
  eventType: 'meeting' | 'celebration' | 'outing' | 'conference' | 'exam' | 'holiday' | 'other';
  startDate: Date;
  endDate: Date;
  location?: string;
  organizer?: mongoose.Types.ObjectId;
  targetAudience: ('all' | 'students' | 'teachers' | 'parents' | 'admin')[];
  classes?: mongoose.Types.ObjectId[];
  maxParticipants?: number;
  currentParticipants: number;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['meeting', 'celebration', 'outing', 'conference', 'exam', 'holiday', 'other'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    targetAudience: {
      type: [String],
      enum: ['all', 'students', 'teachers', 'parents', 'admin'],
      default: ['all'],
    },
    classes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    maxParticipants: {
      type: Number,
      min: 0,
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['planned', 'ongoing', 'completed', 'cancelled'],
      default: 'planned',
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for searching
EventSchema.index({ title: 'text', description: 'text' });
EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ eventType: 1, status: 1 });

export default mongoose.model<IEvent>('Event', EventSchema);
