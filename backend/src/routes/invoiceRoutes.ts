import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  recordPayment,
  deleteInvoice,
  getInvoiceStats,
} from '../controllers/invoiceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Statistics (admin and teacher)
router.get('/stats', authorize('admin', 'teacher'), getInvoiceStats);

// CRUD operations
router.post('/', authorize('admin', 'teacher'), createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.put('/:id', authorize('admin', 'teacher'), updateInvoice);
router.delete('/:id', authorize('admin'), deleteInvoice);

// Payment recording
router.post('/:id/payment', authorize('admin', 'teacher'), recordPayment);

export default router;
