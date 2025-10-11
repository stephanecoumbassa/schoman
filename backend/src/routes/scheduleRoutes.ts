import { Router } from 'express';
import { 
  createSchedule, 
  getSchedules, 
  getSchedule, 
  updateSchedule, 
  deleteSchedule,
  getClassSchedule,
  getTeacherSchedule
} from '../controllers/scheduleController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and teachers can manage schedules
router.post('/', authorize('admin', 'teacher'), createSchedule);
router.get('/', getSchedules);
router.get('/class/:classId', getClassSchedule);
router.get('/teacher/:teacherId', getTeacherSchedule);
router.get('/:id', getSchedule);
router.put('/:id', authorize('admin', 'teacher'), updateSchedule);
router.delete('/:id', authorize('admin'), deleteSchedule);

export default router;
