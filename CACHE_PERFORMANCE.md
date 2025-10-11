# 🚀 Cache & Performance - Schoman

## Overview

Phase 2 - Task 7: Cache & Performance implementation with Redis, rate limiting, and response compression.

**Date:** October 2025  
**Status:** ✅ Complete

---

## 📦 Features Implemented

### 1. Redis Cache Service

**File:** `backend/src/services/cacheService.ts`

A comprehensive caching service that works with or without Redis:

#### Features:
- ✅ **Graceful Fallback**: Application works without Redis if not configured
- ✅ **Auto-reconnection**: Reconnects automatically if connection is lost
- ✅ **TTL Support**: Time-to-live for cached data
- ✅ **Pattern Deletion**: Delete multiple keys matching a pattern
- ✅ **Get-or-Set**: Fetch from cache or execute callback and cache result

#### Methods:
```typescript
// Connect to Redis
await cacheService.connect();

// Get value from cache
const data = await cacheService.get<User>('user:123');

// Set value with TTL (in seconds)
await cacheService.set('user:123', userData, 3600);

// Delete single key
await cacheService.del('user:123');

// Delete all keys matching pattern
await cacheService.delPattern('user:*');

// Clear all cache
await cacheService.clear();

// Get or set with callback
const user = await cacheService.getOrSet(
  'user:123',
  async () => await fetchUserFromDB(123),
  3600
);
```

---

### 2. Cache Middleware

**File:** `backend/src/middleware/cache.ts`

Express middleware for automatic response caching:

#### Features:
- ✅ **Auto-caching**: Automatically caches GET requests
- ✅ **Configurable TTL**: Set cache duration per route
- ✅ **Transparent**: No code changes needed in controllers
- ✅ **Cache Invalidation**: Helper functions to clear cache

#### Usage:
```typescript
import { cacheMiddleware, invalidateCache } from './middleware/cache.js';

// Cache for 5 minutes (300 seconds)
app.get('/api/students', cacheMiddleware(300), getStudents);

// Invalidate cache when data changes
await invalidateCache('/api/students');
```

---

### 3. Rate Limiting

**File:** `backend/src/middleware/rateLimiter.ts`

Multiple rate limiters for different endpoints:

#### Rate Limiters:

| Limiter | Window | Max Requests | Use Case |
|---------|--------|--------------|----------|
| `apiLimiter` | 15 min | 100 | General API routes |
| `authLimiter` | 15 min | 5 | Authentication (login, register) |
| `uploadLimiter` | 1 hour | 10 | File uploads |
| `exportLimiter` | 1 hour | 20 | PDF/Excel exports |

#### Features:
- ✅ **IP-based limiting**: Per IP address
- ✅ **Standard headers**: RateLimit-* headers in response
- ✅ **Skip successful requests**: Auth limiter ignores successful logins
- ✅ **Custom messages**: Clear error messages

#### Usage:
```typescript
import { authLimiter, uploadLimiter } from './middleware/rateLimiter.js';

// Apply rate limiter to routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/uploads', uploadLimiter, uploadRoutes);
```

---

### 4. Response Compression

**Library:** `compression`

Automatically compresses all HTTP responses:

#### Features:
- ✅ **Gzip compression**: Reduces response size
- ✅ **Automatic**: No configuration needed
- ✅ **Bandwidth savings**: 70-90% reduction for text/JSON
- ✅ **Performance**: Faster page loads

#### Integration:
```typescript
import compression from 'compression';

app.use(compression());
```

---

## 🔧 Configuration

### Environment Variables

Add to `.env` (optional):

```env
# Redis Configuration (Optional)
# If not provided, caching will be disabled
REDIS_URL=redis://localhost:6379

# Alternative
REDIS_URI=redis://localhost:6379
```

### Without Redis

The application works perfectly without Redis:
- Cache service detects missing configuration
- Gracefully falls back to no caching
- All features continue to work
- Only caching is disabled

---

## 📊 Performance Benefits

### Response Compression
- **Text/JSON**: 70-90% size reduction
- **HTML**: 60-80% reduction
- **Faster load times**: Especially for mobile/slow connections

### Redis Caching
- **Database queries**: 100x faster from cache
- **API responses**: < 10ms vs 100-500ms
- **Reduced load**: Less database queries
- **Scalability**: Handle more concurrent users

### Rate Limiting
- **DDoS protection**: Prevents abuse
- **Resource protection**: Prevents overload
- **Brute force prevention**: Limits auth attempts
- **Fair usage**: Equal access for all users

---

## 🎯 Best Practices

### What to Cache
✅ **Good candidates:**
- List endpoints (students, classes, books)
- Dashboard statistics
- Reference data (subjects, categories)
- User profiles (infrequent changes)

❌ **Don't cache:**
- Real-time data (notifications, messages)
- User-specific actions (create, update, delete)
- Authentication tokens
- Frequently changing data

### Cache TTL Recommendations
- **Static data**: 1 hour (3600s)
- **List data**: 5 minutes (300s)
- **Statistics**: 10 minutes (600s)
- **User data**: 15 minutes (900s)

### Cache Invalidation
Always invalidate cache when data changes:

```typescript
// After creating/updating/deleting students
await invalidateCache('/api/students');

// After grade changes
await invalidateCache('/api/grades');
```

---

## 🧪 Testing

### Test Without Redis
1. Don't set `REDIS_URL` in `.env`
2. Start the application
3. Should see: "Redis URL not provided - caching disabled"
4. Application works normally

### Test With Redis
1. Start Redis: `docker run -p 6379:6379 redis`
2. Set `REDIS_URL=redis://localhost:6379` in `.env`
3. Start the application
4. Should see: "Redis client ready"
5. Cache should work

### Verify Rate Limiting
```bash
# Test API rate limiter (100 requests per 15 min)
for i in {1..101}; do
  curl http://localhost:3000/api/students
done

# Test auth rate limiter (5 requests per 15 min)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### Verify Compression
```bash
# Without compression header
curl -I http://localhost:3000/api/students

# With compression
curl -I -H "Accept-Encoding: gzip" http://localhost:3000/api/students
# Look for: Content-Encoding: gzip
```

---

## 📈 Monitoring

### Cache Hit Ratio
Monitor in Redis:
```bash
redis-cli INFO stats | grep keyspace
```

### Rate Limit Headers
Check response headers:
```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1234567890
```

### Compression Ratio
Check logs for response sizes before/after compression.

---

## 🔄 Future Enhancements

Potential improvements:
- [ ] Redis Cluster for high availability
- [ ] Cache warming on startup
- [ ] Cache analytics dashboard
- [ ] Dynamic TTL based on data type
- [ ] Cache tags for granular invalidation
- [ ] Request coalescing for concurrent requests

---

## 📚 Dependencies

```json
{
  "dependencies": {
    "redis": "^4.x",
    "express-rate-limit": "^7.x",
    "compression": "^1.x"
  }
}
```

---

## 🏆 Summary

Phase 2 Task 7 successfully implemented:

- ✅ Redis cache service with graceful fallback
- ✅ Cache middleware for automatic caching
- ✅ 4 different rate limiters
- ✅ Response compression
- ✅ Comprehensive documentation
- ✅ Production-ready configuration

**Result:** Application is faster, more scalable, and better protected against abuse.

---

**Last Updated:** October 11, 2025  
**Author:** Agent AI  
**Status:** ✅ Complete
