# Schoman API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register User
**POST** `/auth/register`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student",
  "phone": "+1234567890",
  "address": "123 Main St",
  "schoolId": "school_id_here"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  }
}
```

### Login
**POST** `/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "schoolId": "school_id"
  }
}
```

### Get Profile
**GET** `/auth/profile`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "phone": "+1234567890",
    "address": "123 Main St",
    "schoolId": "school_id"
  }
}
```

## Students

### Get All Students
**GET** `/students`

Headers:
```
Authorization: Bearer <token>
```

Query parameters:
- `schoolId` (optional): Filter by school ID

Response:
```json
{
  "students": [
    {
      "_id": "student_id",
      "userId": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "studentId": "STU001",
      "dateOfBirth": "2005-01-15",
      "classId": {
        "_id": "class_id",
        "name": "Grade 10A"
      },
      "enrollmentDate": "2023-09-01"
    }
  ]
}
```

### Get Student by ID
**GET** `/students/:id`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "student": {
    "_id": "student_id",
    "userId": {...},
    "studentId": "STU001",
    "dateOfBirth": "2005-01-15",
    "classId": {...},
    "parentId": {...},
    "enrollmentDate": "2023-09-01",
    "medicalInfo": "No allergies",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1234567890",
      "relationship": "Mother"
    }
  }
}
```

### Create Student (Admin only)
**POST** `/students`

Headers:
```
Authorization: Bearer <token>
```

Request body:
```json
{
  "email": "student@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "STU001",
  "dateOfBirth": "2005-01-15",
  "classId": "class_id_here",
  "parentId": "parent_user_id_here",
  "medicalInfo": "No allergies",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1234567890",
    "relationship": "Mother"
  },
  "schoolId": "school_id_here"
}
```

Response:
```json
{
  "message": "Student created successfully",
  "student": {...}
}
```

### Update Student (Admin only)
**PUT** `/students/:id`

Headers:
```
Authorization: Bearer <token>
```

Request body: (all fields optional)
```json
{
  "classId": "new_class_id",
  "medicalInfo": "Updated medical info"
}
```

Response:
```json
{
  "message": "Student updated successfully",
  "student": {...}
}
```

### Delete/Deactivate Student (Admin only)
**DELETE** `/students/:id`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Student deactivated successfully"
}
```

## Dashboard

### Get Dashboard Statistics
**GET** `/dashboard/stats`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "stats": {
    "totalStudents": 250,
    "totalTeachers": 30,
    "attendanceRate": 92.5,
    "revenue": 150000,
    "expenses": 80000,
    "netIncome": 70000,
    "pendingInvoices": 15
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided, authorization denied"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden: Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error",
  "error": "Error details (in development mode)"
}
```

## Models Reference

### User Roles
- `admin` - Full system access
- `teacher` - Can manage classes, grades, attendance
- `student` - Can view own information
- `parent` - Can view child's information

### Attendance Status
- `present`
- `absent`
- `late`
- `excused`

### Invoice Status
- `pending`
- `paid`
- `overdue`
- `cancelled`

### Payment Methods
- `cash`
- `bank_transfer`
- `credit_card`
- `check`
- `online`

### Expense Categories
- `salary`
- `supplies`
- `maintenance`
- `utilities`
- `rent`
- `insurance`
- `other`

### Event Types
- `meeting`
- `celebration`
- `field_trip`
- `parent_teacher`
- `sports`
- `other`

## Notes

1. All dates should be in ISO 8601 format (e.g., "2023-09-01T00:00:00.000Z")
2. All monetary amounts are in the smallest currency unit (e.g., cents for USD)
3. JWT tokens expire after 7 days by default
4. All timestamps are automatically generated by MongoDB
5. Soft delete is used for users (isActive flag set to false)
