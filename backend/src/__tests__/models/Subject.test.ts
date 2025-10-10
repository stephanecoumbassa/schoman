import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
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
  await Subject.deleteMany({});
});

describe('Subject Model', () => {
  it('should create a valid subject', async () => {
    const subjectData = {
      name: 'Mathématiques',
      code: 'MATH',
      description: 'Cours de mathématiques',
      level: 'CE1',
      defaultCoefficient: 2,
      color: '#3B82F6',
      isActive: true,
    };

    const subject = await Subject.create(subjectData);

    expect(subject.name).toBe(subjectData.name);
    expect(subject.code).toBe(subjectData.code);
    expect(subject.level).toBe(subjectData.level);
    expect(subject.defaultCoefficient).toBe(subjectData.defaultCoefficient);
    expect(subject.isActive).toBe(true);
  });

  it('should require name field', async () => {
    const subjectData = {
      code: 'MATH',
      level: 'CE1',
    };

    await expect(Subject.create(subjectData)).rejects.toThrow();
  });

  it('should require code field', async () => {
    const subjectData = {
      name: 'Mathématiques',
      level: 'CE1',
    };

    await expect(Subject.create(subjectData)).rejects.toThrow();
  });

  it('should require level field', async () => {
    const subjectData = {
      name: 'Mathématiques',
      code: 'MATH',
    };

    await expect(Subject.create(subjectData)).rejects.toThrow();
  });

  it('should enforce unique code', async () => {
    const subjectData = {
      name: 'Mathématiques',
      code: 'MATH',
      level: 'CE1',
    };

    await Subject.create(subjectData);

    const duplicateSubject = {
      name: 'Mathematics',
      code: 'MATH',
      level: 'CE2',
    };

    await expect(Subject.create(duplicateSubject)).rejects.toThrow();
  });

  it('should convert code to uppercase', async () => {
    const subjectData = {
      name: 'Mathématiques',
      code: 'math',
      level: 'CE1',
    };

    const subject = await Subject.create(subjectData);
    expect(subject.code).toBe('MATH');
  });

  it('should set default coefficient to 1', async () => {
    const subjectData = {
      name: 'Mathématiques',
      code: 'MATH',
      level: 'CE1',
    };

    const subject = await Subject.create(subjectData);
    expect(subject.defaultCoefficient).toBe(1);
  });

  it('should set default isActive to true', async () => {
    const subjectData = {
      name: 'Mathématiques',
      code: 'MATH',
      level: 'CE1',
    };

    const subject = await Subject.create(subjectData);
    expect(subject.isActive).toBe(true);
  });

  it('should validate coefficient is between 0.5 and 5', async () => {
    const subjectData = {
      name: 'Mathématiques',
      code: 'MATH',
      level: 'CE1',
      defaultCoefficient: 0.3,
    };

    await expect(Subject.create(subjectData)).rejects.toThrow();

    const subjectData2 = {
      name: 'Mathématiques',
      code: 'MATH2',
      level: 'CE1',
      defaultCoefficient: 6,
    };

    await expect(Subject.create(subjectData2)).rejects.toThrow();
  });
});
