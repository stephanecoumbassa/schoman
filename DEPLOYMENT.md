# Schoman Deployment Guide

This guide covers deploying Schoman to various environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Nginx Configuration](#nginx-configuration)
- [Docker Deployment](#docker-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 20.19+ or 22.12+
- MongoDB 6.0+
- npm or yarn
- (Production) Nginx or similar reverse proxy
- (Optional) Docker and Docker Compose

## Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/stephanecoumbassa/schoman.git
cd schoman
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local settings
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your local settings
```

### 4. Start MongoDB
```bash
# On Linux/Mac
mongod

# On Windows
net start MongoDB

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6
```

### 5. Run the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application at http://localhost:5173

## Production Deployment

### Option 1: Traditional VPS/Server Deployment

#### 1. Prepare the Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install -y nginx
```

#### 2. Clone and Build
```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/stephanecoumbassa/schoman.git
sudo chown -R $USER:$USER schoman
cd schoman

# Build backend
cd backend
npm install --production
npm run build
cp .env.example .env
# Edit .env with production settings

# Build frontend
cd ../frontend
npm install
npm run build
```

#### 3. Setup Process Manager (PM2)
```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd /var/www/schoman/backend
pm2 start dist/server.js --name schoman-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 4. Configure Nginx
Create `/etc/nginx/sites-available/schoman`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/schoman/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/schoman /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile for Backend
Create `backend/Dockerfile`:
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### 2. Create Dockerfile for Frontend
Create `frontend/Dockerfile`:
```dockerfile
FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Create docker-compose.yml
Create `docker-compose.yml` in the root:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: schoman-mongodb
    restart: always
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: your_password
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    container_name: schoman-backend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:your_password@mongodb:27017/schoman?authSource=admin
      - JWT_SECRET=your_jwt_secret
      - JWT_EXPIRES_IN=7d
      - CORS_ORIGIN=http://your-domain.com
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./frontend
      args:
        - VITE_API_URL=http://your-domain.com/api
    container_name: schoman-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### 4. Deploy with Docker Compose
```bash
docker-compose up -d
```

## Environment Variables

### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/schoman

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-domain.com
```

### Frontend (.env)
```env
VITE_API_URL=https://your-domain.com/api
```

## Database Setup

### Create Initial Admin User
Connect to MongoDB:
```bash
mongosh
```

Use the schoman database and create an admin user:
```javascript
use schoman

// First create a school
db.schools.insertOne({
  name: "Main School",
  address: "123 School St",
  phone: "+1234567890",
  email: "info@school.com",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Get the school ID
const schoolId = db.schools.findOne()._id

// Create admin user (password will be hashed by the application)
// Use the register endpoint instead:
// POST /api/auth/register with admin role
```

### Backup and Restore

#### Backup
```bash
mongodump --db=schoman --out=/backup/schoman-$(date +%Y%m%d)
```

#### Restore
```bash
mongorestore --db=schoman /backup/schoman-20231201/schoman
```

## Nginx Configuration

### Full Nginx Config with SSL
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        root /var/www/schoman/frontend/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## Monitoring and Logs

### PM2 Logs
```bash
# View logs
pm2 logs schoman-backend

# Monitor
pm2 monit
```

### Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### MongoDB Logs
```bash
tail -f /var/log/mongodb/mongod.log
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs schoman-backend

# Check if port is in use
sudo netstat -tulpn | grep 3000

# Restart backend
pm2 restart schoman-backend
```

### Database connection issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
mongosh "your-connection-string"

# Restart MongoDB
sudo systemctl restart mongod
```

### Frontend build issues
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Permission issues
```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/schoman

# Fix permissions
sudo chmod -R 755 /var/www/schoman
```

## Performance Optimization

### Enable MongoDB Indexes
```javascript
// Connect to MongoDB
use schoman

// Add indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.students.createIndex({ studentId: 1 }, { unique: true })
db.students.createIndex({ schoolId: 1 })
db.teachers.createIndex({ teacherId: 1 }, { unique: true })
db.teachers.createIndex({ schoolId: 1 })
db.attendance.createIndex({ studentId: 1, date: 1 }, { unique: true })
db.invoices.createIndex({ studentId: 1, status: 1 })
db.payments.createIndex({ invoiceId: 1 })
```

### Configure PM2 Cluster Mode
```bash
pm2 start dist/server.js --name schoman-backend -i max
```

### Enable Nginx Caching
Add to nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

location /api {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    # ... rest of proxy config
}
```

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong MongoDB credentials
- [ ] Enable SSL/TLS
- [ ] Configure firewall (ufw/iptables)
- [ ] Regular security updates
- [ ] Enable MongoDB authentication
- [ ] Implement rate limiting
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Use environment variables for secrets

## Maintenance

### Regular Updates
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Update application
cd /var/www/schoman
git pull
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
pm2 restart schoman-backend
```

### Database Maintenance
```bash
# Compact database
mongosh --eval "db.runCommand({ compact: 'users' })"

# Repair database
mongod --repair
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/stephanecoumbassa/schoman/issues
- Documentation: https://github.com/stephanecoumbassa/schoman

## License

ISC
