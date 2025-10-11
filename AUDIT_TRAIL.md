# 📊 Audit Trail Documentation - Schoman

## 🎯 Overview

The Audit Trail system provides comprehensive logging of all important actions performed in the Schoman application. It tracks who did what, when, and from where, providing accountability, security monitoring, and compliance support.

## ✨ Features

### Core Capabilities
- 📝 **Automatic Logging** - Middleware automatically logs important actions
- 👤 **User Tracking** - Links actions to specific users
- 🏫 **Multi-School Support** - Tracks actions per school
- 🔍 **Advanced Filtering** - Search and filter by multiple criteria
- 📊 **Statistics Dashboard** - View audit trends and patterns
- ⏰ **Automatic Cleanup** - Delete old logs to manage storage
- 🚨 **Error Tracking** - Monitor failed operations
- 🔐 **Admin-Only Access** - Secure access to sensitive audit data

### Tracked Actions

#### Authentication
- `login` - User login
- `logout` - User logout  
- `register` - New user registration
- `change_password` - Password changes
- `forgot_password` - Password reset requests
- `reset_password` - Password resets
- `enable_2fa` / `disable_2fa` - 2FA changes

#### User Management
- `create_user` / `update_user` / `delete_user`

#### Student Management
- `create_student` / `update_student` / `delete_student`

#### Academic
- `create_grade` / `update_grade` / `delete_grade`
- `create_class` / `update_class` / `delete_class`

#### Financial
- `create_invoice` / `update_invoice` / `delete_invoice`
- `create_transaction` / `update_transaction` / `delete_transaction`
- `create_expense` / `update_expense` / `delete_expense`
- `approve_expense` / `reject_expense`

#### System
- `create_school` / `update_school` / `delete_school`

## 🏗️ Architecture

### Backend Components

#### 1. AuditLog Model (`models/AuditLog.ts`)
```typescript
{
  user: ObjectId,              // Who performed the action
  school: ObjectId,            // Which school (multi-tenant)
  action: string,              // What action (e.g., 'create_student')
  resource: string,            // Resource type (e.g., 'Student')
  resourceId: string,          // ID of affected resource
  method: string,              // HTTP method (GET/POST/PUT/DELETE)
  endpoint: string,            // API endpoint called
  statusCode: number,          // HTTP response status
  ipAddress: string,           // Client IP address
  userAgent: string,           // Client browser/app
  changes: {                   // Optional before/after data
    before: Object,
    after: Object
  },
  metadata: Object,            // Additional context data
  duration: number,            // Request duration in ms
  error: string,               // Error message if failed
  createdAt: Date
}
```

#### 2. Audit Logger Middleware (`middleware/auditLogger.ts`)
- Automatically logs actions based on route patterns
- Captures request/response data
- Non-blocking async logging
- Configurable action mappings

#### 3. Audit Log Controller (`controllers/auditLogController.ts`)
**Endpoints:**
- `GET /api/audit-logs` - Get all logs (admin only)
- `GET /api/audit-logs/my` - Get current user's logs
- `GET /api/audit-logs/stats` - Get statistics (admin only)
- `GET /api/audit-logs/:id` - Get single log (admin only)
- `DELETE /api/audit-logs/old` - Delete old logs (admin only)

**Features:**
- Pagination support
- Advanced filtering
- Statistics aggregation
- Automatic cleanup

### Frontend Components

#### 1. Audit Log Service (`services/auditLogService.ts`)
- API communication layer
- Helper functions for formatting
- Type definitions

#### 2. Audit Logs View (`views/AuditLogsView.vue`)
**Features:**
- 📊 Statistics cards (total, errors, success rate)
- 🔍 Advanced search and filters
- 📋 Paginated table view
- 👁️ Detailed log viewer
- 🗑️ Bulk deletion of old logs
- 📱 Responsive design

**Filters:**
- Search (action, resource, endpoint)
- Action type
- Resource type
- HTTP method
- Status code / Status range
- Date range
- User (admin only)
- School (admin only)

## 📖 Usage

### Backend Integration

#### 1. Automatic Logging (Already Configured)
The audit logger middleware is automatically applied to all API routes:

```typescript
// In index.ts
app.use('/api', auditLogger);
```

#### 2. Manual Logging
For custom actions not caught by the middleware:

```typescript
import { logAuditEntry } from '../middleware/auditLogger.js';

await logAuditEntry({
  user: userId,
  school: schoolId,
  action: 'custom_action',
  resource: 'CustomResource',
  resourceId: '123',
  method: 'POST',
  endpoint: '/api/custom',
  statusCode: 200,
  metadata: {
    customData: 'value'
  },
  changes: {
    before: { status: 'pending' },
    after: { status: 'approved' }
  }
});
```

### Frontend Usage

#### 1. View Audit Logs
Navigate to `/audit-logs` in the application.

**For Regular Users:**
- View their own audit history
- Filter by date and action
- View request details

**For Admins:**
- View all audit logs
- Statistics dashboard
- Advanced filtering
- Bulk cleanup operations

#### 2. Programmatic Access
```typescript
import auditLogService from '@/services/auditLogService';

// Get audit logs
const { logs, pagination } = await auditLogService.getAuditLogs({
  page: 1,
  limit: 50,
  action: 'login',
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});

// Get statistics
const stats = await auditLogService.getAuditStats({
  startDate: '2025-01-01',
  endDate: '2025-01-31'
});

// Delete old logs (admin only)
await auditLogService.deleteOldLogs(365); // Keep last 365 days
```

## 🔐 Security & Permissions

### Access Control
- **Regular Users:** Can view their own audit logs
- **Admins:** Full access to all audit logs and statistics
- All audit log operations require authentication

### Data Protection
- Audit logs are immutable (no update/edit)
- Only admins can delete old logs
- IP addresses and user agents logged for security
- Automatic indexing for performance

## 📊 Statistics & Monitoring

### Available Metrics
- **Total Logs** - Overall count
- **Error Logs** - Failed operations (4xx, 5xx)
- **Success Rate** - Percentage of successful operations
- **Top Actions** - Most frequently performed actions
- **Top Resources** - Most frequently accessed resources
- **Top Users** - Most active users

### Use Cases
- **Security Monitoring** - Detect suspicious activities
- **Compliance** - Audit trails for regulations
- **Performance** - Identify slow operations
- **User Analytics** - Understand user behavior
- **Debugging** - Trace issues through logs

## 🛠️ Configuration

### Storage Management

#### Automatic TTL (Optional)
Uncomment in `models/AuditLog.ts` to enable automatic deletion:
```typescript
// Delete logs older than 1 year automatically
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });
```

#### Manual Cleanup
```typescript
// Via API (admin only)
DELETE /api/audit-logs/old?days=365
```

### Adding New Auditable Actions

Update `AUDITABLE_ACTIONS` in `middleware/auditLogger.ts`:
```typescript
const AUDITABLE_ACTIONS: Record<string, string[]> = {
  // Add new action
  'POST /api/your-resource': ['create_your_resource', 'YourResource'],
  'PUT /api/your-resource': ['update_your_resource', 'YourResource'],
  'DELETE /api/your-resource': ['delete_your_resource', 'YourResource'],
};
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test -- auditLogController.test.ts
```

**Test Coverage:**
- Manual audit log creation ✅
- Get all logs with filters ✅
- Get user's own logs ✅
- Get single log ✅
- Get statistics ✅
- Delete old logs ✅
- Permission checks ✅
- Pagination ✅

### Test Cases
- 19 test cases covering all endpoints
- Tests for admin/user permissions
- Filter and pagination tests
- Statistics calculation tests
- Cleanup operation tests

## 📈 Performance

### Indexes
Optimized indexes for common queries:
- `createdAt` (descending)
- `user + createdAt`
- `school + createdAt`
- `action + createdAt`
- `resource + createdAt`
- `statusCode + createdAt`

### Best Practices
- Async logging (non-blocking)
- Pagination for large datasets
- Index-based filtering
- Lean queries for read operations
- Automatic cleanup to manage size

## 🚀 Future Enhancements

### Planned Features
- [ ] Real-time audit notifications
- [ ] Export audit logs to CSV/PDF
- [ ] Advanced analytics dashboard
- [ ] Anomaly detection
- [ ] Integration with SIEM systems
- [ ] Audit log archiving to S3
- [ ] Before/after data capture for all updates
- [ ] Audit log streaming
- [ ] Custom retention policies per resource type

### Integration Ideas
- [ ] Send alerts on suspicious activities
- [ ] Generate compliance reports
- [ ] Integrate with Winston logger
- [ ] Add audit trail to export reports
- [ ] Webhook notifications for critical actions

## 📝 API Reference

### Get All Audit Logs
```http
GET /api/audit-logs?page=1&limit=50&action=login&startDate=2025-01-01
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "logs": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

### Get Statistics
```http
GET /api/audit-logs/stats?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "totalLogs": 1000,
  "errorLogs": 50,
  "successRate": "95.00",
  "topActions": [
    { "action": "login", "count": 300 },
    { "action": "create_student", "count": 150 }
  ],
  "topResources": [
    { "resource": "Auth", "count": 400 },
    { "resource": "Student", "count": 250 }
  ],
  "topUsers": [...]
}
```

### Get My Logs
```http
GET /api/audit-logs/my?page=1&limit=20
Authorization: Bearer <token>
```

### Delete Old Logs
```http
DELETE /api/audit-logs/old?days=365
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "message": "100 logs d'audit supprimés",
  "deletedCount": 100,
  "cutoffDate": "2024-01-11T00:00:00.000Z"
}
```

## 🎓 Best Practices

1. **Regular Cleanup** - Delete old logs periodically
2. **Monitor Errors** - Check error logs regularly
3. **Review Access** - Audit admin access to audit logs
4. **Secure Sensitive Data** - Don't log passwords or tokens
5. **Performance** - Use filters and pagination
6. **Retention Policy** - Define appropriate retention period
7. **Compliance** - Align with regulatory requirements

## 🔗 Related Documentation
- [PHASE3_PROGRESS.md](./PHASE3_PROGRESS.md) - Implementation progress
- [SECURITY_DOCUMENTATION.md](./SECURITY_DOCUMENTATION.md) - Security features
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference

---

**Status:** ✅ Implemented (Phase 3)  
**Version:** 1.0  
**Last Updated:** October 11, 2025  
**Author:** Agent AI
