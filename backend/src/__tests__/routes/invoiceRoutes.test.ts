import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express, { Express } from 'express';
import invoiceRoutes from '../../routes/invoiceRoutes.js';
import Invoice from '../../models/Invoice.js';
import Student from '../../models/Student.js';
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
  app.use('/api/invoices', authenticate, invoiceRoutes);

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
  await Invoice.deleteMany({});
  await Student.deleteMany({});
  await User.deleteMany({ role: 'student' });
});

describe('Invoice Routes', () => {
  describe('POST /api/invoices', () => {
    it('should create invoice with valid data', async () => {
      // Create student
      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: schoolId
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: schoolId,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33987654321'
        }
      });

      const response = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          student: student._id!.toString(),
          items: [
            {
              description: 'Tuition Fee',
              category: 'tuition',
              quantity: 1,
              unitPrice: 1000
            }
          ],
          taxRate: 10,
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
          notes: 'Test invoice'
        });

      expect(response.status).toBe(201);
      expect(response.body.invoice).toBeDefined();
      expect(response.body.invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d{5}$/);
      expect(response.body.invoice.subtotal).toBe(1000);
      expect(response.body.invoice.taxAmount).toBe(100);
      expect(response.body.invoice.totalAmount).toBe(1100);
      expect(response.body.invoice.status).toBe('draft');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({
          student: new mongoose.Types.ObjectId().toString(),
          items: [{ description: 'Test', category: 'tuition', quantity: 1, unitPrice: 100 }],
          dueDate: new Date().toISOString()
        });

      expect(response.status).toBe(401);
    });

    it('should fail with non-existent student', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          student: new mongoose.Types.ObjectId().toString(),
          items: [{ description: 'Test', category: 'tuition', quantity: 1, unitPrice: 100 }],
          dueDate: new Date().toISOString()
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('trouvé');
    });
  });

  describe('GET /api/invoices', () => {
    it('should get list of invoices with pagination', async () => {
      // Create student
      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: schoolId
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: schoolId,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33987654321'
        }
      });

      // Create multiple invoices
      for (let i = 0; i < 3; i++) {
        await Invoice.create({
          invoiceNumber: `INV-2024-${String(i + 1).padStart(5, '0')}`,
          student: student._id,
          items: [{
            description: 'Test Item',
            category: 'tuition',
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100
          }],
          subtotal: 100,
          taxRate: 0,
          taxAmount: 0,
          totalAmount: 100,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 86400000),
          status: 'draft'
        });
      }

      const response = await request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.invoices).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(3);
    });

    it('should filter invoices by status', async () => {
      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: schoolId
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: schoolId,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33987654321'
        }
      });

      // Create invoices with different statuses
      await Invoice.create({
        invoiceNumber: 'INV-2024-00001',
        student: student._id,
        items: [{ description: 'Test', category: 'tuition', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 100,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'paid'
      });

      await Invoice.create({
        invoiceNumber: 'INV-2024-00002',
        student: student._id,
        items: [{ description: 'Test', category: 'tuition', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 100,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'draft'
      });

      const response = await request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'paid' });

      expect(response.status).toBe(200);
      expect(response.body.invoices).toHaveLength(1);
      expect(response.body.invoices[0].status).toBe('paid');
    });

    it('should filter invoices by student', async () => {
      const studentUser1 = await User.create({
        email: 'student1@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: schoolId
      });

      const student1 = await Student.create({
        userId: studentUser1._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: schoolId,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33987654321'
        }
      });

      const studentUser2 = await User.create({
        email: 'student2@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        school: schoolId
      });

      const student2 = await Student.create({
        userId: studentUser2._id,
        studentNumber: 'STU002',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'M',
        school: schoolId,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Father'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33987654321'
        }
      });

      // Create invoices for different students
      await Invoice.create({
        invoiceNumber: 'INV-2024-00001',
        student: student1._id,
        items: [{ description: 'Test', category: 'tuition', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 100,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'draft'
      });

      await Invoice.create({
        invoiceNumber: 'INV-2024-00002',
        student: student2._id,
        items: [{ description: 'Test', category: 'tuition', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 100,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'draft'
      });

      const response = await request(app)
        .get('/api/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ student: student1._id!.toString() });

      expect(response.status).toBe(200);
      expect(response.body.invoices).toHaveLength(1);
      expect(response.body.invoices[0].student).toBe(student1._id!.toString());
    });
  });

  describe('GET /api/invoices/:id', () => {
    it('should get invoice by id', async () => {
      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: schoolId
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: schoolId,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33987654321'
        }
      });

      const invoice = await Invoice.create({
        invoiceNumber: 'INV-2024-00001',
        student: student._id,
        items: [{ description: 'Test', category: 'tuition', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 100,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'draft'
      });

      const response = await request(app)
        .get(`/api/invoices/${invoice._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.invoice).toBeDefined();
      expect(response.body.invoice._id).toBe(invoice._id!.toString());
      expect(response.body.invoice.invoiceNumber).toBe('INV-2024-00001');
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/invoices/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('trouvé');
    });
  });

  describe('PUT /api/invoices/:id', () => {
    it('should update invoice', async () => {
      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: schoolId
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: schoolId,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33987654321'
        }
      });

      const invoice = await Invoice.create({
        invoiceNumber: 'INV-2024-00001',
        student: student._id,
        items: [{ description: 'Test', category: 'tuition', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 100,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'draft'
      });

      const response = await request(app)
        .put(`/api/invoices/${invoice._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'sent',
          notes: 'Updated notes'
        });

      expect(response.status).toBe(200);
      expect(response.body.invoice.status).toBe('sent');
      expect(response.body.invoice.notes).toBe('Updated notes');
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/invoices/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'sent' });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/invoices/:id/payment', () => {
    it('should record payment for invoice', async () => {
      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: schoolId
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: schoolId,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33987654321'
        }
      });

      const invoice = await Invoice.create({
        invoiceNumber: 'INV-2024-00001',
        student: student._id,
        items: [{ description: 'Test', category: 'tuition', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 100,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'sent'
      });

      const response = await request(app)
        .post(`/api/invoices/${invoice._id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentMethod: 'cash',
          paymentReference: 'REF-001',
          paymentDate: new Date().toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.invoice.status).toBe('paid');
      expect(response.body.invoice.paymentMethod).toBe('cash');
      expect(response.body.invoice.paymentReference).toBe('REF-001');
      expect(response.body.invoice.paymentDate).toBeDefined();
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/invoices/${fakeId}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentMethod: 'cash',
          paymentDate: new Date().toISOString()
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/invoices/:id', () => {
    it('should delete invoice', async () => {
      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: schoolId
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: schoolId,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33987654321'
        }
      });

      const invoice = await Invoice.create({
        invoiceNumber: 'INV-2024-00001',
        student: student._id,
        items: [{ description: 'Test', category: 'tuition', quantity: 1, unitPrice: 100, totalPrice: 100 }],
        subtotal: 100,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 100,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'draft'
      });

      const response = await request(app)
        .delete(`/api/invoices/${invoice._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('supprimée');

      const deletedInvoice = await Invoice.findById(invoice._id);
      expect(deletedInvoice).toBeNull();
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/invoices/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/invoices/stats', () => {
    it('should get invoice statistics', async () => {
      const studentUser = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Student',
        role: 'student',
        school: schoolId
      });

      const student = await Student.create({
        userId: studentUser._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'F',
        school: schoolId,
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33987654321'
        }
      });

      // Create invoices with different statuses
      await Invoice.create({
        invoiceNumber: 'INV-2024-00001',
        student: student._id,
        items: [{ description: 'Test', category: 'tuition', quantity: 1, unitPrice: 1000, totalPrice: 1000 }],
        subtotal: 1000,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 1000,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'paid',
        paymentDate: new Date()
      });

      await Invoice.create({
        invoiceNumber: 'INV-2024-00002',
        student: student._id,
        items: [{ description: 'Test', category: 'tuition', quantity: 1, unitPrice: 500, totalPrice: 500 }],
        subtotal: 500,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 500,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400000),
        status: 'sent'
      });

      const response = await request(app)
        .get('/api/invoices/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.total).toBeGreaterThanOrEqual(2);
    });
  });
});
