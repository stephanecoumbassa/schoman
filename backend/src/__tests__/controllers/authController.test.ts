import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

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
  await User.deleteMany({});
});

describe('Auth Controller', () => {
  describe('User Registration', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.password).not.toBe('password123'); // Password should be hashed
      expect(user.isActive).toBe(true);
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail with missing required fields', async () => {
      const invalidData = {
        email: 'test@example.com'
      };

      await expect(User.create(invalidData)).rejects.toThrow();
    });

    it('should lowercase email', async () => {
      const userData = {
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      const user = await User.create(userData);
      expect(user.email).toBe('test@example.com');
    });
  });

  describe('Password Comparison', () => {
    it('should correctly compare valid password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      const user = await User.create(userData);
      const isMatch = await user.comparePassword('password123');
      
      expect(isMatch).toBe(true);
    });

    it('should reject invalid password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      const user = await User.create(userData);
      const isMatch = await user.comparePassword('wrongpassword');
      
      expect(isMatch).toBe(false);
    });
  });

  describe('User Roles', () => {
    it('should create admin user', async () => {
      const adminData = {
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      };

      const admin = await User.create(adminData);
      expect(admin.role).toBe('admin');
    });

    it('should create teacher user', async () => {
      const teacherData = {
        email: 'teacher@example.com',
        password: 'password123',
        firstName: 'Teacher',
        lastName: 'User',
        role: 'teacher'
      };

      const teacher = await User.create(teacherData);
      expect(teacher.role).toBe('teacher');
    });

    it('should default to student role', async () => {
      const userData = {
        email: 'user@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Test'
      };

      const user = await User.create(userData);
      expect(user.role).toBe('student');
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      const user = await User.create(userData);
      
      const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });
  });

  describe('User Profile', () => {
    it('should store user profile information', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'teacher',
        phone: '+33123456789',
        address: '123 Test Street, Paris'
      };

      const user = await User.create(userData);
      
      expect(user.phone).toBe('+33123456789');
      expect(user.address).toBe('123 Test Street, Paris');
    });

    it('should update user profile', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      user.phone = '+33987654321';
      user.address = 'New Address';
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.phone).toBe('+33987654321');
      expect(updatedUser?.address).toBe('New Address');
    });
  });

  describe('User Deactivation', () => {
    it('should deactivate user', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      user.isActive = false;
      await user.save();

      const deactivatedUser = await User.findById(user._id);
      expect(deactivatedUser?.isActive).toBe(false);
    });

    it('should find only active users', async () => {
      await User.create({
        email: 'active@example.com',
        password: 'password123',
        firstName: 'Active',
        lastName: 'User',
        role: 'student',
        isActive: true
      });

      await User.create({
        email: 'inactive@example.com',
        password: 'password123',
        firstName: 'Inactive',
        lastName: 'User',
        role: 'student',
        isActive: false
      });

      const activeUsers = await User.find({ isActive: true });
      expect(activeUsers).toHaveLength(1);
      expect(activeUsers[0].email).toBe('active@example.com');
    });
  });
});
