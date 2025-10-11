import { Router } from 'express';
import { 
  createSubject, 
  getSubjects, 
  getSubject, 
  updateSubject, 
  deleteSubject,
  getSubjectsByLevel
} from '../controllers/subjectController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and teachers can manage subjects
router.post('/', authorize('admin', 'teacher'), createSubject);
router.get('/', getSubjects);
router.get('/level/:level', getSubjectsByLevel);
router.get('/:id', getSubject);
router.put('/:id', authorize('admin', 'teacher'), updateSubject);
router.delete('/:id', authorize('admin'), deleteSubject);

export default router;
