import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import SchoolYear from '../../models/SchoolYear.js';
import School from '../../models/School.js';
import Class from '../../models/Class.js';
import Student from '../../models/Student.js';
import User from '../../models/User.js';
import {
  getSchoolYears,
  getCurrentSchoolYear,
  getSchoolYear,
  createSchoolYear,
  updateSchoolYear,
  setCurrentSchoolYear,
  closeSchoolYear,
  promoteStudents,
} from '../../controllers/schoolYearController.js';

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
  await SchoolYear.deleteMany({});
  await School.deleteMany({});
  await Class.deleteMany({});
  await Student.deleteMany({});
  await User.deleteMany({});
});

describe('SchoolYear Controller', () => {
  let schoolId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const school = await School.create({
      name: 'Test School',
      address: '123 Test St',
      phone: '0123456789',
      email: 'test@school.com',
    });

    schoolId = school._id as mongoose.Types.ObjectId;
  });

  describe('getSchoolYears', () => {
    it('should return all school years', async () => {
      await SchoolYear.create({
        name: '2023-2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
        school: schoolId,
      });

      await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        school: schoolId,
      });

      const req: any = { query: {} };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getSchoolYears(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: 2,
          data: expect.any(Array),
        })
      );
    });

    it('should filter by status', async () => {
      await SchoolYear.create({
        name: '2023-2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
        status: 'archived',
      });

      await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        status: 'active',
      });

      const req: any = { query: { status: 'active' } };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getSchoolYears(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: 1,
        })
      );
    });
  });

  describe('getCurrentSchoolYear', () => {
    it('should return current school year', async () => {
      const schoolYear = await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: true,
      });

      const req: any = { query: {} };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getCurrentSchoolYear(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: '2024-2025',
            isCurrent: true,
          }),
        })
      );
    });

    it('should return 404 if no current school year exists', async () => {
      const req: any = { query: {} };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getCurrentSchoolYear(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No current school year found',
        })
      );
    });
  });

  describe('getSchoolYear', () => {
    it('should return a specific school year with statistics', async () => {
      const schoolYear = await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      });

      const req: any = { params: { id: (schoolYear._id as mongoose.Types.ObjectId).toString() } };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getSchoolYear(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: '2024-2025',
            statistics: expect.objectContaining({
              classes: 0,
              students: 0,
              grades: 0,
              attendances: 0,
              invoices: 0,
            }),
          }),
        })
      );
    });

    it('should return 404 for non-existent school year', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const req: any = { params: { id: fakeId.toString() } };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await getSchoolYear(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createSchoolYear', () => {
    it('should create a new school year', async () => {
      const req: any = {
        body: {
          name: '2024-2025',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-06-30'),
          status: 'upcoming',
          school: schoolId,
        },
      };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await createSchoolYear(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: '2024-2025',
          }),
        })
      );
    });

    it('should reject if endDate is before startDate', async () => {
      const req: any = {
        body: {
          name: '2024-2025',
          startDate: new Date('2025-06-30'),
          endDate: new Date('2024-09-01'),
        },
      };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await createSchoolYear(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'End date must be after start date',
        })
      );
    });

    it('should reject overlapping school years', async () => {
      await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      });

      const req: any = {
        body: {
          name: '2024-2025-2',
          startDate: new Date('2024-10-01'),
          endDate: new Date('2025-07-30'),
        },
      };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await createSchoolYear(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'School year overlaps with existing year',
        })
      );
    });
  });

  describe('updateSchoolYear', () => {
    it('should update a school year', async () => {
      const schoolYear = await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      });

      const req: any = {
        params: { id: (schoolYear._id as mongoose.Types.ObjectId).toString() },
        body: {
          description: 'Updated description',
          status: 'active',
        },
      };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await updateSchoolYear(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            description: 'Updated description',
            status: 'active',
          }),
        })
      );
    });

    it('should return 404 for non-existent school year', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const req: any = {
        params: { id: fakeId.toString() },
        body: { description: 'Updated' },
      };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await updateSchoolYear(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('setCurrentSchoolYear', () => {
    it('should set a school year as current', async () => {
      const schoolYear = await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: false,
      });

      const req: any = {
        params: { id: (schoolYear._id as mongoose.Types.ObjectId).toString() },
      };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await setCurrentSchoolYear(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            isCurrent: true,
            status: 'active',
          }),
        })
      );
    });
  });

  describe('closeSchoolYear', () => {
    it('should close (archive) a school year', async () => {
      const schoolYear = await SchoolYear.create({
        name: '2023-2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
        isCurrent: true,
        status: 'active',
      });

      const req: any = {
        params: { id: (schoolYear._id as mongoose.Types.ObjectId).toString() },
      };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await closeSchoolYear(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            status: 'archived',
            isCurrent: false,
          }),
        })
      );
    });

    it('should not close already archived school year', async () => {
      const schoolYear = await SchoolYear.create({
        name: '2023-2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
        status: 'archived',
      });

      const req: any = {
        params: { id: (schoolYear._id as mongoose.Types.ObjectId).toString() },
      };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await closeSchoolYear(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'School year is already archived',
        })
      );
    });
  });

  describe('promoteStudents', () => {
    it('should promote students to next level', async () => {
      const user = await User.create({
        email: 'student@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
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
          relationship: 'Mother',
        },
        emergencyContact: {
          name: 'Emergency',
          phone: '+33123456790',
        },
      });

      const oldSchoolYear = await SchoolYear.create({
        name: '2023-2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
      });

      const newSchoolYear = await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      });

      const targetClass = await Class.create({
        name: '6ème A',
        level: '6ème',
        academicYear: '2024-2025',
        maxCapacity: 30,
      });

      const req: any = {
        params: { id: (oldSchoolYear._id as mongoose.Types.ObjectId).toString() },
        body: {
          studentIds: [(student._id as mongoose.Types.ObjectId).toString()],
          targetClassId: (targetClass._id as mongoose.Types.ObjectId).toString(),
          targetLevel: '6ème',
          newSchoolYearId: (newSchoolYear._id as mongoose.Types.ObjectId).toString(),
        },
      };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await promoteStudents(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            promotedCount: 1,
            targetLevel: '6ème',
          }),
        })
      );

      // Verify student was updated
      const updatedStudent = await Student.findById(student._id);
      expect(updatedStudent?.level).toBe('6ème');
      expect(updatedStudent?.enrollmentHistory).toHaveLength(1);
    });

    it('should reject if studentIds array is empty', async () => {
      const req: any = {
        params: { id: 'someid' },
        body: {
          studentIds: [],
          targetClassId: 'classid',
          targetLevel: '6ème',
          newSchoolYearId: 'yearid',
        },
      };
      const res: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await promoteStudents(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
