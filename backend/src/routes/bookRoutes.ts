import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
  getBookStatistics,
} from '../controllers/bookController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all books (all authenticated users)
router.get('/', getBooks);

// Get book statistics (all authenticated users)
router.get('/statistics', getBookStatistics);

// Get single book (all authenticated users)
router.get('/:id', getBook);

// Create book (admin and teacher only)
router.post('/', authorize('admin', 'teacher'), createBook);

// Update book (admin and teacher only)
router.put('/:id', authorize('admin', 'teacher'), updateBook);

// Delete book (admin only)
router.delete('/:id', authorize('admin'), deleteBook);

export default router;
