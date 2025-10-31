import mongoose, { Schema, Document } from 'mongoose';
import * as crypto from 'crypto';

export interface IRefreshToken extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  deviceId?: string;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  createdByIp?: string;
  replacedByToken?: string;
  createdAt: Date;
  updatedAt: Date;
  isExpired: boolean;
  isActive: boolean;
  revoke(reason?: string, replacedByToken?: string): void;
}

const RefreshTokenSchema: Schema = new Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
    },
    revokedReason: {
      type: String,
    },
    createdByIp: {
      type: String,
    },
    replacedByToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for checking if token is expired
RefreshTokenSchema.virtual('isExpired').get(function (this: IRefreshToken) {
  return Date.now() >= this.expiresAt.getTime();
});

// Virtual for checking if token is active
RefreshTokenSchema.virtual('isActive').get(function (this: IRefreshToken) {
  return !this.isRevoked && !this.isExpired;
});

// Index for cleanup and queries
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Static method to generate a new refresh token
RefreshTokenSchema.statics.generateToken = function (): string {
  return crypto.randomBytes(64).toString('hex');
};

// Instance method to revoke token
RefreshTokenSchema.methods.revoke = function (
  reason?: string,
  replacedByToken?: string
): void {
  this.isRevoked = true;
  this.revokedAt = new Date();
  if (reason) this.revokedReason = reason;
  if (replacedByToken) this.replacedByToken = replacedByToken;
};

export default mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
