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
2. [Users](#users-endpoints)
3. [Students](#students-endpoints)
4. [Classes](#classes-endpoints)
5. [Grades](#grades-endpoints)
6. [Attendance](#attendance-endpoints)
7. [Books](#books-endpoints)
8. [Loans](#loans-endpoints)
9. [Invoices](#invoices-endpoints)
10. [Events](#events-endpoints)
11. [Expenses](#expenses-endpoints)
12. [Messages](#messages-endpoints)
13. [Budgets](#budgets-endpoints)
14. [Transactions](#transactions-endpoints)
15. [Dashboard](#dashboard-endpoints)

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

## Users Endpoints

### List Users

Get a paginated list of users (teachers, admins, parents) with optional filters.

**Endpoint:** `GET /api/users`

**Authentication:** Required (Bearer token)

**Authorization:** Admin (full access), Teacher (read-only)

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Results per page (default: 10, max: 100)
- `search` (string, optional) - Search by name or email
- `role` (string, optional) - Filter by role: `admin`, `teacher`, `parent`
- `isActive` (boolean, optional) - Filter by active status

**Example Request:**
```bash
GET /api/users?page=1&limit=10&role=teacher&isActive=true
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "teacher@schoman.com",
      "firstName": "Marie",
      "lastName": "Dupont",
      "role": "teacher",
      "phone": "0601020304",
      "address": "123 Main St",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Create User

Create a new user account (teacher, admin, or parent).

**Endpoint:** `POST /api/users`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Request Body:**
```json
{
  "email": "teacher@school.com",
  "password": "secure123",
  "firstName": "John",
  "lastName": "Smith",
  "role": "teacher",
  "phone": "0601020304",
  "address": "123 School Street"
}
```

**Required Fields:** `email`, `password`, `firstName`, `lastName`, `role`

**Response (201 Created):**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "teacher@school.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "teacher",
    "phone": "0601020304",
    "address": "123 School Street",
    "isActive": true
  }
}
```

### Get User

Get details of a specific user.

**Endpoint:** `GET /api/users/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Response (200 OK):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "teacher@school.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "teacher",
    "phone": "0601020304",
    "address": "123 School Street",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z"
  }
}
```

### Update User

Update user information.

**Endpoint:** `PUT /api/users/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Request Body:**
```json
{
  "email": "newemail@school.com",
  "firstName": "John",
  "lastName": "Smith",
  "role": "teacher",
  "phone": "0602030405",
  "address": "456 New Street",
  "isActive": true
}
```

**Note:** Password cannot be changed via this endpoint. Use the password endpoint instead.

**Response (200 OK):**
```json
{
  "message": "Utilisateur mis à jour avec succès",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "newemail@school.com",
    "firstName": "John",
    "lastName": "Smith",
    "role": "teacher",
    "phone": "0602030405",
    "address": "456 New Street",
    "isActive": true
  }
}
```

### Update User Password

Change a user's password.

**Endpoint:** `PUT /api/users/:id/password`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Note:** Password must be at least 6 characters long.

**Response (200 OK):**
```json
{
  "message": "Mot de passe mis à jour avec succès"
}
```

### Delete User

Delete a user account.

**Endpoint:** `DELETE /api/users/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Note:** 
- Cannot delete the last admin account
- Cannot delete student users (use student management instead)
- This is a permanent deletion, not a soft delete

**Response (200 OK):**
```json
{
  "message": "Utilisateur supprimé avec succès"
}
```

### Get User Statistics

Get statistics about users in the system.

**Endpoint:** `GET /api/users/stats`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Response (200 OK):**
```json
{
  "totalUsers": 50,
  "activeUsers": 48,
  "inactiveUsers": 2,
  "usersByRole": {
    "admin": 3,
    "teacher": 15,
    "parent": 30,
    "student": 2
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

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:**
```json
{
  "title": "Le Petit Prince",
  "author": "Antoine de Saint-Exupéry",
  "isbn": "978-2070408504",
  "category": "Fiction",
  "publisher": "Gallimard",
  "publishedYear": 1943,
  "description": "Un conte philosophique et poétique",
  "totalQuantity": 5,
  "location": "Étagère A1"
}
```

**Required Fields:** `title`, `author`, `category`

**Response (201 Created):**
```json
{
  "message": "Livre créé avec succès",
  "book": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Le Petit Prince",
    "author": "Antoine de Saint-Exupéry",
    "isbn": "978-2070408504",
    "category": "Fiction",
    "publisher": "Gallimard",
    "publishedYear": 1943,
    "description": "Un conte philosophique et poétique",
    "totalQuantity": 5,
    "availableQuantity": 5,
    "location": "Étagère A1",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Book

Get details of a specific book.

**Endpoint:** `GET /api/books/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "book": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Le Petit Prince",
    "author": "Antoine de Saint-Exupéry",
    "isbn": "978-2070408504",
    "category": "Fiction",
    "publisher": "Gallimard",
    "publishedYear": 1943,
    "description": "Un conte philosophique et poétique",
    "totalQuantity": 5,
    "availableQuantity": 3,
    "location": "Étagère A1",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Book

Update book information.

**Endpoint:** `PUT /api/books/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:** (all fields optional)
```json
{
  "title": "Le Petit Prince",
  "author": "Antoine de Saint-Exupéry",
  "isbn": "978-2070408504",
  "category": "Fiction",
  "publisher": "Gallimard",
  "publishedYear": 1943,
  "description": "Updated description",
  "totalQuantity": 6,
  "availableQuantity": 4,
  "location": "Étagère A2",
  "isActive": true
}
```

**Note:** `availableQuantity` cannot exceed `totalQuantity`

**Response (200 OK):**
```json
{
  "message": "Livre mis à jour avec succès",
  "book": {
    /* updated book object */
  }
}
```

### Delete Book

Soft delete (deactivate) a book.

**Endpoint:** `DELETE /api/books/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Note:** This is a soft delete. The book is marked as inactive but not removed from the database.

**Response (200 OK):**
```json
{
  "message": "Livre désactivé avec succès",
  "book": {
    /* book object with isActive: false */
  }
}
```

### Get Book Statistics

Get library statistics.

**Endpoint:** `GET /api/books/statistics`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "totalBooks": 45,
  "totalCopies": 156,
  "availableCopies": 98,
  "borrowedCopies": 58,
  "booksByCategory": [
    {
      "_id": "Fiction",
      "count": 15
    },
    {
      "_id": "Jeunesse",
      "count": 12
    },
    {
      "_id": "Aventure",
      "count": 8
    }
  ]
}
```

---

## Loans Endpoints

### List Loans

Get book loans with filters.

**Endpoint:** `GET /api/loans`

**Authentication:** Required

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Results per page
- `student` (ObjectId) - Filter by student ID
- `book` (ObjectId) - Filter by book ID
- `status` (string) - Filter by status (`borrowed`, `returned`, `overdue`)

**Statuses:**
- `borrowed` - Currently borrowed
- `returned` - Returned to library
- `overdue` - Past due date and not returned

**Response (200 OK):**
```json
{
  "loans": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "book": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Le Petit Prince",
        "author": "Antoine de Saint-Exupéry",
        "isbn": "978-2070408504"
      },
      "student": {
        "_id": "507f1f77bcf86cd799439013",
        "userId": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "borrowDate": "2024-01-15T10:00:00.000Z",
      "dueDate": "2024-01-29T10:00:00.000Z",
      "returnDate": null,
      "status": "borrowed",
      "notes": "Premier emprunt de l'année",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### Create Loan

Record a new book loan.

**Endpoint:** `POST /api/loans`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:**
```json
{
  "book": "507f1f77bcf86cd799439012",
  "student": "507f1f77bcf86cd799439013",
  "dueDate": "2024-01-29",
  "notes": "Premier emprunt de l'année"
}
```

**Required Fields:** `book`, `student`, `dueDate`

**Validation:**
- Book must exist and have available copies
- Student must exist
- Due date must be a valid future date

**Response (201 Created):**
```json
{
  "message": "Emprunt enregistré avec succès",
  "loan": {
    "_id": "507f1f77bcf86cd799439011",
    "book": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Le Petit Prince",
      "author": "Antoine de Saint-Exupéry",
      "isbn": "978-2070408504"
    },
    "student": {
      "userId": {
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "borrowDate": "2024-01-15T10:00:00.000Z",
    "dueDate": "2024-01-29T10:00:00.000Z",
    "status": "borrowed",
    "notes": "Premier emprunt de l'année"
  }
}
```

**Note:** When a loan is created, the book's `availableQuantity` is automatically decremented.

### Get Loan

Get details of a specific loan.

**Endpoint:** `GET /api/loans/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "loan": {
    "_id": "507f1f77bcf86cd799439011",
    "book": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Le Petit Prince",
      "author": "Antoine de Saint-Exupéry",
      "isbn": "978-2070408504"
    },
    "student": {
      "_id": "507f1f77bcf86cd799439013",
      "userId": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@school.com"
      }
    },
    "borrowDate": "2024-01-15T10:00:00.000Z",
    "dueDate": "2024-01-29T10:00:00.000Z",
    "returnDate": null,
    "status": "borrowed",
    "notes": "Premier emprunt de l'année"
  }
}
```

### Return Loan

Mark a loan as returned.

**Endpoint:** `POST /api/loans/:id/return`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:** None required

**Response (200 OK):**
```json
{
  "message": "Livre retourné avec succès",
  "loan": {
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
    "borrowDate": "2024-01-15T10:00:00.000Z",
    "dueDate": "2024-01-29T10:00:00.000Z",
    "returnDate": "2024-01-25T14:30:00.000Z",
    "status": "returned"
  }
}
```

**Note:** When a loan is returned, the book's `availableQuantity` is automatically incremented.

### Update Loan

Update loan information.

**Endpoint:** `PUT /api/loans/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:** (all fields optional)
```json
{
  "dueDate": "2024-02-05",
  "notes": "Extension accordée",
  "status": "borrowed"
}
```

**Response (200 OK):**
```json
{
  "message": "Emprunt mis à jour avec succès",
  "loan": {
    /* updated loan object */
  }
}
```

### Delete Loan

Delete a loan record.

**Endpoint:** `DELETE /api/loans/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Note:** If the loan is not returned, the book's `availableQuantity` will be automatically incremented before deletion.

**Response (200 OK):**
```json
{
  "message": "Emprunt supprimé avec succès"
}
```

### Get Student Loans

Get loan history and statistics for a specific student.

**Endpoint:** `GET /api/loans/student/:studentId`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "currentLoans": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "book": {
        "title": "Le Petit Prince",
        "author": "Antoine de Saint-Exupéry",
        "dueDate": "2024-01-29T10:00:00.000Z"
      }
    }
  ],
  "loanHistory": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "book": {
        "title": "Harry Potter",
        "author": "J.K. Rowling"
      },
      "returnDate": "2024-01-10T14:00:00.000Z"
    }
  ],
  "overdueLoans": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "book": {
        "title": "Le Lion",
        "author": "Joseph Kessel",
        "dueDate": "2024-01-05T10:00:00.000Z"
      }
    }
  ],
  "stats": {
    "currentLoansCount": 1,
    "totalLoansCount": 15,
    "overdueCount": 1
  }
}
```

### Update Overdue Loans

Automatically update the status of all loans past their due date to 'overdue'.

**Endpoint:** `POST /api/loans/update-overdue`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:** None required

**Response (200 OK):**
```json
{
  "message": "Statuts des emprunts en retard mis à jour",
  "updated": 5
}
```

**Note:** This endpoint is useful for batch processing overdue loans, typically run as a scheduled task.

---

## Invoices Endpoints

### List Invoices

Get invoices with filters and pagination.

**Endpoint:** `GET /api/invoices`

**Authentication:** Required

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Results per page
- `student` (ObjectId) - Filter by student ID
- `status` (string) - Filter by status
- `startDate` (ISO date) - Filter by issue date (from)
- `endDate` (ISO date) - Filter by issue date (to)

**Statuses:** `draft`, `sent`, `paid`, `overdue`, `cancelled`

**Response (200 OK):**
```json
{
  "invoices": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "invoiceNumber": "INV-2024-00001",
      "student": {
        "_id": "507f1f77bcf86cd799439012",
        "userId": {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "items": [
        {
          "description": "Frais de scolarité - Trimestre 1",
          "quantity": 1,
          "unitPrice": 50000,
          "totalPrice": 50000
        }
      ],
      "subtotal": 50000,
      "taxRate": 0,
      "taxAmount": 0,
      "totalAmount": 50000,
      "issueDate": "2024-01-15T10:00:00.000Z",
      "dueDate": "2024-02-15T10:00:00.000Z",
      "status": "sent",
      "notes": "Paiement avant le 15 février",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Create Invoice

Create a new invoice for a student.

**Endpoint:** `POST /api/invoices`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:**
```json
{
  "student": "507f1f77bcf86cd799439012",
  "items": [
    {
      "description": "Frais de scolarité - Trimestre 1",
      "quantity": 1,
      "unitPrice": 50000
    },
    {
      "description": "Fournitures scolaires",
      "quantity": 1,
      "unitPrice": 5000
    }
  ],
  "taxRate": 0,
  "dueDate": "2024-02-15",
  "notes": "Paiement avant le 15 février"
}
```

**Required Fields:** `student`, `items` (array with at least one item), `dueDate`

**Item Fields:**
- `description` (string, required) - Item description
- `quantity` (number, required) - Quantity
- `unitPrice` (number, required) - Unit price in FCFA

**Note:** Invoice number is automatically generated. Amounts are automatically calculated.

**Response (201 Created):**
```json
{
  "message": "Facture créée avec succès",
  "invoice": {
    "_id": "507f1f77bcf86cd799439011",
    "invoiceNumber": "INV-2024-00001",
    "student": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {
        "firstName": "John",
        "lastName": "Doe"
      }
    },
    "items": [
      {
        "description": "Frais de scolarité - Trimestre 1",
        "quantity": 1,
        "unitPrice": 50000,
        "totalPrice": 50000
      },
      {
        "description": "Fournitures scolaires",
        "quantity": 1,
        "unitPrice": 5000,
        "totalPrice": 5000
      }
    ],
    "subtotal": 55000,
    "taxRate": 0,
    "taxAmount": 0,
    "totalAmount": 55000,
    "issueDate": "2024-01-15T10:00:00.000Z",
    "dueDate": "2024-02-15T10:00:00.000Z",
    "status": "draft"
  }
}
```

### Get Invoice

Get details of a specific invoice.

**Endpoint:** `GET /api/invoices/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "invoice": {
    "_id": "507f1f77bcf86cd799439011",
    "invoiceNumber": "INV-2024-00001",
    "student": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@school.com"
      }
    },
    "items": [ /* items array */ ],
    "subtotal": 55000,
    "taxRate": 0,
    "taxAmount": 0,
    "totalAmount": 55000,
    "issueDate": "2024-01-15T10:00:00.000Z",
    "dueDate": "2024-02-15T10:00:00.000Z",
    "status": "sent",
    "notes": "Paiement avant le 15 février"
  }
}
```

### Update Invoice

Update invoice information.

**Endpoint:** `PUT /api/invoices/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:** (all fields optional)
```json
{
  "items": [
    {
      "description": "Frais de scolarité - Trimestre 1",
      "quantity": 1,
      "unitPrice": 52000
    }
  ],
  "taxRate": 0,
  "dueDate": "2024-02-20",
  "status": "sent",
  "notes": "Date limite prolongée"
}
```

**Note:** Cannot modify paid or cancelled invoices. Amounts are automatically recalculated when items are updated.

**Response (200 OK):**
```json
{
  "message": "Facture mise à jour avec succès",
  "invoice": {
    /* updated invoice object */
  }
}
```

### Record Payment

Record payment for an invoice.

**Endpoint:** `POST /api/invoices/:id/payment`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:**
```json
{
  "paymentDate": "2024-02-10",
  "paymentMethod": "Espèces",
  "paymentReference": "REF-2024-001"
}
```

**Payment Methods:** `Espèces`, `Chèque`, `Virement bancaire`, `Mobile Money`, `Autre`

**Response (200 OK):**
```json
{
  "message": "Paiement enregistré avec succès",
  "invoice": {
    "_id": "507f1f77bcf86cd799439011",
    "invoiceNumber": "INV-2024-00001",
    "status": "paid",
    "paymentDate": "2024-02-10T10:00:00.000Z",
    "paymentMethod": "Espèces",
    "paymentReference": "REF-2024-001",
    "totalAmount": 55000
  }
}
```

### Delete Invoice

Delete an invoice.

**Endpoint:** `DELETE /api/invoices/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Note:** Cannot delete paid invoices. Cancel them instead by updating status to `cancelled`.

**Response (200 OK):**
```json
{
  "message": "Facture supprimée avec succès"
}
```

### Get Invoice Statistics

Get invoice statistics and revenue information.

**Endpoint:** `GET /api/invoices/stats`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Response (200 OK):**
```json
{
  "stats": [
    {
      "_id": "paid",
      "count": 45,
      "totalAmount": 2250000
    },
    {
      "_id": "sent",
      "count": 12,
      "totalAmount": 600000
    },
    {
      "_id": "draft",
      "count": 3,
      "totalAmount": 150000
    }
  ],
  "totalInvoices": 60,
  "totalRevenue": 2250000,
  "overdueInvoices": 5
}
```

---

## Events Endpoints

### List Events

Get school events with filters and pagination.

**Endpoint:** `GET /api/events`

**Authentication:** Required

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Results per page
- `eventType` (string) - Filter by event type
- `status` (string) - Filter by status
- `startDate` (ISO date) - Filter events starting from this date
- `endDate` (ISO date) - Filter events ending before this date
- `search` (string) - Search in title or description

**Event Types:** `meeting`, `celebration`, `trip`, `training`, `parent_meeting`, `other`

**Event Statuses:** `planned`, `ongoing`, `completed`, `cancelled`

**Response (200 OK):**
```json
{
  "events": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Réunion parents-professeurs",
      "description": "Rencontre avec les parents d'élèves",
      "eventType": "parent_meeting",
      "startDate": "2024-02-15T14:00:00.000Z",
      "endDate": "2024-02-15T17:00:00.000Z",
      "location": "Salle polyvalente",
      "organizer": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Marie",
        "lastName": "Dupont",
        "email": "marie.dupont@school.com"
      },
      "targetAudience": ["parents", "teachers"],
      "classes": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "name": "CE1-A",
          "level": "CE1"
        }
      ],
      "maxParticipants": 50,
      "currentParticipants": 32,
      "status": "planned",
      "notes": "Prévoir un espace pour les questions",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439014",
        "firstName": "Admin",
        "lastName": "User"
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "pages": 2,
    "limit": 10
  }
}
```

### Create Event

Create a new school event.

**Endpoint:** `POST /api/events`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:**
```json
{
  "title": "Réunion parents-professeurs",
  "description": "Rencontre avec les parents d'élèves",
  "eventType": "parent_meeting",
  "startDate": "2024-02-15T14:00:00.000Z",
  "endDate": "2024-02-15T17:00:00.000Z",
  "location": "Salle polyvalente",
  "organizer": "507f1f77bcf86cd799439012",
  "targetAudience": ["parents", "teachers"],
  "classes": ["507f1f77bcf86cd799439013"],
  "maxParticipants": 50,
  "notes": "Prévoir un espace pour les questions"
}
```

**Required Fields:** `title`, `eventType`, `startDate`, `endDate`

**Target Audience Options:** `all`, `students`, `teachers`, `parents`, `staff`

**Validation:**
- End date must be after start date
- Classes must exist if provided

**Response (201 Created):**
```json
{
  "message": "Événement créé avec succès",
  "event": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Réunion parents-professeurs",
    "description": "Rencontre avec les parents d'élèves",
    "eventType": "parent_meeting",
    "startDate": "2024-02-15T14:00:00.000Z",
    "endDate": "2024-02-15T17:00:00.000Z",
    "location": "Salle polyvalente",
    "organizer": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Marie",
      "lastName": "Dupont",
      "email": "marie.dupont@school.com"
    },
    "targetAudience": ["parents", "teachers"],
    "classes": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "CE1-A",
        "level": "CE1"
      }
    ],
    "maxParticipants": 50,
    "currentParticipants": 0,
    "status": "planned",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439014",
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

### Get Event

Get details of a specific event.

**Endpoint:** `GET /api/events/:id`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "event": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Réunion parents-professeurs",
    "description": "Rencontre avec les parents d'élèves",
    "eventType": "parent_meeting",
    "startDate": "2024-02-15T14:00:00.000Z",
    "endDate": "2024-02-15T17:00:00.000Z",
    "location": "Salle polyvalente",
    "organizer": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Marie",
      "lastName": "Dupont",
      "email": "marie.dupont@school.com",
      "phone": "0601020304"
    },
    "targetAudience": ["parents", "teachers"],
    "classes": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "CE1-A",
        "level": "CE1",
        "academicYear": "2024-2025"
      }
    ],
    "maxParticipants": 50,
    "currentParticipants": 32,
    "status": "planned",
    "notes": "Prévoir un espace pour les questions",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439014",
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

### Update Event

Update event information.

**Endpoint:** `PUT /api/events/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:** (all fields optional)
```json
{
  "title": "Réunion parents-professeurs - Modifié",
  "description": "Description mise à jour",
  "eventType": "parent_meeting",
  "startDate": "2024-02-15T15:00:00.000Z",
  "endDate": "2024-02-15T18:00:00.000Z",
  "location": "Grande salle",
  "organizer": "507f1f77bcf86cd799439012",
  "targetAudience": ["parents", "teachers", "students"],
  "classes": ["507f1f77bcf86cd799439013"],
  "maxParticipants": 60,
  "status": "ongoing",
  "notes": "Mise à jour des informations"
}
```

**Response (200 OK):**
```json
{
  "message": "Événement mis à jour avec succès",
  "event": {
    /* updated event object */
  }
}
```

### Delete Event

Delete an event.

**Endpoint:** `DELETE /api/events/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Note:** This is a permanent deletion.

**Response (200 OK):**
```json
{
  "message": "Événement supprimé avec succès"
}
```

### Get Event Statistics

Get event statistics.

**Endpoint:** `GET /api/events/stats`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Response (200 OK):**
```json
{
  "totalEvents": 25,
  "upcomingEvents": 8,
  "ongoingEvents": 2,
  "completedEvents": 12,
  "eventsByType": [
    {
      "_id": "parent_meeting",
      "count": 8
    },
    {
      "_id": "celebration",
      "count": 6
    },
    {
      "_id": "trip",
      "count": 5
    },
    {
      "_id": "training",
      "count": 4
    },
    {
      "_id": "meeting",
      "count": 2
    }
  ]
}
```

---

## Expenses Endpoints

### List Expenses

Get expense records with filters and pagination.

**Endpoint:** `GET /api/expenses`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Results per page
- `category` (string) - Filter by category
- `status` (string) - Filter by status
- `startDate` (ISO date) - Filter by expense date (from)
- `endDate` (ISO date) - Filter by expense date (to)
- `search` (string) - Search in title or description

**Categories:** `Salaires`, `Fournitures`, `Entretien`, `Électricité et eau`, `Transport`, `Autres dépenses`

**Statuses:** `pending`, `approved`, `paid`, `rejected`

**Response (200 OK):**
```json
{
  "expenses": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "expenseNumber": "EXP-2024-00001",
      "title": "Achat de fournitures scolaires",
      "description": "Cahiers, stylos et crayons",
      "category": "Fournitures",
      "amount": 75000,
      "expenseDate": "2024-01-15T10:00:00.000Z",
      "supplier": "Librairie Moderne",
      "supplierContact": "0601020304",
      "status": "approved",
      "approvedBy": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@school.com"
      },
      "approvalDate": "2024-01-16T10:00:00.000Z",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Marie",
        "lastName": "Dupont",
        "email": "marie@school.com"
      },
      "notes": "Pour les classes CE1 et CE2",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-16T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

### Create Expense

Create a new expense record.

**Endpoint:** `POST /api/expenses`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:**
```json
{
  "title": "Achat de fournitures scolaires",
  "description": "Cahiers, stylos et crayons",
  "category": "Fournitures",
  "amount": 75000,
  "expenseDate": "2024-01-15",
  "supplier": "Librairie Moderne",
  "supplierContact": "0601020304",
  "notes": "Pour les classes CE1 et CE2"
}
```

**Required Fields:** `title`, `category`, `amount`, `expenseDate`

**Note:** Expense number is automatically generated. Status is set to `pending` by default.

**Response (201 Created):**
```json
{
  "message": "Dépense créée avec succès",
  "expense": {
    "_id": "507f1f77bcf86cd799439011",
    "expenseNumber": "EXP-2024-00001",
    "title": "Achat de fournitures scolaires",
    "description": "Cahiers, stylos et crayons",
    "category": "Fournitures",
    "amount": 75000,
    "expenseDate": "2024-01-15T10:00:00.000Z",
    "supplier": "Librairie Moderne",
    "supplierContact": "0601020304",
    "status": "pending",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Marie",
      "lastName": "Dupont",
      "email": "marie@school.com"
    },
    "notes": "Pour les classes CE1 et CE2"
  }
}
```

### Get Expense

Get details of a specific expense.

**Endpoint:** `GET /api/expenses/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Response (200 OK):**
```json
{
  "expense": {
    "_id": "507f1f77bcf86cd799439011",
    "expenseNumber": "EXP-2024-00001",
    "title": "Achat de fournitures scolaires",
    "description": "Cahiers, stylos et crayons",
    "category": "Fournitures",
    "amount": 75000,
    "expenseDate": "2024-01-15T10:00:00.000Z",
    "supplier": "Librairie Moderne",
    "supplierContact": "0601020304",
    "status": "approved",
    "approvedBy": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@school.com"
    },
    "approvalDate": "2024-01-16T10:00:00.000Z",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Marie",
      "lastName": "Dupont",
      "email": "marie@school.com",
      "phone": "0601020304"
    },
    "notes": "Pour les classes CE1 et CE2"
  }
}
```

### Update Expense

Update expense information.

**Endpoint:** `PUT /api/expenses/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:** (all fields optional)
```json
{
  "title": "Achat de fournitures scolaires - Modifié",
  "description": "Description mise à jour",
  "category": "Fournitures",
  "amount": 80000,
  "expenseDate": "2024-01-15",
  "supplier": "Nouveau Fournisseur",
  "supplierContact": "0602030405",
  "status": "pending",
  "notes": "Mise à jour des informations"
}
```

**Response (200 OK):**
```json
{
  "message": "Dépense mise à jour avec succès",
  "expense": {
    /* updated expense object */
  }
}
```

### Approve Expense

Approve a pending expense.

**Endpoint:** `POST /api/expenses/:id/approve`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Request Body:** None required

**Validation:**
- Expense must exist
- Expense status must be `pending`

**Response (200 OK):**
```json
{
  "message": "Dépense approuvée avec succès",
  "expense": {
    "_id": "507f1f77bcf86cd799439011",
    "expenseNumber": "EXP-2024-00001",
    "title": "Achat de fournitures scolaires",
    "status": "approved",
    "approvedBy": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@school.com"
    },
    "approvalDate": "2024-01-16T10:00:00.000Z"
  }
}
```

### Record Payment

Record payment for an approved expense.

**Endpoint:** `POST /api/expenses/:id/payment`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Request Body:**
```json
{
  "paymentDate": "2024-01-17",
  "paymentMethod": "Virement bancaire",
  "paymentReference": "REF-2024-001"
}
```

**Payment Methods:** `Espèces`, `Chèque`, `Virement bancaire`, `Mobile Money`, `Autre`

**Validation:**
- Expense must exist
- Expense status must be `approved`

**Response (200 OK):**
```json
{
  "message": "Paiement enregistré avec succès",
  "expense": {
    "_id": "507f1f77bcf86cd799439011",
    "expenseNumber": "EXP-2024-00001",
    "title": "Achat de fournitures scolaires",
    "status": "paid",
    "amount": 75000,
    "paymentDate": "2024-01-17T10:00:00.000Z",
    "paymentMethod": "Virement bancaire",
    "paymentReference": "REF-2024-001"
  }
}
```

### Delete Expense

Delete an expense.

**Endpoint:** `DELETE /api/expenses/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Note:** Cannot delete paid expenses. Only pending or rejected expenses can be deleted.

**Response (200 OK):**
```json
{
  "message": "Dépense supprimée avec succès"
}
```

### Get Expense Statistics

Get expense statistics.

**Endpoint:** `GET /api/expenses/stats`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Response (200 OK):**
```json
{
  "totalExpenses": 125,
  "pendingExpenses": 15,
  "approvedExpenses": 8,
  "paidExpenses": 98,
  "totalAmount": 5250000,
  "paidAmount": 4800000,
  "expensesByCategory": [
    {
      "_id": "Salaires",
      "count": 45,
      "totalAmount": 3000000
    },
    {
      "_id": "Fournitures",
      "count": 32,
      "totalAmount": 850000
    },
    {
      "_id": "Entretien",
      "count": 20,
      "totalAmount": 600000
    },
    {
      "_id": "Électricité et eau",
      "count": 15,
      "totalAmount": 450000
    },
    {
      "_id": "Transport",
      "count": 10,
      "totalAmount": 250000
    },
    {
      "_id": "Autres dépenses",
      "count": 3,
      "totalAmount": 100000
    }
  ]
}
```

---

## Messages Endpoints

### List Messages

Get messages for the authenticated user (inbox or sent).

**Endpoint:** `GET /api/messages`

**Authentication:** Required

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Results per page
- `box` (string, default: 'inbox') - Message box (`inbox` or `sent`)
- `category` (string) - Filter by category
- `priority` (string) - Filter by priority
- `unreadOnly` (boolean) - Show only unread messages (inbox only)
- `search` (string) - Search in subject and content

**Categories:** `general`, `urgent`, `information`, `administrative`, `pedagogical`

**Priorities:** `low`, `normal`, `high`

**Response (200 OK):**
```json
{
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "subject": "Réunion pédagogique",
      "content": "Réunion prévue le vendredi 20 janvier",
      "sender": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@school.com",
        "role": "admin"
      },
      "recipients": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "Marie",
          "lastName": "Dupont",
          "email": "marie@school.com",
          "role": "teacher"
        }
      ],
      "conversationId": "550e8400-e29b-41d4-a716-446655440000",
      "priority": "high",
      "category": "pedagogical",
      "parentMessage": null,
      "isArchived": false,
      "readBy": [
        {
          "user": "507f1f77bcf86cd799439013",
          "readAt": "2024-01-16T14:30:00.000Z"
        }
      ],
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-16T14:30:00.000Z"
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

### Create Message

Send a new message.

**Endpoint:** `POST /api/messages`

**Authentication:** Required

**Request Body:**
```json
{
  "subject": "Réunion pédagogique",
  "content": "Réunion prévue le vendredi 20 janvier à 14h00 en salle des professeurs.",
  "recipients": [
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439014"
  ],
  "priority": "high",
  "category": "pedagogical",
  "parentMessage": null
}
```

**Required Fields:** `subject`, `content`, `recipients` (array with at least one user ID)

**Note:** When replying to a message, include the `parentMessage` field with the ID of the original message. The conversation ID is automatically managed.

**Response (201 Created):**
```json
{
  "message": "Message envoyé avec succès",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "subject": "Réunion pédagogique",
    "content": "Réunion prévue le vendredi 20 janvier à 14h00 en salle des professeurs.",
    "sender": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@school.com",
      "role": "admin"
    },
    "recipients": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Marie",
        "lastName": "Dupont",
        "email": "marie@school.com",
        "role": "teacher"
      }
    ],
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "priority": "high",
    "category": "pedagogical",
    "parentMessage": null,
    "isArchived": false,
    "readBy": []
  }
}
```

### Get Message

Get details of a specific message.

**Endpoint:** `GET /api/messages/:id`

**Authentication:** Required

**Authorization:** Sender, recipients, or admin only

**Response (200 OK):**
```json
{
  "message": {
    "_id": "507f1f77bcf86cd799439011",
    "subject": "Réunion pédagogique",
    "content": "Réunion prévue le vendredi 20 janvier à 14h00 en salle des professeurs.",
    "sender": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@school.com",
      "role": "admin"
    },
    "recipients": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Marie",
        "lastName": "Dupont",
        "email": "marie@school.com",
        "role": "teacher"
      }
    ],
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "priority": "high",
    "category": "pedagogical",
    "parentMessage": {
      "_id": "507f1f77bcf86cd799439010",
      "subject": "Re: Planning",
      "sender": "507f1f77bcf86cd799439013",
      "createdAt": "2024-01-14T10:00:00.000Z"
    },
    "isArchived": false,
    "readBy": [
      {
        "user": "507f1f77bcf86cd799439013",
        "readAt": "2024-01-16T14:30:00.000Z"
      }
    ]
  }
}
```

### Mark as Read

Mark a message as read by the authenticated user.

**Endpoint:** `PATCH /api/messages/:id/read`

**Authentication:** Required

**Authorization:** Recipients only

**Request Body:** None required

**Response (200 OK):**
```json
{
  "message": "Message marqué comme lu",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "subject": "Réunion pédagogique",
    "readBy": [
      {
        "user": "507f1f77bcf86cd799439013",
        "readAt": "2024-01-16T14:30:00.000Z"
      }
    ]
  }
}
```

### Archive Message

Archive a message.

**Endpoint:** `PATCH /api/messages/:id/archive`

**Authentication:** Required

**Authorization:** Sender, recipients, or admin only

**Request Body:** None required

**Response (200 OK):**
```json
{
  "message": "Message archivé avec succès"
}
```

### Delete Message

Delete a message.

**Endpoint:** `DELETE /api/messages/:id`

**Authentication:** Required

**Authorization:** Sender or admin only

**Note:** Only the sender or an admin can delete a message. This is a permanent deletion.

**Response (200 OK):**
```json
{
  "message": "Message supprimé avec succès"
}
```

### Get Conversation

Get all messages in a conversation thread.

**Endpoint:** `GET /api/messages/conversation/:conversationId`

**Authentication:** Required

**Authorization:** Users who are sender or recipient of any message in the conversation

**Response (200 OK):**
```json
{
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439010",
      "subject": "Planning",
      "content": "Pouvez-vous partager le planning?",
      "sender": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Marie",
        "lastName": "Dupont",
        "email": "marie@school.com",
        "role": "teacher"
      },
      "recipients": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@school.com",
          "role": "admin"
        }
      ],
      "conversationId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2024-01-14T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439011",
      "subject": "Re: Planning",
      "content": "Voici le planning demandé.",
      "sender": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@school.com",
        "role": "admin"
      },
      "recipients": [
        {
          "_id": "507f1f77bcf86cd799439013",
          "firstName": "Marie",
          "lastName": "Dupont",
          "email": "marie@school.com",
          "role": "teacher"
        }
      ],
      "conversationId": "550e8400-e29b-41d4-a716-446655440000",
      "parentMessage": "507f1f77bcf86cd799439010",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "conversationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Get Message Statistics

Get message statistics for the authenticated user.

**Endpoint:** `GET /api/messages/stats`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "totalReceived": 125,
  "totalSent": 45,
  "unreadCount": 12,
  "readPercentage": "90.4",
  "byCategory": {
    "general": 35,
    "pedagogical": 28,
    "administrative": 42,
    "urgent": 15,
    "information": 5
  },
  "byPriority": {
    "low": 20,
    "normal": 85,
    "high": 20
  }
}
```

---

## Budgets Endpoints

### List Budgets

Get budgets with filters and pagination.

**Endpoint:** `GET /api/budgets`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Results per page
- `fiscalYear` (string) - Filter by fiscal year (e.g., "2024")
- `status` (string) - Filter by status

**Statuses:** `draft`, `active`, `closed`

**Response (200 OK):**
```json
{
  "budgets": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Budget 2024-2025",
      "fiscalYear": "2024",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z",
      "totalBudget": 10000000,
      "incomeItems": [
        {
          "category": "Frais de scolarité",
          "allocatedAmount": 8000000,
          "spentAmount": 5000000,
          "description": "Frais de scolarité des élèves"
        }
      ],
      "expenseItems": [
        {
          "category": "Salaires",
          "allocatedAmount": 6000000,
          "spentAmount": 3500000,
          "description": "Salaires du personnel"
        }
      ],
      "status": "active",
      "notes": "Budget prévisionnel pour l'année scolaire 2024-2025",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@school.com"
      },
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
  }
}
```

### Create Budget

Create a new budget for a fiscal year.

**Endpoint:** `POST /api/budgets`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:**
```json
{
  "name": "Budget 2024-2025",
  "fiscalYear": "2024",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "totalBudget": 10000000,
  "incomeItems": [
    {
      "category": "Frais de scolarité",
      "allocatedAmount": 8000000,
      "spentAmount": 0,
      "description": "Frais de scolarité des élèves"
    },
    {
      "category": "Subventions",
      "allocatedAmount": 2000000,
      "spentAmount": 0,
      "description": "Subventions gouvernementales"
    }
  ],
  "expenseItems": [
    {
      "category": "Salaires",
      "allocatedAmount": 6000000,
      "spentAmount": 0,
      "description": "Salaires du personnel"
    },
    {
      "category": "Fournitures",
      "allocatedAmount": 1500000,
      "spentAmount": 0,
      "description": "Fournitures scolaires"
    },
    {
      "category": "Entretien",
      "allocatedAmount": 800000,
      "spentAmount": 0,
      "description": "Entretien des bâtiments et équipements"
    }
  ],
  "status": "draft",
  "notes": "Budget prévisionnel pour l'année scolaire 2024-2025"
}
```

**Required Fields:** `name`, `fiscalYear`, `startDate`, `endDate`, `totalBudget`

**Response (201 Created):**
```json
{
  "message": "Budget créé avec succès",
  "budget": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Budget 2024-2025",
    "fiscalYear": "2024",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "totalBudget": 10000000,
    "incomeItems": [ /* ... */ ],
    "expenseItems": [ /* ... */ ],
    "status": "draft",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@school.com"
    }
  }
}
```

### Get Budget

Get details of a specific budget.

**Endpoint:** `GET /api/budgets/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Response (200 OK):**
```json
{
  "budget": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Budget 2024-2025",
    "fiscalYear": "2024",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.000Z",
    "totalBudget": 10000000,
    "incomeItems": [ /* ... */ ],
    "expenseItems": [ /* ... */ ],
    "status": "active",
    "notes": "Budget prévisionnel pour l'année scolaire 2024-2025",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@school.com"
    }
  }
}
```

### Update Budget

Update budget information.

**Endpoint:** `PUT /api/budgets/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:** (all fields optional)
```json
{
  "name": "Budget 2024-2025 - Révisé",
  "totalBudget": 11000000,
  "incomeItems": [ /* updated items */ ],
  "expenseItems": [ /* updated items */ ],
  "status": "active",
  "notes": "Budget révisé en février"
}
```

**Response (200 OK):**
```json
{
  "message": "Budget mis à jour avec succès",
  "budget": {
    /* updated budget object */
  }
}
```

### Delete Budget

Delete a budget.

**Endpoint:** `DELETE /api/budgets/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Response (200 OK):**
```json
{
  "message": "Budget supprimé avec succès"
}
```

### Get Budget Comparison

Compare budget allocations with actual transactions.

**Endpoint:** `GET /api/budgets/:id/comparison`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Response (200 OK):**
```json
{
  "budget": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Budget 2024-2025",
    "fiscalYear": "2024"
  },
  "incomeItems": [
    {
      "category": "Frais de scolarité",
      "allocatedAmount": 8000000,
      "spentAmount": 5000000,
      "actualAmount": 5200000,
      "variance": -2800000,
      "description": "Frais de scolarité des élèves"
    }
  ],
  "expenseItems": [
    {
      "category": "Salaires",
      "allocatedAmount": 6000000,
      "spentAmount": 3500000,
      "actualAmount": 3600000,
      "variance": 2400000,
      "description": "Salaires du personnel"
    }
  ],
  "summary": {
    "totalAllocatedIncome": 10000000,
    "totalActualIncome": 5200000,
    "incomeVariance": -4800000,
    "totalAllocatedExpenses": 8300000,
    "totalActualExpenses": 3600000,
    "expenseVariance": 4700000,
    "projectedBalance": 1700000,
    "actualBalance": 1600000
  }
}
```

**Note:** Variance for income is actual - allocated (positive = exceeded target). Variance for expenses is allocated - actual (positive = under budget).

---

## Transactions Endpoints

### List Transactions

Get financial transactions with filters and pagination.

**Endpoint:** `GET /api/transactions`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Results per page
- `type` (string) - Filter by type (`income` or `expense`)
- `category` (string) - Filter by category
- `fiscalYear` (string) - Filter by fiscal year
- `startDate` (ISO date) - Filter by transaction date (from)
- `endDate` (ISO date) - Filter by transaction date (to)
- `search` (string) - Search in description, reference, or transaction number

**Transaction Types:** `income`, `expense`

**Response (200 OK):**
```json
{
  "transactions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "transactionNumber": "TRX-2024-00001",
      "type": "income",
      "amount": 50000,
      "category": "Frais de scolarité",
      "description": "Paiement frais de scolarité - Trimestre 1",
      "transactionDate": "2024-01-15T10:00:00.000Z",
      "paymentMethod": "Virement bancaire",
      "reference": "REF-2024-001",
      "relatedInvoice": {
        "_id": "507f1f77bcf86cd799439012",
        "invoiceNumber": "INV-2024-00001"
      },
      "relatedExpense": null,
      "fiscalYear": "2024",
      "notes": "Premier paiement de l'année",
      "createdBy": {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@school.com"
      },
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 125,
    "pages": 7
  }
}
```

### Create Transaction

Record a new financial transaction.

**Endpoint:** `POST /api/transactions`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:**
```json
{
  "type": "income",
  "amount": 50000,
  "category": "Frais de scolarité",
  "description": "Paiement frais de scolarité - Trimestre 1",
  "transactionDate": "2024-01-15",
  "paymentMethod": "Virement bancaire",
  "reference": "REF-2024-001",
  "relatedInvoice": "507f1f77bcf86cd799439012",
  "relatedExpense": null,
  "fiscalYear": "2024",
  "notes": "Premier paiement de l'année"
}
```

**Required Fields:** `type`, `amount`, `category`, `description`

**Payment Methods:** `Espèces`, `Chèque`, `Virement bancaire`, `Mobile Money`, `Carte bancaire`, `Autre`

**Note:** Transaction number is automatically generated. If `transactionDate` is not provided, current date is used. If `fiscalYear` is not provided, current year is used.

**Response (201 Created):**
```json
{
  "message": "Transaction créée avec succès",
  "transaction": {
    "_id": "507f1f77bcf86cd799439011",
    "transactionNumber": "TRX-2024-00001",
    "type": "income",
    "amount": 50000,
    "category": "Frais de scolarité",
    "description": "Paiement frais de scolarité - Trimestre 1",
    "transactionDate": "2024-01-15T10:00:00.000Z",
    "paymentMethod": "Virement bancaire",
    "reference": "REF-2024-001",
    "fiscalYear": "2024",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@school.com"
    }
  }
}
```

### Get Transaction

Get details of a specific transaction.

**Endpoint:** `GET /api/transactions/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Response (200 OK):**
```json
{
  "transaction": {
    "_id": "507f1f77bcf86cd799439011",
    "transactionNumber": "TRX-2024-00001",
    "type": "income",
    "amount": 50000,
    "category": "Frais de scolarité",
    "description": "Paiement frais de scolarité - Trimestre 1",
    "transactionDate": "2024-01-15T10:00:00.000Z",
    "paymentMethod": "Virement bancaire",
    "reference": "REF-2024-001",
    "relatedInvoice": {
      "_id": "507f1f77bcf86cd799439012",
      "invoiceNumber": "INV-2024-00001",
      "amount": 50000
    },
    "relatedExpense": null,
    "fiscalYear": "2024",
    "notes": "Premier paiement de l'année",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@school.com"
    }
  }
}
```

### Update Transaction

Update transaction information.

**Endpoint:** `PUT /api/transactions/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Request Body:** (all fields optional)
```json
{
  "type": "income",
  "amount": 52000,
  "category": "Frais de scolarité",
  "description": "Description mise à jour",
  "transactionDate": "2024-01-15",
  "paymentMethod": "Espèces",
  "reference": "REF-2024-001-UPDATED",
  "fiscalYear": "2024",
  "notes": "Montant corrigé"
}
```

**Response (200 OK):**
```json
{
  "message": "Transaction mise à jour avec succès",
  "transaction": {
    /* updated transaction object */
  }
}
```

### Delete Transaction

Delete a transaction.

**Endpoint:** `DELETE /api/transactions/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**Response (200 OK):**
```json
{
  "message": "Transaction supprimée avec succès"
}
```

### Get Transaction Statistics

Get financial statistics for a fiscal year.

**Endpoint:** `GET /api/transactions/stats`

**Authentication:** Required (Bearer token)

**Authorization:** Admin and teachers only

**Query Parameters:**
- `fiscalYear` (string, optional) - Fiscal year to get stats for (default: current year)

**Response (200 OK):**
```json
{
  "fiscalYear": "2024",
  "totalIncome": 8500000,
  "totalExpenses": 6200000,
  "balance": 2300000,
  "transactionCount": 245,
  "incomeByCategory": {
    "Frais de scolarité": 7500000,
    "Subventions": 800000,
    "Autres revenus": 200000
  },
  "expensesByCategory": {
    "Salaires": 4000000,
    "Fournitures": 850000,
    "Entretien": 600000,
    "Électricité et eau": 450000,
    "Transport": 250000,
    "Autres dépenses": 50000
  },
  "monthlyData": {
    "2024-01": {
      "income": 800000,
      "expenses": 550000
    },
    "2024-02": {
      "income": 750000,
      "expenses": 520000
    },
    "2024-03": {
      "income": 720000,
      "expenses": 530000
    }
  }
}
```

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
