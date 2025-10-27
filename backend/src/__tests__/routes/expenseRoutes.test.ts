import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express, { Express } from 'express';
import expenseRoutes from '../../routes/expenseRoutes.js';
import Expense from '../../models/Expense.js';
import User from '../../models/User.js';
import School from '../../models/School.js';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../middleware/auth.js';

let mongoServer: MongoMemoryServer;
let app: Express;
let authToken: string;
let adminId: string;
let schoolId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Setup Express app
  app = express();
  app.use(express.json());
  app.use('/api/expenses', authenticate, expenseRoutes);

  // Create test data
  const school = await School.create({
    name: 'Test School',
    code: 'TEST001',
    address: '123 Test St',
    phone: '+33123456789',
    email: 'test@school.com',
    academicYearStart: new Date('2024-09-01'),
    academicYearEnd: new Date('2025-06-30')
  });
  schoolId = school._id!.toString();

  const admin = await User.create({
    email: 'admin@test.com',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    school: school._id
  });
  adminId = admin._id!.toString();

  // Generate auth token
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
  authToken = jwt.sign(
    {
      id: adminId,
      email: admin.email,
      role: admin.role,
      school: schoolId
    },
    JWT_SECRET
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Expense.deleteMany({});
});

describe('Expense Routes', () => {
  describe('POST /api/expenses', () => {
    it('should create expense with valid data', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Office Supplies',
          description: 'Purchase of office supplies',
          category: 'supplies',
          amount: 500,
          expenseDate: new Date().toISOString(),
          supplier: 'Office Depot',
          supplierContact: '+33123456789'
        });

      expect(response.status).toBe(201);
      expect(response.body.expense).toBeDefined();
      expect(response.body.expense.expenseNumber).toMatch(/^EXP-\d{4}-\d{5}$/);
      expect(response.body.expense.title).toBe('Office Supplies');
      expect(response.body.expense.amount).toBe(500);
      expect(response.body.expense.status).toBe('pending');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .send({
          title: 'Test Expense',
          category: 'supplies',
          amount: 100,
          expenseDate: new Date().toISOString()
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid category', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Expense',
          category: 'invalid_category',
          amount: 100,
          expenseDate: new Date().toISOString()
        });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/expenses', () => {
    it('should get list of expenses', async () => {
      // Create multiple expenses
      for (let i = 0; i < 3; i++) {
        await Expense.create({
          expenseNumber: `EXP-2024-${String(i + 1).padStart(5, '0')}`,
          title: `Expense ${i + 1}`,
          category: 'supplies',
          amount: 100 * (i + 1),
          expenseDate: new Date(),
          status: 'pending',
          createdBy: adminId
        });
      }

      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.expenses).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter expenses by category', async () => {
      await Expense.create({
        expenseNumber: 'EXP-2024-00001',
        title: 'Supplies',
        category: 'supplies',
        amount: 100,
        expenseDate: new Date(),
        status: 'pending',
        createdBy: adminId
      });

      await Expense.create({
        expenseNumber: 'EXP-2024-00002',
        title: 'Utilities',
        category: 'utilities',
        amount: 200,
        expenseDate: new Date(),
        status: 'pending',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ category: 'supplies' });

      expect(response.status).toBe(200);
      expect(response.body.expenses).toHaveLength(1);
      expect(response.body.expenses[0].category).toBe('supplies');
    });

    it('should filter expenses by status', async () => {
      await Expense.create({
        expenseNumber: 'EXP-2024-00001',
        title: 'Pending',
        category: 'supplies',
        amount: 100,
        expenseDate: new Date(),
        status: 'pending',
        createdBy: adminId
      });

      await Expense.create({
        expenseNumber: 'EXP-2024-00002',
        title: 'Approved',
        category: 'supplies',
        amount: 200,
        expenseDate: new Date(),
        status: 'approved',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.expenses).toHaveLength(1);
      expect(response.body.expenses[0].status).toBe('approved');
    });
  });

  describe('GET /api/expenses/:id', () => {
    it('should get expense by id', async () => {
      const expense = await Expense.create({
        expenseNumber: 'EXP-2024-00001',
        title: 'Test Expense',
        category: 'supplies',
        amount: 500,
        expenseDate: new Date(),
        status: 'pending',
        createdBy: adminId
      });

      const response = await request(app)
        .get(`/api/expenses/${expense._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.expense).toBeDefined();
      expect(response.body.expense._id).toBe(expense._id!.toString());
    });

    it('should return 404 for non-existent expense', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    it('should update expense', async () => {
      const expense = await Expense.create({
        expenseNumber: 'EXP-2024-00001',
        title: 'Test Expense',
        category: 'supplies',
        amount: 500,
        expenseDate: new Date(),
        status: 'pending',
        createdBy: adminId
      });

      const response = await request(app)
        .put(`/api/expenses/${expense._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 600,
          notes: 'Updated amount'
        });

      expect(response.status).toBe(200);
      expect(response.body.expense.amount).toBe(600);
      expect(response.body.expense.notes).toBe('Updated amount');
    });

    it('should return 404 for non-existent expense', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 600 });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/expenses/:id/approve', () => {
    it('should approve expense', async () => {
      const expense = await Expense.create({
        expenseNumber: 'EXP-2024-00001',
        title: 'Test Expense',
        category: 'supplies',
        amount: 500,
        expenseDate: new Date(),
        status: 'pending',
        createdBy: adminId
      });

      const response = await request(app)
        .post(`/api/expenses/${expense._id}/approve`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.expense.status).toBe('approved');
      expect(response.body.expense.approvedBy).toBe(adminId);
      expect(response.body.expense.approvalDate).toBeDefined();
    });

    it('should return 404 for non-existent expense', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/expenses/${fakeId}/approve`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/expenses/:id/payment', () => {
    it('should record payment for approved expense', async () => {
      const expense = await Expense.create({
        expenseNumber: 'EXP-2024-00001',
        title: 'Test Expense',
        category: 'supplies',
        amount: 500,
        expenseDate: new Date(),
        status: 'approved',
        approvedBy: new mongoose.Types.ObjectId(adminId),
        approvalDate: new Date(),
        createdBy: adminId
      });

      const response = await request(app)
        .post(`/api/expenses/${expense._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentMethod: 'bank_transfer',
          paymentReference: 'REF-001',
          paymentDate: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.expense.status).toBe('paid');
      expect(response.body.expense.paymentMethod).toBe('bank_transfer');
      expect(response.body.expense.paymentReference).toBe('REF-001');
    });

    it('should return 404 for non-existent expense', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/expenses/${fakeId}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentMethod: 'cash',
          paymentDate: new Date().toISOString()
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('should delete expense', async () => {
      const expense = await Expense.create({
        expenseNumber: 'EXP-2024-00001',
        title: 'Test Expense',
        category: 'supplies',
        amount: 500,
        expenseDate: new Date(),
        status: 'pending',
        createdBy: adminId
      });

      const response = await request(app)
        .delete(`/api/expenses/${expense._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('supprimée');

      const deletedExpense = await Expense.findById(expense._id);
      expect(deletedExpense).toBeNull();
    });

    it('should return 404 for non-existent expense', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/expenses/stats', () => {
    it('should get expense statistics', async () => {
      await Expense.create({
        expenseNumber: 'EXP-2024-00001',
        title: 'Expense 1',
        category: 'supplies',
        amount: 500,
        expenseDate: new Date(),
        status: 'paid',
        createdBy: adminId
      });

      await Expense.create({
        expenseNumber: 'EXP-2024-00002',
        title: 'Expense 2',
        category: 'utilities',
        amount: 300,
        expenseDate: new Date(),
        status: 'approved',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/expenses/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.total).toBeGreaterThanOrEqual(2);
    });
  });
});
