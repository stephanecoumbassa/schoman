# 🎭 Staging Environment Deployment Guide

This guide covers the setup and deployment of the Schoman application in a staging environment for User Acceptance Testing (UAT) and pre-production validation.

## 📋 Table of Contents

1. [Purpose of Staging](#purpose-of-staging)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Deployment Steps](#deployment-steps)
6. [Testing and Validation](#testing-and-validation)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)

## Purpose of Staging

The staging environment is a **production-like environment** used for:

- ✅ User Acceptance Testing (UAT)
- ✅ Integration testing with production-like data
- ✅ Performance testing under realistic conditions
- ✅ Security testing and vulnerability assessments
- ✅ Training and demonstrations
- ✅ Final validation before production deployment

**Key Principle**: Staging should mirror production as closely as possible.

## Prerequisites

### Required Software

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository
- **Node.js**: Version 20+ (for local development/testing)

### Infrastructure Requirements

- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB+ for database and uploads
- **Network**: Stable internet connection

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/stephanecoumbassa/schoman.git
cd schoman
```

### 2. Configure Environment

```bash
# Copy staging environment template
cp .env.staging.example .env.staging

# Edit with your staging configuration
nano .env.staging
```

**Minimum Required Changes:**

```env
# Generate a strong JWT secret
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Set MongoDB credentials
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password_here

# Configure allowed origins
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:8081
```

### 3. Start Staging Environment

```bash
# Start all services
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d

# View logs
docker-compose -f docker-compose.staging.yml logs -f
```

### 4. Initialize Database

```bash
# Run database migrations (if any)
docker-compose -f docker-compose.staging.yml exec backend_staging npm run migrate

# Seed initial data
docker-compose -f docker-compose.staging.yml exec backend_staging npm run seed
```

### 5. Verify Deployment

```bash
# Check all services are healthy
docker-compose -f docker-compose.staging.yml ps

# Test health endpoint
curl http://localhost:3001/health

# Test frontend
curl http://localhost:5174
```

## Configuration

### Environment Variables

See `.env.staging.example` for all available configuration options.

#### Critical Settings

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment identifier | `staging` |
| `MONGODB_URI` | Database connection | See .env.staging.example |
| `JWT_SECRET` | Authentication secret | Generate with crypto |
| `ALLOWED_ORIGINS` | CORS whitelist | `http://localhost:5174` |
| `LOG_LEVEL` | Logging verbosity | `debug` |

### Port Mapping

Staging uses different ports to avoid conflicts with production:

| Service | Staging Port | Production Port |
|---------|-------------|-----------------|
| Frontend | 5174 | 5173 |
| Backend API | 3001 | 3000 |
| MongoDB | 27018 | 27017 |
| Redis | 6380 | 6379 |
| Nginx Proxy | 8081 | 80/443 |

### Network Isolation

Staging uses a dedicated Docker network (`schoman_staging_network`) to isolate it from production services.

## Deployment Steps

### Option 1: Using Docker Compose (Recommended)

```bash
# 1. Pull latest changes
git pull origin main

# 2. Rebuild services (if code changed)
docker-compose -f docker-compose.staging.yml build --no-cache

# 3. Start services
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d

# 4. Run migrations (if needed)
docker-compose -f docker-compose.staging.yml exec backend_staging npm run migrate

# 5. Verify health
curl http://localhost:3001/health
curl http://localhost:8081/health
```

### Option 2: Manual Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for manual deployment instructions adapted for staging.

## Testing and Validation

### 1. Automated Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Expected response:
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2025-10-27T10:00:00.000Z"
}

# Frontend health (via Nginx)
curl http://localhost:8081/health
```

### 2. Smoke Tests

```bash
# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'

# Test API endpoints
curl http://localhost:3001/api/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Load Testing

```bash
# Install Apache Bench (if not installed)
sudo apt-get install apache2-utils

# Run load test (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:3001/api/dashboard/stats
```

### 4. User Acceptance Testing

See [UAT_GUIDE.md](./UAT_GUIDE.md) for detailed UAT procedures and test scenarios.

## Maintenance

### Viewing Logs

```bash
# All services
docker-compose -f docker-compose.staging.yml logs -f

# Specific service
docker-compose -f docker-compose.staging.yml logs -f backend_staging

# Last 100 lines
docker-compose -f docker-compose.staging.yml logs --tail=100 backend_staging
```

### Database Backup

```bash
# Create backup
docker-compose -f docker-compose.staging.yml exec mongodb_staging \
  mongodump --authenticationDatabase admin -u admin -p your_password \
  --db schoman_staging --out /data/backup/$(date +%Y%m%d)

# Copy backup to host
docker cp schoman_mongodb_staging:/data/backup ./backups/staging
```

### Database Restore

```bash
# Restore from backup
docker-compose -f docker-compose.staging.yml exec mongodb_staging \
  mongorestore --authenticationDatabase admin -u admin -p your_password \
  --db schoman_staging /data/backup/20251027/schoman_staging
```

### Updating Services

```bash
# Pull latest code
git pull origin main

# Rebuild and restart specific service
docker-compose -f docker-compose.staging.yml up -d --build backend_staging

# Restart all services
docker-compose -f docker-compose.staging.yml restart
```

### Resetting Staging Environment

```bash
# Stop and remove all containers and volumes
docker-compose -f docker-compose.staging.yml down -v

# Rebuild from scratch
docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d --build

# Reseed database
docker-compose -f docker-compose.staging.yml exec backend_staging npm run seed
```

## Troubleshooting

### Services Won't Start

```bash
# Check Docker daemon
sudo systemctl status docker

# Check logs for errors
docker-compose -f docker-compose.staging.yml logs

# Check disk space
df -h

# Check port conflicts
sudo lsof -i :3001
sudo lsof -i :5174
```

### Database Connection Issues

```bash
# Check MongoDB is running
docker-compose -f docker-compose.staging.yml ps mongodb_staging

# Check MongoDB logs
docker-compose -f docker-compose.staging.yml logs mongodb_staging

# Test connection manually
docker-compose -f docker-compose.staging.yml exec mongodb_staging \
  mongosh -u admin -p your_password --authenticationDatabase admin
```

### Frontend Can't Reach Backend

```bash
# Check VITE_API_URL in frontend
docker-compose -f docker-compose.staging.yml exec frontend_staging env | grep VITE_API_URL

# Check backend CORS settings
docker-compose -f docker-compose.staging.yml logs backend_staging | grep CORS

# Test backend directly
curl http://localhost:3001/health
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check logs for slow queries
docker-compose -f docker-compose.staging.yml logs backend_staging | grep "slow"

# Enable query profiling
docker-compose -f docker-compose.staging.yml exec mongodb_staging \
  mongosh -u admin -p your_password --authenticationDatabase admin \
  --eval "db.setProfilingLevel(2)"
```

## Best Practices

### 1. Data Management

- ✅ Use anonymized production data when possible
- ✅ Never use real user credentials
- ✅ Regular database backups before UAT sessions
- ✅ Reset data between major test cycles

### 2. Access Control

- ✅ Restrict staging access to authorized testers only
- ✅ Use different credentials than production
- ✅ Enable audit logging for all actions
- ✅ Review access logs regularly

### 3. Testing Protocol

- ✅ Test all new features in staging first
- ✅ Run full regression test suite
- ✅ Perform security scans before promotion
- ✅ Document all test results

### 4. Monitoring

- ✅ Set up alerts for service failures
- ✅ Monitor resource usage trends
- ✅ Track error rates and response times
- ✅ Review logs daily during active testing

### 5. Promotion to Production

Before promoting to production:

- [ ] All UAT tests passed
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Production backup confirmed
- [ ] Stakeholders notified

## Support

For issues or questions:

- Check logs: `docker-compose -f docker-compose.staging.yml logs`
- Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Create an issue on GitHub
- Contact the development team

## Next Steps

After successful staging deployment:

1. ✅ Run UAT tests (see [UAT_GUIDE.md](./UAT_GUIDE.md))
2. ✅ Review monitoring metrics
3. ✅ Address any issues found
4. ✅ Plan production deployment
5. ✅ Prepare rollback procedures

---

**Last Updated**: October 27, 2025  
**Version**: 1.0  
**Status**: Ready for UAT
