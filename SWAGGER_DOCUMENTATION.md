# 📚 Schoman API Documentation with Swagger

## 🎯 Overview

Schoman now includes interactive API documentation powered by Swagger/OpenAPI 3.0. This provides a user-friendly interface to explore, test, and understand all available API endpoints.

## 🚀 Access the Documentation

### Development
```
http://localhost:3000/api-docs
```

### Production
```
https://api.schoman.com/api-docs
```

## ✨ Features

### Interactive Interface
- ✅ **Browse all endpoints** - Organized by categories (Schools, Users, Students, etc.)
- ✅ **Try it out** - Execute API calls directly from the browser
- ✅ **Request/Response examples** - See sample data for each endpoint
- ✅ **Schema definitions** - Complete data models with validation rules
- ✅ **Authentication testing** - Add your JWT token to test protected routes

### OpenAPI Specification
- ✅ **OpenAPI 3.0 compliant**
- ✅ **JSON export** available at `/api-docs/swagger.json`
- ✅ **Import into Postman** - Use the JSON spec
- ✅ **Generate client libraries** - Use tools like openapi-generator

## 📋 API Categories

### 1. Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile

### 2. Schools (Multi-tenant)
- GET `/api/schools` - List all schools
- GET `/api/schools/:id` - Get school by ID
- GET `/api/schools/code/:code` - Get school by code
- GET `/api/schools/:id/stats` - Get school statistics
- POST `/api/schools` - Create school (Admin)
- PUT `/api/schools/:id` - Update school (Admin)
- DELETE `/api/schools/:id` - Delete school (Admin)

### 3. Users
- GET `/api/users` - List users
- GET `/api/users/:id` - Get user
- POST `/api/users` - Create user (Admin)
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user (Admin)

### 4. Students
- GET `/api/students` - List students
- GET `/api/students/:id` - Get student
- POST `/api/students` - Create student
- PUT `/api/students/:id` - Update student
- DELETE `/api/students/:id` - Delete student

### 5. Classes
- GET `/api/classes` - List classes
- GET `/api/classes/:id` - Get class
- POST `/api/classes` - Create class
- PUT `/api/classes/:id` - Update class
- DELETE `/api/classes/:id` - Delete class

### 6. Subjects
- GET `/api/subjects` - List subjects
- GET `/api/subjects/:id` - Get subject
- POST `/api/subjects` - Create subject
- PUT `/api/subjects/:id` - Update subject
- DELETE `/api/subjects/:id` - Delete subject

### 7. Schedules
- GET `/api/schedules` - List schedules
- GET `/api/schedules/:id` - Get schedule
- POST `/api/schedules` - Create schedule
- PUT `/api/schedules/:id` - Update schedule
- DELETE `/api/schedules/:id` - Delete schedule

### 8. Grades
- GET `/api/grades` - List grades
- GET `/api/grades/student/:studentId` - Get student grades
- POST `/api/grades` - Create grade
- PUT `/api/grades/:id` - Update grade
- DELETE `/api/grades/:id` - Delete grade

### 9. Attendance
- GET `/api/attendance` - List attendance records
- GET `/api/attendance/student/:studentId` - Get student attendance
- POST `/api/attendance` - Record attendance
- PUT `/api/attendance/:id` - Update attendance
- DELETE `/api/attendance/:id` - Delete attendance

### 10. Invoices & Billing
- GET `/api/invoices` - List invoices
- GET `/api/invoices/:id` - Get invoice
- GET `/api/invoices/student/:studentId` - Get student invoices
- POST `/api/invoices` - Create invoice
- PUT `/api/invoices/:id` - Update invoice
- DELETE `/api/invoices/:id` - Delete invoice

### 11. Library (Books & Loans)
- GET `/api/books` - List books
- GET `/api/loans` - List loans
- POST `/api/loans` - Create loan
- PUT `/api/loans/:id/return` - Return book

### 12. Events
- GET `/api/events` - List events
- POST `/api/events` - Create event
- PUT `/api/events/:id` - Update event
- DELETE `/api/events/:id` - Delete event

### 13. Messages
- GET `/api/messages` - List messages
- POST `/api/messages` - Send message
- PUT `/api/messages/:id/read` - Mark as read
- DELETE `/api/messages/:id` - Delete message

### 14. Exports
- GET `/api/exports/students/pdf` - Export students to PDF
- GET `/api/exports/students/excel` - Export students to Excel
- GET `/api/exports/grades/pdf/:studentId` - Export grades to PDF
- GET `/api/exports/invoice/pdf/:invoiceId` - Export invoice to PDF

### 15. Uploads
- POST `/api/uploads/avatar` - Upload avatar
- POST `/api/uploads/document` - Upload document

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. Register or login via `/api/auth/login`
2. Copy the token from the response
3. In Swagger UI, click "Authorize" button
4. Enter: `Bearer <your-token>`
5. Now you can test protected endpoints

## 📊 Data Models

### User
```json
{
  "_id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "admin|teacher|student|parent",
  "school": "string (ObjectId)",
  "isActive": "boolean"
}
```

### School
```json
{
  "_id": "string",
  "name": "string",
  "code": "string (unique)",
  "address": "string",
  "city": "string",
  "country": "string",
  "phone": "string",
  "email": "string",
  "settings": {
    "currency": "string",
    "language": "string",
    "timezone": "string",
    "dateFormat": "string"
  },
  "isActive": "boolean"
}
```

### Student
```json
{
  "_id": "string",
  "userId": "string (ObjectId)",
  "studentNumber": "string (unique)",
  "dateOfBirth": "date",
  "gender": "M|F",
  "class": "string (ObjectId)",
  "school": "string (ObjectId)",
  "isActive": "boolean"
}
```

## 🛠️ Implementation Details

### Technology Stack
- **OpenAPI 3.0** - API specification standard
- **Swagger UI 5.10** - Interactive documentation interface
- **JSDoc comments** - Route documentation in code
- **Express.js** - API framework

### Files Created
```
backend/src/config/swagger.ts          # Swagger configuration
backend/src/routes/swaggerRoutes.ts    # Swagger UI routes
SWAGGER_DOCUMENTATION.md               # This file
```

### Files Modified
```
backend/src/index.ts                   # Added swagger routes
backend/src/routes/schoolRoutes.ts     # Added JSDoc comments
```

## 📝 Adding Documentation for New Routes

To document a new route, add JSDoc comments above the route definition:

```typescript
/**
 * @swagger
 * /api/your-route:
 *   get:
 *     summary: Description of your endpoint
 *     tags: [YourTag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: param1
 *         schema:
 *           type: string
 *         description: Parameter description
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 */
router.get('/your-route', yourController);
```

## 🎨 Customization

### Adding New Schemas

Edit `backend/src/config/swagger.ts` to add new schemas:

```typescript
components: {
  schemas: {
    YourModel: {
      type: 'object',
      required: ['field1', 'field2'],
      properties: {
        field1: { type: 'string' },
        field2: { type: 'number' }
      }
    }
  }
}
```

### Changing Appearance

Modify the HTML in `backend/src/routes/swaggerRoutes.ts` to customize Swagger UI.

## 🔍 Testing with Swagger UI

1. **Navigate** to http://localhost:3000/api-docs
2. **Expand** an endpoint category
3. **Click** "Try it out" on any endpoint
4. **Fill** in parameters/body
5. **Click** "Execute"
6. **View** the response below

## 📥 Export & Import

### Export OpenAPI Spec
```bash
curl http://localhost:3000/api-docs/swagger.json > schoman-api.json
```

### Import to Postman
1. Open Postman
2. File → Import
3. Select `schoman-api.json`
4. All endpoints will be imported

### Generate Client Code
Use openapi-generator to create client libraries:
```bash
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3000/api-docs/swagger.json \
  -g typescript-axios \
  -o ./client
```

## 🌟 Benefits

### For Developers
- ✅ Quick reference for all endpoints
- ✅ Test APIs without writing code
- ✅ Understand request/response formats
- ✅ Generate client code automatically

### For Frontend Teams
- ✅ Clear API contracts
- ✅ No need to ask backend team for details
- ✅ Live testing environment
- ✅ Mock data examples

### For API Consumers
- ✅ Self-service documentation
- ✅ Always up-to-date
- ✅ Interactive playground
- ✅ Standard OpenAPI format

## 📚 Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Generator](https://openapi-generator.tech/)

## 🎯 Next Steps

1. **Document more routes** - Add JSDoc comments to all route files
2. **Add examples** - Include request/response examples
3. **Add error codes** - Document all possible error responses
4. **Add authentication flows** - Document OAuth/JWT flows
5. **Version the API** - Add versioning to the spec

---

**Status:** ✅ Complete - Interactive API documentation available at `/api-docs`  
**Completion Date:** October 2025  
**Phase:** Phase 3 - Task 2/7 Complete
