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

Currently, the project uses manual testing. Future contributions should add:

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

### Frontend Testing

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
