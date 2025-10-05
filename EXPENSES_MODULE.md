# 💸 Expenses Module Documentation

## Overview

The Expenses Module provides complete expense tracking and management capabilities for the Schoman school management system. It enables administrators and teachers to record expenses across various categories, track vendors, and monitor spending patterns with detailed statistics.

## Features

### Expense Management
- ✅ Record expenses with detailed information
- ✅ Edit existing expense records
- ✅ Delete expenses (admin only, soft delete)
- ✅ 6 expense categories (salaries, supplies, maintenance, utilities, transport, other)
- ✅ Vendor/supplier tracking
- ✅ Multiple payment methods support
- ✅ Receipt number tracking
- ✅ Date-based filtering

### Financial Tracking
- ✅ Real-time statistics dashboard
- ✅ Total expenses calculation
- ✅ Category-based breakdowns
- ✅ Period-based analysis
- ✅ Expense trends tracking

### Advanced Filtering
- ✅ Filter by category
- ✅ Filter by date range (start/end dates)
- ✅ Filter by vendor
- ✅ Pagination support

## Technical Implementation

### Backend (Node.js + TypeScript + MongoDB)

#### Models

**Expense Model** (`backend/src/models/Expense.ts`)
```typescript
{
  description: string;                 // Expense description
  category: string;                    // salaries, supplies, maintenance, utilities, transport, other
  amount: number;                      // Amount in XAF
  date: Date;                          // Expense date
  vendor?: string;                     // Vendor/supplier name
  paymentMethod: string;               // cash, check, bank_transfer, credit_card, mobile_money
  paymentReference?: string;           // Payment reference number
  receiptNumber?: string;              // Receipt/invoice number
  recordedBy: ObjectId;                // Reference to User (who recorded it)
  notes?: string;                      // Additional notes
  isActive: boolean;                   // Soft delete flag
}
```

**Indexes:**
- `category + date` - For category-based date range queries
- `date` - For date-based sorting and filtering
- `recordedBy + date` - For user-specific expense tracking

#### Controllers

**Expense Controller** (`backend/src/controllers/expenseController.ts`)

1. **createExpense**
   - Creates new expense record
   - Validates all required fields
   - Auto-sets recordedBy from authenticated user
   - Returns populated expense with user details

2. **getExpenses**
   - Lists expenses with pagination
   - Filters: category, date range (start/end), vendor
   - Populates recordedBy user information
   - Default limit: 10, max: 100
   - Sorted by date (newest first)

3. **getExpense**
   - Retrieves single expense by ID
   - Includes full user details (recordedBy)

4. **updateExpense**
   - Updates expense details
   - All fields are optional (partial update)
   - Cannot change recordedBy field

5. **deleteExpense**
   - Soft delete (sets isActive: false)
   - Admin only
   - Preserves data for audit trail

6. **getExpenseStats**
   - Aggregates expense statistics
   - Groups by category
   - Calculates totals and counts
   - Supports date range filtering
   - Returns category breakdown

#### Routes

**Expense Routes** (`backend/src/routes/expenseRoutes.ts`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/expenses` | Admin, Teacher | Create new expense |
| GET | `/api/expenses` | All authenticated | List expenses |
| GET | `/api/expenses/statistics` | Admin, Teacher | Get statistics |
| GET | `/api/expenses/:id` | All authenticated | Get expense details |
| PUT | `/api/expenses/:id` | Admin, Teacher | Update expense |
| DELETE | `/api/expenses/:id` | Admin only | Delete expense |

### Frontend (Vue 3 + TypeScript + Tailwind CSS)

#### Views

**ExpensesView.vue** (`frontend/src/views/ExpensesView.vue`)

**Features:**
- Statistics dashboard with 3 key metrics
- Advanced filtering (category, date range)
- Expense table with pagination
- Create/edit expense modal
- Role-based action buttons
- Responsive design

**Components:**
1. **Statistics Cards**
   - Total Expenses (count)
   - Total Amount (currency formatted)
   - Categories (distinct count)

2. **Filters**
   - Category dropdown (6 options)
   - Start date picker
   - End date picker
   - Filter button

3. **Expense Table**
   - Date
   - Description (with notes tooltip)
   - Category (color-coded badge)
   - Vendor
   - Amount (formatted currency)
   - Action buttons (edit, delete)

4. **Create/Edit Modal**
   - Description input
   - Category dropdown
   - Amount input (numeric)
   - Date picker
   - Vendor input
   - Payment method dropdown
   - Payment reference input
   - Receipt number input
   - Notes textarea
   - Submit/Cancel buttons

**Category Color Coding:**
- Salaries: Purple badge
- Supplies: Blue badge
- Maintenance: Yellow badge
- Utilities: Green badge
- Transport: Indigo badge
- Other: Gray badge

#### API Service

**Expense API Methods** (`frontend/src/services/api.ts`)

```typescript
getExpenses(params?: {         // List expenses with filters
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  vendor?: string;
})

getExpense(id: string)         // Get single expense
createExpense(expenseData)     // Create new expense
updateExpense(id, expenseData) // Update expense
deleteExpense(id: string)      // Delete expense
getExpenseStats(params?: {     // Get statistics
  startDate?: string;
  endDate?: string;
})
```

## Usage Guide

### For Administrators/Teachers

#### Creating an Expense

1. Navigate to Dashboard and click "Gérer les dépenses"
2. Click "+ Nouvelle Dépense" button
3. Fill in the form:
   - **Description** (required): Brief description of the expense
   - **Category** (required): Select from dropdown
   - **Amount** (required): Enter amount in XAF
   - **Date** (required): Select date
   - **Vendor** (optional): Vendor/supplier name
   - **Payment Method** (required): Select payment type
   - **Payment Reference** (optional): Transaction reference
   - **Receipt Number** (optional): Receipt/invoice number
   - **Notes** (optional): Additional information
4. Click "Créer" to save

#### Editing an Expense

1. Find the expense in the table
2. Click the ✏️ edit icon (yellow)
3. Modify fields as needed
4. Click "Modifier" to save changes

#### Deleting an Expense

1. Find the expense (Admin only)
2. Click the 🗑️ delete icon (red)
3. Confirm deletion
4. Note: This is a soft delete (data preserved for audit)

#### Viewing Statistics

The dashboard automatically displays:
- **Total Expenses**: Total count of all expenses
- **Total Amount**: Sum of all expense amounts
- **Categories**: Number of distinct categories used

Statistics can be filtered by date range using the filter bar.

#### Filtering Expenses

Use the filter bar to:
- **By Category**: Select specific category
- **By Date Range**: Enter start and/or end dates
- **Apply**: Click "Filtrer" to apply filters

### For Students/Parents

Students and parents can view expense records but cannot create, edit, or delete them. This provides transparency while maintaining control.

## Database Seeding

The seed script creates 4 sample expenses:

1. **Salary Payment**
   - Category: Salaries
   - Amount: 450,000 XAF
   - Vendor: Marie Dupont
   - Method: Bank transfer
   - Date: 5 days ago

2. **School Supplies**
   - Category: Supplies
   - Amount: 75,000 XAF
   - Vendor: Papeterie Moderne
   - Method: Cash
   - Date: 3 days ago

3. **Maintenance Repair**
   - Category: Maintenance
   - Amount: 125,000 XAF
   - Vendor: ClimaTech Services
   - Method: Check
   - Date: 1 day ago

4. **Electricity Bill**
   - Category: Utilities
   - Amount: 95,000 XAF
   - Vendor: CIE (Électricité)
   - Method: Bank transfer
   - Date: Today

**Total Seeded**: 745,000 XAF across 4 categories

## API Examples

### Create Expense

```bash
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Fournitures scolaires - Décembre",
  "category": "supplies",
  "amount": 50000,
  "date": "2024-12-01",
  "vendor": "Papeterie ABC",
  "paymentMethod": "cash",
  "receiptNumber": "REC-2024-123",
  "notes": "Cahiers et stylos pour les élèves"
}
```

### List Expenses with Filters

```bash
GET /api/expenses?category=salaries&startDate=2024-11-01&endDate=2024-11-30&page=1&limit=10
Authorization: Bearer <token>
```

### Get Statistics

```bash
GET /api/expenses/statistics?startDate=2024-11-01&endDate=2024-11-30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalExpenses": 15,
  "totalAmount": 2450000,
  "byCategory": [
    {
      "_id": "salaries",
      "count": 5,
      "totalAmount": 1800000
    },
    {
      "_id": "supplies",
      "count": 6,
      "totalAmount": 350000
    }
  ],
  "period": {
    "startDate": "2024-11-01T00:00:00.000Z",
    "endDate": "2024-11-30T23:59:59.999Z"
  }
}
```

### Update Expense

```bash
PUT /api/expenses/60d5ec49f1b2c72b8c8e4567
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 55000,
  "notes": "Montant révisé après vérification"
}
```

### Delete Expense

```bash
DELETE /api/expenses/60d5ec49f1b2c72b8c8e4567
Authorization: Bearer <token>
```

## Security

### Authentication & Authorization

- All routes require authentication (JWT token)
- Expense creation/editing: Admin and Teacher roles
- Expense deletion: Admin role only
- Viewing: All authenticated users

### Data Validation

- Description required, trimmed
- Category must be valid enum value
- Amount must be >= 0
- Date must be valid date
- Payment method must be valid enum value
- RecordedBy automatically set from authenticated user

### Soft Delete

- Deleted expenses are marked inactive (isActive: false)
- Data preserved for audit trail
- Can be restored if needed (manual database operation)

## Performance Considerations

### Database Indexes

Three indexes for optimal query performance:
1. `{ category: 1, date: -1 }` - Category filtering with date sorting
2. `{ date: -1 }` - Date-based sorting
3. `{ recordedBy: 1, date: -1 }` - User-specific expense tracking

### Pagination

- Default page size: 10 expenses
- Maximum page size: 100 expenses
- Reduces data transfer and improves response time

### Aggregation

Statistics use MongoDB aggregation pipeline for efficient calculation of:
- Group counts by category
- Total amounts per category
- Overall totals

## Expense Categories Explained

| Category | Description | Examples |
|----------|-------------|----------|
| **Salaries** | Employee wages and benefits | Monthly salaries, bonuses, allowances |
| **Supplies** | School materials and equipment | Notebooks, pens, paper, chalk, markers |
| **Maintenance** | Repairs and upkeep | Building repairs, equipment servicing, cleaning |
| **Utilities** | Public services | Electricity, water, internet, phone |
| **Transport** | Transportation costs | Fuel, vehicle maintenance, field trips |
| **Other** | Miscellaneous expenses | Insurance, subscriptions, miscellaneous fees |

## Payment Methods

| Method | Description | Use Cases |
|--------|-------------|-----------|
| **Cash** (Espèces) | Physical currency | Small purchases, petty cash |
| **Check** (Chèque) | Bank check | Vendor payments, salaries |
| **Bank Transfer** (Virement) | Electronic transfer | Regular bills, large payments |
| **Credit Card** (Carte) | Card payment | Online purchases, subscriptions |
| **Mobile Money** | Mobile payment | Quick payments, modern vendors |

## Integration Points

### With Existing Modules

- **Authentication**: Uses JWT and role-based access
- **Users**: References user records for recordedBy field
- **Dashboard**: Can display expense statistics

### Future Integration Opportunities

- **Accounting Module**: Automated journal entries for expenses
- **Invoicing Module**: Link expenses to cost analysis
- **Reports Module**: Financial reports combining income and expenses
- **Budget Module**: Budget vs. actual expense tracking
- **Approval Workflow**: Multi-level approval for large expenses

## Troubleshooting

### Common Issues

**Expense not creating**
- Verify description is provided
- Check amount is a positive number
- Ensure date is a valid date
- Verify category and paymentMethod are valid
- Check JWT token is valid

**Cannot edit expense**
- Verify user has admin or teacher role
- Ensure expense exists and is active
- Check JWT token is valid

**Cannot delete expense**
- Verify user has admin role
- Ensure expense exists
- Check JWT token is valid

**Statistics not showing**
- Verify date range is valid
- Check there are expenses in the selected period
- Ensure user is authenticated

## Testing

### Manual Testing Steps

1. **Create Expense**
   - Login as admin: `admin@schoman.com` / `admin123`
   - Navigate to Expenses
   - Click "Nouvelle Dépense"
   - Fill form and submit
   - Verify expense appears in list

2. **Filter Expenses**
   - Select category filter
   - Enter date range
   - Click "Filtrer"
   - Verify filtered results

3. **Edit Expense**
   - Find expense in table
   - Click edit icon
   - Modify details
   - Submit
   - Verify changes saved

4. **Delete Expense**
   - Login as admin
   - Find expense
   - Click delete icon
   - Confirm deletion
   - Verify expense removed from list

5. **View Statistics**
   - Check statistics cards
   - Apply date filters
   - Verify stats update

### Database Verification

```bash
# Connect to MongoDB
mongosh schoman

# View expenses
db.expenses.find().pretty()

# Check statistics
db.expenses.aggregate([
  { $match: { isActive: true } },
  { $group: { 
    _id: "$category", 
    count: { $sum: 1 }, 
    total: { $sum: "$amount" } 
  }}
])

# View by category
db.expenses.find({ category: "salaries", isActive: true }).pretty()
```

## Future Enhancements

Potential improvements:
- [ ] Recurring expense templates
- [ ] Expense approval workflow
- [ ] Attachment support (receipts, invoices)
- [ ] Budget allocation and tracking
- [ ] Expense reports (PDF export)
- [ ] Email notifications for large expenses
- [ ] Multi-currency support
- [ ] Expense categories customization
- [ ] Bulk expense import (CSV/Excel)
- [ ] Expense vs. budget comparison
- [ ] Vendor management system
- [ ] Purchase order integration
- [ ] Expense analytics dashboard
- [ ] Mobile expense submission
- [ ] OCR for receipt scanning

## Reporting Capabilities

The module supports various reporting scenarios:

1. **Monthly Expense Report**
   - Filter by date range (e.g., current month)
   - View total expenses and breakdown by category

2. **Category Analysis**
   - Filter by specific category
   - View trends over time

3. **Vendor Spending**
   - Filter by vendor name
   - Track spending with specific suppliers

4. **Payment Method Analysis**
   - Track which payment methods are used most
   - Useful for cash flow management

## Best Practices

### Recording Expenses

1. **Be Descriptive**: Write clear descriptions
2. **Choose Correct Category**: Use appropriate category
3. **Keep Receipts**: Always get and file receipts
4. **Enter Promptly**: Record expenses as soon as possible
5. **Add Notes**: Include relevant details
6. **Track References**: Save payment references

### Financial Management

1. **Regular Review**: Check expenses weekly
2. **Budget Monitoring**: Compare against budget
3. **Vendor Tracking**: Maintain vendor relationships
4. **Audit Trail**: Use soft delete to preserve history
5. **Authorization**: Maintain proper approval processes

### Data Quality

1. **Accuracy**: Double-check amounts
2. **Completeness**: Fill all relevant fields
3. **Consistency**: Use standard vendor names
4. **Timeliness**: Enter expenses promptly
5. **Documentation**: Attach supporting documents

## Support

For issues or questions regarding the Expenses module:
1. Check this documentation
2. Review the code comments
3. Check the API response messages
4. Verify authentication and authorization
5. Check browser console for frontend errors
6. Check backend logs for server errors

## Acknowledgments

This module follows the established patterns in Schoman:
- Same authentication system
- Same API structure
- Same UI/UX patterns
- Same coding standards
- Same documentation style

Built with care for the Schoman school management system to provide comprehensive expense tracking and financial management capabilities.

---

**Module Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Production Ready ✅
