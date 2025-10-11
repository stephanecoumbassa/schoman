import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  name: string;
  description?: string;
  type: 'students' | 'grades' | 'attendance' | 'finances' | 'custom';
  template?: string; // Predefined template name
  fields: string[]; // Fields to include in report
  filters: {
    field: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
    value: any;
  }[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  format: 'pdf' | 'excel' | 'csv';
  scheduled?: boolean;
  scheduleExpression?: string; // Cron expression
  createdBy: mongoose.Types.ObjectId;
  school: mongoose.Types.ObjectId;
  lastRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['students', 'grades', 'attendance', 'finances', 'custom'],
      required: true,
    },
    template: {
      type: String,
      trim: true,
    },
    fields: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0;
        },
        message: 'At least one field must be selected',
      },
    },
    filters: [
      {
        field: {
          type: String,
          required: true,
        },
        operator: {
          type: String,
          enum: ['equals', 'contains', 'gt', 'lt', 'gte', 'lte', 'in', 'between'],
          required: true,
        },
        value: {
          type: Schema.Types.Mixed,
          required: true,
        },
      },
    ],
    sortBy: {
      type: String,
    },
    sortOrder: {
      type: String,
      enum: ['asc', 'desc'],
      default: 'asc',
    },
    format: {
      type: String,
      enum: ['pdf', 'excel', 'csv'],
      required: true,
      default: 'pdf',
    },
    scheduled: {
      type: Boolean,
      default: false,
    },
    scheduleExpression: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    lastRun: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ReportSchema.index({ school: 1, createdBy: 1 });
ReportSchema.index({ type: 1, school: 1 });
ReportSchema.index({ scheduled: 1 });

export default mongoose.model<IReport>('Report', ReportSchema);
