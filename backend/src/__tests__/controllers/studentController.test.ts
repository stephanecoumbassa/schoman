import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Student from '../../models/Student.js';
import User from '../../models/User.js';

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
  await Student.deleteMany({});
  await User.deleteMany({});
});

describe('Student Controller', () => {
  describe('Student Creation', () => {
    it('should create a student with valid data', async () => {
      const user = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      const studentData = {
        userId: user._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'M',
        enrollmentDate: new Date(),
        parentContact: {
          name: 'Jane Doe',
          phone: '+33123456789',
          email: 'parent@test.com',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'John Doe Sr.',
          phone: '+33123456790'
        }
      };

      const student = await Student.create(studentData);
      
      expect(student.studentNumber).toBe('STU001');
      expect(student.gender).toBe('M');
      expect(student.isActive).toBe(true);
    });

    it('should fail with missing required fields', async () => {
      const invalidData = {
        studentNumber: 'STU002'
      };

      await expect(Student.create(invalidData)).rejects.toThrow();
    });

    it('should fail with duplicate student number', async () => {
      const user1 = await User.create({
        email: 'student1@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      const user2 = await User.create({
        email: 'student2@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'student'
      });

      const studentData = {
        userId: user1._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'M',
        parentContact: {
          name: 'Parent',
          phone: '+33123456789',
          relationship: 'Mother'
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33123456790'
        }
      };

      await Student.create(studentData);

      const duplicateData = {
        ...studentData,
        userId: user2._id
      };

      await expect(Student.create(duplicateData)).rejects.toThrow();
    });
  });

  describe('Student Queries', () => {
    beforeEach(async () => {
      const user1 = await User.create({
        email: 'student1@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      const user2 = await User.create({
        email: 'student2@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'student'
      });

      await Student.create({
        userId: user1._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'M',
        level: '6ème',
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

      await Student.create({
        userId: user2._id,
        studentNumber: 'STU002',
        dateOfBirth: new Date('2011-01-01'),
        placeOfBirth: 'Lyon',
        gender: 'F',
        level: '5ème',
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
    });

    it('should find all students', async () => {
      const students = await Student.find();
      expect(students).toHaveLength(2);
    });

    it('should find student by student number', async () => {
      const student = await Student.findOne({ studentNumber: 'STU001' });
      expect(student).not.toBeNull();
      expect(student?.gender).toBe('M');
    });

    it('should find students by level', async () => {
      const students = await Student.find({ level: '6ème' });
      expect(students).toHaveLength(1);
      expect(students[0].studentNumber).toBe('STU001');
    });

    it('should populate user data', async () => {
      const student = await Student.findOne({ studentNumber: 'STU001' })
        .populate('userId', 'firstName lastName email');
      
      expect(student).not.toBeNull();
      expect((student?.userId as any).firstName).toBe('John');
      expect((student?.userId as any).email).toBe('student1@test.com');
    });
  });

  describe('Student Updates', () => {
    it('should update student data', async () => {
      const user = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      const student = await Student.create({
        userId: user._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'M',
        level: '6ème',
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

      student.level = '5ème';
      student.notes = 'Good student';
      await student.save();

      const updatedStudent = await Student.findById(student._id);
      expect(updatedStudent?.level).toBe('5ème');
      expect(updatedStudent?.notes).toBe('Good student');
    });

    it('should deactivate student', async () => {
      const user = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      const student = await Student.create({
        userId: user._id,
        studentNumber: 'STU001',
        dateOfBirth: new Date('2010-01-01'),
        placeOfBirth: 'Paris',
        gender: 'M',
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

      student.isActive = false;
      await student.save();

      const inactiveStudent = await Student.findById(student._id);
      expect(inactiveStudent?.isActive).toBe(false);
    });
  });
});
