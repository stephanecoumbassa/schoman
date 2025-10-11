import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Schedule from '../../models/Schedule.js';
import User from '../../models/User.js';
import Class from '../../models/Class.js';
import Subject from '../../models/Subject.js';

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
  await Schedule.deleteMany({});
  await User.deleteMany({});
  await Class.deleteMany({});
  await Subject.deleteMany({});
});

describe('Schedule Model', () => {
  let teacher: any;
  let classData: any;
  let subject: any;

  beforeEach(async () => {
    teacher = await User.create({
      email: 'teacher@test.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'teacher',
    });

    classData = await Class.create({
      name: 'CE1-A',
      level: 'CE1',
      academicYear: '2024-2025',
      maxCapacity: 25,
    });

    subject = await Subject.create({
      name: 'Mathématiques',
      code: 'MATH',
      level: 'CE1',
    });
  });

  it('should create a valid schedule', async () => {
    const scheduleData = {
      class: classData._id,
      subject: subject._id,
      teacher: teacher._id,
      dayOfWeek: 'Lundi',
      startTime: '08:00',
      endTime: '09:30',
      room: 'Salle 101',
      academicYear: '2024-2025',
      isRecurring: true,
    };

    const schedule = await Schedule.create(scheduleData);

    expect(schedule.dayOfWeek).toBe(scheduleData.dayOfWeek);
    expect(schedule.startTime).toBe(scheduleData.startTime);
    expect(schedule.endTime).toBe(scheduleData.endTime);
    expect(schedule.room).toBe(scheduleData.room);
    expect(schedule.isActive).toBe(true);
  });

  it('should require class field', async () => {
    const scheduleData = {
      subject: subject._id,
      teacher: teacher._id,
      dayOfWeek: 'Lundi',
      startTime: '08:00',
      endTime: '09:30',
      academicYear: '2024-2025',
    };

    await expect(Schedule.create(scheduleData)).rejects.toThrow();
  });

  it('should require subject field', async () => {
    const scheduleData = {
      class: classData._id,
      teacher: teacher._id,
      dayOfWeek: 'Lundi',
      startTime: '08:00',
      endTime: '09:30',
      academicYear: '2024-2025',
    };

    await expect(Schedule.create(scheduleData)).rejects.toThrow();
  });

  it('should require teacher field', async () => {
    const scheduleData = {
      class: classData._id,
      subject: subject._id,
      dayOfWeek: 'Lundi',
      startTime: '08:00',
      endTime: '09:30',
      academicYear: '2024-2025',
    };

    await expect(Schedule.create(scheduleData)).rejects.toThrow();
  });

  it('should validate day of week', async () => {
    const scheduleData = {
      class: classData._id,
      subject: subject._id,
      teacher: teacher._id,
      dayOfWeek: 'InvalidDay',
      startTime: '08:00',
      endTime: '09:30',
      academicYear: '2024-2025',
    };

    await expect(Schedule.create(scheduleData)).rejects.toThrow();
  });

  it('should validate time format', async () => {
    const scheduleData = {
      class: classData._id,
      subject: subject._id,
      teacher: teacher._id,
      dayOfWeek: 'Lundi',
      startTime: '25:00', // Invalid time
      endTime: '09:30',
      academicYear: '2024-2025',
    };

    await expect(Schedule.create(scheduleData)).rejects.toThrow();
  });

  it('should reject when endTime is before startTime', async () => {
    const scheduleData = {
      class: classData._id,
      subject: subject._id,
      teacher: teacher._id,
      dayOfWeek: 'Lundi',
      startTime: '10:00',
      endTime: '09:00', // Before start time
      academicYear: '2024-2025',
    };

    await expect(Schedule.create(scheduleData)).rejects.toThrow();
  });

  it('should reject when endTime equals startTime', async () => {
    const scheduleData = {
      class: classData._id,
      subject: subject._id,
      teacher: teacher._id,
      dayOfWeek: 'Lundi',
      startTime: '10:00',
      endTime: '10:00', // Same as start time
      academicYear: '2024-2025',
    };

    await expect(Schedule.create(scheduleData)).rejects.toThrow();
  });

  it('should set isRecurring to true by default', async () => {
    const scheduleData = {
      class: classData._id,
      subject: subject._id,
      teacher: teacher._id,
      dayOfWeek: 'Lundi',
      startTime: '08:00',
      endTime: '09:30',
      academicYear: '2024-2025',
    };

    const schedule = await Schedule.create(scheduleData);
    expect(schedule.isRecurring).toBe(true);
  });

  it('should set isActive to true by default', async () => {
    const scheduleData = {
      class: classData._id,
      subject: subject._id,
      teacher: teacher._id,
      dayOfWeek: 'Lundi',
      startTime: '08:00',
      endTime: '09:30',
      academicYear: '2024-2025',
    };

    const schedule = await Schedule.create(scheduleData);
    expect(schedule.isActive).toBe(true);
  });
});
