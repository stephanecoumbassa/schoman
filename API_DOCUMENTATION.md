# 📚 API Documentation - Schoman

Complete REST API documentation for the Schoman school management system.

## 🌐 Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

Most endpoints require authentication using JWT (JSON Web Token).

### How to authenticate

1. **Login** to get a token
2. **Include token** in all authenticated requests:
   ```
   Authorization: Bearer <your-token-here>
   ```

### Token Expiration
- Default: 7 days
- Configurable in backend/.env (JWT_EXPIRES_IN)

---

## 📋 Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Students](#students-endpoints)
3. [Classes](#classes-endpoints)
4. [Grades](#grades-endpoints)
5. [Attendance](#attendance-endpoints)
6. [Books](#books-endpoints)
7. [Loans](#loans-endpoints)
8. [Invoices](#invoices-endpoints)
9. [Events](#events-endpoints)
10. [Expenses](#expenses-endpoints)
11. [Messages](#messages-endpoints)
12. [Dashboard](#dashboard-endpoints)

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** None required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student",
  "phone": "0601020304",
  "address": "123 Main St"
}
```

**Response (201 Created):**
```json
{
  "message": "Utilisateur créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  }
}
```

### Login

Authenticate a user and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Authentication:** None required

**Request Body:**
```json
{
  "email": "admin@schoman.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@schoman.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }
}
```

### Get Profile

Get the profile of the authenticated user.

**Endpoint:** `GET /api/auth/profile`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "admin@schoman.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "phone": "0601020304",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Students Endpoints

### List Students

Get a paginated list of students with optional filters.

**Endpoint:** `GET /api/students`

**Authentication:** Required

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Results per page
- `search` (string) - Search in firstName, lastName, email
- `level` (string) - Filter by level (e.g., "CE1", "CE2")
- `isActive` (boolean) - Filter by active status

**Example:**
```
GET /api/students?page=1&limit=20&search=John&level=CE1&isActive=true
```

**Response (200 OK):**
```json
{
  "students": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "studentNumber": "2024001",
      "dateOfBirth": "2010-05-15",
      "gender": "M",
      "level": "CE1",
      "class": {
        "name": "CE1-A",
        "level": "CE1"
      },
      "isActive": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Create Student

Create a new student profile.

**Endpoint:** `POST /api/students`

**Authentication:** Required (admin or teacher)

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "student123",
  "dateOfBirth": "2010-05-15",
  "placeOfBirth": "Paris",
  "gender": "M",
  "level": "CE1",
  "class": "507f1f77bcf86cd799439011",
  "parentContact": {
    "name": "Jane Doe",
    "phone": "0601020304",
    "email": "jane@example.com",
    "relationship": "Mother"
  },
  "emergencyContact": {
    "name": "Bob Doe",
    "phone": "0605060708"
  }
}
```

**Response (201 Created):**
```json
{
  "message": "Élève créé avec succès",
  "student": { /* student object */ }
}
```

### Get Student

Get details of a specific student.

**Endpoint:** `GET /api/students/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "student": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": { /* user object */ },
    "studentNumber": "2024001",
    "dateOfBirth": "2010-05-15",
    "placeOfBirth": "Paris",
    "gender": "M",
    "class": { /* class object */ },
    "level": "CE1",
    "parentContact": { /* parent contact */ },
    "emergencyContact": { /* emergency contact */ },
    "isActive": true
  }
}
```

### Update Student

Update student information.

**Endpoint:** `PUT /api/students/:id`

**Authentication:** Required (admin or teacher)

**Request Body:** (all fields optional)
```json
{
  "level": "CE2",
  "class": "507f1f77bcf86cd799439012",
  "parentContact": {
    "phone": "0601020305"
  }
}
```

**Response (200 OK):**
```json
{
  "message": "Élève mis à jour avec succès",
  "student": { /* updated student object */ }
}
```

### Delete Student

Soft delete (deactivate) a student.

**Endpoint:** `DELETE /api/students/:id`

**Authentication:** Required (admin only)

**Response (200 OK):**
```json
{
  "message": "Élève supprimé avec succès"
}
```

---

## Classes Endpoints

### List Classes

Get a paginated list of classes.

**Endpoint:** `GET /api/classes`

**Authentication:** Required

**Query Parameters:**
- `page`, `limit` - Pagination
- `level` (string) - Filter by level
- `academicYear` (string) - Filter by academic year (e.g., "2024-2025")
- `isActive` (boolean) - Filter by active status
- `search` (string) - Search by name

**Response (200 OK):**
```json
{
  "classes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "CE1-A",
      "level": "CE1",
      "academicYear": "2024-2025",
      "maxCapacity": 30,
      "currentEnrollment": 25,
      "mainTeacher": {
        "firstName": "Marie",
        "lastName": "Dupont"
      },
      "room": "Salle 101",
      "isActive": true
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Create Class

Create a new class.

**Endpoint:** `POST /api/classes`

**Authentication:** Required (admin or teacher)

**Request Body:**
```json
{
  "name": "CE1-A",
  "level": "CE1",
  "academicYear": "2024-2025",
  "maxCapacity": 30,
  "mainTeacher": "507f1f77bcf86cd799439011",
  "room": "Salle 101",
  "schedule": "Lundi-Vendredi 8h-16h"
}
```

### Get Class

Get class details with enrolled students.

**Endpoint:** `GET /api/classes/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "class": { /* class object */ },
  "students": [ /* array of students */ ]
}
```

### Get Class Statistics

Get statistics for a specific class.

**Endpoint:** `GET /api/classes/:id/statistics`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "totalStudents": 25,
  "activeStudents": 24,
  "averageGrade": 14.5,
  "attendanceRate": 95.2,
  "genderDistribution": {
    "M": 13,
    "F": 12
  }
}
```

---

## Grades Endpoints

### List Grades

Get grades with filters.

**Endpoint:** `GET /api/grades`

**Authentication:** Required

**Query Parameters:**
- `student` (ObjectId) - Filter by student
- `class` (ObjectId) - Filter by class
- `subject` (string) - Filter by subject
- `semester` (number) - Filter by semester (1 or 2)
- `academicYear` (string) - Filter by academic year
- `page`, `limit` - Pagination

**Response (200 OK):**
```json
{
  "grades": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "student": {
        "userId": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "subject": "Mathématiques",
      "evaluationType": "Devoir",
      "grade": 15,
      "maxGrade": 20,
      "coefficient": 2,
      "date": "2024-01-15",
      "semester": 1,
      "academicYear": "2024-2025"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Create Grade

Record a new grade.

**Endpoint:** `POST /api/grades`

**Authentication:** Required (admin or teacher)

**Request Body:**
```json
{
  "student": "507f1f77bcf86cd799439011",
  "class": "507f1f77bcf86cd799439012",
  "subject": "Mathématiques",
  "evaluationType": "Devoir",
  "grade": 15,
  "maxGrade": 20,
  "coefficient": 2,
  "date": "2024-01-15",
  "semester": 1,
  "academicYear": "2024-2025",
  "comments": "Bon travail"
}
```

**Evaluation Types:** `Contrôle`, `Devoir`, `Examen`, `Oral`, `Projet`

### Get Student Grade Summary

Get complete grade summary for a student (bulletin).

**Endpoint:** `GET /api/grades/student/:studentId/summary`

**Authentication:** Required

**Query Parameters:**
- `semester` (number) - Optional, filter by semester
- `academicYear` (string) - Optional, filter by year

**Response (200 OK):**
```json
{
  "student": { /* student info */ },
  "summary": {
    "Mathématiques": {
      "grades": [ /* grades array */ ],
      "average": 14.5,
      "count": 5
    },
    "Français": { /* ... */ }
  },
  "overallAverage": 13.8
}
```

---

## Attendance Endpoints

### List Attendance

Get attendance records with filters.

**Endpoint:** `GET /api/attendance`

**Authentication:** Required

**Query Parameters:**
- `student` (ObjectId) - Filter by student
- `class` (ObjectId) - Filter by class
- `status` (string) - Filter by status
- `startDate`, `endDate` (ISO date) - Date range filter
- `page`, `limit` - Pagination

**Statuses:** `present`, `absent`, `late`, `excused`

**Response (200 OK):**
```json
{
  "attendances": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "student": { /* student info */ },
      "class": { /* class info */ },
      "date": "2024-01-15",
      "status": "present",
      "timeIn": "08:00",
      "timeOut": "16:00"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Record Attendance

Record attendance for a student.

**Endpoint:** `POST /api/attendance`

**Authentication:** Required (admin or teacher)

**Request Body:**
```json
{
  "student": "507f1f77bcf86cd799439011",
  "class": "507f1f77bcf86cd799439012",
  "date": "2024-01-15",
  "status": "present",
  "timeIn": "08:00",
  "timeOut": "16:00",
  "reason": "Malade",
  "comments": "Certificat médical fourni"
}
```

### Get Student Attendance Stats

Get attendance statistics for a student.

**Endpoint:** `GET /api/attendance/student/:studentId/stats`

**Authentication:** Required

**Query Parameters:**
- `startDate`, `endDate` - Date range

**Response (200 OK):**
```json
{
  "totalDays": 100,
  "present": 92,
  "absent": 5,
  "late": 2,
  "excused": 1,
  "attendanceRate": 92.0
}
```

---

## Books Endpoints

### List Books

Get library catalog.

**Endpoint:** `GET /api/books`

**Authentication:** Required

**Query Parameters:**
- `search` - Search in title, author, ISBN
- `category` - Filter by category
- `available` (boolean) - Filter by availability
- `page`, `limit` - Pagination

**Response (200 OK):**
```json
{
  "books": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Le Petit Prince",
      "author": "Antoine de Saint-Exupéry",
      "isbn": "978-2070408504",
      "category": "Fiction",
      "publisher": "Gallimard",
      "publishedYear": 1943,
      "totalQuantity": 5,
      "availableQuantity": 3,
      "location": "Étagère A1"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### Create Book

Add a book to the library.

**Endpoint:** `POST /api/books`

**Authentication:** Required (admin or teacher)

---

## Loans Endpoints

### List Loans

Get book loans.

**Endpoint:** `GET /api/loans`

**Authentication:** Required

**Query Parameters:**
- `student`, `book` - Filter by student or book
- `status` - Filter by status (`borrowed`, `returned`, `overdue`)

**Response (200 OK):**
```json
{
  "loans": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "book": {
        "title": "Le Petit Prince"
      },
      "student": {
        "userId": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "borrowDate": "2024-01-15",
      "dueDate": "2024-01-29",
      "returnDate": null,
      "status": "borrowed"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

---

## Invoices Endpoints

### List Invoices

Get invoices with filters.

**Endpoint:** `GET /api/invoices`

**Authentication:** Required

**Query Parameters:**
- `student` - Filter by student
- `status` - Filter by status
- `startDate`, `endDate` - Date range
- `page`, `limit` - Pagination

**Statuses:** `draft`, `sent`, `paid`, `overdue`, `cancelled`

---

## Events Endpoints

### List Events

Get school events.

**Endpoint:** `GET /api/events`

**Authentication:** Required

**Query Parameters:**
- `type` - Filter by type
- `startDate`, `endDate` - Date range
- `page`, `limit` - Pagination

**Event Types:** `meeting`, `celebration`, `trip`, `training`, `parent_meeting`, `other`

---

## Expenses Endpoints

### List Expenses

Get expense records.

**Endpoint:** `GET /api/expenses`

**Authentication:** Required (admin or teacher)

**Query Parameters:**
- `category`, `status` - Filters
- `startDate`, `endDate` - Date range
- `page`, `limit` - Pagination

---

## Messages Endpoints

### List Messages

Get messages for the authenticated user.

**Endpoint:** `GET /api/messages`

**Authentication:** Required

**Query Parameters:**
- `category`, `priority` - Filters
- `isArchived` (boolean) - Show archived
- `page`, `limit` - Pagination

---

## Dashboard Endpoints

### Get Dashboard Statistics

Get overview statistics.

**Endpoint:** `GET /api/dashboard/stats`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "stats": {
    "totalUsers": 150,
    "totalStudents": 120,
    "totalTeachers": 15,
    "totalParents": 100,
    "activeStudents": 118,
    "totalClasses": 8
  },
  "recentStudents": [ /* recent students */ ],
  "enrollmentByLevel": {
    "CE1": 30,
    "CE2": 28,
    "CM1": 32,
    "CM2": 30
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Description of the validation error"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentification requise"
}
```

### 403 Forbidden
```json
{
  "message": "Accès non autorisé"
}
```

### 404 Not Found
```json
{
  "message": "Resource non trouvée"
}
```

### 500 Internal Server Error
```json
{
  "message": "Erreur interne du serveur",
  "error": "Error details (in development only)"
}
```

---

## Rate Limiting

Currently not implemented, but recommended for production:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

## CORS

CORS is enabled for:
- Development: `http://localhost:5173`, `http://localhost:3000`
- Production: Configure in backend environment variables

---

## Testing the API

### Using curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@schoman.com","password":"admin123"}'

# Get students (with token)
curl -X GET http://localhost:3000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the endpoints from this documentation
2. Set up environment variables for base URL and token
3. Test each endpoint

### Using the Frontend

The Vue.js frontend at `http://localhost:5173` provides a complete UI for all API endpoints.

---

## Best Practices

1. **Always include the Authorization header** for protected endpoints
2. **Handle token expiration** - implement token refresh logic
3. **Use pagination** for list endpoints
4. **Implement proper error handling** in your client
5. **Cache frequently accessed data** (e.g., class lists, user profile)
6. **Validate data** on the client side before sending requests
7. **Use HTTPS** in production

---

## Support

For issues or questions:
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Review [IMPLEMENTATION.md](./IMPLEMENTATION.md)
- Create an issue on GitHub
