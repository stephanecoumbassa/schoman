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
- ✅ Subject creation
- ✅ Subject listing with filters
- ✅ Duplicate code prevention
- ✅ Search functionality

## Notes

- Tests use isolated MongoDB Memory Server instances
- Each test file gets its own database
- Tests run with 30-second timeout for database operations
- Single worker mode for stability
