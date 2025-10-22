import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import logger from '../utils/logger.js';
import emailService from './emailService.js';

const execAsync = promisify(exec);

export interface BackupInfo {
  filename: string;
  path: string;
  size: number;
  timestamp: Date;
  type: 'manual' | 'automatic';
  status: 'success' | 'failed';
  error?: string;
}

class BackupService {
  private backupDir: string;
  private maxBackups: number;
  private isBackingUp: boolean;

  constructor() {
    this.backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
    this.maxBackups = parseInt(process.env.MAX_BACKUPS || '10', 10);
    this.isBackingUp = false;
    this.initializeBackupDirectory();
  }

  /**
   * Initialize backup directory
   */
  private async initializeBackupDirectory(): Promise<void> {
    try {
      if (!existsSync(this.backupDir)) {
        await fs.mkdir(this.backupDir, { recursive: true });
        logger.info(`Backup directory created at ${this.backupDir}`);
      }
    } catch (error) {
      logger.error('Failed to initialize backup directory', { error });
    }
  }

  /**
   * Create a MongoDB backup using mongodump
   */
  async createBackup(type: 'manual' | 'automatic' = 'automatic'): Promise<BackupInfo> {
    if (this.isBackingUp) {
      throw new Error('Backup already in progress');
    }

    this.isBackingUp = true;
    const timestamp = new Date();
    const filename = `backup_${timestamp.toISOString().replace(/[:.]/g, '-')}.gz`;
    const backupPath = path.join(this.backupDir, filename);

    try {
      logger.info('Starting database backup', { filename, type });

      // Get MongoDB URI from environment
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/schoman';
      
      // Extract database name from URI
      const dbName = this.extractDatabaseName(mongoUri);

      // Check if mongodump is available
      try {
        await execAsync('mongodump --version');
      } catch (error) {
        throw new Error('mongodump is not installed. Please install MongoDB Database Tools.');
      }

      // Create backup using mongodump
      const dumpCommand = mongoUri.includes('mongodb+srv') || mongoUri.includes('mongodb://')
        ? `mongodump --uri="${mongoUri}" --archive="${backupPath}" --gzip`
        : `mongodump --db="${dbName}" --archive="${backupPath}" --gzip`;

      await execAsync(dumpCommand);

      // Get backup file size
      const stats = await fs.stat(backupPath);
      const backupInfo: BackupInfo = {
        filename,
        path: backupPath,
        size: stats.size,
        timestamp,
        type,
        status: 'success'
      };

      logger.info('Backup completed successfully', {
        filename,
        size: this.formatBytes(stats.size),
        type
      });

      // Rotate backups (delete old ones)
      await this.rotateBackups();

      // Send notification email
      await this.sendBackupNotification(backupInfo);

      return backupInfo;
    } catch (error: any) {
      logger.error('Backup failed', { error: error.message, filename });
      
      // Clean up failed backup file
      try {
        if (existsSync(backupPath)) {
          await fs.unlink(backupPath);
        }
      } catch (cleanupError) {
        logger.error('Failed to clean up failed backup', { cleanupError });
      }

      const backupInfo: BackupInfo = {
        filename,
        path: backupPath,
        size: 0,
        timestamp,
        type,
        status: 'failed',
        error: error.message
      };

      // Send failure notification
      await this.sendBackupNotification(backupInfo);

      throw error;
    } finally {
      this.isBackingUp = false;
    }
  }

  /**
   * Restore from a backup
   */
  async restoreBackup(filename: string): Promise<void> {
    const backupPath = path.join(this.backupDir, filename);

    if (!existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${filename}`);
    }

    try {
      logger.info('Starting database restore', { filename });

      // Get MongoDB URI from environment
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/schoman';

      // Check if mongorestore is available
      try {
        await execAsync('mongorestore --version');
      } catch (error) {
        throw new Error('mongorestore is not installed. Please install MongoDB Database Tools.');
      }

      // Restore using mongorestore
      const restoreCommand = mongoUri.includes('mongodb+srv') || mongoUri.includes('mongodb://')
        ? `mongorestore --uri="${mongoUri}" --archive="${backupPath}" --gzip --drop`
        : `mongorestore --archive="${backupPath}" --gzip --drop`;

      await execAsync(restoreCommand);

      logger.info('Database restore completed successfully', { filename });
    } catch (error: any) {
      logger.error('Database restore failed', { error: error.message, filename });
      throw error;
    }
  }

  /**
   * List all available backups
   */
  async listBackups(): Promise<BackupInfo[]> {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.startsWith('backup_') && file.endsWith('.gz'));

      const backups: BackupInfo[] = [];
      for (const file of backupFiles) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        
        // Extract timestamp from filename
        const timestampMatch = file.match(/backup_(.+)\.gz/);
        const timestamp = timestampMatch 
          ? new Date(timestampMatch[1].replace(/-/g, ':'))
          : stats.mtime;

        backups.push({
          filename: file,
          path: filePath,
          size: stats.size,
          timestamp,
          type: 'automatic', // Can't determine from filename alone
          status: 'success'
        });
      }

      // Sort by timestamp (newest first)
      backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return backups;
    } catch (error) {
      logger.error('Failed to list backups', { error });
      return [];
    }
  }

  /**
   * Delete a specific backup
   */
  async deleteBackup(filename: string): Promise<void> {
    const backupPath = path.join(this.backupDir, filename);

    if (!existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${filename}`);
    }

    try {
      await fs.unlink(backupPath);
      logger.info('Backup deleted', { filename });
    } catch (error) {
      logger.error('Failed to delete backup', { error, filename });
      throw error;
    }
  }

  /**
   * Rotate backups - keep only the most recent N backups
   */
  private async rotateBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();

      if (backups.length > this.maxBackups) {
        const backupsToDelete = backups.slice(this.maxBackups);
        
        for (const backup of backupsToDelete) {
          try {
            await this.deleteBackup(backup.filename);
            logger.info('Old backup deleted during rotation', { 
              filename: backup.filename 
            });
          } catch (error) {
            logger.error('Failed to delete old backup during rotation', { 
              error, 
              filename: backup.filename 
            });
          }
        }

        logger.info(`Backup rotation completed. Kept ${this.maxBackups} most recent backups.`);
      }
    } catch (error) {
      logger.error('Backup rotation failed', { error });
    }
  }

  /**
   * Get total size of all backups
   */
  async getTotalBackupSize(): Promise<number> {
    try {
      const backups = await this.listBackups();
      return backups.reduce((total, backup) => total + backup.size, 0);
    } catch (error) {
      logger.error('Failed to calculate total backup size', { error });
      return 0;
    }
  }

  /**
   * Check backup status
   */
  getStatus() {
    return {
      isBackingUp: this.isBackingUp,
      backupDir: this.backupDir,
      maxBackups: this.maxBackups
    };
  }

  /**
   * Send backup notification email
   */
  private async sendBackupNotification(backupInfo: BackupInfo): Promise<void> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        logger.warn('ADMIN_EMAIL not configured, skipping backup notification');
        return;
      }

      // Send email notification using the backup notification template
      await emailService.sendBackupNotificationEmail(
        adminEmail,
        backupInfo.filename,
        backupInfo.type,
        backupInfo.timestamp,
        backupInfo.status,
        this.backupDir,
        backupInfo.status === 'success' ? this.formatBytes(backupInfo.size) : undefined,
        backupInfo.error
      );

      logger.info('Backup notification sent', {
        adminEmail,
        status: backupInfo.status,
        filename: backupInfo.filename
      });
    } catch (error) {
      logger.error('Failed to send backup notification', { error });
    }
  }

  /**
   * Extract database name from MongoDB URI
   */
  private extractDatabaseName(uri: string): string {
    try {
      // For mongodb+srv or mongodb:// URIs
      const match = uri.match(/\/([^/?]+)(\?|$)/);
      return match ? match[1] : 'schoman';
    } catch (error) {
      return 'schoman';
    }
  }

  /**
   * Format bytes to human-readable size
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export default new BackupService();
