import { Request, Response, NextFunction } from 'express';
import { errorHandler, catchAsync, notFoundHandler } from '../../middleware/errorHandler.js';
import { AppError } from '../../utils/errors.js';

// Mock logger to prevent console output during tests
jest.mock('../../utils/logger.js', () => ({
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/test',
      method: 'GET',
      ip: '127.0.0.1'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  describe('errorHandler', () => {
    it('should handle AppError with status code', () => {
      const error = new AppError('Test error message', 400);

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Test error message'
        })
      );
    });

    it('should handle validation errors', () => {
      const validationError = {
        name: 'ValidationError',
        message: 'Validation failed',
        errors: {
          email: {
            path: 'email',
            message: 'Email is required'
          },
          password: {
            path: 'password',
            message: 'Password is required'
          }
        }
      };

      errorHandler(validationError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('Validation error')
        })
      );
    });

    it('should handle duplicate key errors', () => {
      const duplicateError = {
        name: 'MongoError',
        code: 11000,
        message: 'Duplicate key error',
        keyValue: { email: 'test@example.com' }
      };

      errorHandler(duplicateError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('already exists')
        })
      );
    });

    it('should handle cast errors', () => {
      const castError = {
        name: 'CastError',
        path: '_id',
        value: 'invalid_id',
        message: 'Cast to ObjectId failed'
      };

      errorHandler(castError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('Invalid')
        })
      );
    });

    it('should handle JWT errors', () => {
      const jwtError = {
        name: 'JsonWebTokenError',
        message: 'jwt malformed'
      };

      errorHandler(jwtError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('Invalid token')
        })
      );
    });

    it('should handle JWT expired errors', () => {
      const jwtExpiredError = {
        name: 'TokenExpiredError',
        message: 'jwt expired'
      };

      errorHandler(jwtExpiredError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('expired')
        })
      );
    });

    it('should default to 500 for unknown errors', () => {
      const unknownError = {
        message: 'Unknown error'
      };

      errorHandler(unknownError, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new AppError('Test error', 400);

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String)
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new AppError('Test error', 400);
      error.isOperational = true;

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.any(String)
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should hide error details for non-operational errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Programming error');
      (error as any).isOperational = false;

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong. Please try again later.'
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('catchAsync', () => {
    it('should catch async errors and pass to next', async () => {
      const asyncError = new Error('Async error');
      const asyncFunction = jest.fn().mockRejectedValue(asyncError);
      const wrappedFunction = catchAsync(asyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(asyncError);
    });

    it('should call async function with correct parameters', async () => {
      const asyncFunction = jest.fn().mockResolvedValue(undefined);
      const wrappedFunction = catchAsync(asyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(asyncFunction).toHaveBeenCalledWith(mockRequest, mockResponse, nextFunction);
    });

    it('should not call next if async function succeeds', async () => {
      const asyncFunction = jest.fn().mockResolvedValue(undefined);
      const wrappedFunction = catchAsync(asyncFunction);

      await wrappedFunction(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('notFoundHandler', () => {
    it('should create 404 error for non-existent routes', () => {
      mockRequest.originalUrl = '/non-existent-route';

      notFoundHandler(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('/non-existent-route'),
          statusCode: 404
        })
      );
    });

    it('should pass AppError to next middleware', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
