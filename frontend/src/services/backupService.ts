import api from './api';

export interface BackupInfo {
  filename: string;
  path: string;
  size: number;
  timestamp: string;
  type: 'manual' | 'automatic';
  status: 'success' | 'failed';
  error?: string;
}

export interface BackupStatus {
  service: {
    isBackingUp: boolean;
    backupDir: string;
    maxBackups: number;
  };
  scheduled: {
    isRunning: boolean;
    schedule: string;
    nextRun: string;
  };
  stats: {
    totalBackups: number;
    totalSize: number;
    totalSizeFormatted: string;
    latestBackup: BackupInfo | null;
  };
}

class BackupService {
  /**
   * Create a manual backup
   */
  async createBackup() {
    const response = await api.request<{
      message: string;
      backup: BackupInfo;
    }>('/backups', {
      method: 'POST'
    });
    return response.data;
  }

  /**
   * List all backups
   */
  async listBackups() {
    const response = await api.request<{
      backups: BackupInfo[];
      totalBackups: number;
      totalSize: number;
      totalSizeFormatted: string;
    }>('/backups');
    return response.data;
  }

  /**
   * Restore from a backup
   */
  async restoreBackup(filename: string) {
    const response = await api.request<{
      message: string;
      filename: string;
    }>(`/backups/restore/${filename}`, {
      method: 'POST'
    });
    return response.data;
  }

  /**
   * Delete a backup
   */
  async deleteBackup(filename: string) {
    const response = await api.request<{
      message: string;
      filename: string;
    }>(`/backups/${filename}`, {
      method: 'DELETE'
    });
    return response.data;
  }

  /**
   * Get backup service status
   */
  async getStatus() {
    const response = await api.request<BackupStatus>('/backups/status');
    return response.data;
  }

  /**
   * Start scheduled backups
   */
  async startScheduledBackups(schedule?: string) {
    const response = await api.request<{
      message: string;
      status: any;
    }>('/backups/scheduled/start', {
      method: 'POST',
      body: schedule ? { schedule } : undefined
    });
    return response.data;
  }

  /**
   * Stop scheduled backups
   */
  async stopScheduledBackups() {
    const response = await api.request<{
      message: string;
      status: any;
    }>('/backups/scheduled/stop', {
      method: 'POST'
    });
    return response.data;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format backup type for display
   */
  formatType(type: string): string {
    return type === 'manual' ? 'Manuel' : 'Automatique';
  }
}

export default new BackupService();
