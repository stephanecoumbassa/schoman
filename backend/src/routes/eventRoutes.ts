import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventStats,
} from '../controllers/eventController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get statistics - admin and teachers
router.get('/stats', authorize('admin', 'teacher'), getEventStats);

// Get all events - all authenticated users can view
router.get('/', getEvents);

// Get single event
router.get('/:id', getEventById);

// Create event - admin and teachers only
router.post('/', authorize('admin', 'teacher'), createEvent);

// Update event - admin and teachers only
router.put('/:id', authorize('admin', 'teacher'), updateEvent);

// Delete event - admin only
router.delete('/:id', authorize('admin'), deleteEvent);

export default router;
