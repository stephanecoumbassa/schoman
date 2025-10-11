import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createBackup,
  listBackups,
  restoreBackup,
  deleteBackup,
  getBackupStatus,
  startScheduledBackups,
  stopScheduledBackups
} from '../controllers/backupController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// GET /api/backups/status - Get backup service status
router.get('/status', getBackupStatus);

// GET /api/backups - List all backups
router.get('/', listBackups);

// POST /api/backups - Create a manual backup
router.post('/', createBackup);

// POST /api/backups/restore/:filename - Restore from a backup
router.post('/restore/:filename', restoreBackup);

// DELETE /api/backups/:filename - Delete a backup
router.delete('/:filename', deleteBackup);

// POST /api/backups/scheduled/start - Start scheduled backups
router.post('/scheduled/start', startScheduledBackups);

// POST /api/backups/scheduled/stop - Stop scheduled backups
router.post('/scheduled/stop', stopScheduledBackups);

export default router;
