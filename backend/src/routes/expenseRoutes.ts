import { Router } from 'express';
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getExpenseStatistics,
} from '../controllers/expenseController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Statistics
router.get('/statistics', getExpenseStatistics);

// CRUD operations
router.post('/', authorize('admin', 'teacher'), createExpense);
router.get('/', getExpenses);
router.get('/:id', getExpense);
router.put('/:id', authorize('admin', 'teacher'), updateExpense);
router.delete('/:id', authorize('admin'), deleteExpense);

export default router;
