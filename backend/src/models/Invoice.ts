import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  student: mongoose.Types.ObjectId;
  items: {
    description: string;
    category: 'tuition' | 'activity' | 'material' | 'transport' | 'cafeteria' | 'other';
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: Date;
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'mobile_money';
  paymentReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    items: [
      {
        description: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          enum: ['tuition', 'activity', 'material', 'transport', 'cafeteria', 'other'],
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        totalPrice: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
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
InvoiceSchema.index({ student: 1, status: 1 });
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ status: 1, dueDate: 1 });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);
