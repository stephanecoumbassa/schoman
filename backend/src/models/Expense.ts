import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  expenseNumber: string;
  category: 'salaries' | 'supplies' | 'maintenance' | 'utilities' | 'rent' | 'transport' | 'equipment' | 'other';
  description: string;
  amount: number;
  expenseDate: Date;
  payee: string;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'mobile_money' | 'card' | 'other';
  reference?: string;
  receiptNumber?: string;
  notes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  academicYear: string;
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
    category: {
      type: String,
      enum: ['salaries', 'supplies', 'maintenance', 'utilities', 'rent', 'transport', 'equipment', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
    payee: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'check', 'bank_transfer', 'mobile_money', 'card', 'other'],
      required: true,
    },
    reference: {
      type: String,
    },
    receiptNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for text search
ExpenseSchema.index({ description: 'text', payee: 'text' });

// Generate expense number before saving
ExpenseSchema.pre('save', async function (next) {
  if (!this.expenseNumber || this.expenseNumber === '') {
    const count = await mongoose.model('Expense').countDocuments();
    const year = new Date().getFullYear();
    this.expenseNumber = `EXP-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
