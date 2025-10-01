import { Router } from 'express';
import { 
  createClass, 
  getClasses, 
  getClass, 
  updateClass, 
  deleteClass,
  getClassStatistics
} from '../controllers/classController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and teachers can manage classes
router.post('/', authorize('admin', 'teacher'), createClass);
router.get('/', getClasses);
router.get('/:id', getClass);
router.get('/:id/statistics', getClassStatistics);
router.put('/:id', authorize('admin', 'teacher'), updateClass);
router.delete('/:id', authorize('admin'), deleteClass);

export default router;
