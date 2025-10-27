import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import * as os from 'os';
import cacheService from '../services/cacheService.js';

const router = Router();

// Basic health check endpoint (public)
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      cache: cacheService.isReady() ? 'Connected' : 'Disconnected',
    };

    // Return 200 if healthy, 503 if any critical service is down
    const statusCode = health.database === 'Connected' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Detailed health check with metrics (should be protected in production)
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    // System metrics
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);

    // Process metrics
    const processMemory = process.memoryUsage();

    // Database health
    const dbState = mongoose.connection.readyState;
    const dbStateMap: { [key: number]: string } = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };

    // Get database statistics
    let dbStats = null;
    if (dbState === 1 && mongoose.connection.db) {
      try {
        const admin = mongoose.connection.db.admin();
        dbStats = await admin.serverStatus();
      } catch (error) {
        // Ignore if can't get stats
      }
    }

    // Cache health
    const cacheReady = cacheService.isReady();

    // Application metrics
    const health = {
      status: dbState === 1 ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      
      // Uptime
      uptime: {
        process: process.uptime(),
        system: os.uptime(),
      },

      // System resources
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        loadAverage: os.loadavg(),
        memory: {
          total: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
          free: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
          used: `${(usedMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
          usagePercent: `${memoryUsagePercent}%`,
        },
      },

      // Process resources
      process: {
        pid: process.pid,
        memory: {
          rss: `${(processMemory.rss / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(processMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          heapUsed: `${(processMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          external: `${(processMemory.external / 1024 / 1024).toFixed(2)} MB`,
        },
        cpu: process.cpuUsage(),
      },

      // Services health
      services: {
        database: {
          status: dbStateMap[dbState],
          state: dbState,
          host: mongoose.connection.host,
          name: mongoose.connection.name,
          collections: dbStats ? dbStats.collections : null,
          connections: dbStats ? dbStats.connections : null,
        },
        cache: {
          status: cacheReady ? 'Connected' : 'Disconnected',
          ready: cacheReady,
        },
      },

      // Environment
      environment: {
        nodeVersion: process.version,
        env: process.env.NODE_ENV || 'development',
      },
    };

    // Determine status code
    const statusCode = dbState === 1 ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Readiness probe (for Kubernetes/orchestration)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const dbReady = mongoose.connection.readyState === 1;
    
    if (dbReady) {
      res.status(200).json({
        status: 'READY',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'NOT_READY',
        timestamp: new Date().toISOString(),
        reason: 'Database not connected',
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed',
    });
  }
});

// Liveness probe (for Kubernetes/orchestration)
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString(),
  });
});

// Prometheus metrics endpoint
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const processMemory = process.memoryUsage();
    const dbState = mongoose.connection.readyState;

    // Format metrics in Prometheus format
    const metrics = `# HELP nodejs_process_uptime_seconds Process uptime in seconds
# TYPE nodejs_process_uptime_seconds gauge
nodejs_process_uptime_seconds ${process.uptime()}

# HELP nodejs_system_uptime_seconds System uptime in seconds
# TYPE nodejs_system_uptime_seconds gauge
nodejs_system_uptime_seconds ${os.uptime()}

# HELP nodejs_memory_usage_bytes Process memory usage in bytes
# TYPE nodejs_memory_usage_bytes gauge
nodejs_memory_usage_bytes{type="rss"} ${processMemory.rss}
nodejs_memory_usage_bytes{type="heapTotal"} ${processMemory.heapTotal}
nodejs_memory_usage_bytes{type="heapUsed"} ${processMemory.heapUsed}
nodejs_memory_usage_bytes{type="external"} ${processMemory.external}

# HELP system_memory_bytes System memory in bytes
# TYPE system_memory_bytes gauge
system_memory_bytes{type="total"} ${totalMemory}
system_memory_bytes{type="free"} ${freeMemory}
system_memory_bytes{type="used"} ${usedMemory}

# HELP database_connection_status Database connection status (1=connected, 0=disconnected)
# TYPE database_connection_status gauge
database_connection_status ${dbState === 1 ? 1 : 0}

# HELP cache_connection_status Cache connection status (1=connected, 0=disconnected)
# TYPE cache_connection_status gauge
cache_connection_status ${cacheService.isReady() ? 1 : 0}

# HELP nodejs_cpu_usage_user User CPU time spent in microseconds
# TYPE nodejs_cpu_usage_user counter
nodejs_cpu_usage_user ${process.cpuUsage().user}

# HELP nodejs_cpu_usage_system System CPU time spent in microseconds
# TYPE nodejs_cpu_usage_system counter
nodejs_cpu_usage_system ${process.cpuUsage().system}
`;

    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    res.status(500).send('# Error generating metrics\n');
  }
});

export default router;
