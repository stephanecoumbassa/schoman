import mongoose, { Schema, Document } from 'mongoose';

export interface ILoan extends Document {
  book: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'borrowed' | 'returned' | 'overdue';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema: Schema = new Schema(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    borrowDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['borrowed', 'returned', 'overdue'],
      default: 'borrowed',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
LoanSchema.index({ student: 1, status: 1 });
LoanSchema.index({ book: 1, status: 1 });

export default mongoose.model<ILoan>('Loan', LoanSchema);
