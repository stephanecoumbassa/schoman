import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import backupService from '../services/backupService.js';
import scheduledBackupService from '../services/scheduledBackupService.js';
import { AuthorizationError, NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

// Create a manual backup
export const createBackup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can create backups
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('Accès refusé. Seuls les administrateurs peuvent créer des backups.');
    }

    const backupInfo = await backupService.createBackup('manual');
    
    res.status(201).json({
      message: 'Backup créé avec succès',
      backup: backupInfo
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      res.status(403).json({ message: error.message });
    } else {
      logger.error('Error creating backup', { error });
      res.status(500).json({ 
        message: 'Erreur lors de la création du backup',
        error: error.message 
      });
    }
  }
};

// List all backups
export const listBackups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can list backups
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('Accès refusé. Seuls les administrateurs peuvent consulter les backups.');
    }

    const backups = await backupService.listBackups();
    const totalSize = await backupService.getTotalBackupSize();
    
    res.json({
      backups,
      totalBackups: backups.length,
      totalSize,
      totalSizeFormatted: formatBytes(totalSize)
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      res.status(403).json({ message: error.message });
    } else {
      logger.error('Error listing backups', { error });
      res.status(500).json({ message: 'Erreur lors de la récupération des backups' });
    }
  }
};

// Restore from a backup
export const restoreBackup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can restore backups
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('Accès refusé. Seuls les administrateurs peuvent restaurer des backups.');
    }

    const { filename } = req.params;
    
    if (!filename) {
      res.status(400).json({ message: 'Nom du fichier requis' });
      return;
    }

    await backupService.restoreBackup(filename);
    
    res.json({
      message: 'Database restaurée avec succès',
      filename
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      res.status(403).json({ message: error.message });
    } else if (error.message.includes('not found')) {
      res.status(404).json({ message: 'Fichier de backup non trouvé' });
    } else {
      logger.error('Error restoring backup', { error });
      res.status(500).json({ 
        message: 'Erreur lors de la restauration du backup',
        error: error.message 
      });
    }
  }
};

// Delete a backup
export const deleteBackup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can delete backups
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('Accès refusé. Seuls les administrateurs peuvent supprimer des backups.');
    }

    const { filename } = req.params;
    
    if (!filename) {
      res.status(400).json({ message: 'Nom du fichier requis' });
      return;
    }

    await backupService.deleteBackup(filename);
    
    res.json({
      message: 'Backup supprimé avec succès',
      filename
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      res.status(403).json({ message: error.message });
    } else if (error.message.includes('not found')) {
      res.status(404).json({ message: 'Fichier de backup non trouvé' });
    } else {
      logger.error('Error deleting backup', { error });
      res.status(500).json({ 
        message: 'Erreur lors de la suppression du backup',
        error: error.message 
      });
    }
  }
};

// Get backup service status
export const getBackupStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can check backup status
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('Accès refusé. Seuls les administrateurs peuvent consulter le statut des backups.');
    }

    const serviceStatus = backupService.getStatus();
    const scheduledStatus = scheduledBackupService.getStatus();
    const backups = await backupService.listBackups();
    const totalSize = await backupService.getTotalBackupSize();
    
    res.json({
      service: serviceStatus,
      scheduled: scheduledStatus,
      stats: {
        totalBackups: backups.length,
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
        latestBackup: backups.length > 0 ? backups[0] : null
      }
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      res.status(403).json({ message: error.message });
    } else {
      logger.error('Error getting backup status', { error });
      res.status(500).json({ message: 'Erreur lors de la récupération du statut' });
    }
  }
};

// Start scheduled backups
export const startScheduledBackups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can manage scheduled backups
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('Accès refusé. Seuls les administrateurs peuvent gérer les backups planifiés.');
    }

    const { schedule } = req.body;
    scheduledBackupService.start(schedule);
    
    res.json({
      message: 'Backups planifiés démarrés',
      status: scheduledBackupService.getStatus()
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      res.status(403).json({ message: error.message });
    } else {
      logger.error('Error starting scheduled backups', { error });
      res.status(500).json({ 
        message: 'Erreur lors du démarrage des backups planifiés',
        error: error.message 
      });
    }
  }
};

// Stop scheduled backups
export const stopScheduledBackups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only admins can manage scheduled backups
    if (req.user?.role !== 'admin') {
      throw new AuthorizationError('Accès refusé. Seuls les administrateurs peuvent gérer les backups planifiés.');
    }

    scheduledBackupService.stop();
    
    res.json({
      message: 'Backups planifiés arrêtés',
      status: scheduledBackupService.getStatus()
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      res.status(403).json({ message: error.message });
    } else {
      logger.error('Error stopping scheduled backups', { error });
      res.status(500).json({ message: 'Erreur lors de l\'arrêt des backups planifiés' });
    }
  }
};

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
