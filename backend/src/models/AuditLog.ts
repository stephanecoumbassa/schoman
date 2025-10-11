import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  user?: mongoose.Types.ObjectId;
  school?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  duration?: number; // in milliseconds
  error?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true,
    trim: true
    // Examples: 'login', 'logout', 'create_student', 'update_grade', 'delete_invoice'
  },
  resource: {
    type: String,
    required: true,
    index: true,
    trim: true
    // Examples: 'User', 'Student', 'Grade', 'Invoice', 'Auth'
  },
  resourceId: {
    type: String,
    index: true
    // ID of the affected resource (if applicable)
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  statusCode: {
    type: Number,
    required: true,
    index: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  changes: {
    before: {
      type: Schema.Types.Mixed
    },
    after: {
      type: Schema.Types.Mixed
    }
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  duration: {
    type: Number // milliseconds
  },
  error: {
    type: String
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes for efficient querying
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ school: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ statusCode: 1, createdAt: -1 });

// TTL index to automatically delete old logs after 1 year (optional)
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
