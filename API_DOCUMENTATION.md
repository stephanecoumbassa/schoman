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
13. [Dashboard](#dashboard-endpoints)

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
