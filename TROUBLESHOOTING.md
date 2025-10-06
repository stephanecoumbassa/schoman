# 🔧 Troubleshooting Guide - Schoman

This guide helps you resolve common issues when setting up or running the Schoman application.

## 📋 Quick Diagnostics

Run the validation script to check your setup:
```bash
./validate.sh
```

## Common Issues and Solutions

### 1. Backend Issues

#### Backend won't start

**Symptom:** Error when running `npm run dev` in backend folder

**Possible causes:**

1. **Port 3000 already in use**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   # Or on Windows
   netstat -ano | findstr :3000
   ```
   
   **Solution:** Kill the process or change the port in `backend/.env`:
   ```env
   PORT=3001
   ```

2. **MongoDB connection failed**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:27017
   ```
   
   **Solution:** 
   - Check if MongoDB is running: `mongosh mongodb://localhost:27017`
   - Verify MONGODB_URI in `backend/.env`
   - Use MongoDB Atlas cloud database instead

3. **Missing dependencies**
   ```
   Error: Cannot find module 'express'
   ```
   
   **Solution:**
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript compilation errors**
   ```bash
   # Check for errors
   cd backend
   npm run build
   ```
   
   **Solution:** Ensure TypeScript is properly installed:
   ```bash
   npm install --save-dev typescript @types/node
   ```

#### Database seeding fails

**Symptom:** `npm run seed` throws errors

**Solution:**
1. Ensure MongoDB is running and accessible
2. Check connection string in `.env`
3. Clear the database first:
   ```bash
   mongosh mongodb://localhost:27017/schoman --eval "db.dropDatabase()"
   ```
4. Run seed again: `npm run seed`

### 2. Frontend Issues

#### Frontend won't start

**Symptom:** Error when running `npm run dev` in frontend folder

**Possible causes:**

1. **Port 5173 already in use**
   
   **Solution:** Change the port in `frontend/vite.config.ts`:
   ```typescript
   export default defineConfig({
     server: {
       port: 5174
     }
   })
   ```

2. **Missing dependencies**
   
   **Solution:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Vite cache issues**
   
   **Solution:**
   ```bash
   cd frontend
   rm -rf node_modules/.vite
   npm run dev
   ```

#### API Connection Errors

**Symptom:** Frontend shows "Network Error" or "Failed to fetch"

**Possible causes:**

1. **Backend not running**
   
   **Solution:** Start backend: `cd backend && npm run dev`

2. **Wrong API URL**
   
   **Solution:** Check `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **CORS issues**
   
   **Solution:** Verify backend allows frontend origin in CORS configuration

#### Build fails

**Symptom:** `npm run build` fails with TypeScript errors

**Solution:**
```bash
cd frontend
npm run type-check  # See detailed errors
# Fix the reported errors
npm run build
```

### 3. Docker Issues

#### Docker Compose fails to start

**Symptom:** `docker-compose up` exits with errors

**Possible causes:**

1. **Port conflicts**
   ```
   Error: Ports are not available
   ```
   
   **Solution:** Change ports in `docker-compose.yml`:
   ```yaml
   services:
     backend:
       ports:
         - "3001:3000"  # Changed from 3000:3000
   ```

2. **Docker daemon not running**
   
   **Solution:**
   ```bash
   # Start Docker Desktop (Mac/Windows)
   # Or on Linux
   sudo systemctl start docker
   ```

3. **Build context errors**
   
   **Solution:** Build images separately:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

#### Containers exit immediately

**Solution:** Check logs:
```bash
docker-compose logs backend
docker-compose logs frontend
```

### 4. MongoDB Issues

#### Can't connect to MongoDB

**Symptom:** 
```
MongoNetworkError: failed to connect to server
```

**Solutions:**

1. **Using local MongoDB**
   ```bash
   # Start MongoDB
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Using MongoDB Atlas**
   - Verify connection string format
   - Check IP whitelist in Atlas dashboard
   - Ensure username/password are correct
   - URL encode special characters in password

3. **Check MongoDB status**
   ```bash
   mongosh mongodb://localhost:27017 --eval "db.runCommand({ ping: 1 })"
   ```

#### Database authentication failed

**Symptom:**
```
MongoServerError: Authentication failed
```

**Solution:**
- Verify username and password in MONGODB_URI
- URL encode special characters:
  ```
  mongodb://user:p%40ssw0rd@cluster.mongodb.net/schoman
  # @ becomes %40, : becomes %3A, etc.
  ```

### 5. Environment Configuration Issues

#### Missing .env file

**Solution:**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your API URL
```

#### Environment variables not loading

**Solution:**
1. Restart the development server
2. Verify .env file location (must be in root of backend/frontend folders)
3. Check variable names (backend: normal vars, frontend: must start with VITE_)

### 6. Authentication Issues

#### Can't login

**Symptom:** "Invalid credentials" even with correct password

**Solutions:**

1. **Database not seeded**
   ```bash
   cd backend
   npm run seed
   ```

2. **Check user exists**
   ```bash
   mongosh mongodb://localhost:27017/schoman
   db.users.find({ email: "admin@schoman.com" })
   ```

3. **JWT secret mismatch**
   - Ensure JWT_SECRET is set in `backend/.env`
   - Don't change JWT_SECRET after creating users

#### Token expired errors

**Solution:** Login again or increase JWT_EXPIRES_IN in backend/.env:
```env
JWT_EXPIRES_IN=30d
```

### 7. Performance Issues

#### Slow API responses

**Solutions:**

1. **Add database indexes**
   ```javascript
   // Already implemented in models
   // But verify they're created:
   mongosh mongodb://localhost:27017/schoman
   db.students.getIndexes()
   ```

2. **Enable MongoDB caching**
   ```javascript
   // Add to mongoose connection
   mongoose.set('bufferCommands', true);
   ```

3. **Check MongoDB query profiling**
   ```javascript
   db.setProfilingLevel(2)
   db.system.profile.find().limit(10).sort({ ts: -1 })
   ```

#### Frontend slow to load

**Solutions:**

1. **Use production build**
   ```bash
   cd frontend
   npm run build
   npm install -g serve
   serve -s dist
   ```

2. **Enable caching**
   - Use a reverse proxy (Nginx) with caching
   - Enable browser caching headers

### 8. Installation Issues

#### npm install fails

**Symptom:** Errors during `npm install`

**Solutions:**

1. **Clear npm cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Node version issues**
   ```bash
   # Check version
   node -v
   # Should be 18.x or higher
   
   # Install/update Node.js
   # Use nvm (Node Version Manager)
   nvm install 18
   nvm use 18
   ```

3. **Permission errors (Linux/Mac)**
   ```bash
   # Don't use sudo with npm!
   # Fix npm permissions:
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   # Add to ~/.profile or ~/.bashrc
   export PATH=~/.npm-global/bin:$PATH
   ```

### 9. Git Issues

#### Large files in repository

**Symptom:** Git push fails due to large files

**Solution:**
```bash
# Remove node_modules if accidentally committed
git rm -r --cached node_modules
git rm -r --cached backend/node_modules
git rm -r --cached frontend/node_modules
echo "node_modules/" >> .gitignore
git commit -m "Remove node_modules"
```

### 10. Production Deployment Issues

#### Environment variables in production

**Solution:**
- Don't commit .env files
- Set environment variables on hosting platform
- Use secrets management for sensitive data

#### CORS errors in production

**Solution:** Update backend CORS configuration:
```typescript
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

## Diagnostic Commands

### Check all services
```bash
./validate.sh
```

### Check Node.js and npm
```bash
node -v && npm -v
```

### Check MongoDB
```bash
mongosh mongodb://localhost:27017 --eval "db.runCommand({ ping: 1 })"
```

### Check backend health
```bash
curl http://localhost:3000/health
```

### Check frontend
```bash
curl http://localhost:5173
```

### View logs

**Docker:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**PM2:**
```bash
pm2 logs schoman-backend
```

## Getting More Help

### Collect diagnostic information

When asking for help, provide:

1. **System information**
   ```bash
   node -v
   npm -v
   docker --version
   uname -a  # Linux/Mac
   ```

2. **Error messages**
   - Full error output
   - Browser console errors (F12)
   - Server logs

3. **Configuration**
   - Node.js version
   - MongoDB version and type (local/Atlas)
   - Operating system

4. **What you've tried**
   - Steps to reproduce
   - Solutions attempted

### Useful resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Vue.js Documentation](https://vuejs.org/)
- [Docker Documentation](https://docs.docker.com/)
- [Express.js Documentation](https://expressjs.com/)

### Create an issue

If the problem persists:
1. Go to GitHub Issues
2. Provide system info and error messages
3. Describe what you expected vs what happened
4. Include steps to reproduce

## Prevention Tips

1. **Always use version control**
   ```bash
   git status
   git diff
   ```

2. **Test in isolation**
   - Test backend separately
   - Test frontend separately
   - Test integration

3. **Keep dependencies updated**
   ```bash
   npm outdated
   npm update
   ```

4. **Use environment variables**
   - Never hardcode secrets
   - Use .env files (don't commit them)

5. **Monitor logs**
   - Check logs regularly
   - Set up error tracking (Sentry, etc.)

6. **Backup database**
   ```bash
   mongodump --uri="mongodb://localhost:27017/schoman" --out=backup
   ```
