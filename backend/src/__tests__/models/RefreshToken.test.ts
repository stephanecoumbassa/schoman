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

describe('RefreshToken Model', () => {
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

  describe('Create RefreshToken', () => {
    it('should create refresh token with valid data', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
        createdByIp: '127.0.0.1',
      });

      expect(refreshToken.token).toBe(token);
      expect(refreshToken.userId.toString()).toBe(user._id.toString());
      expect(refreshToken.expiresAt).toBeInstanceOf(Date);
      expect(refreshToken.isRevoked).toBe(false);
    });

    it('should generate unique tokens', () => {
      const token1 = RefreshToken.schema.statics.generateToken();
      const token2 = RefreshToken.schema.statics.generateToken();
      
      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(0);
      expect(token2.length).toBeGreaterThan(0);
    });

    it('should require token field', async () => {
      await expect(
        RefreshToken.create({
          userId: user._id,
          expiresAt: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should require userId field', async () => {
      await expect(
        RefreshToken.create({
          token: 'test-token',
          expiresAt: new Date(),
        })
      ).rejects.toThrow();
    });

    it('should require expiresAt field', async () => {
      await expect(
        RefreshToken.create({
          token: 'test-token',
          userId: user._id,
        })
      ).rejects.toThrow();
    });

    it('should enforce unique token constraint', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      await expect(
        RefreshToken.create({
          token,
          userId: user._id,
          expiresAt,
        })
      ).rejects.toThrow();
    });
  });

  describe('Token Expiration', () => {
    it('should identify expired tokens', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() - 1000); // Expired 1 second ago

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      const savedToken = await RefreshToken.findById(refreshToken._id);
      expect(savedToken?.isExpired).toBe(true);
    });

    it('should identify active tokens', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      const savedToken = await RefreshToken.findById(refreshToken._id);
      expect(savedToken?.isExpired).toBe(false);
    });
  });

  describe('Token Revocation', () => {
    it('should revoke token successfully', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      refreshToken.revoke('Manual revocation');
      await refreshToken.save();

      const revokedToken = await RefreshToken.findById(refreshToken._id);
      expect(revokedToken?.isRevoked).toBe(true);
      expect(revokedToken?.revokedAt).toBeInstanceOf(Date);
      expect(revokedToken?.revokedReason).toBe('Manual revocation');
    });

    it('should revoke token with replacement', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const newToken = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      refreshToken.revoke('Token rotation', newToken);
      await refreshToken.save();

      const revokedToken = await RefreshToken.findById(refreshToken._id);
      expect(revokedToken?.isRevoked).toBe(true);
      expect(revokedToken?.replacedByToken).toBe(newToken);
    });

    it('should mark revoked token as inactive', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      refreshToken.revoke('Test revocation');
      await refreshToken.save();

      const revokedToken = await RefreshToken.findById(refreshToken._id);
      expect(revokedToken?.isActive).toBe(false);
    });
  });

  describe('Token Active Status', () => {
    it('should mark non-revoked, non-expired token as active', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      const savedToken = await RefreshToken.findById(refreshToken._id);
      expect(savedToken?.isActive).toBe(true);
    });

    it('should mark revoked token as inactive', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
        isRevoked: true,
        revokedAt: new Date(),
      });

      const savedToken = await RefreshToken.findById(refreshToken._id);
      expect(savedToken?.isActive).toBe(false);
    });

    it('should mark expired token as inactive', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() - 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      const savedToken = await RefreshToken.findById(refreshToken._id);
      expect(savedToken?.isActive).toBe(false);
    });
  });

  describe('Device and IP Tracking', () => {
    it('should store device ID', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
        deviceId: 'mobile-device-123',
      });

      expect(refreshToken.deviceId).toBe('mobile-device-123');
    });

    it('should store IP address', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
        createdByIp: '192.168.1.1',
      });

      expect(refreshToken.createdByIp).toBe('192.168.1.1');
    });
  });

  describe('User Association', () => {
    it('should populate user details', async () => {
      const token = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const refreshToken = await RefreshToken.create({
        token,
        userId: user._id,
        expiresAt,
      });

      const populatedToken = await RefreshToken.findById(refreshToken._id).populate('userId');
      expect(populatedToken?.userId).toHaveProperty('email');
      expect((populatedToken?.userId as any).email).toBe('test@test.com');
    });

    it('should query tokens by user', async () => {
      const token1 = RefreshToken.schema.statics.generateToken();
      const token2 = RefreshToken.schema.statics.generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await RefreshToken.create([
        { token: token1, userId: user._id, expiresAt },
        { token: token2, userId: user._id, expiresAt },
      ]);

      const userTokens = await RefreshToken.find({ userId: user._id });
      expect(userTokens).toHaveLength(2);
    });
  });

  describe('Bulk Operations', () => {
    it('should revoke all tokens for a user', async () => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await RefreshToken.create([
        { token: RefreshToken.schema.statics.generateToken(), userId: user._id, expiresAt },
        { token: RefreshToken.schema.statics.generateToken(), userId: user._id, expiresAt },
        { token: RefreshToken.schema.statics.generateToken(), userId: user._id, expiresAt },
      ]);

      await RefreshToken.updateMany(
        { userId: user._id },
        { 
          $set: { 
            isRevoked: true, 
            revokedAt: new Date(), 
            revokedReason: 'Bulk revocation' 
          } 
        }
      );

      const revokedTokens = await RefreshToken.find({ userId: user._id, isRevoked: true });
      expect(revokedTokens).toHaveLength(3);
    });
  });
});
