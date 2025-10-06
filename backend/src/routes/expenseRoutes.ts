import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  approveExpense,
  recordPayment,
  deleteExpense,
  getExpenseStats,
} from '../controllers/expenseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get statistics - admin and teachers
router.get('/stats', authorize('admin', 'teacher'), getExpenseStats);

// Get all expenses - admin and teachers only
router.get('/', authorize('admin', 'teacher'), getExpenses);

// Get single expense - admin and teachers only
router.get('/:id', authorize('admin', 'teacher'), getExpenseById);

// Create expense - admin and teachers only
router.post('/', authorize('admin', 'teacher'), createExpense);

// Update expense - admin and teachers only
router.put('/:id', authorize('admin', 'teacher'), updateExpense);

// Approve expense - admin only
router.post('/:id/approve', authorize('admin'), approveExpense);

// Record payment - admin only
router.post('/:id/payment', authorize('admin'), recordPayment);

// Delete expense - admin only
router.delete('/:id', authorize('admin'), deleteExpense);

export default router;
