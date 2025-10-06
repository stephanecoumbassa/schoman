import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  expenseNumber: string;
  title: string;
  description?: string;
  category: 'salary' | 'supplies' | 'maintenance' | 'utilities' | 'transport' | 'food' | 'equipment' | 'other';
  amount: number;
  expenseDate: Date;
  paymentDate?: Date;
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'mobile_money';
  paymentReference?: string;
  supplier?: string;
  supplierContact?: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  attachments?: string[];
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    expenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['salary', 'supplies', 'maintenance', 'utilities', 'transport', 'food', 'equipment', 'other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    expenseDate: {
      type: Date,
      required: true,
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'check', 'bank_transfer', 'credit_card', 'mobile_money'],
    },
    paymentReference: {
      type: String,
      trim: true,
    },
    supplier: {
      type: String,
      trim: true,
    },
    supplierContact: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: {
      type: Date,
    },
    attachments: [
      {
        type: String,
      },
    ],
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

// Create indexes
ExpenseSchema.index({ title: 'text', description: 'text' });
ExpenseSchema.index({ expenseDate: -1 });
ExpenseSchema.index({ category: 1, status: 1 });
ExpenseSchema.index({ expenseNumber: 1 });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
