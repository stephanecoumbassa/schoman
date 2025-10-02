import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createLoan,
  getLoans,
  getLoan,
  returnLoan,
  updateLoan,
  deleteLoan,
  getStudentLoans,
  updateOverdueLoans,
} from '../controllers/loanController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all loans (all authenticated users)
router.get('/', getLoans);

// Update overdue loans status (admin and teacher only)
router.post('/update-overdue', authorize('admin', 'teacher'), updateOverdueLoans);

// Get student loans history and stats (all authenticated users)
router.get('/student/:studentId', getStudentLoans);

// Get single loan (all authenticated users)
router.get('/:id', getLoan);

// Create loan (admin and teacher only)
router.post('/', authorize('admin', 'teacher'), createLoan);

// Return loan (admin and teacher only)
router.post('/:id/return', authorize('admin', 'teacher'), returnLoan);

// Update loan (admin and teacher only)
router.put('/:id', authorize('admin', 'teacher'), updateLoan);

// Delete loan (admin only)
router.delete('/:id', authorize('admin'), deleteLoan);

export default router;
