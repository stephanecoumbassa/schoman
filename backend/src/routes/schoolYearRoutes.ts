import express from 'express';
import {
  getSchoolYears,
  getCurrentSchoolYear,
  getSchoolYear,
  createSchoolYear,
  updateSchoolYear,
  deleteSchoolYear,
  setCurrentSchoolYear,
  closeSchoolYear,
  promoteStudents,
  getSchoolYearStatistics,
} from '../controllers/schoolYearController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  validateRequest,
  schoolYearCreateSchema,
  schoolYearUpdateSchema,
  promoteStudentsSchema,
} from '../validation/schemas.js';

const router = express.Router();

// Public routes (protected)
router.get('/', protect, getSchoolYears);
router.get('/current', protect, getCurrentSchoolYear);
router.get('/:id', protect, getSchoolYear);
router.get('/:id/statistics', protect, getSchoolYearStatistics);

// Admin-only routes
router.post('/', protect, authorize('admin'), validateRequest(schoolYearCreateSchema), createSchoolYear);
router.put('/:id', protect, authorize('admin'), validateRequest(schoolYearUpdateSchema), updateSchoolYear);
router.delete('/:id', protect, authorize('admin'), deleteSchoolYear);
router.put('/:id/set-current', protect, authorize('admin'), setCurrentSchoolYear);
router.put('/:id/close', protect, authorize('admin'), closeSchoolYear);
router.post('/:id/promote-students', protect, authorize('admin'), validateRequest(promoteStudentsSchema), promoteStudents);

export default router;
