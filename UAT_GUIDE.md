# 🧪 User Acceptance Testing (UAT) Guide - Schoman

This comprehensive guide provides structured test scenarios, procedures, and checklists for conducting User Acceptance Testing of the Schoman school management application.

## 📋 Table of Contents

1. [UAT Overview](#uat-overview)
2. [Test Preparation](#test-preparation)
3. [Test Scenarios by Module](#test-scenarios-by-module)
4. [Test Execution](#test-execution)
5. [Issue Reporting](#issue-reporting)
6. [UAT Completion Criteria](#uat-completion-criteria)

## UAT Overview

### Purpose

User Acceptance Testing validates that the Schoman application:
- ✅ Meets business requirements
- ✅ Functions correctly in real-world scenarios
- ✅ Is user-friendly and intuitive
- ✅ Handles edge cases gracefully
- ✅ Performs adequately under normal load

### Test Roles

| Role | Responsibilities |
|------|-----------------|
| **Test Coordinator** | Organize testing, track progress, consolidate results |
| **Admin Tester** | Test administrator functions (user management, system config) |
| **Teacher Tester** | Test teaching functions (grades, attendance, schedules) |
| **Parent Tester** | Test parent portal (view grades, messages, invoices) |
| **Accountant Tester** | Test financial functions (invoices, payments, reports) |
| **Librarian Tester** | Test library functions (books, loans, returns) |

### Testing Environment

- **URL**: http://localhost:8081 (or your staging URL)
- **Duration**: 2-3 days recommended
- **Data**: Pre-seeded test data (see Test Data section)

## Test Preparation

### 1. Environment Setup

```bash
# Start staging environment
docker-compose -f docker-compose.staging.yml up -d

# Seed test data
docker-compose -f docker-compose.staging.yml exec backend_staging npm run seed

# Verify environment is ready
curl http://localhost:3001/health
```

### 2. Test Accounts

Default test accounts created by seed script:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@test.com | admin123 | Full system access |
| Teacher | teacher@test.com | teacher123 | Teacher functions |
| Parent | parent@test.com | parent123 | Parent portal |
| Accountant | accountant@test.com | accountant123 | Financial functions |
| Librarian | librarian@test.com | librarian123 | Library functions |

### 3. Test Data Overview

The seed script creates:
- 🏫 2 schools
- 👥 50 students across multiple classes
- 📚 30 books in library
- 📊 Multiple grades and attendance records
- 💰 Sample invoices and transactions
- 📅 Schedule entries
- 📧 Sample messages

### 4. Testing Tools

- **Browser**: Chrome, Firefox, or Safari (latest version)
- **Screen Resolution**: 1920x1080 recommended
- **Network**: Stable internet connection
- **Notes**: Spreadsheet or document for recording results

## Test Scenarios by Module

### Module 1: Authentication & User Management

#### Test Case 1.1: User Login
**Priority**: Critical

**Steps**:
1. Navigate to http://localhost:8081
2. Enter email: `admin@test.com`
3. Enter password: `admin123`
4. Click "Se connecter"

**Expected Results**:
- ✅ Successful login
- ✅ Redirected to dashboard
- ✅ User name displayed in header
- ✅ Appropriate menu items shown based on role

**Test Data**: All test accounts listed above

#### Test Case 1.2: Invalid Login
**Priority**: High

**Steps**:
1. Navigate to login page
2. Enter email: `admin@test.com`
3. Enter password: `wrongpassword`
4. Click "Se connecter"

**Expected Results**:
- ❌ Login fails
- ⚠️ Error message displayed: "Email ou mot de passe incorrect"
- 🔒 Account not locked after 1 attempt

#### Test Case 1.3: Password Reset
**Priority**: High

**Steps**:
1. Click "Mot de passe oublié?"
2. Enter email: `admin@test.com`
3. Submit request
4. Check for confirmation message

**Expected Results**:
- ✅ Success message displayed
- 📧 Email sent notification (check logs if email not configured)

#### Test Case 1.4: User Profile Management
**Priority**: Medium

**Steps**:
1. Login as admin
2. Click on user profile icon
3. Click "Profil"
4. Update name and phone number
5. Click "Sauvegarder"

**Expected Results**:
- ✅ Changes saved successfully
- ✅ Updated information displayed
- ✅ Success notification shown

### Module 2: Dashboard

#### Test Case 2.1: Dashboard Statistics
**Priority**: High

**Steps**:
1. Login as admin
2. View dashboard
3. Observe statistics cards

**Expected Results**:
- ✅ Total students count displayed
- ✅ Total teachers count displayed
- ✅ Total classes count displayed
- ✅ Revenue statistics shown
- ✅ Charts render correctly
- ✅ Recent activities list populated

#### Test Case 2.2: Dashboard Role-Based View
**Priority**: High

**Steps**:
1. Login as different roles (admin, teacher, parent)
2. Compare dashboard content

**Expected Results**:
- ✅ Admin sees system-wide statistics
- ✅ Teacher sees their classes and students
- ✅ Parent sees their children's information
- ✅ No unauthorized information visible

### Module 3: Student Management

#### Test Case 3.1: View Students List
**Priority**: High

**Steps**:
1. Login as admin or teacher
2. Navigate to "Élèves" menu
3. View student list

**Expected Results**:
- ✅ List of students displayed
- ✅ Search functionality works
- ✅ Filters (class, status) work
- ✅ Pagination works if >20 students
- ✅ Student cards show photo, name, class

#### Test Case 3.2: Add New Student
**Priority**: Critical

**Steps**:
1. Login as admin
2. Navigate to "Élèves"
3. Click "Ajouter un élève"
4. Fill in required fields:
   - Prénom: Jean
   - Nom: Dupont
   - Date de naissance: 01/01/2010
   - Sexe: Masculin
   - Classe: Select from dropdown
   - Email parent: parent.test@test.com
5. Click "Sauvegarder"

**Expected Results**:
- ✅ Student created successfully
- ✅ Success notification displayed
- ✅ Student appears in list
- ✅ Unique student ID generated

#### Test Case 3.3: Edit Student Information
**Priority**: High

**Steps**:
1. Navigate to student list
2. Click on a student
3. Click "Modifier"
4. Update phone number
5. Click "Sauvegarder"

**Expected Results**:
- ✅ Changes saved successfully
- ✅ Updated information displayed
- ✅ Audit trail recorded (if enabled)

#### Test Case 3.4: View Student Details
**Priority**: High

**Steps**:
1. Click on a student from the list
2. View student detail page

**Expected Results**:
- ✅ Personal information displayed
- ✅ Enrollment history shown
- ✅ Academic records visible
- ✅ Attendance summary shown
- ✅ Financial information (invoices) visible

### Module 4: Class Management

#### Test Case 4.1: View Classes
**Priority**: High

**Steps**:
1. Login as admin or teacher
2. Navigate to "Classes"
3. View class list

**Expected Results**:
- ✅ List of classes displayed
- ✅ Class name, level, and teacher shown
- ✅ Student count displayed
- ✅ Academic year indicated

#### Test Case 4.2: Create New Class
**Priority**: Critical

**Steps**:
1. Login as admin
2. Navigate to "Classes"
3. Click "Créer une classe"
4. Fill in:
   - Nom: "Terminale S1"
   - Niveau: "Terminale"
   - Enseignant principal: Select teacher
   - Année scolaire: Select current year
5. Click "Créer"

**Expected Results**:
- ✅ Class created successfully
- ✅ Appears in class list
- ✅ Can be selected when adding students

#### Test Case 4.3: Assign Students to Class
**Priority**: High

**Steps**:
1. Open class details
2. Click "Ajouter des élèves"
3. Select multiple students
4. Click "Ajouter"

**Expected Results**:
- ✅ Students added to class
- ✅ Student count updated
- ✅ Students appear in class roster

### Module 5: Grades & Academic Records

#### Test Case 5.1: Enter Grades
**Priority**: Critical

**Steps**:
1. Login as teacher
2. Navigate to "Notes"
3. Select class and subject
4. Click "Ajouter une note"
5. Enter:
   - Élève: Select student
   - Type: Devoir
   - Note: 15/20
   - Date: Today
6. Click "Enregistrer"

**Expected Results**:
- ✅ Grade saved successfully
- ✅ Appears in grade list
- ✅ Student average updated
- ✅ Parent can view grade

#### Test Case 5.2: View Grade Reports
**Priority**: High

**Steps**:
1. Navigate to "Bulletins"
2. Select student and term
3. Generate report

**Expected Results**:
- ✅ Report generated successfully
- ✅ All grades included
- ✅ Averages calculated correctly
- ✅ Teacher comments displayed
- ✅ Can export as PDF

#### Test Case 5.3: Parent Views Grades
**Priority**: High

**Steps**:
1. Login as parent
2. Navigate to child's grades
3. View grade details

**Expected Results**:
- ✅ All grades visible
- ✅ Averages displayed
- ✅ Subject breakdown shown
- ✅ No edit capability

### Module 6: Attendance Management

#### Test Case 6.1: Mark Attendance
**Priority**: Critical

**Steps**:
1. Login as teacher
2. Navigate to "Présences"
3. Select today's date and class
4. Mark attendance for each student:
   - Present, Absent, Late, Excused
5. Add note for absences
6. Click "Enregistrer"

**Expected Results**:
- ✅ Attendance saved successfully
- ✅ Can edit within same day
- ✅ Statistics updated
- ✅ Parent notified of absence

#### Test Case 6.2: View Attendance Reports
**Priority**: High

**Steps**:
1. Navigate to attendance reports
2. Select date range and student/class
3. Generate report

**Expected Results**:
- ✅ Report shows attendance statistics
- ✅ Absence rate calculated
- ✅ Trends visualization displayed
- ✅ Can export report

### Module 7: Financial Management

#### Test Case 7.1: Create Invoice
**Priority**: Critical

**Steps**:
1. Login as admin/accountant
2. Navigate to "Facturation"
3. Click "Créer une facture"
4. Fill in:
   - Élève: Select student
   - Type: Frais de scolarité
   - Montant: 50000 FCFA
   - Date d'échéance: End of month
5. Click "Créer"

**Expected Results**:
- ✅ Invoice created successfully
- ✅ Invoice number generated
- ✅ Status: "Non payée"
- ✅ Parent notified

#### Test Case 7.2: Record Payment
**Priority**: Critical

**Steps**:
1. Open invoice details
2. Click "Enregistrer un paiement"
3. Enter:
   - Montant: 50000 FCFA
   - Méthode: Espèces
   - Date: Today
4. Click "Enregistrer"

**Expected Results**:
- ✅ Payment recorded
- ✅ Invoice status: "Payée"
- ✅ Receipt generated
- ✅ Transaction recorded in accounting

#### Test Case 7.3: View Financial Reports
**Priority**: High

**Steps**:
1. Navigate to "Rapports financiers"
2. Select date range
3. Generate report

**Expected Results**:
- ✅ Revenue summary displayed
- ✅ Payment methods breakdown shown
- ✅ Outstanding invoices listed
- ✅ Charts and graphs rendered
- ✅ Can export to Excel/PDF

### Module 8: Library Management

#### Test Case 8.1: Add New Book
**Priority**: Medium

**Steps**:
1. Login as librarian
2. Navigate to "Bibliothèque"
3. Click "Ajouter un livre"
4. Fill in:
   - Titre: "Les Misérables"
   - Auteur: "Victor Hugo"
   - ISBN: "978-2-07-036158-4"
   - Catégorie: Littérature
   - Quantité: 5
5. Click "Ajouter"

**Expected Results**:
- ✅ Book added successfully
- ✅ Appears in catalog
- ✅ Available for loan

#### Test Case 8.2: Loan Book to Student
**Priority**: High

**Steps**:
1. Search for book
2. Click "Prêter"
3. Select student
4. Set due date (2 weeks)
5. Click "Confirmer"

**Expected Results**:
- ✅ Loan recorded
- ✅ Book quantity decreased
- ✅ Student notified
- ✅ Due date reminder scheduled

#### Test Case 8.3: Return Book
**Priority**: High

**Steps**:
1. Navigate to "Prêts en cours"
2. Find active loan
3. Click "Retourner"
4. Check book condition
5. Click "Confirmer le retour"

**Expected Results**:
- ✅ Loan closed
- ✅ Book quantity increased
- ✅ Late fees calculated if overdue
- ✅ Student history updated

### Module 9: Communication

#### Test Case 9.1: Send Message
**Priority**: High

**Steps**:
1. Login as teacher
2. Navigate to "Messages"
3. Click "Nouveau message"
4. Fill in:
   - Destinataire: Select parent(s)
   - Sujet: "Réunion de classe"
   - Message: Enter text
5. Click "Envoyer"

**Expected Results**:
- ✅ Message sent successfully
- ✅ Appears in sent items
- ✅ Recipient receives notification
- ✅ Can attach files

#### Test Case 9.2: Create Event
**Priority**: Medium

**Steps**:
1. Navigate to "Événements"
2. Click "Créer un événement"
3. Fill in:
   - Titre: "Journée sportive"
   - Date: Next week
   - Description: Event details
   - Participants: All students
4. Click "Créer"

**Expected Results**:
- ✅ Event created
- ✅ Appears in calendar
- ✅ Notifications sent
- ✅ Visible to participants

### Module 10: School Year Management

#### Test Case 10.1: View Current School Year
**Priority**: High

**Steps**:
1. Login as admin
2. Navigate to "Années scolaires"
3. View current year details

**Expected Results**:
- ✅ Current year highlighted
- ✅ Start and end dates shown
- ✅ Statistics displayed (classes, students, etc.)

#### Test Case 10.2: Create New School Year
**Priority**: Critical

**Steps**:
1. Click "Créer une année scolaire"
2. Fill in:
   - Nom: "2025-2026"
   - Date de début: 01/09/2025
   - Date de fin: 30/06/2026
   - Description: Optional
3. Click "Créer"

**Expected Results**:
- ✅ Year created successfully
- ✅ Status: "À venir"
- ✅ Can be selected for future planning

#### Test Case 10.3: Close School Year
**Priority**: Critical

**Steps**:
1. Select current school year
2. Click "Clôturer l'année"
3. Confirm action
4. System performs:
   - Archive current data
   - Generate reports
   - Prepare for new year

**Expected Results**:
- ✅ Year status: "Archivée"
- ✅ Data preserved and accessible
- ✅ Cannot add new data to archived year
- ✅ Reports generated successfully

#### Test Case 10.4: Promote Students
**Priority**: Critical

**Steps**:
1. Select school year to close
2. Click "Promouvoir les élèves"
3. Review promotion list
4. Confirm promotions

**Expected Results**:
- ✅ Students moved to next level
- ✅ Class assignments updated
- ✅ History maintained
- ✅ No data loss

## Test Execution

### Test Cycle Process

1. **Preparation** (Day 1 Morning)
   - [ ] Set up staging environment
   - [ ] Verify all services running
   - [ ] Distribute test accounts
   - [ ] Brief testers on procedures

2. **Execution** (Day 1-2)
   - [ ] Execute test cases by priority
   - [ ] Record results in test log
   - [ ] Report issues immediately
   - [ ] Take screenshots of issues

3. **Re-testing** (Day 3)
   - [ ] Verify bug fixes
   - [ ] Complete remaining tests
   - [ ] Perform exploratory testing
   - [ ] Validate edge cases

4. **Sign-off** (Day 3 End)
   - [ ] Review all test results
   - [ ] Ensure critical issues resolved
   - [ ] Document known issues
   - [ ] Approve for production (or not)

### Test Result Recording

Use this template for each test case:

```
Test Case ID: [e.g., 3.1]
Tester Name: [Your Name]
Date/Time: [When tested]
Result: [PASS / FAIL / BLOCKED]
Notes: [Any observations]
Issues Found: [List issue IDs if any]
Screenshots: [Attach if needed]
```

## Issue Reporting

### Issue Priority Levels

| Priority | Description | Example | Response Time |
|----------|-------------|---------|---------------|
| **Critical** | System unusable, data loss | Cannot login, data corruption | Immediate |
| **High** | Major feature broken | Cannot create invoice | Same day |
| **Medium** | Feature partially works | Minor calculation error | 2-3 days |
| **Low** | Cosmetic, minor inconvenience | Typo, alignment issue | Next sprint |

### Issue Report Template

```markdown
## Issue Title
[Brief description]

**Priority**: [Critical/High/Medium/Low]
**Module**: [Which module]
**Test Case**: [Which test case found it]

**Steps to Reproduce**:
1. Step one
2. Step two
3. Step three

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots**:
[Attach screenshots]

**Environment**:
- Browser: [Chrome 118]
- OS: [Windows 10]
- Date: [2025-10-27]

**Additional Notes**:
[Any other relevant information]
```

### Issue Tracking

Create issues in your tracking system (GitHub Issues, Jira, etc.) with:
- Clear title
- Detailed description
- Screenshots/videos
- Steps to reproduce
- Expected vs actual behavior
- Environment details

## UAT Completion Criteria

The UAT is considered complete when:

### Functional Criteria
- [ ] All critical test cases executed: 100%
- [ ] All high priority test cases executed: 100%
- [ ] Medium priority test cases executed: ≥80%
- [ ] Critical issues resolved: 100%
- [ ] High priority issues resolved: ≥95%
- [ ] No known data loss or corruption issues

### Performance Criteria
- [ ] Page load time: <3 seconds
- [ ] API response time: <500ms average
- [ ] Can handle 50+ concurrent users
- [ ] Database queries optimized

### Usability Criteria
- [ ] Testers rate usability: ≥4/5
- [ ] No major confusion in workflows
- [ ] Help documentation adequate
- [ ] Error messages clear and helpful

### Security Criteria
- [ ] Authentication works correctly
- [ ] Authorization enforced properly
- [ ] No sensitive data exposed
- [ ] Audit logging functional

### Documentation Criteria
- [ ] User guides updated
- [ ] Known issues documented
- [ ] Release notes prepared
- [ ] Training materials ready

## UAT Sign-Off Document

```
=====================================================
SCHOMAN UAT SIGN-OFF
=====================================================

Project: Schoman School Management System
Version: 3.0
UAT Period: [Start Date] to [End Date]

TEST SUMMARY
-----------------------------------------------------
Total Test Cases: [Number]
Executed: [Number] ([Percentage]%)
Passed: [Number] ([Percentage]%)
Failed: [Number] ([Percentage]%)

ISSUES SUMMARY
-----------------------------------------------------
Critical: [Number] (Resolved: [Number])
High: [Number] (Resolved: [Number])
Medium: [Number] (Resolved: [Number])
Low: [Number] (Resolved: [Number])

RECOMMENDATION
-----------------------------------------------------
[ ] APPROVED for production deployment
[ ] APPROVED with minor issues to be fixed post-deployment
[ ] NOT APPROVED - major issues must be resolved

SIGN-OFFS
-----------------------------------------------------
Test Coordinator: _______________ Date: _______
Admin Tester: _______________ Date: _______
Teacher Tester: _______________ Date: _______
Parent Tester: _______________ Date: _______
Business Owner: _______________ Date: _______

NOTES
-----------------------------------------------------
[Any additional comments or conditions]
```

## Support During UAT

### Contact Information

- **Technical Support**: [Support Email]
- **Test Coordinator**: [Coordinator Contact]
- **Development Team**: [Team Contact]

### Support Hours

- Monday-Friday: 8:00 AM - 6:00 PM
- Response Time: <2 hours for critical issues

### Resources

- [User Guide](./USAGE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [FAQ Document](./README.md)

---

**Last Updated**: October 27, 2025  
**Version**: 1.0  
**Status**: Ready for Use
