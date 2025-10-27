import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express, { Express } from 'express';
import messageRoutes from '../../routes/messageRoutes.js';
import Message from '../../models/Message.js';
import User from '../../models/User.js';
import School from '../../models/School.js';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../middleware/auth.js';

let mongoServer: MongoMemoryServer;
let app: Express;
let authToken: string;
let senderId: string;
let recipientId: string;
let schoolId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Setup Express app
  app = express();
  app.use(express.json());
  app.use('/api/messages', authenticate, messageRoutes);

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

  const sender = await User.create({
    email: 'sender@test.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Teacher',
    role: 'teacher',
    school: school._id
  });
  senderId = sender._id!.toString();

  const recipient = await User.create({
    email: 'recipient@test.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Parent',
    role: 'parent',
    school: school._id
  });
  recipientId = recipient._id!.toString();

  // Generate auth token
  const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
  authToken = jwt.sign(
    {
      id: senderId,
      email: sender.email,
      role: sender.role,
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
  await Message.deleteMany({});
});

describe('Message Routes', () => {
  describe('POST /api/messages', () => {
    it('should create message with valid data', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'Test Message',
          content: 'This is a test message content',
          recipients: [recipientId],
          priority: 'normal',
          category: 'general'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBeDefined();
      expect(response.body.message.subject).toBe('Test Message');
      expect(response.body.message.content).toBe('This is a test message content');
      expect(response.body.message.sender).toBe(senderId);
      expect(response.body.message.recipients).toHaveLength(1);
      expect(response.body.message.conversationId).toBeDefined();
    });

    it('should create message with multiple recipients', async () => {
      const recipient2 = await User.create({
        email: 'recipient2@test.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'Student',
        role: 'student',
        school: schoolId
      });

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'Multi-recipient Message',
          content: 'Message to multiple recipients',
          recipients: [recipientId, recipient2._id!.toString()],
          priority: 'high',
          category: 'announcement'
        });

      expect(response.status).toBe(201);
      expect(response.body.message.recipients).toHaveLength(2);
      expect(response.body.message.priority).toBe('high');
      expect(response.body.message.category).toBe('announcement');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          subject: 'Test',
          content: 'Test content',
          recipients: [recipientId]
        });

      expect(response.status).toBe(401);
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'Test Message'
          // Missing content and recipients
        });

      expect(response.status).toBe(500);
    });

    it('should fail with empty recipients array', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'Test Message',
          content: 'Test content',
          recipients: []
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('destinataire');
    });
  });

  describe('GET /api/messages', () => {
    it('should get list of messages for sender', async () => {
      // Create messages as sender
      for (let i = 0; i < 3; i++) {
        await Message.create({
          subject: `Message ${i + 1}`,
          content: `Content ${i + 1}`,
          sender: senderId,
          recipients: [recipientId],
          conversationId: `conv-${i + 1}`,
          priority: 'normal',
          category: 'general',
          isArchived: false,
          readBy: []
        });
      }

      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter messages by priority', async () => {
      await Message.create({
        subject: 'High Priority',
        content: 'Important message',
        sender: senderId,
        recipients: [recipientId],
        conversationId: 'conv-1',
        priority: 'high',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      await Message.create({
        subject: 'Normal Priority',
        content: 'Regular message',
        sender: senderId,
        recipients: [recipientId],
        conversationId: 'conv-2',
        priority: 'normal',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ priority: 'high' });

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].priority).toBe('high');
    });

    it('should filter messages by category', async () => {
      await Message.create({
        subject: 'Academic Message',
        content: 'About grades',
        sender: senderId,
        recipients: [recipientId],
        conversationId: 'conv-1',
        priority: 'normal',
        category: 'academic',
        isArchived: false,
        readBy: []
      });

      await Message.create({
        subject: 'General Message',
        content: 'General info',
        sender: senderId,
        recipients: [recipientId],
        conversationId: 'conv-2',
        priority: 'normal',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ category: 'academic' });

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].category).toBe('academic');
    });

    it('should exclude archived messages by default', async () => {
      await Message.create({
        subject: 'Active Message',
        content: 'Not archived',
        sender: senderId,
        recipients: [recipientId],
        conversationId: 'conv-1',
        priority: 'normal',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      await Message.create({
        subject: 'Archived Message',
        content: 'This is archived',
        sender: senderId,
        recipients: [recipientId],
        conversationId: 'conv-2',
        priority: 'normal',
        category: 'general',
        isArchived: true,
        readBy: []
      });

      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.messages[0].isArchived).toBe(false);
    });
  });

  describe('GET /api/messages/:id', () => {
    it('should get message by id', async () => {
      const message = await Message.create({
        subject: 'Test Message',
        content: 'Test content',
        sender: senderId,
        recipients: [recipientId],
        conversationId: 'conv-1',
        priority: 'normal',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      const response = await request(app)
        .get(`/api/messages/${message._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
      expect(response.body.message._id).toBe(message._id!.toString());
      expect(response.body.message.subject).toBe('Test Message');
    });

    it('should return 404 for non-existent message', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/messages/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('trouvé');
    });
  });

  describe('PATCH /api/messages/:id/read', () => {
    it('should mark message as read', async () => {
      const message = await Message.create({
        subject: 'Unread Message',
        content: 'Not read yet',
        sender: recipientId,
        recipients: [senderId],
        conversationId: 'conv-1',
        priority: 'normal',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      const response = await request(app)
        .patch(`/api/messages/${message._id}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message.readBy).toHaveLength(1);
      expect(response.body.message.readBy[0].user).toBe(senderId);
      expect(response.body.message.readBy[0].readAt).toBeDefined();
    });

    it('should not duplicate readBy entry', async () => {
      const message = await Message.create({
        subject: 'Message',
        content: 'Content',
        sender: recipientId,
        recipients: [senderId],
        conversationId: 'conv-1',
        priority: 'normal',
        category: 'general',
        isArchived: false,
        readBy: [{
          user: new mongoose.Types.ObjectId(senderId),
          readAt: new Date()
        }]
      });

      const response = await request(app)
        .patch(`/api/messages/${message._id}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message.readBy).toHaveLength(1);
    });

    it('should return 404 for non-existent message', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/messages/${fakeId}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/messages/:id/archive', () => {
    it('should archive message', async () => {
      const message = await Message.create({
        subject: 'Message to Archive',
        content: 'This will be archived',
        sender: senderId,
        recipients: [recipientId],
        conversationId: 'conv-1',
        priority: 'normal',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      const response = await request(app)
        .patch(`/api/messages/${message._id}/archive`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message.isArchived).toBe(true);
    });

    it('should return 404 for non-existent message', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/api/messages/${fakeId}/archive`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/messages/:id', () => {
    it('should delete message', async () => {
      const message = await Message.create({
        subject: 'Message to Delete',
        content: 'This will be deleted',
        sender: senderId,
        recipients: [recipientId],
        conversationId: 'conv-1',
        priority: 'normal',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      const response = await request(app)
        .delete(`/api/messages/${message._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('supprimé');

      const deletedMessage = await Message.findById(message._id);
      expect(deletedMessage).toBeNull();
    });

    it('should return 404 for non-existent message', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/messages/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/messages/conversation/:conversationId', () => {
    it('should get all messages in a conversation', async () => {
      const conversationId = 'conv-123';

      // Create parent message
      const parentMessage = await Message.create({
        subject: 'Parent Message',
        content: 'First message in thread',
        sender: senderId,
        recipients: [recipientId],
        conversationId,
        priority: 'normal',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      // Create reply messages
      await Message.create({
        subject: 'Re: Parent Message',
        content: 'Reply to first message',
        sender: recipientId,
        recipients: [senderId],
        conversationId,
        parentMessage: parentMessage._id,
        priority: 'normal',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      await Message.create({
        subject: 'Re: Parent Message',
        content: 'Another reply',
        sender: senderId,
        recipients: [recipientId],
        conversationId,
        parentMessage: parentMessage._id,
        priority: 'normal',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      const response = await request(app)
        .get(`/api/messages/conversation/${conversationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(3);
      expect(response.body.messages[0].conversationId).toBe(conversationId);
    });

    it('should return empty array for non-existent conversation', async () => {
      const response = await request(app)
        .get('/api/messages/conversation/nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(0);
    });
  });

  describe('GET /api/messages/stats', () => {
    it('should get message statistics', async () => {
      // Create messages with different priorities
      await Message.create({
        subject: 'Message 1',
        content: 'Content 1',
        sender: senderId,
        recipients: [recipientId],
        conversationId: 'conv-1',
        priority: 'high',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      await Message.create({
        subject: 'Message 2',
        content: 'Content 2',
        sender: senderId,
        recipients: [recipientId],
        conversationId: 'conv-2',
        priority: 'normal',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      await Message.create({
        subject: 'Message 3',
        content: 'Content 3',
        sender: recipientId,
        recipients: [senderId],
        conversationId: 'conv-3',
        priority: 'urgent',
        category: 'general',
        isArchived: false,
        readBy: []
      });

      const response = await request(app)
        .get('/api/messages/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.total).toBeGreaterThanOrEqual(3);
    });
  });
});
