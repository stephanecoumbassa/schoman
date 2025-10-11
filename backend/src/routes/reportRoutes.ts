import express from 'express';
import {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  generateReport,
  getTemplates,
  getReportStats,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Templates route (public for authenticated users)
router.get('/templates', getTemplates);

// Stats route (admin only)
router.get('/stats', authorize('admin'), getReportStats);

// Report CRUD routes
router.route('/').get(getReports).post(authorize('admin', 'teacher'), createReport);

router
  .route('/:id')
  .get(getReport)
  .put(authorize('admin', 'teacher'), updateReport)
  .delete(authorize('admin', 'teacher'), deleteReport);

// Generate report route
router.post('/:id/generate', generateReport);

export default router;
