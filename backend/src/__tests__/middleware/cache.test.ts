import { Request, Response, NextFunction } from 'express';
import { cacheMiddleware, invalidateCache, clearCache } from '../../middleware/cache.js';
import cacheService from '../../services/cacheService.js';

// Mock cache service
jest.mock('../../services/cacheService.js', () => ({
  default: {
    isReady: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    delPattern: jest.fn(),
    clear: jest.fn()
  }
}));

describe('Cache Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let originalJson: jest.Mock;

  beforeEach(() => {
    originalJson = jest.fn();
    mockRequest = {
      method: 'GET',
      originalUrl: '/api/test',
      url: '/api/test'
    };
    mockResponse = {
      json: originalJson
    };
    nextFunction = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('cacheMiddleware', () => {
    it('should skip caching for non-GET requests', async () => {
      mockRequest.method = 'POST';
      const middleware = cacheMiddleware();

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(cacheService.get).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should skip caching when cache service is not ready', async () => {
      (cacheService.isReady as jest.Mock).mockReturnValue(false);
      const middleware = cacheMiddleware();

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(cacheService.get).not.toHaveBeenCalled();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return cached data on cache hit', async () => {
      (cacheService.isReady as jest.Mock).mockReturnValue(true);
      const cachedData = { message: 'Cached response' };
      (cacheService.get as jest.Mock).mockResolvedValue(cachedData);
      
      const middleware = cacheMiddleware();

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(cacheService.get).toHaveBeenCalledWith('cache:/api/test');
      expect(mockResponse.json).toHaveBeenCalledWith(cachedData);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should continue to route handler on cache miss', async () => {
      (cacheService.isReady as jest.Mock).mockReturnValue(true);
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      
      const middleware = cacheMiddleware();

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(cacheService.get).toHaveBeenCalledWith('cache:/api/test');
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should cache response on cache miss', async () => {
      (cacheService.isReady as jest.Mock).mockReturnValue(true);
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (cacheService.set as jest.Mock).mockResolvedValue(undefined);
      
      const middleware = cacheMiddleware(300);

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Verify that json method is overridden
      expect(mockResponse.json).not.toBe(originalJson);
      
      // Call the overridden json method
      const testData = { message: 'Test response' };
      mockResponse.json!(testData);

      // Give time for the async caching to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(cacheService.set).toHaveBeenCalledWith('cache:/api/test', testData, 300);
    });

    it('should use custom TTL when provided', async () => {
      (cacheService.isReady as jest.Mock).mockReturnValue(true);
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      (cacheService.set as jest.Mock).mockResolvedValue(undefined);
      
      const customTTL = 600;
      const middleware = cacheMiddleware(customTTL);

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      const testData = { message: 'Test response' };
      mockResponse.json!(testData);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(cacheService.set).toHaveBeenCalledWith('cache:/api/test', testData, customTTL);
    });

    it('should handle cache service errors gracefully', async () => {
      (cacheService.isReady as jest.Mock).mockReturnValue(true);
      (cacheService.get as jest.Mock).mockRejectedValue(new Error('Cache error'));
      
      const middleware = cacheMiddleware();

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should generate cache key from URL', async () => {
      mockRequest.originalUrl = '/api/students?page=1&limit=10';
      (cacheService.isReady as jest.Mock).mockReturnValue(true);
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      
      const middleware = cacheMiddleware();

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(cacheService.get).toHaveBeenCalledWith('cache:/api/students?page=1&limit=10');
    });

    it('should use url if originalUrl is not available', async () => {
      mockRequest.originalUrl = undefined;
      mockRequest.url = '/api/test';
      (cacheService.isReady as jest.Mock).mockReturnValue(true);
      (cacheService.get as jest.Mock).mockResolvedValue(null);
      
      const middleware = cacheMiddleware();

      await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(cacheService.get).toHaveBeenCalledWith('cache:/api/test');
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate cache for specific pattern', async () => {
      (cacheService.isReady as jest.Mock).mockReturnValue(true);
      (cacheService.delPattern as jest.Mock).mockResolvedValue(undefined);

      await invalidateCache('students');

      expect(cacheService.delPattern).toHaveBeenCalledWith('cache:*students*');
    });

    it('should skip invalidation if cache is not ready', async () => {
      (cacheService.isReady as jest.Mock).mockReturnValue(false);

      await invalidateCache('students');

      expect(cacheService.delPattern).not.toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear all cache', async () => {
      (cacheService.isReady as jest.Mock).mockReturnValue(true);
      (cacheService.clear as jest.Mock).mockResolvedValue(undefined);

      await clearCache();

      expect(cacheService.clear).toHaveBeenCalled();
    });

    it('should skip clearing if cache is not ready', async () => {
      (cacheService.isReady as jest.Mock).mockReturnValue(false);

      await clearCache();

      expect(cacheService.clear).not.toHaveBeenCalled();
    });
  });
});
