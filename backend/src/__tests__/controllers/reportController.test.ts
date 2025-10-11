import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Report from '../../models/Report.js';
import User from '../../models/User.js';
import School from '../../models/School.js';
import reportRoutes from '../../routes/reportRoutes.js';
import { protect, authorize } from '../../middleware/auth.js';

// Create express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware
jest.mock('../../middleware/auth.js', () => ({
  protect: (req: any, res: any, next: any) => {
    req.user = {
      id: 'user123',
      school: 'school123',
      role: 'admin',
    };
    next();
  },
  authorize: (...roles: string[]) => (req: any, res: any, next: any) => {
    next();
  },
}));

app.use('/api/reports', reportRoutes);

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

beforeEach(async () => {
  await Report.deleteMany({});
  await User.deleteMany({});
  await School.deleteMany({});
});

describe('Report Controller', () => {
  describe('GET /api/reports/templates', () => {
    it('should return report templates', async () => {
      const response = await request(app).get('/api/reports/templates');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('type');
      expect(response.body.data[0]).toHaveProperty('fields');
    });
  });

  describe('POST /api/reports', () => {
    it('should create a new report', async () => {
      const reportData = {
        name: 'Test Report',
        description: 'Test description',
        type: 'students',
        fields: ['firstName', 'lastName', 'email'],
        filters: [],
        format: 'pdf',
      };

      const response = await request(app).post('/api/reports').send(reportData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(reportData.name);
      expect(response.body.data.type).toBe(reportData.type);
    });

    it('should require at least one field', async () => {
      const reportData = {
        name: 'Test Report',
        type: 'students',
        fields: [],
        format: 'pdf',
      };

      const response = await request(app).post('/api/reports').send(reportData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate report type', async () => {
      const reportData = {
        name: 'Test Report',
        type: 'invalid_type',
        fields: ['firstName'],
        format: 'pdf',
      };

      const response = await request(app).post('/api/reports').send(reportData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/reports', () => {
    beforeEach(async () => {
      // Create sample reports
      await Report.create([
        {
          name: 'Report 1',
          type: 'students',
          fields: ['firstName', 'lastName'],
          format: 'pdf',
          createdBy: 'user123',
          school: 'school123',
        },
        {
          name: 'Report 2',
          type: 'grades',
          fields: ['student', 'grade'],
          format: 'excel',
          createdBy: 'user123',
          school: 'school123',
          scheduled: true,
        },
      ]);
    });

    it('should get all reports for the school', async () => {
      const response = await request(app).get('/api/reports');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter reports by type', async () => {
      const response = await request(app).get('/api/reports?type=students');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].type).toBe('students');
    });

    it('should filter scheduled reports', async () => {
      const response = await request(app).get('/api/reports?scheduled=true');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].scheduled).toBe(true);
    });
  });

  describe('GET /api/reports/:id', () => {
    let reportId: string;

    beforeEach(async () => {
      const report = await Report.create({
        name: 'Test Report',
        type: 'students',
        fields: ['firstName', 'lastName'],
        format: 'pdf',
        createdBy: 'user123',
        school: 'school123',
      });
      reportId = report._id.toString();
    });

    it('should get a single report by ID', async () => {
      const response = await request(app).get(`/api/reports/${reportId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(reportId);
      expect(response.body.data.name).toBe('Test Report');
    });

    it('should return 404 for non-existent report', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).get(`/api/reports/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/reports/:id', () => {
    let reportId: string;

    beforeEach(async () => {
      const report = await Report.create({
        name: 'Test Report',
        type: 'students',
        fields: ['firstName', 'lastName'],
        format: 'pdf',
        createdBy: 'user123',
        school: 'school123',
      });
      reportId = report._id.toString();
    });

    it('should update a report', async () => {
      const updateData = {
        name: 'Updated Report',
        description: 'Updated description',
      };

      const response = await request(app).put(`/api/reports/${reportId}`).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent report', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).put(`/api/reports/${fakeId}`).send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/reports/:id', () => {
    let reportId: string;

    beforeEach(async () => {
      const report = await Report.create({
        name: 'Test Report',
        type: 'students',
        fields: ['firstName', 'lastName'],
        format: 'pdf',
        createdBy: 'user123',
        school: 'school123',
      });
      reportId = report._id.toString();
    });

    it('should delete a report', async () => {
      const response = await request(app).delete(`/api/reports/${reportId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify report is deleted
      const report = await Report.findById(reportId);
      expect(report).toBeNull();
    });

    it('should return 404 for non-existent report', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).delete(`/api/reports/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/reports/stats', () => {
    beforeEach(async () => {
      await Report.create([
        {
          name: 'Report 1',
          type: 'students',
          fields: ['firstName'],
          format: 'pdf',
          createdBy: 'user123',
          school: 'school123',
          scheduled: true,
        },
        {
          name: 'Report 2',
          type: 'grades',
          fields: ['grade'],
          format: 'excel',
          createdBy: 'user123',
          school: 'school123',
          lastRun: new Date(),
        },
      ]);
    });

    it('should get report statistics', async () => {
      const response = await request(app).get('/api/reports/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalReports');
      expect(response.body.data).toHaveProperty('scheduledReports');
      expect(response.body.data).toHaveProperty('byType');
      expect(response.body.data).toHaveProperty('byFormat');
      expect(response.body.data.totalReports).toBe(2);
      expect(response.body.data.scheduledReports).toBe(1);
    });
  });
});
