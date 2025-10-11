import mongoose, { Schema, Document } from 'mongoose';

export interface ISchool extends Document {
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  director?: string;
  academicYearStart: string; // Format: MM-DD
  academicYearEnd: string; // Format: MM-DD
  settings: {
    currency: string;
    language: string;
    timezone: string;
    dateFormat: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    director: {
      type: String,
      trim: true,
    },
    academicYearStart: {
      type: String,
      default: '09-01', // September 1st
    },
    academicYearEnd: {
      type: String,
      default: '06-30', // June 30th
    },
    settings: {
      currency: {
        type: String,
        default: 'EUR',
      },
      language: {
        type: String,
        default: 'fr',
      },
      timezone: {
        type: String,
        default: 'Europe/Paris',
      },
      dateFormat: {
        type: String,
        default: 'DD/MM/YYYY',
      },
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

// Index for faster lookups
SchoolSchema.index({ code: 1 });
SchoolSchema.index({ isActive: 1 });

export default mongoose.model<ISchool>('School', SchoolSchema);
