import { Router } from 'express';
import { 
  recordAttendance, 
  getAttendances, 
  getAttendance, 
  updateAttendance, 
  deleteAttendance,
  getStudentAttendanceStats,
  getClassAttendanceForDate
} from '../controllers/attendanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Teachers and admin can manage attendance
router.post('/', authorize('admin', 'teacher'), recordAttendance);
router.get('/', getAttendances);
router.get('/student/:studentId/stats', getStudentAttendanceStats);
router.get('/class/:classId/date', getClassAttendanceForDate);
router.get('/:id', getAttendance);
router.put('/:id', authorize('admin', 'teacher'), updateAttendance);
router.delete('/:id', authorize('admin', 'teacher'), deleteAttendance);

export default router;
