import { Router } from 'express';
import {
  recordPayment,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
  getStudentPayments,
  getPaymentStatistics,
} from '../controllers/paymentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Statistics
router.get('/statistics', getPaymentStatistics);

// Student payments
router.get('/student/:studentId', getStudentPayments);

// CRUD operations
router.post('/', authorize('admin', 'teacher'), recordPayment);
router.get('/', getPayments);
router.get('/:id', getPayment);
router.put('/:id', authorize('admin', 'teacher'), updatePayment);
router.delete('/:id', authorize('admin'), deletePayment);

export default router;
