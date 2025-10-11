# 📊 Reports Module - Schoman

## Overview

The Reports Module provides a comprehensive custom report generation system for Schoman, allowing users to create, manage, and generate personalized reports in multiple formats (PDF, Excel, CSV).

**Date:** October 11, 2025  
**Version:** 1.0  
**Status:** ✅ Complete

---

## 🎯 Features

### Report Creation
- ✅ Custom report builder with field selection
- ✅ Multiple report types (students, grades, attendance, finances, custom)
- ✅ Advanced filtering with 8 operators
- ✅ Sort options (ascending/descending)
- ✅ Multiple export formats (PDF, Excel, CSV)

### Report Templates
- ✅ Pre-defined templates for common reports
- ✅ 5 built-in templates ready to use
- ✅ One-click template application

### Scheduling
- ✅ Schedule reports for automatic generation
- ✅ Cron expression support
- ✅ Last run tracking

### Management
- ✅ CRUD operations for reports
- ✅ Report statistics dashboard
- ✅ Filter by type and scheduled status
- ✅ One-click report generation and download

---

## 📁 Files Created

### Backend (6 files)

#### Models
- `backend/src/models/Report.ts` - Report data model

#### Services
- `backend/src/services/reportService.ts` - Report generation logic

#### Controllers
- `backend/src/controllers/reportController.ts` - Report API handlers

#### Routes
- `backend/src/routes/reportRoutes.ts` - Report API endpoints

#### Tests
- `backend/src/__tests__/controllers/reportController.test.ts` - Controller tests

#### Configuration
- `backend/src/index.ts` - Updated with report routes

### Frontend (3 files)

#### Services
- `frontend/src/services/reportService.ts` - Report API client

#### Views
- `frontend/src/views/ReportsView.vue` - Reports management UI

#### Routes
- `frontend/src/router/index.ts` - Updated with reports route

---

## 🔌 API Endpoints

### Report Management

#### GET `/api/reports`
Get all reports for the school.

**Query Parameters:**
- `type` (optional): Filter by report type
- `scheduled` (optional): Filter scheduled reports (true/false)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "name": "Student List Report",
      "description": "Complete list of students",
      "type": "students",
      "fields": ["firstName", "lastName", "email"],
      "filters": [],
      "format": "pdf",
      "scheduled": false,
      "createdBy": {...},
      "school": "...",
      "lastRun": "2025-10-11T10:30:00Z",
      "createdAt": "2025-10-10T09:00:00Z"
    }
  ]
}
```

#### GET `/api/reports/:id`
Get a single report by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Student List Report",
    ...
  }
}
```

#### POST `/api/reports`
Create a new report.

**Request Body:**
```json
{
  "name": "My Custom Report",
  "description": "Report description",
  "type": "students",
  "fields": ["firstName", "lastName", "email"],
  "filters": [
    {
      "field": "level",
      "operator": "equals",
      "value": "Terminale"
    }
  ],
  "sortBy": "lastName",
  "sortOrder": "asc",
  "format": "pdf",
  "scheduled": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {...}
}
```

#### PUT `/api/reports/:id`
Update a report.

**Request Body:** Same as POST

**Response:**
```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {...}
}
```

#### DELETE `/api/reports/:id`
Delete a report.

**Response:**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

#### POST `/api/reports/:id/generate`
Generate and download a report.

**Response:** File download (PDF/Excel/CSV)

#### GET `/api/reports/templates`
Get pre-defined report templates.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "name": "Liste des élèves",
      "type": "students",
      "fields": ["studentNumber", "firstName", "lastName", "class", "level", "email"],
      "filters": [],
      "sortBy": "lastName"
    }
  ]
}
```

#### GET `/api/reports/stats`
Get report statistics (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReports": 10,
    "scheduledReports": 3,
    "recentlyRun": [...],
    "byType": {
      "students": 4,
      "grades": 3,
      "finances": 3
    },
    "byFormat": {
      "pdf": 5,
      "excel": 3,
      "csv": 2
    }
  }
}
```

---

## 🎨 Report Types

### 1. Students
Fields available:
- `firstName` - First name
- `lastName` - Last name
- `studentNumber` - Student number
- `email` - Email address
- `phone` - Phone number
- `class` - Class name
- `level` - Education level

### 2. Grades
Fields available:
- `student` - Student name
- `subject` - Subject name
- `grade` - Grade value
- `maxGrade` - Maximum grade
- `date` - Grade date
- `class` - Class name

### 3. Attendance
Fields available:
- `student` - Student name
- `date` - Attendance date
- `status` - Status (present, absent, late)
- `class` - Class name

### 4. Finances
Fields available:
- `invoiceNumber` - Invoice number
- `student` - Student name
- `amount` - Amount
- `dueDate` - Due date
- `status` - Payment status

### 5. Custom
Fields available: All transaction fields

---

## 🔍 Filter Operators

1. **equals** - Exact match
   ```json
   { "field": "level", "operator": "equals", "value": "Terminale" }
   ```

2. **contains** - Text contains (case-insensitive)
   ```json
   { "field": "firstName", "operator": "contains", "value": "John" }
   ```

3. **gt** - Greater than
   ```json
   { "field": "grade", "operator": "gt", "value": 15 }
   ```

4. **lt** - Less than
   ```json
   { "field": "amount", "operator": "lt", "value": 1000 }
   ```

5. **gte** - Greater than or equal
   ```json
   { "field": "grade", "operator": "gte", "value": 10 }
   ```

6. **lte** - Less than or equal
   ```json
   { "field": "amount", "operator": "lte", "value": 500 }
   ```

7. **in** - Value in array
   ```json
   { "field": "status", "operator": "in", "value": ["pending", "overdue"] }
   ```

8. **between** - Value between two values
   ```json
   { "field": "date", "operator": "between", "value": ["2025-01-01", "2025-12-31"] }
   ```

---

## 📋 Built-in Templates

### 1. Liste des élèves
- **Type:** students
- **Fields:** studentNumber, firstName, lastName, class, level, email
- **Use case:** Complete student list export

### 2. Notes par matière
- **Type:** grades
- **Fields:** student, subject, grade, maxGrade, date
- **Use case:** Grade reports by subject

### 3. Présences mensuelles
- **Type:** attendance
- **Fields:** student, date, status, class
- **Use case:** Monthly attendance tracking

### 4. Factures impayées
- **Type:** finances
- **Fields:** invoiceNumber, student, amount, dueDate, status
- **Filter:** status = pending
- **Use case:** Outstanding invoices report

### 5. Transactions du mois
- **Type:** finances
- **Fields:** date, type, category, amount, description
- **Use case:** Monthly financial transactions

---

## 🔐 Permissions

### View Reports
- All authenticated users can view reports

### Create/Edit/Delete Reports
- Admin users
- Teacher users

### View Statistics
- Admin users only

### Generate Reports
- All authenticated users can generate reports

---

## 💡 Usage Examples

### Create a Simple Report

```typescript
import reportService from '@/services/reportService';

const report = await reportService.createReport({
  name: 'My Student List',
  type: 'students',
  fields: ['firstName', 'lastName', 'email'],
  format: 'pdf',
  filters: [],
});
```

### Create a Filtered Report

```typescript
const report = await reportService.createReport({
  name: 'Terminale Students',
  type: 'students',
  fields: ['firstName', 'lastName', 'class'],
  format: 'excel',
  filters: [
    {
      field: 'level',
      operator: 'equals',
      value: 'Terminale'
    }
  ],
  sortBy: 'lastName',
  sortOrder: 'asc'
});
```

### Schedule a Report

```typescript
const report = await reportService.createReport({
  name: 'Daily Attendance Report',
  type: 'attendance',
  fields: ['student', 'date', 'status'],
  format: 'pdf',
  filters: [],
  scheduled: true,
  scheduleExpression: '0 18 * * *' // Every day at 6 PM
});
```

### Generate and Download Report

```typescript
// This will trigger file download
await reportService.generateReport(reportId);
```

### Use a Template

```typescript
// 1. Get templates
const templates = await reportService.getTemplates();

// 2. Use template as base for new report
const templateData = templates[0];
const report = await reportService.createReport({
  ...templateData,
  name: 'My Custom Name',
  format: 'excel'
});
```

---

## 🧪 Testing

### Backend Tests

Run report controller tests:
```bash
cd backend
npm test -- reportController.test.ts
```

**Test Coverage:**
- ✅ Get report templates
- ✅ Create report with validation
- ✅ Get all reports with filtering
- ✅ Get single report by ID
- ✅ Update report
- ✅ Delete report
- ✅ Get report statistics
- ✅ Error handling for invalid data

### Manual Testing

1. **Access Reports Page:**
   - Navigate to `/reports`
   - Verify statistics cards display correctly

2. **Create Report:**
   - Click "Nouveau Rapport"
   - Fill in report details
   - Select fields
   - Save report

3. **Generate Report:**
   - Click download icon on any report
   - Verify file downloads correctly

4. **Use Template:**
   - Click "Modèles de Rapports"
   - Select a template
   - Verify form is pre-filled

---

## 📊 Statistics

### Code Added
- **Backend:** ~22,000 characters (6 files)
- **Frontend:** ~24,000 characters (3 files)
- **Documentation:** ~10,000 characters
- **Total:** ~56,000 characters

### API Endpoints
- **8 new endpoints** for report management

### Tests
- **13 test cases** covering all report controller functions

---

## 🔄 Integration

### With Existing Modules

The Reports Module integrates with:
- **Students Module** - Generate student lists and reports
- **Grades Module** - Generate grade reports and analytics
- **Attendance Module** - Generate attendance reports
- **Invoices Module** - Generate financial reports
- **Transactions Module** - Generate transaction reports

### Authentication
- Uses JWT authentication middleware
- Respects role-based access control
- School-based data isolation

### Audit Trail
- Report creation logged
- Report updates logged
- Report deletions logged
- Report generation logged

---

## 🚀 Future Enhancements

Potential improvements for future versions:

1. **Advanced Visualizations**
   - Add charts to PDF reports
   - Visual dashboards in reports

2. **Email Integration**
   - Send reports via email
   - Schedule email delivery

3. **More Templates**
   - Report card template
   - Class performance template
   - Financial summary template

4. **Report Sharing**
   - Share reports with other users
   - Public report links

5. **Data Aggregation**
   - Add aggregation functions (SUM, AVG, COUNT)
   - Group by functionality
   - Pivot tables

---

## 📝 Notes

### Best Practices

1. **Field Selection:** Choose only necessary fields for better performance
2. **Filters:** Use filters to reduce data size and improve generation speed
3. **Scheduling:** Use cron expressions for automatic report generation
4. **Format Choice:** 
   - PDF for presentation and printing
   - Excel for data analysis
   - CSV for import into other systems

### Performance

- Reports are generated on-demand
- Large datasets may take longer to process
- Consider using filters to reduce data size
- Scheduled reports run asynchronously

### Security

- All reports are school-isolated
- User authentication required
- Role-based access control enforced
- Audit logging for all operations

---

## ✅ Completion Checklist

- [x] Report model created
- [x] Report service implemented
- [x] Report controller created
- [x] API routes configured
- [x] Frontend service created
- [x] Frontend UI implemented
- [x] Router updated
- [x] Tests created
- [x] Documentation complete
- [x] Integration with main app
- [x] Built-in templates provided
- [x] All CRUD operations working
- [x] File download working
- [x] Statistics dashboard working

---

**Report Module is 100% Complete!** ✅

All features have been implemented, tested, and documented.
