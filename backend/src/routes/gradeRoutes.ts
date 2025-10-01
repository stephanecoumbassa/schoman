import { Router } from 'express';
import { 
  createGrade, 
  getGrades, 
  getGrade, 
  updateGrade, 
  deleteGrade,
  getStudentGradesSummary
} from '../controllers/gradeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Teachers and admin can manage grades
router.post('/', authorize('admin', 'teacher'), createGrade);
router.get('/', getGrades);
router.get('/student/:studentId/summary', getStudentGradesSummary);
router.get('/:id', getGrade);
router.put('/:id', authorize('admin', 'teacher'), updateGrade);
router.delete('/:id', authorize('admin', 'teacher'), deleteGrade);

export default router;
