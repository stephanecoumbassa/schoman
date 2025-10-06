# 🚀 Deployment Guide - Schoman

This guide covers different deployment strategies for the Schoman application.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Docker Deployment](#docker-deployment)
4. [Manual Deployment](#manual-deployment)
5. [Production Best Practices](#production-best-practices)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **MongoDB**: Version 6 or higher (local or cloud)
- **Docker** (optional): For containerized deployment

### MongoDB Options

#### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Whitelist your IP address

#### Option 2: Local MongoDB
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Windows
# Download and install from mongodb.com
```

#### Option 3: MongoDB in Docker
```bash
docker run -d -p 27017:27017 --name schoman-mongo mongo:latest
```

## Environment Configuration

### Backend Environment (.env)

Create `backend/.env` from `backend/.env.example`:

```bash
cd backend
cp .env.example .env
```

Configure the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/schoman
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/schoman?retryWrites=true&w=majority

# JWT Configuration (IMPORTANT: Change in production!)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

**Security Note**: Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Environment (.env)

Create `frontend/.env` from `frontend/.env.example`:

```bash
cd frontend
cp .env.example .env
```

Configure:

```env
# API Configuration
VITE_API_URL=https://api.your-domain.com/api
```

## Docker Deployment

### Quick Start with Docker Compose

1. **Clone and configure**
```bash
git clone https://github.com/stephanecoumbassa/schoman.git
cd schoman
```

2. **Set environment variables**
```bash
# Create .env file for docker-compose
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" > .env
```

3. **Build and start all services**
```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend API on port 3000
- Frontend on port 5173

4. **Seed the database** (first time only)
```bash
docker-compose exec backend npm run seed
```

5. **Access the application**
```
Frontend: http://localhost:5173
Backend API: http://localhost:3000
```

### Docker Commands

```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart a service
docker-compose restart backend

# Remove all data (including database)
docker-compose down -v
```

## Manual Deployment

### Backend Deployment

1. **Install dependencies**
```bash
cd backend
npm install --production
```

2. **Build TypeScript**
```bash
npm run build
```

3. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

Or use a process manager like PM2:
```bash
npm install -g pm2
pm2 start dist/index.js --name schoman-backend
pm2 save
pm2 startup
```

### Frontend Deployment

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Build for production**
```bash
npm run build
```

3. **Serve the built files**

Option 1: Using a static file server
```bash
npm install -g serve
serve -s dist -l 5173
```

Option 2: Using Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/schoman/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Production Best Practices

### Security

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets (minimum 32 characters)
   - Rotate secrets regularly

2. **Database**
   - Enable authentication on MongoDB
   - Use SSL/TLS for database connections
   - Regular backups

3. **API Security**
   - Enable CORS only for trusted domains
   - Implement rate limiting
   - Use HTTPS in production

### Performance

1. **Backend**
   - Use Node.js cluster mode
   - Enable gzip compression
   - Implement caching for frequently accessed data

2. **Frontend**
   - Enable CDN for static assets
   - Implement lazy loading
   - Optimize images

3. **Database**
   - Create indexes for frequently queried fields
   - Monitor query performance
   - Implement database connection pooling

### Scalability

1. **Horizontal Scaling**
   ```bash
   # Using PM2 cluster mode
   pm2 start dist/index.js -i max --name schoman-backend
   ```

2. **Load Balancing**
   - Use Nginx or HAProxy
   - Distribute traffic across multiple backend instances

3. **Database Scaling**
   - Use MongoDB replica sets
   - Implement read replicas for read-heavy operations

## Monitoring and Maintenance

### Health Checks

The backend provides a health check endpoint:
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Logging

1. **Backend Logs**
```bash
# PM2 logs
pm2 logs schoman-backend

# Docker logs
docker-compose logs -f backend
```

2. **Application Monitoring**
   - Use tools like New Relic, Datadog, or Sentry
   - Monitor error rates, response times, and resource usage

### Backup Strategy

1. **Database Backup**
```bash
# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/schoman" --out=/backup/$(date +%Y%m%d)

# Restore MongoDB
mongorestore --uri="mongodb://localhost:27017/schoman" /backup/20240115
```

2. **Automated Backups**
```bash
# Add to crontab for daily backups at 2 AM
0 2 * * * mongodump --uri="mongodb://localhost:27017/schoman" --out=/backup/$(date +\%Y\%m\%d)
```

### Updates and Maintenance

1. **Update Dependencies**
```bash
# Check for updates
npm outdated

# Update to latest versions
npm update

# Update to latest major versions (carefully!)
npm install <package>@latest
```

2. **Database Migrations**
   - Always test migrations in staging first
   - Create backup before running migrations
   - Document all schema changes

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check MongoDB connection
   - Verify environment variables
   - Check port availability

2. **Frontend can't connect to backend**
   - Verify VITE_API_URL in frontend/.env
   - Check CORS configuration
   - Ensure backend is running

3. **Database connection errors**
   - Verify MongoDB is running
   - Check MONGODB_URI format
   - Ensure network connectivity

### Getting Help

- Check the logs: `pm2 logs` or `docker-compose logs`
- Review error messages in browser console
- Verify all environment variables are set correctly

## Production Checklist

Before deploying to production:

- [ ] All environment variables are set correctly
- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB authentication is enabled
- [ ] HTTPS is configured
- [ ] CORS is restricted to production domains
- [ ] Backup strategy is in place
- [ ] Monitoring is configured
- [ ] Error tracking is set up
- [ ] Load balancing is configured (if needed)
- [ ] Rate limiting is enabled
- [ ] All dependencies are up to date
- [ ] Security headers are configured
- [ ] Application has been tested in staging

## Support

For issues or questions:
- Create an issue on GitHub
- Review the documentation in IMPLEMENTATION.md
- Check the setup guide in SETUP_GUIDE.md
