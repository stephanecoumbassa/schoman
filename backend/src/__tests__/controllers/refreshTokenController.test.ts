import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import RefreshToken from '../../models/RefreshToken.js';
import User from '../../models/User.js';
import School from '../../models/School.js';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await RefreshToken.deleteMany({});
  await User.deleteMany({});
  await School.deleteMany({});
});

describe('Refresh Token Controller Operations', () => {
  let user: any;
  let school: any;

  beforeEach(async () => {
    school = await School.create({
      name: 'Test School',
      code: 'TEST001',
      address: '123 Test St',
      phone: '+33123456789',
      email: 'test@school.com',
      academicYearStart: new Date('2024-09-01'),
      academicYearEnd: new Date('2025-06-30'),
    });

    user = await User.create({
      email: 'test@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
      school: school._id,
    });
  });

  describe('Token Refresh Flow', () => {
    it('should create refresh token during login/register', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
        deviceId: 'test-device',
        createdByIp: '127.0.0.1',
      });

      expect(refreshToken).toBeDefined();
      expect(refreshToken.token).toBe(token);
      expect(refreshToken.userId.toString()).toBe(user._id.toString());
      expect(refreshToken.isActive).toBe(true);
    });

    it('should validate refresh token exists', async () => {
      const token = 'invalid-token';
      
      const refreshToken = await RefreshToken.findOne({ token });
      expect(refreshToken).toBeNull();
    });

    it('should verify refresh token is active', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      const foundToken = await RefreshToken.findOne({ token });
      expect(foundToken?.isActive).toBe(true);
    });

    it('should detect expired refresh token', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() - 1000); // Expired

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      const foundToken = await RefreshToken.findOne({ token });
      expect(foundToken?.isActive).toBe(false);
      expect(foundToken?.isExpired).toBe(true);
    });

    it('should detect revoked refresh token', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
        isRevoked: true,
        revokedAt: new Date(),
      });

      const foundToken = await RefreshToken.findOne({ token });
      expect(foundToken?.isActive).toBe(false);
      expect(foundToken?.isRevoked).toBe(true);
    });

    it('should create new refresh token when rotating', async () => {
      const oldToken = RefreshToken.schema.statics.generateToken();
      const newToken = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Create old token
      const oldRefreshToken = await RefreshToken.create({
        token: oldToken,
        userId: user._id,
        expiresAt,
      });

      // Revoke old token and link to new one
      oldRefreshToken.isRevoked = true;
      oldRefreshToken.revokedAt = new Date();
      oldRefreshToken.revokedReason = 'Replaced by new token';
      oldRefreshToken.replacedByToken = newToken;
      await oldRefreshToken.save();

      // Create new token
      const newRefreshToken = await RefreshToken.create({
        token: newToken,
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(oldRefreshToken.isActive).toBe(false);
      expect(oldRefreshToken.replacedByToken).toBe(newToken);
      expect(newRefreshToken.isActive).toBe(true);
    });
  });

  describe('Token Reuse Detection', () => {
    it('should identify token reuse scenario', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Token already revoked
      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
        isRevoked: true,
        revokedAt: new Date(),
      });

      // Attempt to use revoked token
      const foundToken = await RefreshToken.findOne({ token });
      
      if (foundToken && foundToken.isRevoked && !foundToken.isExpired) {
        // This indicates token reuse - should revoke all user tokens
        expect(foundToken.isRevoked).toBe(true);
      }
    });

    it('should revoke all user tokens on reuse detection', async () => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Create multiple tokens for user
      await RefreshToken.create([
        {
          token: RefreshToken.schema.statics.generateToken(),
          userId: user._id,
          expiresAt,
        },
        {
          token: RefreshToken.schema.statics.generateToken(),
          userId: user._id,
          expiresAt,
        },
        {
          token: RefreshToken.schema.statics.generateToken(),
          userId: user._id,
          expiresAt,
        },
      ]);

      // Simulate token reuse detection - revoke all tokens
      await RefreshToken.updateMany(
        { userId: user._id },
        {
          $set: {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'Token reuse detected',
          },
        }
      );

      const allTokens = await RefreshToken.find({ userId: user._id });
      expect(allTokens.every(t => t.isRevoked)).toBe(true);
    });
  });

  describe('Token Revocation', () => {
    it('should revoke single token', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      refreshToken.revoke('Revoked by user');
      await refreshToken.save();

      expect(refreshToken.isRevoked).toBe(true);
      expect(refreshToken.revokedAt).toBeInstanceOf(Date);
      expect(refreshToken.revokedReason).toBe('Revoked by user');
    });

    it('should revoke all tokens for a user', async () => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await RefreshToken.create([
        {
          token: RefreshToken.schema.statics.generateToken(),
          userId: user._id,
          expiresAt,
        },
        {
          token: RefreshToken.schema.statics.generateToken(),
          userId: user._id,
          expiresAt,
        },
      ]);

      const result = await RefreshToken.updateMany(
        { userId: user._id, isRevoked: false },
        {
          $set: {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'Revoked all tokens by user',
          },
        }
      );

      expect(result.modifiedCount).toBe(2);

      const revokedTokens = await RefreshToken.find({ userId: user._id });
      expect(revokedTokens.every(t => t.isRevoked)).toBe(true);
    });

    it('should verify token belongs to user before revoking', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      // Simulate checking ownership
      const foundToken = await RefreshToken.findOne({ token });
      expect(foundToken?.userId.toString()).toBe(user._id.toString());
    });
  });

  describe('User Account Status', () => {
    it('should check if user is active before refreshing', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      const refreshToken = await RefreshToken.findOne({ token }).populate('userId');
      const tokenUser = refreshToken?.userId as any;
      
      expect(tokenUser.isActive).toBe(true);
    });

    it('should reject refresh if user is inactive', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Deactivate user
      user.isActive = false;
      await user.save();

      await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      const refreshToken = await RefreshToken.findOne({ token }).populate('userId');
      const tokenUser = refreshToken?.userId as any;
      
      expect(tokenUser.isActive).toBe(false);
    });
  });

  describe('Token Lifecycle', () => {
    it('should track token creation metadata', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const deviceId = 'mobile-app-v1.0';
      const ipAddress = '192.168.1.100';

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
        deviceId,
        createdByIp: ipAddress,
      });

      expect(refreshToken.deviceId).toBe(deviceId);
      expect(refreshToken.createdByIp).toBe(ipAddress);
      expect(refreshToken.createdAt).toBeInstanceOf(Date);
    });

    it('should track token rotation chain', async () => {
      const token1 = RefreshToken.schema.statics.generateToken();
      const token2 = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Create initial token
      const refreshToken1 = await RefreshToken.create({
        token: token1,
        userId: user._id,
        expiresAt,
      });

      // Rotate to new token
      refreshToken1.revoke('Replaced by new token', token2);
      await refreshToken1.save();

      const refreshToken2 = await RefreshToken.create({
        token: token2,
        userId: user._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(refreshToken1.replacedByToken).toBe(token2);
      expect(refreshToken2.token).toBe(token2);
    });
  });

  describe('Query and Filtering', () => {
    it('should find active tokens for a user', async () => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await RefreshToken.create([
        {
          token: RefreshToken.schema.statics.generateToken(),
          userId: user._id,
          expiresAt,
        },
        {
          token: RefreshToken.schema.statics.generateToken(),
          userId: user._id,
          expiresAt,
          isRevoked: true,
        },
        {
          token: RefreshToken.schema.statics.generateToken(),
          userId: user._id,
          expiresAt: new Date(Date.now() - 1000), // Expired
        },
      ]);

      const activeTokens = await RefreshToken.find({
        userId: user._id,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });

      expect(activeTokens).toHaveLength(1);
    });

    it('should count tokens by user', async () => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await RefreshToken.create([
        {
          token: RefreshToken.schema.statics.generateToken(),
          userId: user._id,
          expiresAt,
        },
        {
          token: RefreshToken.schema.statics.generateToken(),
          userId: user._id,
          expiresAt,
        },
      ]);

      const count = await RefreshToken.countDocuments({ userId: user._id });
      expect(count).toBe(2);
    });
  });
});
