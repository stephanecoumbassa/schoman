import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAuditLogs,
  getAuditLog,
  getMyAuditLogs,
  getAuditStats,
  deleteOldLogs
} from '../controllers/auditLogController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/audit-logs/my - Get current user's audit logs
router.get('/my', getMyAuditLogs);

// GET /api/audit-logs/stats - Get audit log statistics (admin only)
router.get('/stats', authorize('admin'), getAuditStats);

// GET /api/audit-logs - Get all audit logs (admin only)
router.get('/', authorize('admin'), getAuditLogs);

// GET /api/audit-logs/:id - Get a single audit log (admin only)
router.get('/:id', authorize('admin'), getAuditLog);

// DELETE /api/audit-logs/old - Delete old audit logs (admin only)
router.delete('/old', authorize('admin'), deleteOldLogs);

export default router;
