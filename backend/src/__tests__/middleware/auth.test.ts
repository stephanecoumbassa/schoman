import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth.js';

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn()
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate with valid token', () => {
      const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
      const payload = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin',
        school: 'school123'
      };
      const token = jwt.sign(payload, JWT_SECRET);

      (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe('user123');
      expect(mockRequest.user?.email).toBe('test@example.com');
      expect(mockRequest.user?.role).toBe('admin');
    });

    it('should reject request without token', () => {
      (mockRequest.header as jest.Mock).mockReturnValue(undefined);

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Authentification requise'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', () => {
      (mockRequest.header as jest.Mock).mockReturnValue('Bearer invalid_token');

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token invalide'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with expired token', () => {
      const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
      const payload = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };
      // Create an expired token (expires in -1 hour)
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1h' });

      (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token invalide'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle token without Bearer prefix', () => {
      const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
      const payload = {
        id: 'user123',
        email: 'test@example.com',
        role: 'admin'
      };
      const token = jwt.sign(payload, JWT_SECRET);

      // Return token without 'Bearer ' prefix
      (mockRequest.header as jest.Mock).mockReturnValue(token);

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      // This should fail since the token doesn't start with 'Bearer '
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  describe('authorize', () => {
    beforeEach(() => {
      mockRequest.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'teacher',
        school: undefined
      };
    });

    it('should allow access for authorized role', () => {
      const middleware = authorize('teacher', 'admin');

      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      const middleware = authorize('admin', 'superadmin');

      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Accès non autorisé'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should deny access if user is not authenticated', () => {
      mockRequest.user = undefined;
      const middleware = authorize('admin');

      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Authentification requise'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should allow access for admin role', () => {
      mockRequest.user!.role = 'admin';
      const middleware = authorize('admin');

      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access for student role', () => {
      mockRequest.user!.role = 'student';
      const middleware = authorize('student', 'parent');

      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle multiple allowed roles', () => {
      mockRequest.user!.role = 'parent';
      const middleware = authorize('teacher', 'parent', 'admin');

      middleware(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
