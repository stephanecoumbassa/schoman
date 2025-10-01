# Schoman Database Schema Documentation

This document describes the MongoDB database schema for the Schoman school management system.

## Overview

Schoman uses MongoDB as its database, with Mongoose as the ODM (Object Document Mapper). The database is organized into collections that represent different entities in the school management system.

## Collections

### 1. Users

Stores all system users including administrators, teachers, students, and parents.

**Collection Name**: `users`

**Fields**:
```javascript
{
  _id: ObjectId,
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  firstName: String (required),
  lastName: String (required),
  role: String (required, enum: ['admin', 'teacher', 'student', 'parent']),
  phone: String,
  address: String,
  schoolId: ObjectId (ref: 'School'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email`: unique index
- `schoolId`: regular index for filtering by school

**Notes**:
- Passwords are hashed using bcryptjs before storage
- Soft delete is implemented using the `isActive` flag
- Role determines access permissions throughout the system

---

### 2. Schools

Stores information about schools or campuses in a multi-establishment setup.

**Collection Name**: `schools`

**Fields**:
```javascript
{
  _id: ObjectId,
  name: String (required),
  address: String (required),
  phone: String (required),
  email: String (required, lowercase),
  principalName: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email`: unique index

---

### 3. Students

Stores student-specific information linked to a user account.

**Collection Name**: `students`

**Fields**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, ref: 'User'),
  studentId: String (required, unique),
  dateOfBirth: Date (required),
  classId: ObjectId (ref: 'Class'),
  parentId: ObjectId (ref: 'User'),
  enrollmentDate: Date (default: now),
  medicalInfo: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `studentId`: unique index
- `userId`: unique index
- `schoolId`: regular index
- `classId`: regular index

---

### 4. Teachers

Stores teacher-specific information linked to a user account.

**Collection Name**: `teachers`

**Fields**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required, ref: 'User'),
  teacherId: String (required, unique),
  subjects: [ObjectId] (ref: 'Subject'),
  qualification: String (required),
  experience: Number (default: 0),
  hireDate: Date (default: now),
  salary: Number,
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `teacherId`: unique index
- `userId`: unique index
- `schoolId`: regular index

---

### 5. Classes

Stores information about classes or grade levels.

**Collection Name**: `classes`

**Fields**:
```javascript
{
  _id: ObjectId,
  name: String (required),
  level: String (required),
  academicYear: String (required),
  teacherId: ObjectId (ref: 'Teacher'),
  capacity: Number (required, default: 30),
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `schoolId`: regular index
- `academicYear`: regular index

---

### 6. Subjects

Stores subject or course information.

**Collection Name**: `subjects`

**Fields**:
```javascript
{
  _id: ObjectId,
  name: String (required),
  code: String (required, unique, uppercase),
  description: String,
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `code`: unique index
- `schoolId`: regular index

---

### 7. Grades

Stores student grades and assessment results.

**Collection Name**: `grades`

**Fields**:
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (required, ref: 'Student'),
  subjectId: ObjectId (required, ref: 'Subject'),
  classId: ObjectId (required, ref: 'Class'),
  examType: String (required, enum: ['quiz', 'midterm', 'final', 'assignment', 'project']),
  score: Number (required, min: 0),
  maxScore: Number (required, default: 100),
  term: String (required),
  academicYear: String (required),
  teacherId: ObjectId (required, ref: 'Teacher'),
  comments: String,
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `studentId`: regular index
- `subjectId`: regular index
- `schoolId`: regular index
- `academicYear`: regular index

---

### 8. Attendance

Stores daily attendance records.

**Collection Name**: `attendance`

**Fields**:
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (required, ref: 'Student'),
  classId: ObjectId (required, ref: 'Class'),
  date: Date (required),
  status: String (required, enum: ['present', 'absent', 'late', 'excused']),
  remarks: String,
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `studentId, date`: compound unique index
- `classId`: regular index
- `schoolId`: regular index
- `date`: regular index

---

### 9. Invoices

Stores billing and invoice information.

**Collection Name**: `invoices`

**Fields**:
```javascript
{
  _id: ObjectId,
  invoiceNumber: String (required, unique),
  studentId: ObjectId (required, ref: 'Student'),
  amount: Number (required, min: 0),
  dueDate: Date (required),
  status: String (enum: ['pending', 'paid', 'overdue', 'cancelled'], default: 'pending'),
  description: String (required),
  academicYear: String (required),
  term: String (required),
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `invoiceNumber`: unique index
- `studentId`: regular index
- `status`: regular index
- `schoolId`: regular index

---

### 10. Payments

Stores payment transactions.

**Collection Name**: `payments`

**Fields**:
```javascript
{
  _id: ObjectId,
  invoiceId: ObjectId (required, ref: 'Invoice'),
  amount: Number (required, min: 0),
  paymentDate: Date (default: now),
  paymentMethod: String (required, enum: ['cash', 'bank_transfer', 'credit_card', 'check', 'online']),
  transactionId: String,
  notes: String,
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `invoiceId`: regular index
- `schoolId`: regular index
- `paymentDate`: regular index

---

### 11. Expenses

Stores school expenses and expenditures.

**Collection Name**: `expenses`

**Fields**:
```javascript
{
  _id: ObjectId,
  category: String (required, enum: ['salary', 'supplies', 'maintenance', 'utilities', 'rent', 'insurance', 'other']),
  amount: Number (required, min: 0),
  date: Date (required),
  description: String (required),
  vendor: String,
  paymentMethod: String (required, enum: ['cash', 'bank_transfer', 'credit_card', 'check']),
  status: String (enum: ['pending', 'paid', 'cancelled'], default: 'pending'),
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `schoolId`: regular index
- `category`: regular index
- `date`: regular index

---

### 12. Books

Stores library book inventory.

**Collection Name**: `books`

**Fields**:
```javascript
{
  _id: ObjectId,
  title: String (required),
  author: String (required),
  isbn: String (required, unique),
  category: String (required),
  quantity: Number (required, min: 0),
  availableQuantity: Number (required, min: 0),
  location: String,
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `isbn`: unique index
- `schoolId`: regular index
- `category`: regular index

---

### 13. BookLoans

Stores library book borrowing records.

**Collection Name**: `bookloans`

**Fields**:
```javascript
{
  _id: ObjectId,
  bookId: ObjectId (required, ref: 'Book'),
  userId: ObjectId (required, ref: 'User'),
  borrowDate: Date (default: now),
  dueDate: Date (required),
  returnDate: Date,
  status: String (enum: ['borrowed', 'returned', 'overdue'], default: 'borrowed'),
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `bookId`: regular index
- `userId`: regular index
- `status`: regular index
- `dueDate`: regular index

---

### 14. Events

Stores school events and activities.

**Collection Name**: `events`

**Fields**:
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  type: String (required, enum: ['meeting', 'celebration', 'field_trip', 'parent_teacher', 'sports', 'other']),
  date: Date (required),
  endDate: Date,
  location: String,
  organizer: ObjectId (required, ref: 'User'),
  attendees: [ObjectId] (ref: 'User'),
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `schoolId`: regular index
- `date`: regular index
- `type`: regular index

---

### 15. Messages

Stores internal messaging between users.

**Collection Name**: `messages`

**Fields**:
```javascript
{
  _id: ObjectId,
  senderId: ObjectId (required, ref: 'User'),
  recipientId: ObjectId (required, ref: 'User'),
  subject: String (required),
  content: String (required),
  isRead: Boolean (default: false),
  schoolId: ObjectId (required, ref: 'School'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `senderId`: regular index
- `recipientId`: regular index
- `isRead`: regular index
- `createdAt`: regular index (for sorting)

---

## Relationships

### One-to-One
- User → Student (one user can be one student)
- User → Teacher (one user can be one teacher)

### One-to-Many
- School → Users (one school has many users)
- School → Students (one school has many students)
- School → Teachers (one school has many teachers)
- School → Classes (one school has many classes)
- Class → Students (one class has many students)
- Teacher → Classes (one teacher can teach many classes)
- Student → Grades (one student has many grades)
- Student → Attendance (one student has many attendance records)
- Student → Invoices (one student has many invoices)
- User → Messages (one user can send/receive many messages)

### Many-to-Many
- Teachers → Subjects (teachers can teach multiple subjects, subjects can be taught by multiple teachers)
- Events → Attendees (events can have multiple attendees, users can attend multiple events)

---

## Data Validation

### Email Validation
All email fields are validated to ensure proper format and are stored in lowercase.

### Password Security
Passwords are hashed using bcryptjs with a salt round of 10 before storage. Plain text passwords are never stored.

### Required Fields
Fields marked as `required` must be provided during document creation.

### Enum Validation
Fields with enum constraints only accept predefined values.

### Numeric Validation
Numeric fields with `min` constraints ensure positive values where appropriate.

---

## Soft Delete Pattern

The system implements soft delete for users using the `isActive` flag:
- `isActive: true` - User is active
- `isActive: false` - User is deactivated (soft deleted)

This preserves data integrity and maintains historical records.

---

## Timestamps

All collections include automatic timestamp fields:
- `createdAt`: Set when document is first created
- `updatedAt`: Updated whenever document is modified

These are managed automatically by Mongoose.

---

## Performance Considerations

### Indexing Strategy
- Unique indexes on frequently queried unique fields (email, studentId, teacherId)
- Regular indexes on foreign keys (schoolId, userId, classId)
- Compound indexes for combined queries (studentId + date in attendance)

### Population Strategy
Use Mongoose `.populate()` judiciously:
- Populate only necessary fields
- Use `select` to limit populated fields
- Avoid deep nesting of populations

### Query Optimization
- Filter by schoolId first for multi-tenant scenarios
- Use pagination for large result sets
- Implement caching for frequently accessed data

---

## Migration Notes

### From Relational Database
If migrating from a relational database:
1. Map tables to collections
2. Handle foreign keys as ObjectId references
3. Consider embedding vs. referencing based on data access patterns
4. Preserve existing IDs where possible using custom _id values

### Schema Evolution
When adding new fields:
- Use default values for backward compatibility
- Consider migration scripts for required fields
- Document schema version changes

---

## Backup and Recovery

### Regular Backups
```bash
mongodump --db=schoman --out=/backup/$(date +%Y%m%d)
```

### Restore
```bash
mongorestore --db=schoman /backup/20231201/schoman
```

### Backup Strategy
- Daily automated backups
- Weekly full backups
- Monthly archive backups
- Test restore procedures regularly

---

## Security Considerations

### Sensitive Data
- Passwords are hashed
- Financial data should be encrypted at rest
- Access logs should be maintained
- PII should be handled according to privacy regulations

### Access Control
- Role-based access at application level
- MongoDB user authentication enabled
- Network-level security (firewall rules)
- Regular security audits

---

## Future Enhancements

Potential schema additions:
- Schedule/Timetable collection
- Assignment/Homework collection
- Notification collection
- Document/File storage metadata
- Parent-Student relationship table
- Class enrollment history
- Audit log collection
- Settings/Configuration collection

---

## References

- MongoDB Documentation: https://docs.mongodb.com/
- Mongoose Documentation: https://mongoosejs.com/docs/
- Schema Design Best Practices: https://www.mongodb.com/developer/products/mongodb/schema-design-best-practices/

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Database Version**: MongoDB 6.0+
