import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Attendance from '../../models/Attendance.js';
import Student from '../../models/Student.js';
import Class from '../../models/Class.js';
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
  await Attendance.deleteMany({});
  await Student.deleteMany({});
  await Class.deleteMany({});
  await User.deleteMany({});
  await School.deleteMany({});
});

describe('Attendance Controller', () => {
  describe('Record Attendance', () => {
    it('should create attendance record with valid data', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const teacher = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
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

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: school._id,
        teacher: teacher._id
      });

      const attendanceData = {
        student: student._id,
        class: classDoc._id,
        date: new Date(),
        status: 'Present',
        timeIn: '08:00',
        recordedBy: teacher._id
      };

      const attendance = await Attendance.create(attendanceData);

      expect(attendance.status).toBe('Present');
      expect(attendance.student.toString()).toBe(student._id.toString());
      expect(attendance.class.toString()).toBe(classDoc._id.toString());
    });

    it('should fail with missing required fields', async () => {
      const invalidData = {
        status: 'Present'
      };

      await expect(Attendance.create(invalidData)).rejects.toThrow();
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

      const teacher = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
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

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: school._id,
        teacher: teacher._id
      });

      const invalidData = {
        student: student._id,
        class: classDoc._id,
        date: new Date(),
        status: 'InvalidStatus',
        recordedBy: teacher._id
      };

      await expect(Attendance.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Get Attendances', () => {
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

      const teacher = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
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

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: school._id,
        teacher: teacher._id
      });

      await Attendance.create({
        student: student1._id,
        class: classDoc._id,
        date: new Date(),
        status: 'Present',
        recordedBy: teacher._id
      });

      await Attendance.create({
        student: student2._id,
        class: classDoc._id,
        date: new Date(),
        status: 'Absent',
        recordedBy: teacher._id
      });
    });

    it('should retrieve all attendances', async () => {
      const attendances = await Attendance.find();
      expect(attendances).toHaveLength(2);
    });

    it('should filter attendances by status', async () => {
      const presentAttendances = await Attendance.find({ status: 'Present' });
      expect(presentAttendances).toHaveLength(1);
      expect(presentAttendances[0].status).toBe('Present');

      const absentAttendances = await Attendance.find({ status: 'Absent' });
      expect(absentAttendances).toHaveLength(1);
      expect(absentAttendances[0].status).toBe('Absent');
    });

    it('should filter attendances by student', async () => {
      const student = await Student.findOne({ studentNumber: 'STU001' });
      const attendances = await Attendance.find({ student: student!._id });
      expect(attendances).toHaveLength(1);
    });

    it('should filter attendances by date', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const attendances = await Attendance.find({
        date: { $gte: today, $lt: tomorrow }
      });
      expect(attendances.length).toBeGreaterThan(0);
    });
  });

  describe('Update Attendance', () => {
    it('should update attendance status', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const teacher = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
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

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: school._id,
        teacher: teacher._id
      });

      const attendance = await Attendance.create({
        student: student._id,
        class: classDoc._id,
        date: new Date(),
        status: 'Present',
        recordedBy: teacher._id
      });

      attendance.status = 'Late';
      attendance.reason = 'Traffic delay';
      await attendance.save();

      const updatedAttendance = await Attendance.findById(attendance._id);
      expect(updatedAttendance?.status).toBe('Late');
      expect(updatedAttendance?.reason).toBe('Traffic delay');
    });
  });

  describe('Delete Attendance', () => {
    it('should delete attendance record', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const teacher = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
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

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: school._id,
        teacher: teacher._id
      });

      const attendance = await Attendance.create({
        student: student._id,
        class: classDoc._id,
        date: new Date(),
        status: 'Present',
        recordedBy: teacher._id
      });

      await Attendance.findByIdAndDelete(attendance._id);

      const deletedAttendance = await Attendance.findById(attendance._id);
      expect(deletedAttendance).toBeNull();
    });
  });

  describe('Attendance Statistics', () => {
    it('should calculate attendance statistics correctly', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const teacher = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
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

      const classDoc = await Class.create({
        name: '6ème A',
        level: '6ème',
        school: school._id,
        teacher: teacher._id
      });

      // Create attendance records
      await Attendance.create({
        student: student._id,
        class: classDoc._id,
        date: new Date(),
        status: 'Present',
        recordedBy: teacher._id
      });

      await Attendance.create({
        student: student._id,
        class: classDoc._id,
        date: new Date(Date.now() - 86400000), // Yesterday
        status: 'Absent',
        recordedBy: teacher._id
      });

      await Attendance.create({
        student: student._id,
        class: classDoc._id,
        date: new Date(Date.now() - 2 * 86400000), // 2 days ago
        status: 'Late',
        recordedBy: teacher._id
      });

      const attendances = await Attendance.find({ student: student._id });
      const stats = {
        total: attendances.length,
        present: attendances.filter(a => a.status === 'Present').length,
        absent: attendances.filter(a => a.status === 'Absent').length,
        late: attendances.filter(a => a.status === 'Late').length
      };

      expect(stats.total).toBe(3);
      expect(stats.present).toBe(1);
      expect(stats.absent).toBe(1);
      expect(stats.late).toBe(1);

      const attendanceRate = ((stats.present + stats.late) / stats.total * 100).toFixed(2);
      expect(attendanceRate).toBe('66.67');
    });
  });
});
