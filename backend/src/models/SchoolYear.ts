import mongoose, { Schema, Document } from 'mongoose';

export interface ISchoolYear extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  status: 'active' | 'archived' | 'upcoming';
  school?: mongoose.Types.ObjectId;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolYearSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: ISchoolYear, value: Date) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'upcoming'],
      default: 'upcoming',
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
SchoolYearSchema.index({ school: 1, isCurrent: 1 });
SchoolYearSchema.index({ status: 1 });
SchoolYearSchema.index({ startDate: 1, endDate: 1 });

// Ensure only one current year per school
SchoolYearSchema.pre('save', async function (next) {
  if (this.isCurrent) {
    await mongoose.model('SchoolYear').updateMany(
      { _id: { $ne: this._id }, school: this.school },
      { isCurrent: false }
    );
  }
  next();
});

export default mongoose.model<ISchoolYear>('SchoolYear', SchoolYearSchema);
