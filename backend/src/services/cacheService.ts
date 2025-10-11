import { createClient, RedisClientType } from 'redis';
import logger from '../utils/logger.js';

class CacheService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  private enabled: boolean = false;

  async connect(): Promise<void> {
    // Only enable Redis if REDIS_URL is provided
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI;
    
    if (!redisUrl) {
      logger.info('📦 Redis URL not provided - caching disabled (fallback mode)');
      this.enabled = false;
      return;
    }

    try {
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              logger.error('Redis reconnection failed after 3 retries');
              return new Error('Max retries reached');
            }
            return Math.min(retries * 1000, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('✅ Redis connecting...');
      });

      this.client.on('ready', () => {
        logger.info('✅ Redis client ready');
        this.isConnected = true;
        this.enabled = true;
      });

      this.client.on('end', () => {
        logger.info('👋 Redis connection closed');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.enabled = false;
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.client || !this.isConnected) {
      return null;
    }

    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in cache with optional TTL (in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.enabled || !this.client || !this.isConnected) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.enabled || !this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async delPattern(pattern: string): Promise<boolean> {
    if (!this.enabled || !this.client || !this.isConnected) {
      return false;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    if (!this.enabled || !this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.flushDb();
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Check if cache is enabled and connected
   */
  isReady(): boolean {
    return this.enabled && this.isConnected;
  }

  /**
   * Get or set cache with a callback
   */
  async getOrSet<T>(
    key: string,
    callback: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch data
    const data = await callback();
    
    // Store in cache for next time
    await this.set(key, data, ttl);
    
    return data;
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService;
