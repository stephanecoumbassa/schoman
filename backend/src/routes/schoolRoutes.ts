import express from 'express';
import {
  getSchools,
  getSchoolById,
  getSchoolByCode,
  createSchool,
  updateSchool,
  deleteSchool,
  getSchoolStats,
} from '../controllers/schoolController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Public routes (authenticated users)
router.get('/', getSchools);
router.get('/code/:code', getSchoolByCode);
router.get('/:id', getSchoolById);
router.get('/:id/stats', getSchoolStats);

// Admin only routes
router.post('/', authorize('admin'), createSchool);
router.put('/:id', authorize('admin'), updateSchool);
router.delete('/:id', authorize('admin'), deleteSchool);

export default router;
