import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  studentId: mongoose.Types.ObjectId;
  amount: number;
  dueDate: Date;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  items: {
    description: string;
    amount: number;
  }[];
  academicYear: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'overdue'],
      default: 'pending',
    },
    items: [{
      description: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    }],
    academicYear: {
      type: String,
      required: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IInvoice>('Invoice', invoiceSchema);
