import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Message from '../../models/Message.js';
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
  await Message.deleteMany({});
  await User.deleteMany({});
  await School.deleteMany({});
});

describe('Message Controller', () => {
  describe('Create Message', () => {
    it('should create message with valid data', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const sender = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
      });

      const recipient = await User.create({
        email: 'parent@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Parent',
        role: 'parent',
        school: school._id
      });

      const messageData = {
        subject: 'Test Message',
        content: 'This is a test message',
        sender: sender._id,
        recipients: [recipient._id],
        priority: 'normal',
        category: 'general'
      };

      const message = await Message.create(messageData);

      expect(message.subject).toBe('Test Message');
      expect(message.content).toBe('This is a test message');
      expect(message.sender.toString()).toBe(sender._id!.toString());
      expect(message.recipients).toHaveLength(1);
    });

    it('should fail with missing required fields', async () => {
      const invalidData = {
        subject: 'Test'
      };

      await expect(Message.create(invalidData)).rejects.toThrow();
    });

    it('should require at least one recipient', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const sender = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
      });

      const invalidData = {
        subject: 'Test',
        content: 'Content',
        sender: sender._id,
        recipients: []
      };

      await expect(Message.create(invalidData)).rejects.toThrow();
    });

    it('should validate priority enum', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const sender = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
      });

      const recipient = await User.create({
        email: 'parent@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Parent',
        role: 'parent',
        school: school._id
      });

      const invalidData = {
        subject: 'Test',
        content: 'Content',
        sender: sender._id,
        recipients: [recipient._id],
        priority: 'InvalidPriority'
      };

      await expect(Message.create(invalidData)).rejects.toThrow();
    });

    it('should create message with multiple recipients', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const sender = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
      });

      const recipient1 = await User.create({
        email: 'parent1@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Parent1',
        role: 'parent',
        school: school._id
      });

      const recipient2 = await User.create({
        email: 'parent2@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Parent2',
        role: 'parent',
        school: school._id
      });

      const message = await Message.create({
        subject: 'Broadcast Message',
        content: 'Message to all parents',
        sender: sender._id,
        recipients: [recipient1._id, recipient2._id],
        priority: 'normal'
      });

      expect(message.recipients).toHaveLength(2);
    });
  });

  describe('Get Messages', () => {
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

      const sender = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
      });

      const recipient = await User.create({
        email: 'parent@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Parent',
        role: 'parent',
        school: school._id
      });

      await Message.create({
        subject: 'Important Notice',
        content: 'This is an important message',
        sender: sender._id,
        recipients: [recipient._id],
        priority: 'high',
        category: 'announcement'
      });

      await Message.create({
        subject: 'Regular Update',
        content: 'This is a regular update',
        sender: sender._id,
        recipients: [recipient._id],
        priority: 'normal',
        category: 'general'
      });

      await Message.create({
        subject: 'Private Message',
        content: 'This is a private message',
        sender: sender._id,
        recipients: [recipient._id],
        priority: 'normal',
        category: 'private'
      });
    });

    it('should retrieve all messages', async () => {
      const messages = await Message.find();
      expect(messages).toHaveLength(3);
    });

    it('should filter messages by priority', async () => {
      const highPriorityMessages = await Message.find({ priority: 'high' });
      expect(highPriorityMessages).toHaveLength(1);
      expect(highPriorityMessages[0].subject).toBe('Important Notice');
    });

    it('should filter messages by category', async () => {
      const announcements = await Message.find({ category: 'announcement' });
      expect(announcements).toHaveLength(1);
      expect(announcements[0].subject).toBe('Important Notice');
    });

    it('should filter messages by sender', async () => {
      const sender = await User.findOne({ email: 'teacher@test.com' });
      const messages = await Message.find({ sender: sender!._id });
      expect(messages).toHaveLength(3);
    });

    it('should filter messages by recipient', async () => {
      const recipient = await User.findOne({ email: 'parent@test.com' });
      const messages = await Message.find({ recipients: recipient!._id });
      expect(messages).toHaveLength(3);
    });
  });

  describe('Mark as Read', () => {
    it('should mark message as read', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const sender = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
      });

      const recipient = await User.create({
        email: 'parent@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Parent',
        role: 'parent',
        school: school._id
      });

      const message = await Message.create({
        subject: 'Test Message',
        content: 'Content',
        sender: sender._id,
        recipients: [recipient._id],
        readBy: []
      });

      message.readBy.push(recipient._id as any);
      await message.save();

      const updatedMessage = await Message.findById(message._id);
      expect(updatedMessage?.readBy).toHaveLength(1);
    });
  });

  describe('Archive Message', () => {
    it('should archive message', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const sender = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
      });

      const recipient = await User.create({
        email: 'parent@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Parent',
        role: 'parent',
        school: school._id
      });

      const message = await Message.create({
        subject: 'Test Message',
        content: 'Content',
        sender: sender._id,
        recipients: [recipient._id],
        isArchived: false
      });

      message.isArchived = true;
      await message.save();

      const updatedMessage = await Message.findById(message._id);
      expect(updatedMessage?.isArchived).toBe(true);
    });

    it('should filter out archived messages', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const sender = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
      });

      const recipient = await User.create({
        email: 'parent@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Parent',
        role: 'parent',
        school: school._id
      });

      await Message.create({
        subject: 'Active Message',
        content: 'Content',
        sender: sender._id,
        recipients: [recipient._id],
        isArchived: false
      });

      await Message.create({
        subject: 'Archived Message',
        content: 'Content',
        sender: sender._id,
        recipients: [recipient._id],
        isArchived: true
      });

      const activeMessages = await Message.find({ isArchived: false });
      expect(activeMessages).toHaveLength(1);
      expect(activeMessages[0].subject).toBe('Active Message');
    });
  });

  describe('Delete Message', () => {
    it('should delete message', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const sender = await User.create({
        email: 'teacher@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Teacher',
        role: 'teacher',
        school: school._id
      });

      const recipient = await User.create({
        email: 'parent@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Parent',
        role: 'parent',
        school: school._id
      });

      const message = await Message.create({
        subject: 'Test Message',
        content: 'Content',
        sender: sender._id,
        recipients: [recipient._id]
      });

      await Message.findByIdAndDelete(message._id);

      const deletedMessage = await Message.findById(message._id);
      expect(deletedMessage).toBeNull();
    });
  });

  describe('Conversation Threading', () => {
    it('should link reply to parent message', async () => {
      const school = await School.create({
        name: 'Test School',
        code: 'TEST001',
        address: '123 Test St',
        phone: '+33123456789',
        email: 'test@school.com',
        academicYearStart: new Date('2024-09-01'),
        academicYearEnd: new Date('2025-06-30')
      });

      const user1 = await User.create({
        email: 'user1@test.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'One',
        role: 'teacher',
        school: school._id
      });

      const user2 = await User.create({
        email: 'user2@test.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Two',
        role: 'parent',
        school: school._id
      });

      const parentMessage = await Message.create({
        subject: 'Original Message',
        content: 'Original content',
        sender: user1._id,
        recipients: [user2._id],
        conversationId: 'conv-123'
      });

      const replyMessage = await Message.create({
        subject: 'Re: Original Message',
        content: 'Reply content',
        sender: user2._id,
        recipients: [user1._id],
        conversationId: 'conv-123',
        parentMessage: parentMessage._id
      });

      expect(replyMessage.parentMessage?.toString()).toBe(parentMessage._id!.toString());
      expect(replyMessage.conversationId).toBe(parentMessage.conversationId);
    });
  });
});
