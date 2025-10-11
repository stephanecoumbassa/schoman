import * as cron from 'node-cron';
import backupService from './backupService.js';
import logger from '../utils/logger.js';

class ScheduledBackupService {
  private task: ReturnType<typeof cron.schedule> | null = null;
  private isRunning: boolean = false;

  /**
   * Start scheduled backups
   * Default: Daily at 2:00 AM
   */
  start(cronExpression?: string): void {
    if (this.isRunning) {
      logger.warn('Scheduled backup service is already running');
      return;
    }

    // Default to daily at 2:00 AM if not specified
    const schedule = cronExpression || process.env.BACKUP_SCHEDULE || '0 2 * * *';

    try {
      // Validate cron expression
      if (!cron.validate(schedule)) {
        throw new Error(`Invalid cron expression: ${schedule}`);
      }

      this.task = cron.schedule(schedule, async () => {
        logger.info('Scheduled backup starting...');
        try {
          await backupService.createBackup('automatic');
          logger.info('Scheduled backup completed successfully');
        } catch (error) {
          logger.error('Scheduled backup failed', { error });
        }
      });

      this.isRunning = true;
      logger.info(`Scheduled backup service started with schedule: ${schedule}`);
      
      // Log next scheduled run
      const nextRun = this.getNextRunTime(schedule);
      if (nextRun) {
        logger.info(`Next scheduled backup: ${nextRun.toISOString()}`);
      }
    } catch (error) {
      logger.error('Failed to start scheduled backup service', { error });
      throw error;
    }
  }

  /**
   * Stop scheduled backups
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
      this.isRunning = false;
      logger.info('Scheduled backup service stopped');
    }
  }

  /**
   * Get status of scheduled backup service
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
      nextRun: this.task ? 'Active' : 'Inactive'
    };
  }

  /**
   * Calculate next run time for a cron expression
   */
  private getNextRunTime(cronExpression: string): Date | null {
    try {
      // Parse cron expression to calculate next run
      const parts = cronExpression.split(' ');
      if (parts.length < 5) return null;

      const now = new Date();
      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts.map(p => 
        p === '*' ? null : parseInt(p, 10)
      );

      const next = new Date(now);
      
      // Set minute
      if (minute !== null) {
        next.setMinutes(minute);
        if (next <= now) {
          next.setHours(next.getHours() + 1);
        }
      }

      // Set hour
      if (hour !== null) {
        next.setHours(hour);
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
      }

      next.setSeconds(0);
      next.setMilliseconds(0);

      return next;
    } catch (error) {
      return null;
    }
  }

  /**
   * Trigger manual backup immediately
   */
  async triggerManualBackup(): Promise<void> {
    logger.info('Manual backup triggered');
    await backupService.createBackup('manual');
  }
}

export default new ScheduledBackupService();
