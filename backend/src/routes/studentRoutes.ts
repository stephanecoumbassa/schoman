import { Router } from 'express';
import { 
  createStudent, 
  getStudents, 
  getStudent, 
  updateStudent, 
  deleteStudent 
} from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and teachers can manage students
router.post('/', authorize('admin', 'teacher'), createStudent);
router.get('/', getStudents);
router.get('/:id', getStudent);
router.put('/:id', authorize('admin', 'teacher'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);

export default router;
