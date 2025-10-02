# 💰 Billing/Invoicing Module Documentation

## Overview

The Billing/Invoicing module provides complete invoice management capabilities for the Schoman school management system. It enables administrators and teachers to create invoices for tuition, activities, materials, and other school-related fees, track payments, and monitor financial status.

## Features

### Invoice Management
- ✅ Create invoices with multiple line items
- ✅ Edit draft and sent invoices
- ✅ Delete unpaid invoices (admin only)
- ✅ Automatic invoice numbering (INV-YYYY-NNNNN format)
- ✅ Multiple item categories (tuition, activity, material, transport, cafeteria, other)
- ✅ Tax calculation support
- ✅ Status tracking (draft, sent, paid, overdue, cancelled)

### Payment Processing
- ✅ Record payments with date and reference
- ✅ Multiple payment methods supported:
  - Cash (Espèces)
  - Check (Chèque)
  - Bank Transfer (Virement bancaire)
  - Credit Card (Carte de crédit)
  - Mobile Money (Mobile Money)
- ✅ Automatic status update to "paid" upon payment
- ✅ Payment history tracking

### Financial Tracking
- ✅ Real-time statistics dashboard
- ✅ Total revenue calculation
- ✅ Overdue invoice tracking
- ✅ Payment rate percentage
- ✅ Status-based grouping

### Advanced Filtering
- ✅ Filter by student
- ✅ Filter by status
- ✅ Filter by date range
- ✅ Pagination support

## Technical Implementation

### Backend (Node.js + TypeScript + MongoDB)

#### Models

**Invoice Model** (`backend/src/models/Invoice.ts`)
```typescript
{
  invoiceNumber: string;           // Auto-generated (INV-2024-00001)
  student: ObjectId;               // Reference to Student
  items: [{
    description: string;
    category: 'tuition' | 'activity' | 'material' | 'transport' | 'cafeteria' | 'other';
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }];
  subtotal: number;                // Auto-calculated
  taxRate: number;                 // Percentage (0-100)
  taxAmount: number;               // Auto-calculated
  totalAmount: number;             // Auto-calculated
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: Date;
  paymentMethod?: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'mobile_money';
  paymentReference?: string;
  notes?: string;
}
```

**Indexes:**
- `student + status` - For filtering invoices by student and status
- `invoiceNumber` - For unique invoice lookup
- `status + dueDate` - For overdue invoice queries

#### Controllers

**Invoice Controller** (`backend/src/controllers/invoiceController.ts`)

1. **createInvoice**
   - Creates new invoice with automatic calculations
   - Generates unique invoice number
   - Validates student exists
   - Calculates subtotal, tax, and total

2. **getInvoices**
   - Lists invoices with pagination
   - Filters: student, status, date range
   - Populates student information
   - Default limit: 10, max: 100

3. **getInvoice**
   - Retrieves single invoice by ID
   - Includes full student details

4. **updateInvoice**
   - Updates invoice details
   - Recalculates amounts if items changed
   - Cannot modify paid or cancelled invoices

5. **recordPayment**
   - Records payment for an invoice
   - Updates status to 'paid'
   - Stores payment method and reference
   - Cannot pay already paid or cancelled invoices

6. **deleteInvoice**
   - Deletes an invoice
   - Cannot delete paid invoices
   - Admin only

7. **getInvoiceStats**
   - Aggregates invoice statistics
   - Groups by status
   - Calculates total revenue
   - Counts overdue invoices

#### Routes

**Invoice Routes** (`backend/src/routes/invoiceRoutes.ts`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/invoices` | Admin, Teacher | Create new invoice |
| GET | `/api/invoices` | All authenticated | List invoices |
| GET | `/api/invoices/:id` | All authenticated | Get invoice details |
| PUT | `/api/invoices/:id` | Admin, Teacher | Update invoice |
| DELETE | `/api/invoices/:id` | Admin only | Delete invoice |
| POST | `/api/invoices/:id/payment` | Admin, Teacher | Record payment |
| GET | `/api/invoices/stats` | Admin, Teacher | Get statistics |

### Frontend (Vue 3 + TypeScript + Tailwind CSS)

#### Views

**InvoicesView.vue** (`frontend/src/views/InvoicesView.vue`)

**Features:**
- Statistics dashboard with 4 key metrics
- Advanced filtering (status, student, date range)
- Invoice table with pagination
- Create/edit invoice modal
- Payment recording modal
- Role-based action buttons
- Responsive design

**Components:**
1. **Statistics Cards**
   - Total Invoices
   - Total Revenue (in XAF)
   - Overdue Invoices
   - Payment Rate (%)

2. **Filters**
   - Status dropdown
   - Student dropdown
   - Start date picker
   - End date picker

3. **Invoice Table**
   - Invoice number
   - Student name
   - Amount (formatted currency)
   - Issue date
   - Due date
   - Status badge (color-coded)
   - Action buttons (view, pay, edit, delete)

4. **Create/Edit Modal**
   - Student selection
   - Dynamic line items
   - Category selection per item
   - Quantity and unit price inputs
   - Tax rate configuration
   - Due date picker
   - Status selection
   - Notes field
   - Real-time total calculation

5. **Payment Modal**
   - Amount display
   - Payment date picker
   - Payment method dropdown
   - Payment reference input

#### API Service

**Invoice API Methods** (`frontend/src/services/api.ts`)

```typescript
getInvoices(params?: any)          // List invoices with filters
getInvoice(id: string)             // Get single invoice
createInvoice(invoiceData: any)    // Create new invoice
updateInvoice(id, invoiceData)     // Update invoice
deleteInvoice(id: string)          // Delete invoice
recordPayment(id, paymentData)     // Record payment
getInvoiceStats()                  // Get statistics
```

## Usage Guide

### For Administrators/Teachers

#### Creating an Invoice

1. Navigate to Dashboard and click "Gérer les factures"
2. Click "+ Nouvelle Facture" button
3. Select the student from the dropdown
4. Add line items:
   - Enter description
   - Select category
   - Enter quantity
   - Enter unit price (will auto-calculate total)
   - Click "+ Ajouter un article" for additional items
5. Set tax rate if applicable (percentage)
6. Choose due date
7. Select status (Draft or Sent)
8. Add optional notes
9. Review the calculated total
10. Click "Créer" to save

#### Recording a Payment

1. Find the invoice in the table
2. Click the 💰 payment icon (green)
3. Verify the amount
4. Enter payment date
5. Select payment method
6. Enter payment reference (optional)
7. Click "Enregistrer le Paiement"
8. Invoice status will automatically update to "Paid"

#### Editing an Invoice

1. Find the invoice (must be Draft or Sent status)
2. Click the ✏️ edit icon (yellow)
3. Modify fields as needed
4. Click "Modifier" to save changes
5. Note: Cannot edit paid or cancelled invoices

#### Deleting an Invoice

1. Find the invoice (must not be paid)
2. Click the 🗑️ delete icon (red) - Admin only
3. Confirm deletion
4. Note: Cannot delete paid invoices

#### Viewing Statistics

The dashboard automatically displays:
- **Total Invoices**: Total count of all invoices
- **Total Revenue**: Sum of all paid invoices
- **Overdue Invoices**: Count of sent/overdue invoices past due date
- **Payment Rate**: Percentage of paid invoices

#### Filtering Invoices

Use the filter bar to:
- **By Status**: Draft, Sent, Paid, Overdue, Cancelled
- **By Student**: Select specific student
- **By Date Range**: Enter start and end dates

### For Students/Parents

Students can view invoices assigned to them but cannot create, edit, or delete them.

## Database Seeding

The seed script creates 3 sample invoices:

1. **INV-2024-00001** - Paid invoice
   - Student: First enrolled student
   - Items: Tuition (150,000 XAF), Materials (25,000 XAF)
   - Status: Paid
   - Payment: Bank transfer

2. **INV-2024-00002** - Sent invoice
   - Student: Second enrolled student
   - Items: Tuition (150,000 XAF)
   - Status: Sent
   - Payment: Pending

3. **INV-2024-00003** - Draft invoice
   - Student: Third enrolled student
   - Items: Tuition (150,000 XAF), Transport (30,000 XAF), Cafeteria (20,000 XAF)
   - Status: Draft
   - Payment: Not sent yet

## API Examples

### Create Invoice

```bash
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "student": "60d5ec49f1b2c72b8c8e4567",
  "items": [
    {
      "description": "Frais de scolarité - Trimestre 1",
      "category": "tuition",
      "quantity": 1,
      "unitPrice": 150000
    }
  ],
  "taxRate": 0,
  "dueDate": "2024-12-31",
  "notes": "Premier trimestre"
}
```

### List Invoices with Filters

```bash
GET /api/invoices?status=sent&student=60d5ec49f1b2c72b8c8e4567&page=1&limit=10
Authorization: Bearer <token>
```

### Record Payment

```bash
POST /api/invoices/60d5ec49f1b2c72b8c8e4568/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentDate": "2024-10-02",
  "paymentMethod": "bank_transfer",
  "paymentReference": "TRX-2024-001"
}
```

## Security

### Authentication & Authorization

- All routes require authentication (JWT token)
- Invoice creation/editing: Admin and Teacher roles
- Payment recording: Admin and Teacher roles
- Deletion: Admin role only
- Viewing: All authenticated users (filtered by access)

### Data Validation

- Invoice number uniqueness enforced
- Student existence validated
- Quantity must be >= 1
- Unit price must be >= 0
- Tax rate must be 0-100%
- Status must be valid enum value
- Cannot modify paid/cancelled invoices
- Cannot delete paid invoices

## Performance Considerations

### Database Indexes

Three indexes for optimal query performance:
1. `{ student: 1, status: 1 }` - Student invoices by status
2. `{ invoiceNumber: 1 }` - Unique invoice lookup
3. `{ status: 1, dueDate: 1 }` - Overdue queries

### Pagination

- Default page size: 10 invoices
- Maximum page size: 100 invoices
- Reduces data transfer and improves response time

### Aggregation

Statistics use MongoDB aggregation pipeline for efficient calculation of:
- Group counts by status
- Total revenue (paid invoices only)
- Overdue invoice count

## Future Enhancements

Potential improvements:
- [ ] PDF invoice generation with logo and template
- [ ] Email invoice to parents automatically
- [ ] Recurring invoice templates
- [ ] Partial payment support
- [ ] Payment plan/installment feature
- [ ] Late fee calculation for overdue invoices
- [ ] Bulk invoice generation for classes
- [ ] Export to Excel/CSV
- [ ] Invoice preview before sending
- [ ] Email reminders for due dates
- [ ] Receipt generation for paid invoices
- [ ] Integration with accounting module
- [ ] Multi-currency support
- [ ] Discount/voucher codes
- [ ] Payment gateway integration

## Integration Points

### With Existing Modules

- **Students**: Invoices reference student records
- **Authentication**: Uses JWT and role-based access
- **Dashboard**: Can display invoice statistics

### Future Integration Opportunities

- **Accounting Module**: Automated journal entries
- **Communication Module**: Email/SMS invoice reminders
- **Reports Module**: Financial reports and analytics
- **Parent Portal**: Parents view and pay invoices online
- **Expenses Module**: Complete financial picture

## Troubleshooting

### Common Issues

**Invoice not creating**
- Verify student ID is valid
- Check item quantities and prices are numbers
- Ensure due date is a valid date
- Verify JWT token is valid

**Cannot edit invoice**
- Check invoice status (must be draft or sent)
- Verify user has admin or teacher role
- Ensure invoice exists

**Cannot delete invoice**
- Check if invoice is paid (cannot delete)
- Verify user has admin role
- Ensure invoice exists

**Payment not recording**
- Check invoice status (must not be paid or cancelled)
- Verify payment method is valid
- Ensure payment date is valid
- Check JWT token is valid

## Testing

### Manual Testing Steps

1. **Create Invoice**
   - Login as admin: `admin@schoman.com` / `admin123`
   - Navigate to Invoices
   - Click "Nouvelle Facture"
   - Fill form and submit
   - Verify invoice appears in list

2. **Record Payment**
   - Find an unpaid invoice
   - Click payment icon
   - Fill payment details
   - Submit
   - Verify status changes to "Paid"

3. **Filter Invoices**
   - Select status filter
   - Select student filter
   - Enter date range
   - Verify filtered results

4. **Edit Invoice**
   - Find draft/sent invoice
   - Click edit icon
   - Modify details
   - Submit
   - Verify changes saved

5. **Delete Invoice**
   - Login as admin
   - Find unpaid invoice
   - Click delete icon
   - Confirm deletion
   - Verify invoice removed

### Database Verification

```bash
# Connect to MongoDB
mongosh schoman

# View invoices
db.invoices.find().pretty()

# Check statistics
db.invoices.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$totalAmount" } } }
])
```

## Support

For issues or questions regarding the Billing module:
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

Built with care for the Schoman school management system.
