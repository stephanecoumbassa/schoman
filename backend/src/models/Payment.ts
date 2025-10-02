import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  paymentNumber: string;
  invoice: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'mobile_money' | 'card' | 'other';
  reference?: string;
  notes?: string;
  receivedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'check', 'bank_transfer', 'mobile_money', 'card', 'other'],
      required: true,
    },
    reference: {
      type: String,
    },
    notes: {
      type: String,
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate payment number before saving
PaymentSchema.pre('save', async function (next) {
  if (!this.paymentNumber || this.paymentNumber === '') {
    const count = await mongoose.model('Payment').countDocuments();
    const year = new Date().getFullYear();
    this.paymentNumber = `PAY-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);
