import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Subject from '../../models/Subject.js';
import { createSubject, getSubjects } from '../../controllers/subjectController.js';
import { AuthRequest } from '../../middleware/auth.js';

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

describe('Subject Controller', () => {
  describe('createSubject', () => {
    it('should create a new subject', async () => {
      const req = {
        body: {
          name: 'Mathématiques',
          code: 'MATH',
          level: 'CE1',
          defaultCoefficient: 2,
          color: '#3B82F6',
        },
        user: { id: 'test-user-id' },
      } as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await createSubject(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Matière créée avec succès',
          subject: expect.objectContaining({
            name: 'Mathématiques',
            code: 'MATH',
            level: 'CE1',
          }),
        })
      );
    });

    it('should reject duplicate code', async () => {
      await Subject.create({
        name: 'Mathématiques',
        code: 'MATH',
        level: 'CE1',
      });

      const req = {
        body: {
          name: 'Mathematics',
          code: 'MATH',
          level: 'CE2',
        },
        user: { id: 'test-user-id' },
      } as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await createSubject(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Une matière avec ce code existe déjà',
        })
      );
    });
  });

  describe('getSubjects', () => {
    beforeEach(async () => {
      await Subject.create([
        { name: 'Mathématiques', code: 'MATH', level: 'CE1' },
        { name: 'Français', code: 'FR', level: 'CE1' },
        { name: 'Sciences', code: 'SCI', level: 'CE2' },
      ]);
    });

    it('should return all subjects', async () => {
      const req = {
        query: {},
        user: { id: 'test-user-id' },
      } as unknown as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getSubjects(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          subjects: expect.arrayContaining([
            expect.objectContaining({ code: 'MATH' }),
            expect.objectContaining({ code: 'FR' }),
            expect.objectContaining({ code: 'SCI' }),
          ]),
          pagination: expect.objectContaining({
            total: 3,
          }),
        })
      );
    });

    it('should filter subjects by level', async () => {
      const req = {
        query: { level: 'CE1' },
        user: { id: 'test-user-id' },
      } as unknown as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getSubjects(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          subjects: expect.arrayContaining([
            expect.objectContaining({ level: 'CE1' }),
          ]),
          pagination: expect.objectContaining({
            total: 2,
          }),
        })
      );
    });

    it('should search subjects by name', async () => {
      const req = {
        query: { search: 'Math' },
        user: { id: 'test-user-id' },
      } as unknown as AuthRequest;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getSubjects(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          subjects: expect.arrayContaining([
            expect.objectContaining({ name: 'Mathématiques' }),
          ]),
          pagination: expect.objectContaining({
            total: 1,
          }),
        })
      );
    });
  });
});
