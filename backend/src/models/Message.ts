import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  subject: string;
  content: string;
  sender: mongoose.Types.ObjectId;
  recipients: mongoose.Types.ObjectId[];
  conversationId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'academic' | 'administrative' | 'event' | 'announcement';
  readBy: {
    user: mongoose.Types.ObjectId;
    readAt: Date;
  }[];
  isArchived: boolean;
  parentMessage?: mongoose.Types.ObjectId;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    conversationId: {
      type: String,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    category: {
      type: String,
      enum: ['general', 'academic', 'administrative', 'event', 'announcement'],
      default: 'general',
    },
    readBy: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
    parentMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
MessageSchema.index({ subject: 'text', content: 'text' });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipients: 1, createdAt: -1 });
MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ category: 1, priority: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
