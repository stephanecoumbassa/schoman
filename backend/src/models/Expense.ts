import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  description: string;
  category: 'salaries' | 'supplies' | 'maintenance' | 'utilities' | 'transport' | 'other';
  amount: number;
  date: Date;
  vendor?: string;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'mobile_money';
  paymentReference?: string;
  receiptNumber?: string;
  recordedBy: mongoose.Types.ObjectId;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['salaries', 'supplies', 'maintenance', 'utilities', 'transport', 'other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    vendor: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'check', 'bank_transfer', 'credit_card', 'mobile_money'],
      required: true,
    },
    paymentReference: {
      type: String,
      trim: true,
    },
    receiptNumber: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Indexes for faster queries
ExpenseSchema.index({ category: 1, date: -1 });
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ recordedBy: 1, date: -1 });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
