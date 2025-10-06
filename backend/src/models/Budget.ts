import mongoose, { Schema, Document } from 'mongoose';

export interface IBudgetItem {
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  description?: string;
}

export interface IBudget extends Document {
  name: string;
  fiscalYear: string;
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  incomeItems: IBudgetItem[];
  expenseItems: IBudgetItem[];
  status: 'draft' | 'active' | 'closed';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetItemSchema = new Schema({
  category: {
    type: String,
    required: true,
    trim: true,
  },
  allocatedAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  spentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
  },
}, { _id: false });

const BudgetSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fiscalYear: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    incomeItems: [BudgetItemSchema],
    expenseItems: [BudgetItemSchema],
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'draft',
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
BudgetSchema.index({ fiscalYear: 1, status: 1 });
BudgetSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model<IBudget>('Budget', BudgetSchema);
