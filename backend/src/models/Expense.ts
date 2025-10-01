import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  category: string;
  amount: number;
  date: Date;
  description: string;
  vendor?: string;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'cancelled';
  schoolId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    category: {
      type: String,
      required: true,
      enum: ['salary', 'supplies', 'maintenance', 'utilities', 'rent', 'insurance', 'other'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    vendor: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cash', 'bank_transfer', 'credit_card', 'check'],
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IExpense>('Expense', expenseSchema);
