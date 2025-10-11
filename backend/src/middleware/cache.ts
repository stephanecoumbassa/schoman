import { Request, Response, NextFunction } from 'express';
import cacheService from '../services/cacheService.js';

/**
 * Cache middleware for GET requests
 * @param ttl Time to live in seconds (default: 5 minutes)
 */
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if cache is not ready
    if (!cacheService.isReady()) {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        // Cache hit - return cached data
        return res.json(cachedData);
      }

      // Cache miss - store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache the response
      res.json = function (data: any) {
        // Cache the response
        cacheService.set(cacheKey, data, ttl).catch((err) => {
          console.error('Failed to cache response:', err);
        });

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      // On error, just continue without caching
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Invalidate cache for a specific pattern
 */
export const invalidateCache = async (pattern: string): Promise<void> => {
  if (cacheService.isReady()) {
    await cacheService.delPattern(`cache:*${pattern}*`);
  }
};

/**
 * Invalidate all cache
 */
export const clearCache = async (): Promise<void> => {
  if (cacheService.isReady()) {
    await cacheService.clear();
  }
};
