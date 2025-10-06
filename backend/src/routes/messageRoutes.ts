import express from 'express';
import {
  createMessage,
  getMessages,
  getMessage,
  markAsRead,
  archiveMessage,
  deleteMessage,
  getConversation,
  getMessageStats,
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get statistics
router.get('/stats', getMessageStats);

// Get all messages (inbox/sent)
router.get('/', getMessages);

// Get conversation by ID
router.get('/conversation/:conversationId', getConversation);

// Get single message
router.get('/:id', getMessage);

// Create new message
router.post('/', createMessage);

// Mark message as read
router.patch('/:id/read', markAsRead);

// Archive message
router.patch('/:id/archive', archiveMessage);

// Delete message
router.delete('/:id', deleteMessage);

export default router;
