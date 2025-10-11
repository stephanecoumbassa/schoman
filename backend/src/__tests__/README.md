# Tests Backend

## Structure

```
__tests__/
├── models/          # Tests for Mongoose models
│   ├── Subject.test.ts
│   └── Schedule.test.ts
├── controllers/     # Tests for controllers
│   └── subjectController.test.ts
└── routes/          # Tests for API routes
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Environment

- **Test Runner:** Jest
- **Database:** MongoDB Memory Server (in-memory MongoDB)
- **HTTP Testing:** Supertest
- **TypeScript:** ts-jest

## Writing Tests

Each test file should:
1. Set up MongoDB Memory Server before all tests
2. Clean up test data after each test
3. Disconnect and stop MongoDB after all tests

Example:
```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean up test data
});
```

## Current Tests

### Model Tests
- ✅ Subject model validation
- ✅ Schedule model validation
- ✅ Time conflict validation
- ✅ Required fields validation
- ✅ Default values

### Controller Tests
- ✅ Authentication controller
  - ✅ User registration with password hashing
  - ✅ Password comparison
  - ✅ JWT token generation
  - ✅ User roles (admin, teacher, student, parent)
  - ✅ User profile management
  - ✅ User deactivation
- ✅ Student controller
  - ✅ Student creation with validation
  - ✅ Duplicate student number prevention
  - ✅ Student queries and filtering
  - ✅ Student data updates
  - ✅ Population of user data
- ✅ Grade controller
  - ✅ Grade creation with validation
  - ✅ Grade range validation
  - ✅ Grade statistics (min, max, average)
  - ✅ Weighted average calculation
  - ✅ Grade updates
- ✅ Subject controller
  - ✅ Subject creation
  - ✅ Subject listing with filters
  - ✅ Duplicate code prevention
  - ✅ Search functionality

### Pending Tests
- [ ] Route integration tests with Supertest
- [ ] Attendance controller tests
- [ ] Invoice controller tests
- [ ] Transaction controller tests
- [ ] Message controller tests
- [ ] Export functionality tests (PDF/Excel)
- [ ] Upload functionality tests
- [ ] Middleware tests (auth, validation)

## Notes

- Tests use isolated MongoDB Memory Server instances
- Each test file gets its own database
- Tests run with 30-second timeout for database operations
- Single worker mode for stability
