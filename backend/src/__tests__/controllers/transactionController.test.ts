import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Transaction from '../../models/Transaction.js';
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
  await Transaction.deleteMany({});
  await User.deleteMany({});
  await School.deleteMany({});
});

describe('Transaction Controller', () => {
  describe('Create Transaction', () => {
    it('should create transaction with valid data', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const user = await User.create({
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        school: school._id
      });

      const transactionData = {
        type: 'income',
        amount: 1000,
        category: 'Tuition',
        description: 'Student tuition payment',
        transactionDate: new Date(),
        paymentMethod: 'Bank Transfer',
        reference: 'TXN-2024-001',
        fiscalYear: '2024',
        createdBy: user._id
      };

      const transaction = await Transaction.create(transactionData);

      expect(transaction.type).toBe('income');
      expect(transaction.amount).toBe(1000);
      expect(transaction.category).toBe('Tuition');
      expect(transaction.reference).toBe('TXN-2024-001');
    });

    it('should fail with missing required fields', async () => {
      const invalidData = {
        category: 'Test'
      };

      await expect(Transaction.create(invalidData)).rejects.toThrow();
    });

    it('should validate transaction type enum', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const user = await User.create({
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        school: school._id
      });

      const invalidData = {
        type: 'InvalidType',
        amount: 1000,
        category: 'Test',
        description: 'Test transaction',
        createdBy: user._id
      };

      await expect(Transaction.create(invalidData)).rejects.toThrow();
    });

    it('should set default fiscal year if not provided', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const user = await User.create({
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        school: school._id
      });

      const transaction = await Transaction.create({
        type: 'income',
        amount: 500,
        category: 'Other',
        description: 'Test',
        createdBy: user._id
      });

      expect(transaction.fiscalYear).toBeDefined();
    });
  });

  describe('Get Transactions', () => {
    beforeEach(async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const user = await User.create({
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        school: school._id
      });

      await Transaction.create({
        type: 'income',
        amount: 1000,
        category: 'Tuition',
        description: 'Tuition payment',
        transactionDate: new Date(),
        paymentMethod: 'Bank Transfer',
        fiscalYear: '2024',
        createdBy: user._id
      });

      await Transaction.create({
        type: 'expense',
        amount: 500,
        category: 'Supplies',
        description: 'Office supplies',
        transactionDate: new Date(),
        paymentMethod: 'Cash',
        fiscalYear: '2024',
        createdBy: user._id
      });

      await Transaction.create({
        type: 'income',
        amount: 750,
        category: 'Donations',
        description: 'Donation from parent',
        transactionDate: new Date(Date.now() - 86400000), // Yesterday
        paymentMethod: 'Check',
        fiscalYear: '2024',
        createdBy: user._id
      });
    });

    it('should retrieve all transactions', async () => {
      const transactions = await Transaction.find();
      expect(transactions).toHaveLength(3);
    });

    it('should filter transactions by type', async () => {
      const incomeTransactions = await Transaction.find({ type: 'income' });
      expect(incomeTransactions).toHaveLength(2);

      const expenseTransactions = await Transaction.find({ type: 'expense' });
      expect(expenseTransactions).toHaveLength(1);
    });

    it('should filter transactions by category', async () => {
      const tuitionTransactions = await Transaction.find({ category: 'Tuition' });
      expect(tuitionTransactions).toHaveLength(1);
      expect(tuitionTransactions[0].amount).toBe(1000);
    });

    it('should filter transactions by fiscal year', async () => {
      const transactions2024 = await Transaction.find({ fiscalYear: '2024' });
      expect(transactions2024).toHaveLength(3);
    });

    it('should sort transactions by date', async () => {
      const transactions = await Transaction.find().sort({ transactionDate: -1 });
      expect(transactions).toHaveLength(3);
      // Most recent should be first
      expect(transactions[0].transactionDate.getTime()).toBeGreaterThanOrEqual(
        transactions[1].transactionDate.getTime()
      );
    });

    it('should search transactions by description', async () => {
      const transactions = await Transaction.find({
        description: { $regex: 'Tuition', $options: 'i' }
      });
      expect(transactions).toHaveLength(1);
      expect(transactions[0].category).toBe('Tuition');
    });
  });

  describe('Update Transaction', () => {
    it('should update transaction details', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const user = await User.create({
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        school: school._id
      });

      const transaction = await Transaction.create({
        type: 'income',
        amount: 1000,
        category: 'Tuition',
        description: 'Initial description',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: user._id
      });

      transaction.description = 'Updated description';
      transaction.notes = 'Additional notes';
      await transaction.save();

      const updatedTransaction = await Transaction.findById(transaction._id);
      expect(updatedTransaction?.description).toBe('Updated description');
      expect(updatedTransaction?.notes).toBe('Additional notes');
    });

    it('should update transaction amount', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const user = await User.create({
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        school: school._id
      });

      const transaction = await Transaction.create({
        type: 'expense',
        amount: 500,
        category: 'Supplies',
        description: 'Office supplies',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: user._id
      });

      transaction.amount = 600;
      await transaction.save();

      const updatedTransaction = await Transaction.findById(transaction._id);
      expect(updatedTransaction?.amount).toBe(600);
    });
  });

  describe('Delete Transaction', () => {
    it('should delete transaction', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const user = await User.create({
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        school: school._id
      });

      const transaction = await Transaction.create({
        type: 'income',
        amount: 1000,
        category: 'Tuition',
        description: 'Tuition payment',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: user._id
      });

      await Transaction.findByIdAndDelete(transaction._id);

      const deletedTransaction = await Transaction.findById(transaction._id);
      expect(deletedTransaction).toBeNull();
    });
  });

  describe('Transaction Statistics', () => {
    beforeEach(async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const user = await User.create({
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        school: school._id
      });

      await Transaction.create({
        type: 'income',
        amount: 1000,
        category: 'Tuition',
        description: 'Tuition 1',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: user._id
      });

      await Transaction.create({
        type: 'income',
        amount: 500,
        category: 'Tuition',
        description: 'Tuition 2',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: user._id
      });

      await Transaction.create({
        type: 'expense',
        amount: 300,
        category: 'Supplies',
        description: 'Supplies',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: user._id
      });

      await Transaction.create({
        type: 'expense',
        amount: 200,
        category: 'Utilities',
        description: 'Electricity',
        transactionDate: new Date(),
        fiscalYear: '2024',
        createdBy: user._id
      });
    });

    it('should calculate total income', async () => {
      const incomeTransactions = await Transaction.find({ type: 'income' });
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      expect(totalIncome).toBe(1500);
    });

    it('should calculate total expenses', async () => {
      const expenseTransactions = await Transaction.find({ type: 'expense' });
      const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      expect(totalExpenses).toBe(500);
    });

    it('should calculate net balance', async () => {
      const incomeTransactions = await Transaction.find({ type: 'income' });
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

      const expenseTransactions = await Transaction.find({ type: 'expense' });
      const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

      const netBalance = totalIncome - totalExpenses;
      expect(netBalance).toBe(1000);
    });
  });
});
