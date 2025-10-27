import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import School from '../../models/School';
import {
  getSchools,
  getSchoolById,
  getSchoolByCode,
  createSchool,
  updateSchool,
  deleteSchool,
} from '../../controllers/schoolController';

let mongoServer: MongoMemoryServer;

// Mock request and response
const mockRequest = (data: any = {}) => {
  return {
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
    user: data.user || { id: 'testUserId', role: 'admin' },
  } as any;
};

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  jest.clearAllMocks();
});

describe('School Controller', () => {
  describe('createSchool', () => {
    it('should create a new school successfully', async () => {
      const req = mockRequest({
        body: {
          name: 'Test School',
          code: 'TS001',
          address: '123 Test Street',
          city: 'Test City',
          country: 'Test Country',
          phone: '+1234567890',
          email: 'test@school.com',
        },
      });
      const res = mockResponse();
      const next = mockNext;

      await createSchool(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      const createdSchool = res.json.mock.calls[0][0];
      expect(createdSchool.name).toBe('Test School');
      expect(createdSchool.code).toBe('TS001');
    });

    it('should fail when required fields are missing', async () => {
      const req = mockRequest({
        body: {
          name: 'Test School',
          // Missing required fields
        },
      });
      const res = mockResponse();
      const next = mockNext;

      await createSchool(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(400);
    });

    it('should fail when school code already exists', async () => {
      // Create first school
      await School.create({
        name: 'First School',
        code: 'TS001',
        address: '123 Test Street',
        city: 'Test City',
        country: 'Test Country',
        phone: '+1234567890',
        email: 'first@school.com',
      });

      // Try to create second school with same code
      const req = mockRequest({
        body: {
          name: 'Second School',
          code: 'TS001',
          address: '456 Test Avenue',
          city: 'Test City',
          country: 'Test Country',
          phone: '+0987654321',
          email: 'second@school.com',
        },
      });
      const res = mockResponse();
      const next = mockNext;

      await createSchool(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(409);
    });
  });

  describe('getSchools', () => {
    it('should return all schools', async () => {
      // Create test schools
      await School.create([
        {
          name: 'School 1',
          code: 'SC001',
          address: '123 Street',
          city: 'City 1',
          country: 'Country',
          phone: '+1234567890',
          email: 'school1@test.com',
        },
        {
          name: 'School 2',
          code: 'SC002',
          address: '456 Avenue',
          city: 'City 2',
          country: 'Country',
          phone: '+0987654321',
          email: 'school2@test.com',
        },
      ]);

      const req = mockRequest();
      const res = mockResponse();
      const next = mockNext;

      await getSchools(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const schools = res.json.mock.calls[0][0];
      expect(schools).toHaveLength(2);
    });

    it('should filter schools by search query', async () => {
      // Create test schools
      await School.create([
        {
          name: 'Primary School',
          code: 'PS001',
          address: '123 Street',
          city: 'Paris',
          country: 'France',
          phone: '+1234567890',
          email: 'primary@test.com',
        },
        {
          name: 'Secondary School',
          code: 'SS001',
          address: '456 Avenue',
          city: 'Lyon',
          country: 'France',
          phone: '+0987654321',
          email: 'secondary@test.com',
        },
      ]);

      const req = mockRequest({ query: { search: 'Primary' } });
      const res = mockResponse();
      const next = mockNext;

      await getSchools(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const schools = res.json.mock.calls[0][0];
      expect(schools).toHaveLength(1);
      expect(schools[0].name).toBe('Primary School');
    });
  });

  describe('getSchoolById', () => {
    it('should return a school by ID', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TS001',
        address: '123 Test Street',
        city: 'Test City',
        country: 'Test Country',
        phone: '+1234567890',
        email: 'test@school.com',
      });

      const req = mockRequest({ params: { id: (school._id as any).toString() } });
      const res = mockResponse();
      const next = mockNext;

      await getSchoolById(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const foundSchool = res.json.mock.calls[0][0];
      expect(foundSchool.name).toBe('Test School');
    });

    it('should return 404 for non-existent school', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const req = mockRequest({ params: { id: fakeId.toString() } });
      const res = mockResponse();
      const next = mockNext;

      await getSchoolById(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.statusCode).toBe(404);
    });
  });

  describe('getSchoolByCode', () => {
    it('should return a school by code', async () => {
      await School.create({
        name: 'Test School',
        code: 'TS001',
        address: '123 Test Street',
        city: 'Test City',
        country: 'Test Country',
        phone: '+1234567890',
        email: 'test@school.com',
      });

      const req = mockRequest({ params: { code: 'ts001' } });
      const res = mockResponse();
      const next = mockNext;

      await getSchoolByCode(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const foundSchool = res.json.mock.calls[0][0];
      expect(foundSchool.code).toBe('TS001');
    });
  });

  describe('updateSchool', () => {
    it('should update a school successfully', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TS001',
        address: '123 Test Street',
        city: 'Test City',
        country: 'Test Country',
        phone: '+1234567890',
        email: 'test@school.com',
      });

      const req = mockRequest({
        params: { id: (school._id as any).toString() },
        body: {
          name: 'Updated School',
          city: 'Updated City',
        },
      });
      const res = mockResponse();
      const next = mockNext;

      await updateSchool(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const updatedSchool = res.json.mock.calls[0][0];
      expect(updatedSchool.name).toBe('Updated School');
      expect(updatedSchool.city).toBe('Updated City');
    });
  });

  describe('deleteSchool', () => {
    it('should soft delete a school', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TS001',
        address: '123 Test Street',
        city: 'Test City',
        country: 'Test Country',
        phone: '+1234567890',
        email: 'test@school.com',
      });

      const req = mockRequest({ params: { id: (school._id as any).toString() } });
      const res = mockResponse();
      const next = mockNext;

      await deleteSchool(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const deletedSchool = await School.findById(school._id as any);
      expect(deletedSchool?.isActive).toBe(false);
    });
  });
});
