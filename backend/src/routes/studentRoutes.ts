import express from 'express';
import { getStudents, getStudent, createStudent, updateStudent, deleteStudent } from '../controllers/studentController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getStudents);
router.get('/:id', authenticate, getStudent);
router.post('/', authenticate, authorize('admin'), createStudent);
router.put('/:id', authenticate, authorize('admin'), updateStudent);
router.delete('/:id', authenticate, authorize('admin'), deleteStudent);

export default router;
