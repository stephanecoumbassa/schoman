import { Router } from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  getStudentInvoices,
  updateOverdueInvoices,
  getInvoiceStatistics,
} from '../controllers/invoiceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Statistics
router.get('/statistics', getInvoiceStatistics);

// Update overdue invoices
router.post('/update-overdue', authorize('admin', 'teacher'), updateOverdueInvoices);

// Student invoices
router.get('/student/:studentId', getStudentInvoices);

// CRUD operations
router.post('/', authorize('admin', 'teacher'), createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.put('/:id', authorize('admin', 'teacher'), updateInvoice);
router.delete('/:id', authorize('admin'), deleteInvoice);

export default router;
