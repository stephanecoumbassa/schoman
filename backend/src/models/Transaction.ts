import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  transactionNumber: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  transactionDate: Date;
  paymentMethod?: string;
  reference?: string;
  relatedInvoice?: mongoose.Types.ObjectId;
  relatedExpense?: mongoose.Types.ObjectId;
  fiscalYear: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    transactionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'check', 'bank_transfer', 'mobile_money', 'other'],
    },
    reference: {
      type: String,
      trim: true,
    },
    relatedInvoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    relatedExpense: {
      type: Schema.Types.ObjectId,
      ref: 'Expense',
    },
    fiscalYear: {
      type: String,
      required: true,
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

// Index for queries
TransactionSchema.index({ type: 1, transactionDate: -1 });
TransactionSchema.index({ fiscalYear: 1, type: 1 });
TransactionSchema.index({ category: 1, type: 1 });
TransactionSchema.index({ transactionNumber: 1 });

// Auto-generate transaction number before saving
TransactionSchema.pre('save', async function (next) {
  if (this.isNew && !this.transactionNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Transaction').countDocuments({
      transactionNumber: new RegExp(`^TRX-${year}-`),
    });
    this.transactionNumber = `TRX-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
