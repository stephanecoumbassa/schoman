import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  isbn?: string;
  category: string;
  publisher?: string;
  publishedYear?: number;
  description?: string;
  totalQuantity: number;
  availableQuantity: number;
  location?: string;
  coverImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    publisher: {
      type: String,
      trim: true,
    },
    publishedYear: {
      type: Number,
    },
    description: {
      type: String,
    },
    totalQuantity: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
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

// Index for searching
BookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

export default mongoose.model<IBook>('Book', BookSchema);
