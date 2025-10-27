import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express, { Express } from 'express';
import transactionRoutes from '../../routes/transactionRoutes.js';
import Transaction from '../../models/Transaction.js';
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
  app.use('/api/transactions', authenticate, transactionRoutes);

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
  await Transaction.deleteMany({});
});

describe('Transaction Routes', () => {
  describe('POST /api/transactions', () => {
    it('should create income transaction with valid data', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'income',
          amount: 1000,
          category: 'Tuition',
          description: 'Student tuition payment',
          transactionDate: new Date().toISOString(),
          paymentMethod: 'bank_transfer',
          reference: 'REF-001',
          fiscalYear: '2024'
        });

      expect(response.status).toBe(201);
      expect(response.body.transaction).toBeDefined();
      expect(response.body.transaction.transactionNumber).toMatch(/^TXN-\d{4}-\d{5}$/);
      expect(response.body.transaction.type).toBe('income');
      expect(response.body.transaction.amount).toBe(1000);
      expect(response.body.transaction.category).toBe('Tuition');
    });

    it('should create expense transaction with valid data', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'expense',
          amount: 500,
          category: 'Supplies',
          description: 'Office supplies purchase',
          transactionDate: new Date().toISOString(),
          paymentMethod: 'cash',
          fiscalYear: '2024'
        });

      expect(response.status).toBe(201);
      expect(response.body.transaction).toBeDefined();
      expect(response.body.transaction.type).toBe('expense');
      expect(response.body.transaction.amount).toBe(500);
      expect(response.body.transaction.category).toBe('Supplies');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .send({
          type: 'income',
          amount: 1000,
          category: 'Test',
          description: 'Test transaction',
          transactionDate: new Date().toISOString(),
          fiscalYear: '2024'
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid type', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'invalid_type',
          amount: 1000,
          category: 'Test',
          description: 'Test transaction',
          transactionDate: new Date().toISOString(),
          fiscalYear: '2024'
        });

      expect(response.status).toBe(500);
    });

    it('should fail with negative amount', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'income',
          amount: -100,
          category: 'Test',
          description: 'Test transaction',
          transactionDate: new Date().toISOString(),
          fiscalYear: '2024'
        });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/transactions', () => {
    it('should get list of transactions with pagination', async () => {
      // Create multiple transactions
      for (let i = 0; i < 5; i++) {
        await Transaction.create({
          transactionNumber: `TXN-2024-${String(i + 1).padStart(5, '0')}`,
          type: i % 2 === 0 ? 'income' : 'expense',
          amount: 100 * (i + 1),
          category: 'Test',
          description: `Test transaction ${i + 1}`,
          transactionDate: new Date(),
          fiscalYear: '2024',
          createdBy: adminId
        });
      }

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.transactions).toHaveLength(5);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(5);
    });

    it('should filter transactions by type', async () => {
      // Create income and expense transactions
      await Transaction.create({
        transactionNumber: 'TXN-2024-00001',
        type: 'income',
        amount: 1000,
        category: 'Tuition',
        description: 'Income transaction',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      await Transaction.create({
        transactionNumber: 'TXN-2024-00002',
        type: 'expense',
        amount: 500,
        category: 'Supplies',
        description: 'Expense transaction',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'income' });

      expect(response.status).toBe(200);
      expect(response.body.transactions).toHaveLength(1);
      expect(response.body.transactions[0].type).toBe('income');
    });

    it('should filter transactions by category', async () => {
      await Transaction.create({
        transactionNumber: 'TXN-2024-00001',
        type: 'income',
        amount: 1000,
        category: 'Tuition',
        description: 'Tuition payment',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      await Transaction.create({
        transactionNumber: 'TXN-2024-00002',
        type: 'expense',
        amount: 500,
        category: 'Supplies',
        description: 'Supplies purchase',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ category: 'Tuition' });

      expect(response.status).toBe(200);
      expect(response.body.transactions).toHaveLength(1);
      expect(response.body.transactions[0].category).toBe('Tuition');
    });

    it('should filter transactions by fiscal year', async () => {
      await Transaction.create({
        transactionNumber: 'TXN-2024-00001',
        type: 'income',
        amount: 1000,
        category: 'Test',
        description: '2024 transaction',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      await Transaction.create({
        transactionNumber: 'TXN-2025-00001',
        type: 'income',
        amount: 1000,
        category: 'Test',
        description: '2025 transaction',
        transactionDate: new Date(),
        fiscalYear: '2025',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ fiscalYear: '2024' });

      expect(response.status).toBe(200);
      expect(response.body.transactions).toHaveLength(1);
      expect(response.body.transactions[0].fiscalYear).toBe('2024');
    });

    it('should search transactions by description', async () => {
      await Transaction.create({
        transactionNumber: 'TXN-2024-00001',
        type: 'income',
        amount: 1000,
        category: 'Test',
        description: 'Student tuition payment for January',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      await Transaction.create({
        transactionNumber: 'TXN-2024-00002',
        type: 'expense',
        amount: 500,
        category: 'Test',
        description: 'Office supplies purchase',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'tuition' });

      expect(response.status).toBe(200);
      expect(response.body.transactions).toHaveLength(1);
      expect(response.body.transactions[0].description).toContain('tuition');
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('should get transaction by id', async () => {
      const transaction = await Transaction.create({
        transactionNumber: 'TXN-2024-00001',
        type: 'income',
        amount: 1000,
        category: 'Tuition',
        description: 'Test transaction',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      const response = await request(app)
        .get(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.transaction).toBeDefined();
      expect(response.body.transaction._id).toBe(transaction._id!.toString());
      expect(response.body.transaction.transactionNumber).toBe('TXN-2024-00001');
    });

    it('should return 404 for non-existent transaction', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/transactions/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('trouvée');
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should update transaction', async () => {
      const transaction = await Transaction.create({
        transactionNumber: 'TXN-2024-00001',
        type: 'income',
        amount: 1000,
        category: 'Tuition',
        description: 'Test transaction',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      const response = await request(app)
        .put(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1500,
          description: 'Updated transaction',
          notes: 'Updated with new amount'
        });

      expect(response.status).toBe(200);
      expect(response.body.transaction.amount).toBe(1500);
      expect(response.body.transaction.description).toBe('Updated transaction');
      expect(response.body.transaction.notes).toBe('Updated with new amount');
    });

    it('should return 404 for non-existent transaction', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/transactions/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ amount: 1500 });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete transaction', async () => {
      const transaction = await Transaction.create({
        transactionNumber: 'TXN-2024-00001',
        type: 'income',
        amount: 1000,
        category: 'Tuition',
        description: 'Test transaction',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      const response = await request(app)
        .delete(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('supprimée');

      const deletedTransaction = await Transaction.findById(transaction._id);
      expect(deletedTransaction).toBeNull();
    });

    it('should return 404 for non-existent transaction', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/transactions/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/transactions/stats', () => {
    it('should get transaction statistics', async () => {
      // Create income transactions
      await Transaction.create({
        transactionNumber: 'TXN-2024-00001',
        type: 'income',
        amount: 1000,
        category: 'Tuition',
        description: 'Income 1',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      await Transaction.create({
        transactionNumber: 'TXN-2024-00002',
        type: 'income',
        amount: 2000,
        category: 'Fees',
        description: 'Income 2',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      // Create expense transactions
      await Transaction.create({
        transactionNumber: 'TXN-2024-00003',
        type: 'expense',
        amount: 500,
        category: 'Supplies',
        description: 'Expense 1',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      await Transaction.create({
        transactionNumber: 'TXN-2024-00004',
        type: 'expense',
        amount: 800,
        category: 'Utilities',
        description: 'Expense 2',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/transactions/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.totalIncome).toBe(3000);
      expect(response.body.stats.totalExpense).toBe(1300);
      expect(response.body.stats.netBalance).toBe(1700);
      expect(response.body.stats.totalTransactions).toBe(4);
    });

    it('should filter statistics by fiscal year', async () => {
      // Create transactions for 2024
      await Transaction.create({
        transactionNumber: 'TXN-2024-00001',
        type: 'income',
        amount: 1000,
        category: 'Tuition',
        description: '2024 income',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: adminId
      });

      // Create transactions for 2025
      await Transaction.create({
        transactionNumber: 'TXN-2025-00001',
        type: 'income',
        amount: 2000,
        category: 'Tuition',
        description: '2025 income',
        transactionDate: new Date(),
        fiscalYear: '2025',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/transactions/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ fiscalYear: '2024' });

      expect(response.status).toBe(200);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.totalIncome).toBe(1000);
    });
  });
});
