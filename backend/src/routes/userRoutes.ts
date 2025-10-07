import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  updatePassword,
  deleteUser,
  getUserStats,
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user statistics (admin only)
router.get('/stats', authorize('admin'), getUserStats);

// CRUD operations (admin only)
router.post('/', authorize('admin'), createUser);
router.get('/', authorize('admin', 'teacher'), getUsers);
router.get('/:id', authorize('admin'), getUser);
router.put('/:id', authorize('admin'), updateUser);
router.put('/:id/password', authorize('admin'), updatePassword);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
