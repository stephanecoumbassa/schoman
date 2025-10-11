import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Grade from '../../models/Grade.js';
import Student from '../../models/Student.js';
import Subject from '../../models/Subject.js';
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
  await Grade.deleteMany({});
  await Student.deleteMany({});
  await Subject.deleteMany({});
  await User.deleteMany({});
});

describe('Grade Controller', () => {
  let studentId: mongoose.Types.ObjectId;
  let subjectId: mongoose.Types.ObjectId;

  beforeEach(async () => {
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

    const subject = await Subject.create({
      name: 'Mathematics',
      code: 'MATH',
      level: '6ème',
      coefficient: 3
    });

    studentId = student._id;
    subjectId = subject._id;
  });

  describe('Grade Creation', () => {
    it('should create a grade with valid data', async () => {
      const gradeData = {
        student: studentId,
        subject: subjectId,
        grade: 15,
        maxGrade: 20,
        coefficient: 3,
        date: new Date(),
        semester: 1,
        academicYear: '2024-2025',
        type: 'exam'
      };

      const grade = await Grade.create(gradeData);

      expect(grade.grade).toBe(15);
      expect(grade.maxGrade).toBe(20);
      expect(grade.coefficient).toBe(3);
    });

    it('should fail with invalid grade (negative)', async () => {
      const gradeData = {
        student: studentId,
        subject: subjectId,
        grade: -5,
        maxGrade: 20,
        date: new Date(),
        semester: 1,
        academicYear: '2024-2025'
      };

      await expect(Grade.create(gradeData)).rejects.toThrow();
    });

    it('should fail with grade exceeding maxGrade', async () => {
      const gradeData = {
        student: studentId,
        subject: subjectId,
        grade: 25,
        maxGrade: 20,
        date: new Date(),
        semester: 1,
        academicYear: '2024-2025'
      };

      await expect(Grade.create(gradeData)).rejects.toThrow();
    });
  });

  describe('Grade Queries', () => {
    beforeEach(async () => {
      await Grade.create({
        student: studentId,
        subject: subjectId,
        grade: 15,
        maxGrade: 20,
        coefficient: 3,
        date: new Date(),
        semester: 1,
        academicYear: '2024-2025',
        type: 'exam'
      });

      await Grade.create({
        student: studentId,
        subject: subjectId,
        grade: 12,
        maxGrade: 20,
        coefficient: 2,
        date: new Date(),
        semester: 1,
        academicYear: '2024-2025',
        type: 'quiz'
      });
    });

    it('should find all grades for a student', async () => {
      const grades = await Grade.find({ student: studentId });
      expect(grades).toHaveLength(2);
    });

    it('should find grades by type', async () => {
      const exams = await Grade.find({ type: 'exam' });
      expect(exams).toHaveLength(1);
      expect(exams[0].grade).toBe(15);
    });

    it('should calculate average grade', async () => {
      const grades = await Grade.find({ student: studentId });
      
      const totalWeighted = grades.reduce((sum, g) => {
        return sum + (g.grade / g.maxGrade) * 20 * g.coefficient;
      }, 0);
      
      const totalCoefficient = grades.reduce((sum, g) => sum + g.coefficient, 0);
      const average = totalWeighted / totalCoefficient;

      expect(average).toBeCloseTo(13.8, 1); // (15*3 + 12*2) / (3+2) = 13.8
    });

    it('should populate student and subject data', async () => {
      const grade = await Grade.findOne()
        .populate('student')
        .populate('subject', 'name code');

      expect(grade).not.toBeNull();
      expect((grade?.subject as any).name).toBe('Mathematics');
    });
  });

  describe('Grade Statistics', () => {
    beforeEach(async () => {
      await Grade.create({
        student: studentId,
        subject: subjectId,
        grade: 15,
        maxGrade: 20,
        coefficient: 3,
        date: new Date(),
        semester: 1,
        academicYear: '2024-2025',
        type: 'exam'
      });

      await Grade.create({
        student: studentId,
        subject: subjectId,
        grade: 18,
        maxGrade: 20,
        coefficient: 2,
        date: new Date(),
        semester: 1,
        academicYear: '2024-2025',
        type: 'exam'
      });

      await Grade.create({
        student: studentId,
        subject: subjectId,
        grade: 10,
        maxGrade: 20,
        coefficient: 1,
        date: new Date(),
        semester: 1,
        academicYear: '2024-2025',
        type: 'quiz'
      });
    });

    it('should find minimum grade', async () => {
      const grades = await Grade.find({ student: studentId });
      const minGrade = Math.min(...grades.map(g => g.grade));
      expect(minGrade).toBe(10);
    });

    it('should find maximum grade', async () => {
      const grades = await Grade.find({ student: studentId });
      const maxGrade = Math.max(...grades.map(g => g.grade));
      expect(maxGrade).toBe(18);
    });

    it('should count total grades', async () => {
      const count = await Grade.countDocuments({ student: studentId });
      expect(count).toBe(3);
    });
  });

  describe('Grade Updates', () => {
    it('should update grade value', async () => {
      const grade = await Grade.create({
        student: studentId,
        subject: subjectId,
        grade: 15,
        maxGrade: 20,
        coefficient: 3,
        date: new Date(),
        semester: 1,
        academicYear: '2024-2025',
        type: 'exam'
      });

      grade.grade = 17;
      grade.comments = 'Excellent improvement';
      await grade.save();

      const updatedGrade = await Grade.findById(grade._id);
      expect(updatedGrade?.grade).toBe(17);
      expect(updatedGrade?.comments).toBe('Excellent improvement');
    });

    it('should not allow invalid updates', async () => {
      const grade = await Grade.create({
        student: studentId,
        subject: subjectId,
        grade: 15,
        maxGrade: 20,
        coefficient: 3,
        date: new Date(),
        semester: 1,
        academicYear: '2024-2025',
        type: 'exam'
      });

      grade.grade = -5;
      await expect(grade.save()).rejects.toThrow();
    });
  });
});
