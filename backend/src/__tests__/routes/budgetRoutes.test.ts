import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express, { Express } from 'express';
import budgetRoutes from '../../routes/budgetRoutes.js';
import Budget from '../../models/Budget.js';
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
  app.use('/api/budgets', authenticate, budgetRoutes);

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
  await Budget.deleteMany({});
});

describe('Budget Routes', () => {
  describe('POST /api/budgets', () => {
    it('should create budget with valid data', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'School Budget 2024',
          fiscalYear: '2024',
          startDate: new Date('2024-01-01').toISOString(),
          endDate: new Date('2024-12-31').toISOString(),
          totalBudget: 100000,
          incomeItems: [
            {
              category: 'Tuition',
              allocatedAmount: 80000,
              spentAmount: 0,
              description: 'Student tuition fees'
            },
            {
              category: 'Donations',
              allocatedAmount: 20000,
              spentAmount: 0,
              description: 'Donations and grants'
            }
          ],
          expenseItems: [
            {
              category: 'Salaries',
              allocatedAmount: 50000,
              spentAmount: 0,
              description: 'Teacher and staff salaries'
            },
            {
              category: 'Supplies',
              allocatedAmount: 30000,
              spentAmount: 0,
              description: 'School supplies and materials'
            },
            {
              category: 'Utilities',
              allocatedAmount: 20000,
              spentAmount: 0,
              description: 'Electricity, water, internet'
            }
          ],
          status: 'draft'
        });

      expect(response.status).toBe(201);
      expect(response.body.budget).toBeDefined();
      expect(response.body.budget.name).toBe('School Budget 2024');
      expect(response.body.budget.totalBudget).toBe(100000);
      expect(response.body.budget.incomeItems).toHaveLength(2);
      expect(response.body.budget.expenseItems).toHaveLength(3);
      expect(response.body.budget.status).toBe('draft');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .send({
          name: 'Test Budget',
          fiscalYear: '2024',
          startDate: new Date('2024-01-01').toISOString(),
          endDate: new Date('2024-12-31').toISOString(),
          totalBudget: 100000
        });

      expect(response.status).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Budget'
          // Missing other required fields
        });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/budgets', () => {
    it('should get list of budgets', async () => {
      // Create multiple budgets
      for (let i = 0; i < 3; i++) {
        await Budget.create({
          name: `Budget ${i + 1}`,
          fiscalYear: `202${i + 4}`,
          startDate: new Date(`202${i + 4}-01-01`),
          endDate: new Date(`202${i + 4}-12-31`),
          totalBudget: 100000 * (i + 1),
          incomeItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
          expenseItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
          status: 'draft',
          createdBy: adminId
        });
      }

      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.budgets).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter budgets by fiscal year', async () => {
      await Budget.create({
        name: 'Budget 2024',
        fiscalYear: '2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalBudget: 100000,
        incomeItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
        expenseItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
        status: 'active',
        createdBy: adminId
      });

      await Budget.create({
        name: 'Budget 2025',
        fiscalYear: '2025',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        totalBudget: 200000,
        incomeItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
        expenseItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
        status: 'draft',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ fiscalYear: '2024' });

      expect(response.status).toBe(200);
      expect(response.body.budgets).toHaveLength(1);
      expect(response.body.budgets[0].fiscalYear).toBe('2024');
    });

    it('should filter budgets by status', async () => {
      await Budget.create({
        name: 'Active Budget',
        fiscalYear: '2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalBudget: 100000,
        incomeItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
        expenseItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
        status: 'active',
        createdBy: adminId
      });

      await Budget.create({
        name: 'Draft Budget',
        fiscalYear: '2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalBudget: 100000,
        incomeItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
        expenseItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
        status: 'draft',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'active' });

      expect(response.status).toBe(200);
      expect(response.body.budgets).toHaveLength(1);
      expect(response.body.budgets[0].status).toBe('active');
    });
  });

  describe('GET /api/budgets/:id', () => {
    it('should get budget by id', async () => {
      const budget = await Budget.create({
        name: 'Test Budget',
        fiscalYear: '2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalBudget: 100000,
        incomeItems: [
          { category: 'Tuition', allocatedAmount: 80000, spentAmount: 50000 }
        ],
        expenseItems: [
          { category: 'Salaries', allocatedAmount: 60000, spentAmount: 40000 }
        ],
        status: 'active',
        createdBy: adminId
      });

      const response = await request(app)
        .get(`/api/budgets/${budget._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.budget).toBeDefined();
      expect(response.body.budget._id).toBe(budget._id!.toString());
      expect(response.body.budget.name).toBe('Test Budget');
    });

    it('should return 404 for non-existent budget', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/budgets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/budgets/:id', () => {
    it('should update budget', async () => {
      const budget = await Budget.create({
        name: 'Test Budget',
        fiscalYear: '2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalBudget: 100000,
        incomeItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
        expenseItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
        status: 'draft',
        createdBy: adminId
      });

      const response = await request(app)
        .put(`/api/budgets/${budget._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Budget',
          totalBudget: 150000,
          status: 'active',
          notes: 'Budget activated with updated amount'
        });

      expect(response.status).toBe(200);
      expect(response.body.budget.name).toBe('Updated Budget');
      expect(response.body.budget.totalBudget).toBe(150000);
      expect(response.body.budget.status).toBe('active');
      expect(response.body.budget.notes).toBe('Budget activated with updated amount');
    });

    it('should update spent amounts in budget items', async () => {
      const budget = await Budget.create({
        name: 'Test Budget',
        fiscalYear: '2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalBudget: 100000,
        incomeItems: [
          { category: 'Tuition', allocatedAmount: 100000, spentAmount: 0 }
        ],
        expenseItems: [
          { category: 'Salaries', allocatedAmount: 60000, spentAmount: 0 }
        ],
        status: 'active',
        createdBy: adminId
      });

      const response = await request(app)
        .put(`/api/budgets/${budget._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          expenseItems: [
            { category: 'Salaries', allocatedAmount: 60000, spentAmount: 25000 }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.budget.expenseItems[0].spentAmount).toBe(25000);
    });

    it('should return 404 for non-existent budget', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/budgets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/budgets/:id', () => {
    it('should delete budget', async () => {
      const budget = await Budget.create({
        name: 'Budget to Delete',
        fiscalYear: '2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalBudget: 100000,
        incomeItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
        expenseItems: [{ category: 'Test', allocatedAmount: 10000, spentAmount: 0 }],
        status: 'draft',
        createdBy: adminId
      });

      const response = await request(app)
        .delete(`/api/budgets/${budget._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('supprimé');

      const deletedBudget = await Budget.findById(budget._id);
      expect(deletedBudget).toBeNull();
    });

    it('should return 404 for non-existent budget', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/budgets/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/budgets/:id/comparison', () => {
    it('should get budget vs actual comparison', async () => {
      const budget = await Budget.create({
        name: 'Test Budget',
        fiscalYear: '2024',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalBudget: 100000,
        incomeItems: [
          { category: 'Tuition', allocatedAmount: 80000, spentAmount: 60000 },
          { category: 'Fees', allocatedAmount: 20000, spentAmount: 15000 }
        ],
        expenseItems: [
          { category: 'Salaries', allocatedAmount: 50000, spentAmount: 40000 },
          { category: 'Supplies', allocatedAmount: 30000, spentAmount: 25000 },
          { category: 'Utilities', allocatedAmount: 20000, spentAmount: 10000 }
        ],
        status: 'active',
        createdBy: adminId
      });

      const response = await request(app)
        .get(`/api/budgets/${budget._id}/comparison`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.comparison).toBeDefined();
      expect(response.body.comparison.budget).toBeDefined();
      expect(response.body.comparison.totalIncome).toBeDefined();
      expect(response.body.comparison.totalExpense).toBeDefined();
      
      // Check if the comparison data is calculated correctly
      const totalIncome = response.body.comparison.totalIncome;
      const totalExpense = response.body.comparison.totalExpense;
      
      expect(totalIncome.allocated).toBe(100000); // 80000 + 20000
      expect(totalIncome.spent).toBe(75000); // 60000 + 15000
      expect(totalExpense.allocated).toBe(100000); // 50000 + 30000 + 20000
      expect(totalExpense.spent).toBe(75000); // 40000 + 25000 + 10000
    });

    it('should return 404 for non-existent budget', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/budgets/${fakeId}/comparison`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
