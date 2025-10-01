# Contributing to Schoman

Thank you for your interest in contributing to Schoman! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior
- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other contributors

### Unacceptable Behavior
- Harassment or discriminatory language
- Personal attacks
- Publishing private information
- Other unprofessional conduct

## Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- MongoDB 6.0+
- Git
- A GitHub account

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/schoman.git
   cd schoman
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/stephanecoumbassa/schoman.git
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your settings
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Development Workflow

### Creating a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### Branch Naming Convention
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

Examples:
- `feature/add-teacher-management`
- `fix/login-validation-error`
- `docs/update-api-documentation`

### Keeping Your Fork Updated
```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Coding Standards

### TypeScript/JavaScript Style

#### General Rules
- Use TypeScript for all new code
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Use async/await instead of callbacks

#### Naming Conventions
```typescript
// Classes: PascalCase
class StudentController {}

// Interfaces: PascalCase with 'I' prefix
interface IStudent {}

// Functions/Methods: camelCase
function getStudents() {}

// Constants: UPPER_SNAKE_CASE
const MAX_STUDENTS = 100;

// Variables: camelCase
const studentName = 'John';
```

#### Example Good Code
```typescript
// ✅ Good
interface IStudent {
  id: string;
  firstName: string;
  lastName: string;
}

async function getStudentById(id: string): Promise<IStudent | null> {
  try {
    const student = await Student.findById(id);
    return student;
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
}
```

#### Example Bad Code
```typescript
// ❌ Bad
function gs(i) {
  return Student.findById(i);
}
```

### Vue Component Style

```vue
<script setup lang="ts">
// Imports
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

// Store
const authStore = useAuthStore()

// Reactive state
const students = ref([])
const loading = ref(false)

// Functions
const fetchStudents = async () => {
  loading.value = true
  // ... fetch logic
  loading.value = false
}

// Lifecycle
onMounted(() => {
  fetchStudents()
})
</script>

<template>
  <!-- Template uses kebab-case for components -->
  <div class="container">
    <student-list :students="students" />
  </div>
</template>

<style scoped>
/* Scoped styles */
.container {
  padding: 1rem;
}
</style>
```

### CSS/Tailwind Guidelines
- Use Tailwind utility classes when possible
- Keep custom CSS minimal
- Use semantic class names
- Follow mobile-first responsive design

## Commit Guidelines

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
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
# Feature
git commit -m "feat(students): add student bulk import"

# Bug fix
git commit -m "fix(auth): resolve token expiration issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# With body
git commit -m "feat(dashboard): add statistics charts

- Add pie chart for attendance
- Add bar chart for grades
- Integrate Chart.js library

Closes #123"
```

### Commit Best Practices
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Reference issues when applicable
- Test before committing

## Pull Request Process

### Before Submitting

1. **Update from main**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and checks**
   ```bash
   # Backend
   cd backend
   npm run build
   
   # Frontend
   cd frontend
   npm run type-check
   npm run lint
   npm run build
   ```

3. **Update documentation**
   - Update README if needed
   - Update API documentation if adding/changing endpoints
   - Add JSDoc comments to new functions

### Creating a Pull Request

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open Pull Request on GitHub**
   - Provide a clear title
   - Fill out the PR template
   - Link related issues
   - Add screenshots for UI changes

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests passing

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
```

### Review Process
1. Wait for automated checks to pass
2. Address reviewer feedback
3. Make requested changes
4. Request re-review when ready
5. Maintainers will merge when approved

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm run test:unit
```

### Manual Testing Checklist
- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Works in different browsers
- [ ] Error handling works
- [ ] Loading states display correctly

## Documentation

### What to Document

1. **Code Comments**
   - Complex algorithms
   - Non-obvious decisions
   - API usage examples

2. **API Documentation**
   - New endpoints in `backend/API.md`
   - Request/response examples
   - Error cases

3. **User Documentation**
   - New features in `USER_GUIDE.md`
   - Configuration changes in `README.md`
   - Deployment changes in `DEPLOYMENT.md`

### Documentation Style
- Write in clear, simple language
- Include code examples
- Add screenshots for UI features
- Keep formatting consistent

## Project Structure

### Backend
```
backend/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── utils/        # Utility functions
│   └── server.ts     # Entry point
├── .env.example
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── assets/       # Static assets
│   ├── components/   # Reusable components
│   ├── router/       # Vue Router config
│   ├── services/     # API services
│   ├── stores/       # Pinia stores
│   ├── views/        # Page components
│   ├── App.vue       # Root component
│   └── main.ts       # Entry point
├── .env.example
└── package.json
```

## Common Tasks

### Adding a New Model
1. Create model file in `backend/src/models/`
2. Define interface and schema
3. Export model
4. Update database schema documentation

### Adding a New API Endpoint
1. Create/update controller in `backend/src/controllers/`
2. Create/update route in `backend/src/routes/`
3. Add authentication/authorization middleware
4. Update `backend/API.md`
5. Test endpoint

### Adding a New Page
1. Create view component in `frontend/src/views/`
2. Add route in `frontend/src/router/`
3. Create store if needed in `frontend/src/stores/`
4. Update navigation menu
5. Test routing and guards

### Adding a New Feature
1. Create feature branch
2. Implement backend (model, controller, routes)
3. Implement frontend (store, views, components)
4. Add tests
5. Update documentation
6. Submit pull request

## Need Help?

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Security**: Email security@schoman.com
- **Chat**: Join our Discord (if available)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (if applicable)

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

Thank you for contributing to Schoman! 🎓
