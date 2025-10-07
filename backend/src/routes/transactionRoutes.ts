import express from 'express';
import {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} from '../controllers/transactionController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get statistics (admin and teacher only)
router.get('/stats', authorize('admin', 'teacher'), getTransactionStats);

// CRUD operations
router.get('/', authorize('admin', 'teacher'), getTransactions);
router.post('/', authorize('admin', 'teacher'), createTransaction);
router.get('/:id', authorize('admin', 'teacher'), getTransaction);
router.put('/:id', authorize('admin', 'teacher'), updateTransaction);
router.delete('/:id', authorize('admin'), deleteTransaction);

export default router;
