import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express, { Express } from 'express';
import attendanceRoutes from '../../routes/attendanceRoutes.js';
import Attendance from '../../models/Attendance.js';
import Student from '../../models/Student.js';
import Class from '../../models/Class.js';
import User from '../../models/User.js';
import School from '../../models/School.js';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../middleware/auth.js';

let mongoServer: MongoMemoryServer;
let app: Express;
let authToken: string;
let teacherId: string;
let schoolId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Setup Express app
  app = express();
  app.use(express.json());
  app.use('/api/attendance', authenticate, attendanceRoutes);

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

  const teacher = await User.create({
    email: 'teacher@test.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Teacher',
    role: 'teacher',
    school: school._id
  });
  teacherId = teacher._id!.toString();

  // Generate auth token
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
  authToken = jwt.sign(
    {
      id: teacherId,
      email: teacher.email,
      role: teacher.role,
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
  await Attendance.deleteMany({});
  await Student.deleteMany({});
  await Class.deleteMany({});
});

describe('Attendance Routes', () => {
  describe('POST /api/attendance', () => {
    it('should create attendance record with valid data', async () => {
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
          phone: '+33123456790'
        }
      });

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: schoolId,
        teacher: teacherId
      });

      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          student: student._id!.toString(),
          class: classDoc._id!.toString(),
          date: new Date().toISOString(),
          status: 'Present',
          timeIn: '08:00'
        });

      expect(response.status).toBe(201);
      expect(response.body.attendance).toBeDefined();
      expect(response.body.attendance.status).toBe('Present');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/attendance')
        .send({
          status: 'Present'
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid student ID', async () => {
      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: schoolId,
        teacher: teacherId
      });

      const response = await request(app)
        .post('/api/attendance')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          student: new mongoose.Types.ObjectId().toString(),
          class: classDoc._id!.toString(),
          date: new Date().toISOString(),
          status: 'Present'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('trouvé');
    });
  });

  describe('GET /api/attendance', () => {
    it('should retrieve all attendance records', async () => {
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
          phone: '+33123456790'
        }
      });

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: schoolId,
        teacher: teacherId
      });

      await Attendance.create({
        student: student._id,
        class: classDoc._id,
        date: new Date(),
        status: 'Present',
        recordedBy: teacherId
      });

      await Attendance.create({
        student: student._id,
        class: classDoc._id,
        date: new Date(Date.now() - 86400000),
        status: 'Absent',
        recordedBy: teacherId
      });

      const response = await request(app)
        .get('/api/attendance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.attendances).toBeDefined();
      expect(response.body.attendances.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter attendance by status', async () => {
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
          phone: '+33123456790'
        }
      });

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: schoolId,
        teacher: teacherId
      });

      await Attendance.create({
        student: student._id,
        class: classDoc._id,
        date: new Date(),
        status: 'Present',
        recordedBy: teacherId
      });

      await Attendance.create({
        student: student._id,
        class: classDoc._id,
        date: new Date(Date.now() - 86400000),
        status: 'Absent',
        recordedBy: teacherId
      });

      const response = await request(app)
        .get('/api/attendance?status=Present')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.attendances).toBeDefined();
      expect(response.body.attendances.every((a: any) => a.status === 'Present')).toBe(true);
    });

    it('should support pagination', async () => {
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
          phone: '+33123456790'
        }
      });

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: schoolId,
        teacher: teacherId
      });

      // Create multiple records
      for (let i = 0; i < 5; i++) {
        await Attendance.create({
          student: student._id,
          class: classDoc._id,
          date: new Date(Date.now() - i * 86400000),
          status: 'Present',
          recordedBy: teacherId
        });
      }

      const response = await request(app)
        .get('/api/attendance?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.attendances.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/attendance/:id', () => {
    it('should retrieve specific attendance record', async () => {
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
          phone: '+33123456790'
        }
      });

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: schoolId,
        teacher: teacherId
      });

      const attendance = await Attendance.create({
        student: student._id,
        class: classDoc._id,
        date: new Date(),
        status: 'Present',
        recordedBy: teacherId
      });

      const response = await request(app)
        .get(`/api/attendance/${attendance._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.attendance).toBeDefined();
      expect(response.body.attendance._id).toBe(attendance._id!.toString());
    });

    it('should return 404 for non-existent attendance', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/attendance/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/attendance/:id', () => {
    it('should update attendance record', async () => {
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
          phone: '+33123456790'
        }
      });

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: schoolId,
        teacher: teacherId
      });

      const attendance = await Attendance.create({
        student: student._id,
        class: classDoc._id,
        date: new Date(),
        status: 'Present',
        recordedBy: teacherId
      });

      const response = await request(app)
        .put(`/api/attendance/${attendance._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'Late',
          reason: 'Traffic delay'
        });

      expect(response.status).toBe(200);
      expect(response.body.attendance.status).toBe('Late');
      expect(response.body.attendance.reason).toBe('Traffic delay');
    });
  });

  describe('DELETE /api/attendance/:id', () => {
    it('should delete attendance record', async () => {
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
          phone: '+33123456790'
        }
      });

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: schoolId,
        teacher: teacherId
      });

      const attendance = await Attendance.create({
        student: student._id,
        class: classDoc._id,
        date: new Date(),
        status: 'Present',
        recordedBy: teacherId
      });

      const response = await request(app)
        .delete(`/api/attendance/${attendance._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('succès');

      // Verify deletion
      const deletedAttendance = await Attendance.findById(attendance._id);
      expect(deletedAttendance).toBeNull();
    });
  });
});
