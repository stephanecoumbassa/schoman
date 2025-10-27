import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express, { Express } from 'express';
import eventRoutes from '../../routes/eventRoutes.js';
import Event from '../../models/Event.js';
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
  app.use('/api/events', authenticate, eventRoutes);

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
  await Event.deleteMany({});
});

describe('Event Routes', () => {
  describe('POST /api/events', () => {
    it('should create event with valid data', async () => {
      const startDate = new Date(Date.now() + 86400000); // Tomorrow
      const endDate = new Date(Date.now() + 2 * 86400000); // Day after tomorrow

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'School Assembly',
          description: 'Monthly school assembly',
          eventType: 'meeting',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          location: 'Main Hall',
          targetAudience: ['all'],
          maxParticipants: 500
        });

      expect(response.status).toBe(201);
      expect(response.body.event).toBeDefined();
      expect(response.body.event.title).toBe('School Assembly');
      expect(response.body.event.eventType).toBe('meeting');
      expect(response.body.event.status).toBe('planned');
      expect(response.body.event.currentParticipants).toBe(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({
          title: 'Test Event',
          eventType: 'meeting',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          targetAudience: ['all']
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid event type', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Event',
          eventType: 'invalid_type',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          targetAudience: ['all']
        });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/events', () => {
    it('should get list of events', async () => {
      // Create multiple events
      for (let i = 0; i < 3; i++) {
        await Event.create({
          title: `Event ${i + 1}`,
          eventType: 'meeting',
          startDate: new Date(Date.now() + (i + 1) * 86400000),
          endDate: new Date(Date.now() + (i + 2) * 86400000),
          targetAudience: ['all'],
          currentParticipants: 0,
          status: 'planned',
          createdBy: adminId
        });
      }

      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter events by type', async () => {
      await Event.create({
        title: 'Meeting Event',
        eventType: 'meeting',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 2 * 86400000),
        targetAudience: ['all'],
        currentParticipants: 0,
        status: 'planned',
        createdBy: adminId
      });

      await Event.create({
        title: 'Celebration Event',
        eventType: 'celebration',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 2 * 86400000),
        targetAudience: ['all'],
        currentParticipants: 0,
        status: 'planned',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ eventType: 'meeting' });

      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(1);
      expect(response.body.events[0].eventType).toBe('meeting');
    });

    it('should filter events by status', async () => {
      await Event.create({
        title: 'Planned Event',
        eventType: 'meeting',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 2 * 86400000),
        targetAudience: ['all'],
        currentParticipants: 0,
        status: 'planned',
        createdBy: adminId
      });

      await Event.create({
        title: 'Completed Event',
        eventType: 'meeting',
        startDate: new Date(Date.now() - 2 * 86400000),
        endDate: new Date(Date.now() - 86400000),
        targetAudience: ['all'],
        currentParticipants: 0,
        status: 'completed',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'planned' });

      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(1);
      expect(response.body.events[0].status).toBe('planned');
    });

    it('should filter events by date range', async () => {
      const today = new Date();
      const tomorrow = new Date(Date.now() + 86400000);
      const nextWeek = new Date(Date.now() + 7 * 86400000);

      await Event.create({
        title: 'Tomorrow Event',
        eventType: 'meeting',
        startDate: tomorrow,
        endDate: new Date(Date.now() + 2 * 86400000),
        targetAudience: ['all'],
        currentParticipants: 0,
        status: 'planned',
        createdBy: adminId
      });

      await Event.create({
        title: 'Next Week Event',
        eventType: 'meeting',
        startDate: nextWeek,
        endDate: new Date(Date.now() + 8 * 86400000),
        targetAudience: ['all'],
        currentParticipants: 0,
        status: 'planned',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: today.toISOString(),
          endDate: new Date(Date.now() + 3 * 86400000).toISOString()
        });

      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(1);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should get event by id', async () => {
      const event = await Event.create({
        title: 'Test Event',
        eventType: 'meeting',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 2 * 86400000),
        location: 'Main Hall',
        targetAudience: ['all'],
        currentParticipants: 0,
        status: 'planned',
        createdBy: adminId
      });

      const response = await request(app)
        .get(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.event).toBeDefined();
      expect(response.body.event._id).toBe(event._id!.toString());
      expect(response.body.event.title).toBe('Test Event');
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/events/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update event', async () => {
      const event = await Event.create({
        title: 'Test Event',
        eventType: 'meeting',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 2 * 86400000),
        targetAudience: ['all'],
        currentParticipants: 0,
        status: 'planned',
        createdBy: adminId
      });

      const response = await request(app)
        .put(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Event',
          location: 'Updated Location',
          notes: 'Updated notes'
        });

      expect(response.status).toBe(200);
      expect(response.body.event.title).toBe('Updated Event');
      expect(response.body.event.location).toBe('Updated Location');
      expect(response.body.event.notes).toBe('Updated notes');
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/events/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete event', async () => {
      const event = await Event.create({
        title: 'Event to Delete',
        eventType: 'meeting',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 2 * 86400000),
        targetAudience: ['all'],
        currentParticipants: 0,
        status: 'planned',
        createdBy: adminId
      });

      const response = await request(app)
        .delete(`/api/events/${event._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('supprimé');

      const deletedEvent = await Event.findById(event._id);
      expect(deletedEvent).toBeNull();
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/events/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/events/stats', () => {
    it('should get event statistics', async () => {
      await Event.create({
        title: 'Event 1',
        eventType: 'meeting',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 2 * 86400000),
        targetAudience: ['all'],
        currentParticipants: 50,
        status: 'planned',
        createdBy: adminId
      });

      await Event.create({
        title: 'Event 2',
        eventType: 'celebration',
        startDate: new Date(Date.now() - 2 * 86400000),
        endDate: new Date(Date.now() - 86400000),
        targetAudience: ['students'],
        currentParticipants: 100,
        status: 'completed',
        createdBy: adminId
      });

      const response = await request(app)
        .get('/api/events/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.total).toBeGreaterThanOrEqual(2);
    });
  });
});
