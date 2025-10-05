import { Router } from 'express';
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
} from '../controllers/expenseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Expense management routes
router.post('/', authorize('admin', 'teacher'), createExpense);
router.get('/', getExpenses);
router.get('/statistics', authorize('admin', 'teacher'), getExpenseStats);
router.get('/:id', getExpense);
router.put('/:id', authorize('admin', 'teacher'), updateExpense);
router.delete('/:id', authorize('admin'), deleteExpense);

export default router;
