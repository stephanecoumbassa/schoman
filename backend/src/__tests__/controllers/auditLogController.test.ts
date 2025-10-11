import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import AuditLog from '../../models/AuditLog.js';
import User from '../../models/User.js';
import auditLogRoutes from '../../routes/auditLogRoutes.js';
import { logAuditEntry } from '../../middleware/auditLogger.js';
import jwt from 'jsonwebtoken';

let mongoServer: MongoMemoryServer;
let app: Express;
let adminToken: string;
let userToken: string;
let adminUser: any;
let regularUser: any;

beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test users
  adminUser = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    password: 'Password123!',
    role: 'admin'
  });

  regularUser = await User.create({
    firstName: 'Regular',
    lastName: 'User',
    email: 'user@test.com',
    password: 'Password123!',
    role: 'teacher'
  });

  // Generate tokens
  adminToken = jwt.sign(
    { id: adminUser._id, email: adminUser.email, role: adminUser.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );

  userToken = jwt.sign(
    { id: regularUser._id, email: regularUser.email, role: regularUser.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );

  // Setup Express app
  app = express();
  app.use(express.json());
  app.use('/api/audit-logs', auditLogRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear audit logs before each test
  await AuditLog.deleteMany({});
});

describe('Audit Log Controller', () => {
  describe('POST - Create audit logs', () => {
    it('should create an audit log entry manually', async () => {
      await logAuditEntry({
        user: adminUser._id.toString(),
        action: 'login',
        resource: 'Auth',
        method: 'POST',
        endpoint: '/api/auth/login',
        statusCode: 200,
        ipAddress: '127.0.0.1'
      });

      const logs = await AuditLog.find({});
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('login');
      expect(logs[0].resource).toBe('Auth');
      expect(logs[0].statusCode).toBe(200);
    });

    it('should include metadata when creating audit log', async () => {
      await logAuditEntry({
        user: adminUser._id.toString(),
        action: 'create_student',
        resource: 'Student',
        resourceId: '123456',
        method: 'POST',
        endpoint: '/api/students',
        statusCode: 201,
        metadata: {
          studentName: 'John Doe',
          class: 'Grade 1'
        }
      });

      const log = await AuditLog.findOne({ action: 'create_student' });
      expect(log).toBeTruthy();
      expect(log?.metadata).toEqual({
        studentName: 'John Doe',
        class: 'Grade 1'
      });
    });
  });

  describe('GET /api/audit-logs - Get all audit logs', () => {
    beforeEach(async () => {
      // Create sample audit logs
      await AuditLog.create([
        {
          user: adminUser._id,
          action: 'login',
          resource: 'Auth',
          method: 'POST',
          endpoint: '/api/auth/login',
          statusCode: 200
        },
        {
          user: regularUser._id,
          action: 'create_student',
          resource: 'Student',
          method: 'POST',
          endpoint: '/api/students',
          statusCode: 201
        },
        {
          user: regularUser._id,
          action: 'update_grade',
          resource: 'Grade',
          method: 'PUT',
          endpoint: '/api/grades/123',
          statusCode: 200
        }
      ]);
    });

    it('should return audit logs for admin', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs).toHaveLength(3);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(3);
    });

    it('should deny access for non-admin users', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('administrateurs');
    });

    it('should filter by action', async () => {
      const res = await request(app)
        .get('/api/audit-logs?action=login')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs).toHaveLength(1);
      expect(res.body.logs[0].action).toBe('login');
    });

    it('should filter by resource', async () => {
      const res = await request(app)
        .get('/api/audit-logs?resource=Student')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs).toHaveLength(1);
      expect(res.body.logs[0].resource).toBe('Student');
    });

    it('should filter by user', async () => {
      const res = await request(app)
        .get(`/api/audit-logs?userId=${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs).toHaveLength(2);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/audit-logs?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs).toHaveLength(2);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.pages).toBe(2);
    });
  });

  describe('GET /api/audit-logs/my - Get my audit logs', () => {
    beforeEach(async () => {
      await AuditLog.create([
        {
          user: regularUser._id,
          action: 'login',
          resource: 'Auth',
          method: 'POST',
          endpoint: '/api/auth/login',
          statusCode: 200
        },
        {
          user: regularUser._id,
          action: 'update_grade',
          resource: 'Grade',
          method: 'PUT',
          endpoint: '/api/grades/123',
          statusCode: 200
        },
        {
          user: adminUser._id,
          action: 'create_user',
          resource: 'User',
          method: 'POST',
          endpoint: '/api/users',
          statusCode: 201
        }
      ]);
    });

    it('should return only current user audit logs', async () => {
      const res = await request(app)
        .get('/api/audit-logs/my')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs).toHaveLength(2);
      expect(res.body.logs.every((log: any) => log.user.toString() === regularUser._id.toString())).toBe(true);
    });

    it('should filter by action', async () => {
      const res = await request(app)
        .get('/api/audit-logs/my?action=login')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs).toHaveLength(1);
      expect(res.body.logs[0].action).toBe('login');
    });
  });

  describe('GET /api/audit-logs/stats - Get audit statistics', () => {
    beforeEach(async () => {
      await AuditLog.create([
        {
          user: adminUser._id,
          action: 'login',
          resource: 'Auth',
          method: 'POST',
          endpoint: '/api/auth/login',
          statusCode: 200
        },
        {
          user: regularUser._id,
          action: 'login',
          resource: 'Auth',
          method: 'POST',
          endpoint: '/api/auth/login',
          statusCode: 200
        },
        {
          user: regularUser._id,
          action: 'create_student',
          resource: 'Student',
          method: 'POST',
          endpoint: '/api/students',
          statusCode: 201
        },
        {
          user: regularUser._id,
          action: 'create_student',
          resource: 'Student',
          method: 'POST',
          endpoint: '/api/students',
          statusCode: 400,
          error: 'Validation error'
        }
      ]);
    });

    it('should return statistics for admin', async () => {
      const res = await request(app)
        .get('/api/audit-logs/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalLogs).toBe(4);
      expect(res.body.errorLogs).toBe(1);
      expect(res.body.successRate).toBeDefined();
      expect(res.body.topActions).toBeDefined();
      expect(res.body.topResources).toBeDefined();
      expect(res.body.topUsers).toBeDefined();
    });

    it('should deny access for non-admin users', async () => {
      const res = await request(app)
        .get('/api/audit-logs/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should calculate success rate correctly', async () => {
      const res = await request(app)
        .get('/api/audit-logs/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(parseFloat(res.body.successRate)).toBe(75); // 3 out of 4 successful
    });
  });

  describe('GET /api/audit-logs/:id - Get single audit log', () => {
    it('should return a single audit log for admin', async () => {
      const log = await AuditLog.create({
        user: regularUser._id,
        action: 'login',
        resource: 'Auth',
        method: 'POST',
        endpoint: '/api/auth/login',
        statusCode: 200
      });

      const logId = (log._id as mongoose.Types.ObjectId).toString();
      const res = await request(app)
        .get(`/api/audit-logs/${logId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body._id).toBe(logId);
      expect(res.body.action).toBe('login');
    });

    it('should return 404 for non-existent log', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/audit-logs/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should deny access for non-admin users', async () => {
      const log = await AuditLog.create({
        user: regularUser._id,
        action: 'login',
        resource: 'Auth',
        method: 'POST',
        endpoint: '/api/auth/login',
        statusCode: 200
      });

      const logId = (log._id as mongoose.Types.ObjectId).toString();
      const res = await request(app)
        .get(`/api/audit-logs/${logId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/audit-logs/old - Delete old logs', () => {
    beforeEach(async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 400); // 400 days ago

      await AuditLog.create([
        {
          user: adminUser._id,
          action: 'login',
          resource: 'Auth',
          method: 'POST',
          endpoint: '/api/auth/login',
          statusCode: 200,
          createdAt: oldDate
        },
        {
          user: regularUser._id,
          action: 'login',
          resource: 'Auth',
          method: 'POST',
          endpoint: '/api/auth/login',
          statusCode: 200,
          createdAt: new Date() // Recent
        }
      ]);
    });

    it('should delete old logs for admin', async () => {
      const res = await request(app)
        .delete('/api/audit-logs/old?days=365')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.deletedCount).toBe(1);

      const remainingLogs = await AuditLog.find({});
      expect(remainingLogs).toHaveLength(1);
    });

    it('should deny access for non-admin users', async () => {
      const res = await request(app)
        .delete('/api/audit-logs/old?days=365')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should use default retention of 365 days', async () => {
      const res = await request(app)
        .delete('/api/audit-logs/old')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.deletedCount).toBe(1);
    });
  });
});
