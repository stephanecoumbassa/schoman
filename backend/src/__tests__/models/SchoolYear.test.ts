import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import SchoolYear from '../../models/SchoolYear.js';
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
  await SchoolYear.deleteMany({});
  await School.deleteMany({});
});

describe('SchoolYear Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid school year', async () => {
      const schoolYearData = {
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        status: 'upcoming',
      };

      const schoolYear = await SchoolYear.create(schoolYearData);

      expect(schoolYear.name).toBe('2024-2025');
      expect(schoolYear.startDate).toEqual(schoolYearData.startDate);
      expect(schoolYear.endDate).toEqual(schoolYearData.endDate);
      expect(schoolYear.status).toBe('upcoming');
      expect(schoolYear.isCurrent).toBe(false);
    });

    it('should require name field', async () => {
      const schoolYearData = {
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      };

      await expect(SchoolYear.create(schoolYearData)).rejects.toThrow();
    });

    it('should require startDate field', async () => {
      const schoolYearData = {
        name: '2024-2025',
        endDate: new Date('2025-06-30'),
      };

      await expect(SchoolYear.create(schoolYearData)).rejects.toThrow();
    });

    it('should require endDate field', async () => {
      const schoolYearData = {
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
      };

      await expect(SchoolYear.create(schoolYearData)).rejects.toThrow();
    });

    it('should validate that endDate is after startDate', async () => {
      const schoolYearData = {
        name: '2024-2025',
        startDate: new Date('2025-06-30'),
        endDate: new Date('2024-09-01'),
      };

      await expect(SchoolYear.create(schoolYearData)).rejects.toThrow();
    });

    it('should enforce unique name', async () => {
      const schoolYearData = {
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      };

      await SchoolYear.create(schoolYearData);
      await expect(SchoolYear.create(schoolYearData)).rejects.toThrow();
    });

    it('should accept valid status values', async () => {
      const statuses = ['active', 'archived', 'upcoming'];

      for (const status of statuses) {
        const schoolYear = await SchoolYear.create({
          name: `Year-${status}`,
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-06-30'),
          status,
        });

        expect(schoolYear.status).toBe(status);
      }
    });

    it('should default status to upcoming', async () => {
      const schoolYear = await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      });

      expect(schoolYear.status).toBe('upcoming');
    });

    it('should default isCurrent to false', async () => {
      const schoolYear = await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      });

      expect(schoolYear.isCurrent).toBe(false);
    });

    it('should accept optional description', async () => {
      const schoolYear = await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        description: 'Test academic year',
      });

      expect(schoolYear.description).toBe('Test academic year');
    });

    it('should reference a school if provided', async () => {
      const school = await School.create({
        name: 'Test School',
        address: '123 Test St',
        phone: '0123456789',
        email: 'test@school.com',
      });

      const schoolYear = await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        school: school._id,
      });

      const populated = await SchoolYear.findById(schoolYear._id).populate('school');
      expect(populated?.school).toBeDefined();
      expect((populated?.school as any).name).toBe('Test School');
    });
  });

  describe('Pre-save Hook', () => {
    it('should set only one school year as current', async () => {
      const schoolYear1 = await SchoolYear.create({
        name: '2023-2024',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-06-30'),
        isCurrent: true,
      });

      expect(schoolYear1.isCurrent).toBe(true);

      const schoolYear2 = await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: true,
      });

      const updatedSchoolYear1 = await SchoolYear.findById(schoolYear1._id);
      expect(updatedSchoolYear1?.isCurrent).toBe(false);
      expect(schoolYear2.isCurrent).toBe(true);
    });

    it('should handle current year per school', async () => {
      const school1 = await School.create({
        name: 'School 1',
        address: '123 Test St',
        phone: '0123456789',
        email: 'school1@test.com',
      });

      const school2 = await School.create({
        name: 'School 2',
        address: '456 Test Ave',
        phone: '0987654321',
        email: 'school2@test.com',
      });

      const schoolYear1 = await SchoolYear.create({
        name: '2024-2025-S1',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: true,
        school: school1._id,
      });

      const schoolYear2 = await SchoolYear.create({
        name: '2024-2025-S2',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        isCurrent: true,
        school: school2._id,
      });

      // Both should remain current as they belong to different schools
      const updated1 = await SchoolYear.findById(schoolYear1._id);
      const updated2 = await SchoolYear.findById(schoolYear2._id);

      expect(updated1?.isCurrent).toBe(true);
      expect(updated2?.isCurrent).toBe(true);
    });
  });

  describe('Indexes', () => {
    it('should have indexes on school and isCurrent', async () => {
      const indexes = await SchoolYear.collection.getIndexes();
      const indexKeys = Object.keys(indexes);

      expect(indexKeys.some((key) => indexes[key].some((idx: any) => idx[0] === 'school'))).toBe(
        true
      );
    });

    it('should have index on status', async () => {
      const indexes = await SchoolYear.collection.getIndexes();
      const indexKeys = Object.keys(indexes);

      expect(indexKeys.some((key) => indexes[key].some((idx: any) => idx[0] === 'status'))).toBe(
        true
      );
    });

    it('should have indexes on startDate and endDate', async () => {
      const indexes = await SchoolYear.collection.getIndexes();
      const indexKeys = Object.keys(indexes);

      expect(
        indexKeys.some((key) => indexes[key].some((idx: any) => idx[0] === 'startDate'))
      ).toBe(true);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt timestamps', async () => {
      const schoolYear = await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      });

      expect(schoolYear.createdAt).toBeDefined();
      expect(schoolYear.updatedAt).toBeDefined();
      expect(schoolYear.createdAt).toBeInstanceOf(Date);
      expect(schoolYear.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt on modification', async () => {
      const schoolYear = await SchoolYear.create({
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
      });

      const originalUpdatedAt = schoolYear.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      schoolYear.description = 'Updated description';
      await schoolYear.save();

      expect(schoolYear.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
