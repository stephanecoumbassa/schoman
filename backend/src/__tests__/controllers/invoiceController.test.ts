import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Invoice from '../../models/Invoice.js';
import Student from '../../models/Student.js';
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
  await Invoice.deleteMany({});
  await Student.deleteMany({});
  await User.deleteMany({});
  await School.deleteMany({});
});

describe('Invoice Controller', () => {
  describe('Create Invoice', () => {
    it('should create invoice with valid data', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: school._id
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: school._id,
        parentContact: {
          name: 'Parent Name',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '+33123456790'
        }
      });

      const invoiceData = {
        invoiceNumber: 'INV-2024-00001',
        student: student._id,
        items: [
          {
            description: 'Frais de scolarité',
            quantity: 1,
            unitPrice: 500,
            totalPrice: 500
          }
        ],
        subtotal: 500,
        taxRate: 20,
        taxAmount: 100,
        totalAmount: 600,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'draft'
      };

      const invoice = await Invoice.create(invoiceData);

      expect(invoice.invoiceNumber).toBe('INV-2024-00001');
      expect(invoice.totalAmount).toBe(600);
      expect(invoice.status).toBe('draft');
      expect(invoice.items).toHaveLength(1);
    });

    it('should calculate subtotal correctly', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: school._id
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: school._id,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33123456790'
        }
      });

      const items = [
        { description: 'Item 1', quantity: 2, unitPrice: 100, totalPrice: 200 },
        { description: 'Item 2', quantity: 1, unitPrice: 150, totalPrice: 150 }
      ];
      const subtotal = 350;
      const taxRate = 10;
      const taxAmount = 35;
      const totalAmount = 385;

      const invoice = await Invoice.create({
        invoiceNumber: 'INV-2024-00002',
        student: student._id,
        items,
        subtotal,
        taxRate,
        taxAmount,
        totalAmount,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'draft'
      });

      expect(invoice.subtotal).toBe(350);
      expect(invoice.taxAmount).toBe(35);
      expect(invoice.totalAmount).toBe(385);
    });

    it('should fail with missing required fields', async () => {
      const invalidData = {
        invoiceNumber: 'INV-2024-00003'
      };

      await expect(Invoice.create(invalidData)).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: school._id
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: school._id,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33123456790'
        }
      });

      const invalidData = {
        invoiceNumber: 'INV-2024-00004',
        student: student._id,
        items: [{ description: 'Test', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 100,
        issueDate: new Date(),
        dueDate: new Date(),
        status: 'InvalidStatus'
      };

      await expect(Invoice.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Get Invoices', () => {
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

      const studentUser1 = await User.create({
        email: 'student1@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'student',
        school: school._id
      });

      const studentUser2 = await User.create({
        email: 'student2@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'student',
        school: school._id
      });

      const student1 = await Student.create({
        userId: studentUser1._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: school._id,
        parentContact: {
          name: 'Parent 1',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency 1',
          phone: '+33123456790'
        }
      });

      const student2 = await Student.create({
        userId: studentUser2._id,
        studentNumber: 'STU002',
        dateOfBirth: new Date('2011-01-01'),
        placeOfBirth: 'Lyon',
        gender: 'M',
        school: school._id,
        parentContact: {
          name: 'Parent 2',
          phone: '+33123456791',
          relationship: 'Father'
        },
        emergencyContact: {
          name: 'Emergency 2',
          phone: '+33123456792'
        }
      });

      await Invoice.create({
        invoiceNumber: 'INV-2024-00001',
        student: student1._id,
        items: [{ description: 'Tuition', quantity: 1, unitPrice: 500, totalPrice: 500 }],
        subtotal: 500,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 500,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'sent'
      });

      await Invoice.create({
        invoiceNumber: 'INV-2024-00002',
        student: student2._id,
        items: [{ description: 'Books', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 100,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'paid'
      });
    });

    it('should retrieve all invoices', async () => {
      const invoices = await Invoice.find();
      expect(invoices).toHaveLength(2);
    });

    it('should filter invoices by status', async () => {
      const sentInvoices = await Invoice.find({ status: 'sent' });
      expect(sentInvoices).toHaveLength(1);
      expect(sentInvoices[0].status).toBe('sent');

      const paidInvoices = await Invoice.find({ status: 'paid' });
      expect(paidInvoices).toHaveLength(1);
      expect(paidInvoices[0].status).toBe('paid');
    });

    it('should filter invoices by student', async () => {
      const student = await Student.findOne({ studentNumber: 'STU001' });
      const invoices = await Invoice.find({ student: student!._id });
      expect(invoices).toHaveLength(1);
    });

    it('should sort invoices by issue date', async () => {
      const invoices = await Invoice.find().sort({ issueDate: -1 });
      expect(invoices).toHaveLength(2);
    });
  });

  describe('Update Invoice', () => {
    it('should update invoice status', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: school._id
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: school._id,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33123456790'
        }
      });

      const invoice = await Invoice.create({
        invoiceNumber: 'INV-2024-00001',
        student: student._id,
        items: [{ description: 'Tuition', quantity: 1, unitPrice: 500, totalPrice: 500 }],
        subtotal: 500,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 500,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'draft'
      });

      invoice.status = 'sent';
      await invoice.save();

      const updatedInvoice = await Invoice.findById(invoice._id);
      expect(updatedInvoice?.status).toBe('sent');
    });

    it('should record payment date when marked as paid', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: school._id
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: school._id,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33123456790'
        }
      });

      const invoice = await Invoice.create({
        invoiceNumber: 'INV-2024-00001',
        student: student._id,
        items: [{ description: 'Tuition', quantity: 1, unitPrice: 500, totalPrice: 500 }],
        subtotal: 500,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 500,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'sent'
      });

      invoice.status = 'paid';
      invoice.paidDate = new Date();
      await invoice.save();

      const updatedInvoice = await Invoice.findById(invoice._id);
      expect(updatedInvoice?.status).toBe('paid');
      expect(updatedInvoice?.paidDate).toBeDefined();
    });
  });

  describe('Delete Invoice', () => {
    it('should delete invoice', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: school._id
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: school._id,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33123456790'
        }
      });

      const invoice = await Invoice.create({
        invoiceNumber: 'INV-2024-00001',
        student: student._id,
        items: [{ description: 'Tuition', quantity: 1, unitPrice: 500, totalPrice: 500 }],
        subtotal: 500,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 500,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'draft'
      });

      await Invoice.findByIdAndDelete(invoice._id);

      const deletedInvoice = await Invoice.findById(invoice._id);
      expect(deletedInvoice).toBeNull();
    });
  });
});
