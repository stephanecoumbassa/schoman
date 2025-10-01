import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  category: 'salary' | 'supplies' | 'maintenance' | 'utilities' | 'other';
  description: string;
  amount: number;
  date: Date;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'other';
  status: 'pending' | 'paid';
  vendor?: string;
  invoiceRef?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    category: {
      type: String,
      enum: ['salary', 'supplies', 'maintenance', 'utilities', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'cheque', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    vendor: String,
    invoiceRef: String,
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

export default mongoose.model<IExpense>('Expense', expenseSchema);
