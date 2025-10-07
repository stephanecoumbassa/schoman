# 👥 Users Management Module Documentation

## Overview

The Users Management Module is a comprehensive user administration system for the Schoman school management application. It allows administrators to manage all user accounts including teachers, parents, and other administrators. This module is essential for maintaining the school's staff directory and access control.

## Features Implemented

### User Management
- ✅ Create, read, update, and delete users
- ✅ Support for multiple roles (admin, teacher, parent)
- ✅ Password management and reset functionality
- ✅ Search by name or email
- ✅ Filter by role and active status
- ✅ Track contact information (phone, address)
- ✅ View user statistics
- ✅ Prevent deletion of last admin

### Role-Based Access Control
- ✅ Admin-only access to user management
- ✅ Teachers can view user list (read-only)
- ✅ Secure password hashing with bcrypt
- ✅ Role-based feature restrictions

## Backend Implementation

### Models

#### User Model (`backend/src/models/User.ts`)
```typescript
interface IUser {
  email: string;                // Required, unique, lowercase
  password: string;             // Required, hashed with bcrypt
  firstName: string;            // Required
  lastName: string;             // Required
  role: 'admin' | 'teacher' | 'student' | 'parent';
  phone?: string;               // Optional contact number
  address?: string;             // Optional physical address
  isActive: boolean;            // Account status (default: true)
  createdAt: Date;              // Auto-generated
  updatedAt: Date;              // Auto-updated
}
```

**Features:**
- Email validation and uniqueness
- Automatic password hashing before save
- `comparePassword()` method for authentication
- Soft delete with `isActive` flag
- Timestamps for audit trail

### API Endpoints

#### User CRUD Operations
- `GET /api/users` - List all users (paginated, with filters)
  - Query params: `page`, `limit`, `search`, `role`, `isActive`
  - Returns: `{ users: User[], pagination: PaginationInfo }`
  - Access: Admin (full), Teacher (read-only)
  
- `GET /api/users/:id` - Get single user details
  - Access: Admin only
  
- `POST /api/users` - Create new user (admin only)
  - Body: `{ email, password, firstName, lastName, role, phone?, address? }`
  - Validates email uniqueness
  - Automatically hashes password
  - Access: Admin only
  
- `PUT /api/users/:id` - Update user (admin only)
  - Body: `{ email?, firstName?, lastName?, role?, phone?, address?, isActive? }`
  - Validates email uniqueness if changed
  - Cannot change password (use separate endpoint)
  - Access: Admin only
  
- `PUT /api/users/:id/password` - Update user password (admin only)
  - Body: `{ password }`
  - Validates password length (min 6 characters)
  - Automatically hashes new password
  - Access: Admin only
  
- `DELETE /api/users/:id` - Delete user (admin only)
  - Prevents deletion of last admin
  - Cannot delete users with student role (use student management)
  - Permanent deletion (not soft delete)
  - Access: Admin only

#### Statistics
- `GET /api/users/stats` - Get user statistics
  - Returns: Total users, active/inactive counts, breakdown by role
  - Access: Admin only

### Controllers

#### userController.ts (`backend/src/controllers/userController.ts`)

**Key Functions:**
- `createUser()` - Create new user account
- `getUsers()` - List users with pagination and filters
- `getUser()` - Get single user details
- `updateUser()` - Update user information
- `updatePassword()` - Change user password
- `deleteUser()` - Delete user (with admin protection)
- `getUserStats()` - Get user statistics

**Security Features:**
- Email uniqueness validation
- Last admin protection (prevents system lockout)
- Password length validation
- Automatic password hashing
- Password excluded from responses

## Frontend Implementation

### Views

#### UsersView.vue (`frontend/src/views/UsersView.vue`)

**Features:**
- Responsive table layout with user list
- Search by name or email (debounced)
- Filter by role (admin/teacher/parent)
- Filter by active status
- Pagination controls
- Add/Edit user modal with form validation
- Password change modal
- Delete confirmation
- Role-based badge colors
- Admin-only access

**UI Components:**
1. **Header Section**
   - Title and description
   - Back to dashboard button
   - Add user button (admin only)

2. **Search and Filters**
   - Real-time search (debounced 500ms)
   - Role dropdown filter
   - Active status filter
   - Responsive grid layout

3. **Users Table**
   - Full name display
   - Email address
   - Role badge with color coding
   - Phone number
   - Active/Inactive status
   - Action buttons (Edit, Change Password, Delete)

4. **Add/Edit Modal**
   - First name and last name inputs
   - Email input with validation
   - Password input (create only)
   - Role selector
   - Phone number (optional)
   - Address textarea (optional)
   - Active status toggle (edit only)

5. **Password Change Modal**
   - User identification
   - New password input
   - Minimum 6 characters validation

### Router Configuration

```typescript
{
  path: '/users',
  name: 'users',
  component: UsersView,
  meta: { 
    requiresAuth: true, 
    requiresAdmin: true 
  }
}
```

### API Service

#### New Methods in api.ts

```typescript
// User management
async getUsers(params?: QueryParams)
async getUser(id: string)
async createUser(userData: Partial<User> & { password: string })
async updateUser(id: string, userData: Partial<User>)
async updateUserPassword(id: string, password: string)
async deleteUser(id: string)
async getUserStats()
```

### Dashboard Integration

Added "Gérer les utilisateurs" card to dashboard quick actions:
- Visible only to admins
- Purple-themed icon (user group)
- Located between Students and Classes
- Direct link to `/users` route

## Usage Examples

### Creating a New Teacher

1. Navigate to Users Management (admin only)
2. Click "Ajouter un utilisateur"
3. Fill in the form:
   - Prénom: Marie
   - Nom: Dupont
   - Email: marie.dupont@school.com
   - Mot de passe: secure123 (min 6 chars)
   - Rôle: Enseignant
   - Téléphone: 0601020304 (optional)
4. Click "Créer"

### Changing a User's Password

1. Find the user in the table
2. Click "Mot de passe" button
3. Enter new password (min 6 characters)
4. Click "Changer"

### Filtering Users

- **Search**: Type name or email in search box
- **By Role**: Select from dropdown (Admin/Teacher/Parent)
- **By Status**: Select Active or Inactive
- **Combine filters**: All filters work together

### Deactivating a User

1. Find the user in the table
2. Click "Modifier"
3. Change "Statut" to "Inactif"
4. Click "Modifier"

Note: Inactive users cannot log in but their data is preserved.

## Security Considerations

1. **Admin Protection**: System prevents deletion of the last admin account
2. **Password Security**: All passwords are hashed using bcrypt with salt
3. **Access Control**: Only admins can manage users
4. **Email Uniqueness**: System enforces unique email addresses
5. **Role Restrictions**: Teachers have read-only access to user list

## Data Validation

### Backend Validation
- Email: Required, must be valid email format, unique
- Password: Required (create), minimum 6 characters
- First Name: Required, trimmed
- Last Name: Required, trimmed
- Role: Required, must be one of: admin, teacher, parent
- Phone: Optional, trimmed
- Address: Optional, trimmed

### Frontend Validation
- Email: Required, type="email"
- Password: Required (create only), minlength="6"
- First Name: Required
- Last Name: Required
- Role: Required, dropdown selection
- All fields: HTML5 form validation

## Testing Recommendations

### Manual Testing Checklist

- [ ] Create user with all roles (admin, teacher, parent)
- [ ] Create user without optional fields
- [ ] Try to create user with duplicate email (should fail)
- [ ] Update user information
- [ ] Change user password
- [ ] Deactivate and reactivate user
- [ ] Try to delete last admin (should fail)
- [ ] Search users by name and email
- [ ] Filter by each role
- [ ] Filter by active/inactive status
- [ ] Test pagination (create 15+ users)
- [ ] Verify teachers can view but not edit
- [ ] Verify non-admins cannot access page

### API Testing with curl

```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@schoman.com","password":"admin123"}'

# Get users list
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "new.teacher@school.com",
    "password": "teacher123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "teacher",
    "phone": "0601020304"
  }'

# Update user password
curl -X PUT http://localhost:3000/api/users/USER_ID/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"password":"newpassword123"}'
```

## Future Enhancements

Potential features for future development:

1. **Bulk Operations**
   - Import users from CSV/Excel
   - Bulk activate/deactivate users
   - Bulk password reset

2. **Advanced Security**
   - Two-factor authentication
   - Password complexity rules
   - Password expiration policy
   - Login attempt tracking

3. **User Profiles**
   - Profile photos/avatars
   - Biography/description
   - Social media links
   - Schedule/availability

4. **Notifications**
   - Email verification on account creation
   - Password reset via email
   - Account status change notifications
   - Welcome emails for new users

5. **Audit Trail**
   - Track all user modifications
   - Login history
   - Activity logs
   - Export audit reports

6. **Department Management**
   - Assign teachers to departments
   - Department head roles
   - Department-based filtering

## Integration with Other Modules

### Student Module
- Students are managed separately through Student Management
- Student accounts are created with Student profiles
- Users module only manages staff and parents

### Class Module
- Teachers can be assigned as main teachers for classes
- User module provides teacher list for class assignment

### Grade Module
- Teachers are referenced when recording grades
- User module provides teacher authentication

### Message Module
- All users can send/receive messages
- User module provides recipient selection

## Troubleshooting

### Common Issues

**Issue**: Cannot create user with existing email
- **Solution**: Check if email is already in use. Emails must be unique.

**Issue**: Cannot delete admin user
- **Solution**: System prevents deletion of the last admin. Create another admin first.

**Issue**: Password not accepted
- **Solution**: Ensure password is at least 6 characters long.

**Issue**: Page not accessible
- **Solution**: Users module requires admin role. Verify you're logged in as admin.

**Issue**: Changes not reflected
- **Solution**: Refresh the page or check if the API request was successful.

## Conclusion

The Users Management Module provides a complete solution for managing school staff and parent accounts. It follows security best practices, includes comprehensive validation, and integrates seamlessly with other modules in the Schoman system.

For questions or support, please refer to the main documentation or contact the development team.
