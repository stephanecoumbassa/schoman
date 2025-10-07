import express from 'express';
import {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget,
  getBudgetComparison,
} from '../controllers/budgetController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Budget comparison (admin and teacher only)
router.get('/:id/comparison', authorize('admin', 'teacher'), getBudgetComparison);

// CRUD operations
router.get('/', authorize('admin', 'teacher'), getBudgets);
router.post('/', authorize('admin', 'teacher'), createBudget);
router.get('/:id', authorize('admin', 'teacher'), getBudget);
router.put('/:id', authorize('admin', 'teacher'), updateBudget);
router.delete('/:id', authorize('admin'), deleteBudget);

export default router;
