# 🤝 Contributing to Schoman

Thank you for your interest in contributing to Schoman! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. We pledge to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or intimidation
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

Before you start contributing, make sure you have:

- Node.js 18+ installed
- Git installed
- A GitHub account
- MongoDB (local or Atlas) for testing

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/schoman.git
   cd schoman
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/stephanecoumbassa/schoman.git
   ```

4. **Install dependencies**
   ```bash
   # Quick setup
   ./setup.sh
   
   # Or manually
   cd backend && npm install
   cd ../frontend && npm install
   ```

5. **Configure environment**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB connection
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

6. **Seed the database**
   ```bash
   cd backend
   npm run seed
   ```

7. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

8. **Verify setup**
   ```bash
   ./validate.sh
   ```

## 🔄 Development Workflow

### Branching Strategy

We use a simplified Git Flow:

- `main` - Production-ready code
- `develop` - Latest development changes
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Creating a New Feature

1. **Update your local repository**
   ```bash
   git checkout develop
   git pull upstream develop
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

4. **Test your changes**
   ```bash
   # Backend
   cd backend
   npm run build
   npm test
   
   # Frontend
   cd frontend
   npm run build
   npm run type-check
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub

## 📝 Coding Standards

### TypeScript Style Guide

#### General Rules

- Use TypeScript for all new code
- Enable strict mode in tsconfig.json
- Use interfaces for object types
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

#### Naming Conventions

```typescript
// Classes: PascalCase
class UserService {}

// Interfaces: PascalCase with 'I' prefix
interface IUser {}

// Functions: camelCase
function getUserById() {}

// Variables: camelCase
const userId = "123";

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// Files: kebab-case
// user-service.ts, auth-controller.ts
```

#### Code Examples

**Good:**
```typescript
// Good: Proper typing and naming
interface IStudent {
  userId: mongoose.Types.ObjectId;
  studentNumber: string;
  dateOfBirth: Date;
}

async function getStudentById(id: string): Promise<IStudent | null> {
  return await Student.findById(id);
}
```

**Bad:**
```typescript
// Bad: No types, unclear naming
function get(id) {
  return Student.findById(id);
}
```

### Backend (Node.js/Express)

#### File Structure
```typescript
// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  // ... other fields
}

const UserSchema: Schema = new Schema({ /* ... */ });

export default mongoose.model<IUser>('User', UserSchema);
```

#### Controllers
```typescript
// controllers/userController.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    // Implementation
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: 'Error message', error: error.message });
  }
};
```

#### Routes
```typescript
// routes/userRoutes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/', authenticate, userController.getUsers);
router.post('/', authenticate, authorize('admin'), userController.createUser);

export default router;
```

### Frontend (Vue.js)

#### Component Structure
```vue
<template>
  <!-- Use semantic HTML -->
  <div class="container">
    <h1>{{ title }}</h1>
    <!-- Always use v-bind for dynamic attributes -->
    <button @click="handleClick" :disabled="isLoading">
      {{ buttonText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Props
interface Props {
  title: string;
}
const props = defineProps<Props>();

// State
const isLoading = ref(false);
const buttonText = ref('Click me');

// Methods
const handleClick = () => {
  // Implementation
};

// Lifecycle
onMounted(() => {
  // Initialization
});
</script>

<style scoped>
/* Use Tailwind CSS classes when possible */
.container {
  @apply max-w-7xl mx-auto px-4;
}
</style>
```

#### API Service Pattern
```typescript
// services/api.ts
class ApiService {
  async getUsers(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    return this.request<{ users: User[] }>(`/users?${queryParams}`);
  }
}
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Use `scoped` styles in Vue components
- Follow responsive-first approach
- Use CSS variables for theme colors

```vue
<!-- Good: Tailwind classes -->
<div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">

<!-- Avoid: Inline styles -->
<div style="background: white; padding: 24px;">
```

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples

```bash
# Feature
git commit -m "feat(students): add bulk import functionality"

# Bug fix
git commit -m "fix(auth): resolve token expiration issue"

# Documentation
git commit -m "docs(api): update authentication endpoints"

# Multiple changes
git commit -m "feat(grades): add grade calculation

- Implement weighted average calculation
- Add semester-based filtering
- Update grade summary component"
```

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No console.log() statements
- [ ] Tests pass locally
- [ ] Builds without errors

### PR Title Format

Use the same format as commit messages:
```
feat(module): add new feature
fix(module): resolve bug
docs: update README
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. Automated checks must pass (CI/CD)
2. At least one maintainer review required
3. Address all review comments
4. Squash commits if necessary
5. Maintainer will merge when ready

## 🧪 Testing

### Backend Testing

The project uses Jest for backend testing with TypeScript support.

#### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

#### Test Structure

```typescript
// Example test structure (to be implemented)
describe('Student Controller', () => {
  it('should get all students', async () => {
    // Test implementation
  });
  
  it('should create a new student', async () => {
    // Test implementation
  });
});
```

#### Writing Backend Tests

**Model Tests:**
```typescript
// __tests__/models/Student.test.ts
import { Student } from '@/models/Student';

describe('Student Model', () => {
  it('should validate required fields', async () => {
    const student = new Student({});
    await expect(student.validate()).rejects.toThrow();
  });
  
  it('should save valid student', async () => {
    const student = new Student({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      dateOfBirth: new Date('2010-01-01'),
    });
    await student.save();
    expect(student._id).toBeDefined();
  });
});
```

**Controller Tests:**
```typescript
// __tests__/controllers/studentController.test.ts
import request from 'supertest';
import app from '@/index';

describe('Student Controller', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    authToken = response.body.token;
  });
  
  describe('GET /api/students', () => {
    it('should return all students', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.students).toBeInstanceOf(Array);
    });
    
    it('should return 401 without auth', async () => {
      await request(app)
        .get('/api/students')
        .expect(401);
    });
  });
  
  describe('POST /api/students', () => {
    it('should create a new student', async () => {
      const studentData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@test.com',
        dateOfBirth: '2010-05-15',
      };
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send(studentData)
        .expect(201);
      
      expect(response.body.firstName).toBe(studentData.firstName);
    });
    
    it('should validate required fields', async () => {
      await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });
});
```

**Middleware Tests:**
```typescript
// __tests__/middleware/auth.test.ts
import { Request, Response } from 'express';
import { authenticate, authorize } from '@/middleware/auth';

describe('Auth Middleware', () => {
  describe('authenticate', () => {
    it('should authenticate valid token', async () => {
      const req = {
        headers: { authorization: 'Bearer valid_token' }
      } as Request;
      const res = {} as Response;
      const next = jest.fn();
      
      await authenticate(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect((req as any).user).toBeDefined();
    });
    
    it('should reject invalid token', async () => {
      const req = {
        headers: { authorization: 'Bearer invalid_token' }
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const next = jest.fn();
      
      await authenticate(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
```

### Frontend Testing

The project uses Vitest and Vue Test Utils for frontend testing.

```typescript
// Example Vue component test (to be implemented)
import { mount } from '@vue/test-utils';
import LoginView from '@/views/LoginView.vue';

describe('LoginView', () => {
  it('renders login form', () => {
    const wrapper = mount(LoginView);
    expect(wrapper.find('form').exists()).toBe(true);
  });
});
```

#### Running Frontend Tests

```bash
cd frontend

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

#### Writing Frontend Tests

**Component Tests:**
```typescript
// tests/components/StudentCard.test.ts
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StudentCard from '@/components/students/StudentCard.vue';

describe('StudentCard', () => {
  it('renders student information', () => {
    const student = {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };
    
    const wrapper = mount(StudentCard, {
      props: { student },
    });
    
    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('john@test.com');
  });
  
  it('emits delete event on button click', async () => {
    const wrapper = mount(StudentCard, {
      props: {
        student: { _id: '1', firstName: 'John', lastName: 'Doe' },
      },
    });
    
    await wrapper.find('.delete-btn').trigger('click');
    
    expect(wrapper.emitted('delete')).toBeTruthy();
    expect(wrapper.emitted('delete')?.[0]).toEqual(['1']);
  });
});
```

**Store Tests:**
```typescript
// tests/stores/students.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStudentsStore } from '@/stores/students';
import { studentsService } from '@/services/students.service';

// Mock the service
vi.mock('@/services/students.service');

describe('Students Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });
  
  it('fetches students successfully', async () => {
    const mockStudents = [
      { _id: '1', firstName: 'John', lastName: 'Doe' },
      { _id: '2', firstName: 'Jane', lastName: 'Smith' },
    ];
    
    vi.mocked(studentsService.getAll).mockResolvedValue({
      data: { students: mockStudents, total: 2 }
    } as any);
    
    const store = useStudentsStore();
    await store.fetchStudents();
    
    expect(store.students).toEqual(mockStudents);
    expect(store.studentsCount).toBe(2);
  });
  
  it('handles fetch error', async () => {
    const error = new Error('Network error');
    vi.mocked(studentsService.getAll).mockRejectedValue(error);
    
    const store = useStudentsStore();
    
    await expect(store.fetchStudents()).rejects.toThrow('Network error');
    expect(store.error).toBe('Network error');
  });
});
```

**Composable Tests:**
```typescript
// tests/composables/usePagination.test.ts
import { describe, it, expect } from 'vitest';
import { usePagination } from '@/composables/usePagination';

describe('usePagination', () => {
  it('initializes with default values', () => {
    const { currentPage, perPage } = usePagination();
    
    expect(currentPage.value).toBe(1);
    expect(perPage.value).toBe(10);
  });
  
  it('calculates offset correctly', () => {
    const { currentPage, offset } = usePagination();
    
    currentPage.value = 3;
    expect(offset.value).toBe(20);
  });
  
  it('navigates to next page', () => {
    const { currentPage, nextPage } = usePagination();
    
    nextPage();
    expect(currentPage.value).toBe(2);
  });
  
  it('navigates to previous page', () => {
    const { currentPage, prevPage, nextPage } = usePagination();
    
    nextPage();
    nextPage();
    prevPage();
    expect(currentPage.value).toBe(2);
  });
});
```

### Test Coverage Goals

- **Backend**: Aim for 70%+ coverage
  - Models: 80%+
  - Controllers: 70%+
  - Middleware: 80%+
  - Services: 70%+
  
- **Frontend**: Aim for 60%+ coverage
  - Components: 70%+
  - Stores: 80%+
  - Composables: 70%+
  - Utilities: 80%+

### Manual Testing Checklist

Before submitting PR:

- [ ] Backend builds: `cd backend && npm run build`
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] Backend runs: `cd backend && npm run dev`
- [ ] Frontend runs: `cd frontend && npm run dev`
- [ ] All API endpoints work
- [ ] UI is responsive
- [ ] No console errors
- [ ] Authentication works
- [ ] Authorization enforced correctly

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Get all students with pagination and filtering
 * @param req - Express request object with query params
 * @param res - Express response object
 * @returns Promise<void>
 */
export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  // Implementation
};
```

### API Documentation

When adding new endpoints, update:
- `API_DOCUMENTATION.md` - Complete endpoint documentation
- `README.md` - If it affects main features
- JSDoc comments in code

### README Updates

Update README.md when:
- Adding new major features
- Changing installation/setup process
- Modifying environment variables
- Adding new dependencies

## 🐛 Reporting Bugs

### Before Reporting

1. Check existing issues
2. Try latest version
3. Read documentation
4. Run `./validate.sh`

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., macOS 12.0]
- Node.js: [e.g., 18.0.0]
- Browser: [e.g., Chrome 100]

**Additional context**
Any other information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Alternative solutions

**Additional context**
Mockups, examples, etc.
```

## 🎯 Areas for Contribution

### High Priority

- [ ] Add automated testing (Jest, Vitest)
- [ ] Implement email notifications
- [ ] Add PDF export functionality
- [ ] Improve error handling
- [ ] Add data validation middleware
- [ ] Implement file upload for avatars

### Medium Priority

- [ ] Add more filtering options
- [ ] Improve search functionality
- [ ] Add bulk operations
- [ ] Implement caching
- [ ] Add more dashboard widgets
- [ ] Improve mobile responsiveness

### Documentation

- [ ] Add more code examples
- [ ] Create video tutorials
- [ ] Improve API documentation
- [ ] Add architecture diagrams
- [ ] Create FAQ

## 🚀 DevOps et CI/CD

### Pipeline CI/CD Actuel

Le projet utilise GitHub Actions pour l'intégration continue :

**`.github/workflows/ci.yml`** - Exécute automatiquement :
- ✅ Vérification de compilation TypeScript (backend + frontend)
- ✅ Tests automatisés
- ✅ Build des images Docker
- ✅ Tests d'intégration avec MongoDB

### Configuration CI/CD

```yaml
# .github/workflows/ci.yml (simplifié)
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test
      - name: Build
        run: cd backend && npm run build
        
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run tests
        run: cd frontend && npm run test:run
      - name: Build
        run: cd frontend && npm run build
```

### Déploiement Automatique (À Implémenter)

**Workflow de Déploiement Suggéré:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
      
      - name: Deploy to VPS
        run: |
          ssh user@vps_ip << 'EOF'
            cd /path/to/schoman
            git pull origin main
            docker-compose down
            docker-compose up -d --build
          EOF
      
      - name: Health Check
        run: |
          curl -f https://your-domain.com/health || exit 1
```

### Environnements

**1. Development (Local)**
```bash
# .env.development
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/schoman_dev
JWT_SECRET=dev_secret
REDIS_URL=redis://localhost:6379
```

**2. Staging**
```bash
# .env.staging
NODE_ENV=staging
MONGODB_URI=mongodb://staging_db/schoman_staging
JWT_SECRET=${STAGING_JWT_SECRET}
REDIS_URL=redis://staging_redis:6379
```

**3. Production**
```bash
# .env.production
NODE_ENV=production
MONGODB_URI=mongodb://prod_db/schoman
JWT_SECRET=${PROD_JWT_SECRET}
REDIS_URL=redis://prod_redis:6379
```

### Docker et Conteneurisation

**Backend Dockerfile:**
```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose pour Production:**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
      - redis
    restart: always
    
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl
    restart: always
    
  mongodb:
    image: mongo:7
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    restart: always
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: always
    
  prometheus:
    image: prom/prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    restart: always
    
  grafana:
    image: grafana/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
    restart: always

volumes:
  mongodb_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

### Monitoring et Logs

**Prometheus Configuration:**
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/health/metrics'
    
  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']
      
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

**Grafana Dashboards:**
- Application Performance
- Database Metrics
- API Response Times
- Error Rates
- System Resources

### Backup Automatique

**Script de Backup MongoDB:**
```bash
#!/bin/bash
# scripts/backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
BACKUP_FILE="schoman_backup_$DATE.gz"

# Créer le backup
mongodump --uri="${MONGODB_URI}" --gzip --archive="$BACKUP_DIR/$BACKUP_FILE"

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

# Upload vers S3 (optionnel)
# aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" s3://your-bucket/backups/

echo "Backup completed: $BACKUP_FILE"
```

**Cron Job pour Backups:**
```bash
# Ajouter au crontab
0 2 * * * /path/to/scripts/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1
```

### Scripts de Déploiement

**Script de Déploiement Manuel:**
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Backend
echo "📦 Building backend..."
cd backend
npm install --production
npm run build
pm2 restart schoman-backend

# Frontend
echo "🎨 Building frontend..."
cd ../frontend
npm install
npm run build
rsync -av dist/ /var/www/schoman/

# Database migrations (si nécessaire)
cd ../backend
npm run migrate

echo "✅ Deployment completed!"

# Health check
curl -f http://localhost:3000/health || echo "⚠️ Backend health check failed"
curl -f http://localhost/health || echo "⚠️ Frontend health check failed"
```

### Rollback Strategy

**Rollback Rapide:**
```bash
#!/bin/bash
# scripts/rollback.sh

PREVIOUS_VERSION=$1

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "Usage: ./rollback.sh <previous_version_tag>"
  exit 1
fi

echo "🔄 Rolling back to $PREVIOUS_VERSION..."

git checkout $PREVIOUS_VERSION
docker-compose down
docker-compose up -d --build

echo "✅ Rollback completed to $PREVIOUS_VERSION"
```

### Secrets Management

**Utilisation de GitHub Secrets:**
- `SSH_PRIVATE_KEY` - Clé SSH pour déploiement
- `MONGODB_URI` - URI MongoDB
- `JWT_SECRET` - Secret JWT
- `STAGING_HOST` - Host du serveur staging
- `PRODUCTION_HOST` - Host du serveur production

**Utilisation de Docker Secrets (Production):**
```yaml
secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  db_password:
    file: ./secrets/db_password.txt

services:
  backend:
    secrets:
      - jwt_secret
      - db_password
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
```

### Load Balancing et Scaling

**Configuration Nginx pour Load Balancing:**
```nginx
# nginx/load-balancer.conf
upstream backend {
    least_conn;
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
}

server {
    listen 80;
    server_name api.schoman.com;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Docker Compose avec Scaling:**
```bash
# Démarrer 3 instances du backend
docker-compose up -d --scale backend=3
```

### Bonnes Pratiques DevOps

1. **Infrastructure as Code**: Utiliser Docker Compose, Kubernetes ou Terraform
2. **Automated Testing**: Tests automatiques avant chaque déploiement
3. **Blue-Green Deployment**: Déploiement sans downtime
4. **Monitoring**: Alertes sur Prometheus/Grafana
5. **Logging**: Logs centralisés (ELK Stack, Loki)
6. **Backups**: Backups automatiques quotidiens
7. **Security**: Scans de sécurité automatiques
8. **Documentation**: Documentation à jour du processus de déploiement

## 📞 Getting Help

- **Documentation**: Check all .md files in the repository
- **Issues**: Search existing issues on GitHub
- **Discussions**: Start a discussion on GitHub
- **Email**: Contact maintainers (if available)

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing to Schoman! 🎉
