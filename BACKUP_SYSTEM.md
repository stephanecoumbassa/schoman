# 💾 Automatic Backup System Documentation - Schoman

## 🎯 Overview

The Automatic Backup System provides comprehensive database backup and restore capabilities for the Schoman application. It supports both manual and scheduled backups, with automatic rotation and email notifications.

## ✨ Features

### Core Capabilities
- 💾 **Manual Backups** - Create backups on-demand
- ⏰ **Scheduled Backups** - Automated daily backups
- 🔄 **Automatic Rotation** - Keep only N most recent backups
- 📧 **Email Notifications** - Alerts on backup success/failure
- 🔙 **Easy Restore** - One-click database restoration
- 📊 **Backup Management** - List, view, and delete backups
- 🔐 **Admin-Only Access** - Secure backup operations
- 📈 **Statistics** - Track backup size and frequency

### Key Features
- Uses MongoDB's native `mongodump` and `mongorestore` tools
- Compressed backups with gzip for space efficiency
- Configurable backup retention policy
- Non-blocking async operations
- Comprehensive error handling and logging
- Admin notification via email

## 🏗️ Architecture

### Backend Components

#### 1. Backup Service (`services/backupService.ts`)
Core service handling backup operations:

**Methods:**
- `createBackup(type)` - Create a new backup
- `restoreBackup(filename)` - Restore from a backup
- `listBackups()` - List all available backups
- `deleteBackup(filename)` - Delete a specific backup
- `rotateBackups()` - Remove old backups
- `getTotalBackupSize()` - Calculate total storage used
- `getStatus()` - Get service status

**Features:**
- Automatic cleanup after failed backups
- Email notifications on success/failure
- Backup rotation to manage storage
- MongoDB URI parsing for cloud/local databases

#### 2. Scheduled Backup Service (`services/scheduledBackupService.ts`)
Handles automated backup scheduling:

**Methods:**
- `start(cronExpression)` - Start scheduled backups
- `stop()` - Stop scheduled backups
- `getStatus()` - Get scheduling status
- `triggerManualBackup()` - Force a manual backup

**Configuration:**
- Default schedule: Daily at 2:00 AM (`0 2 * * *`)
- Customizable via cron expressions
- Automatic startup if enabled in environment

#### 3. Backup Controller (`controllers/backupController.ts`)
API endpoints for backup management:

**Endpoints:**
- `POST /api/backups` - Create manual backup
- `GET /api/backups` - List all backups
- `POST /api/backups/restore/:filename` - Restore backup
- `DELETE /api/backups/:filename` - Delete backup
- `GET /api/backups/status` - Get system status
- `POST /api/backups/scheduled/start` - Start scheduler
- `POST /api/backups/scheduled/stop` - Stop scheduler

### Frontend Components

#### 1. Backup Service (`services/backupService.ts`)
- API communication layer
- Type definitions
- Helper functions for formatting

#### 2. Backups View (`views/BackupsView.vue`)
**Features:**
- 📊 Statistics dashboard
- 📋 Backup list with details
- 🔄 Manual backup creation
- ▶️/⏹️ Start/stop scheduled backups
- 🔙 Restore functionality
- 🗑️ Delete backups
- 📱 Responsive design

## 📖 Usage

### Environment Configuration

Create or update `.env` file:

```env
# Backup Configuration
BACKUP_DIR=/path/to/backups          # Default: ./backups
MAX_BACKUPS=10                       # Keep last 10 backups
ENABLE_SCHEDULED_BACKUPS=true        # Auto-start scheduler
BACKUP_SCHEDULE=0 2 * * *            # Daily at 2:00 AM (cron)
ADMIN_EMAIL=admin@school.com         # For notifications

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/schoman
```

### Cron Expression Format

```
┌─────────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌─────────── day of month (1 - 31)
│ │ │ ┌───────── month (1 - 12)
│ │ │ │ ┌─────── day of week (0 - 6) (Sunday=0)
│ │ │ │ │
* * * * *
```

**Examples:**
- `0 2 * * *` - Every day at 2:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Every Sunday at midnight
- `30 3 * * 1-5` - Every weekday at 3:30 AM

### Backend Usage

#### 1. Manual Backup
```typescript
import backupService from './services/backupService.js';

// Create a backup
const backup = await backupService.createBackup('manual');
console.log(`Backup created: ${backup.filename}`);
```

#### 2. Scheduled Backups
```typescript
import scheduledBackupService from './services/scheduledBackupService.js';

// Start scheduled backups (daily at 2 AM)
scheduledBackupService.start();

// Custom schedule (every 6 hours)
scheduledBackupService.start('0 */6 * * *');

// Stop scheduled backups
scheduledBackupService.stop();
```

#### 3. Restore Database
```typescript
// Restore from a backup
await backupService.restoreBackup('backup_2025-10-11T02-00-00.gz');
```

### Frontend Usage

#### 1. Access Backup Management
Navigate to `/backups` in the application (admin only).

#### 2. Create Manual Backup
Click "Créer un Backup Manuel" button.

#### 3. Restore from Backup
- Click "Restaurer" on any backup in the list
- Confirm the operation
- Application will reload after successful restore

#### 4. Manage Scheduled Backups
- Click "Démarrer Backups Planifiés" to enable automation
- Click "Arrêter Backups Planifiés" to disable

#### 5. Delete Old Backups
Click "Supprimer" next to any backup to remove it.

### API Reference

#### Create Manual Backup
```http
POST /api/backups
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "message": "Backup créé avec succès",
  "backup": {
    "filename": "backup_2025-10-11T12-00-00.gz",
    "path": "/backups/backup_2025-10-11T12-00-00.gz",
    "size": 1048576,
    "timestamp": "2025-10-11T12:00:00.000Z",
    "type": "manual",
    "status": "success"
  }
}
```

#### List Backups
```http
GET /api/backups
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "backups": [...],
  "totalBackups": 5,
  "totalSize": 5242880,
  "totalSizeFormatted": "5 MB"
}
```

#### Restore Backup
```http
POST /api/backups/restore/backup_2025-10-11T12-00-00.gz
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "message": "Database restaurée avec succès",
  "filename": "backup_2025-10-11T12-00-00.gz"
}
```

#### Delete Backup
```http
DELETE /api/backups/backup_2025-10-11T12-00-00.gz
Authorization: Bearer <admin-token>
```

#### Get Status
```http
GET /api/backups/status
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "service": {
    "isBackingUp": false,
    "backupDir": "/backups",
    "maxBackups": 10
  },
  "scheduled": {
    "isRunning": true,
    "schedule": "0 2 * * *",
    "nextRun": "Active"
  },
  "stats": {
    "totalBackups": 5,
    "totalSize": 5242880,
    "totalSizeFormatted": "5 MB",
    "latestBackup": {...}
  }
}
```

## 🛠️ Requirements

### System Requirements
- **MongoDB Database Tools** must be installed
  - `mongodump` - For creating backups
  - `mongorestore` - For restoring backups

### Installation (Ubuntu/Debian)
```bash
# Install MongoDB Database Tools
wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-x86_64-100.9.0.tgz
tar -zxvf mongodb-database-tools-*.tgz
sudo mv mongodb-database-tools-*/bin/* /usr/local/bin/
mongodump --version
```

### Installation (macOS)
```bash
brew install mongodb-database-tools
```

### Installation (Windows)
Download from: https://www.mongodb.com/try/download/database-tools

### Node.js Dependencies
```bash
npm install node-cron @types/node-cron
```

## 📊 Backup Details

### Backup File Format
- **Filename:** `backup_YYYY-MM-DDTHH-MM-SS.gz`
- **Format:** Gzip-compressed MongoDB archive
- **Location:** Configurable via `BACKUP_DIR` env variable

### Storage Management
- **Automatic Rotation:** Keeps only N most recent backups (configurable)
- **Manual Deletion:** Admins can delete any backup
- **Size Tracking:** Total size displayed in dashboard

### Email Notifications
Sent when:
- ✅ Backup completes successfully
- ❌ Backup fails
- Includes: filename, size, timestamp, status, error details

**Email Template:**
```
Subject: ✅ Backup Database Successful

Database backup completed successfully.

Filename: backup_2025-10-11T02-00-00.gz
Size: 2.5 MB
Type: automatic
Timestamp: 2025-10-11T02:00:00.000Z

The backup is stored in: /backups
```

## 🔐 Security & Permissions

### Access Control
- **Admin-Only:** All backup operations require admin role
- **Authentication:** JWT token required for all endpoints
- **Authorization:** Role-based access control

### Best Practices
1. **Regular Backups** - Schedule daily backups minimum
2. **Off-Site Storage** - Copy backups to remote location
3. **Test Restores** - Periodically test restoration process
4. **Secure Backup Files** - Restrict file system access
5. **Monitor Notifications** - Check backup success emails
6. **Clean Old Backups** - Don't let backups consume all storage

## ⚠️ Important Notes

### Before Restoring
1. ✅ **Verify Backup** - Ensure backup file is valid
2. ✅ **Notify Users** - Warn users of downtime
3. ✅ **Create Current Backup** - Backup current state first
4. ✅ **Stop Services** - Consider stopping application
5. ⚠️ **Data Loss Warning** - All current data will be replaced

### Backup Limitations
- ⚠️ Requires MongoDB Database Tools installed
- ⚠️ Large databases may take several minutes
- ⚠️ Backup process blocks during execution
- ⚠️ Network connectivity required for cloud databases

### Restore Considerations
- ⚠️ Restores are destructive (data replaced)
- ⚠️ No partial restore support
- ⚠️ Users should be logged out
- ⚠️ Application restart recommended

## 📈 Monitoring

### Health Checks
- Check scheduled backup status regularly
- Monitor backup file sizes (rapid growth = investigation)
- Review backup success rate
- Verify email notifications received

### Logs
All backup operations are logged via Winston:
```typescript
logger.info('Starting database backup', { filename, type });
logger.info('Backup completed successfully', { filename, size });
logger.error('Backup failed', { error, filename });
```

### Metrics to Track
- Backup success rate
- Average backup size
- Backup duration
- Storage usage
- Failed backup count

## 🚀 Future Enhancements

### Planned Features
- [ ] S3/Cloud storage integration
- [ ] Incremental backups
- [ ] Backup encryption
- [ ] Backup verification/integrity checks
- [ ] Multiple backup locations
- [ ] Backup scheduling UI
- [ ] Restore preview (non-destructive)
- [ ] Backup compression level options
- [ ] Backup to remote MongoDB
- [ ] Point-in-time recovery

### Integration Ideas
- [ ] Slack/Teams notifications
- [ ] Backup before major operations
- [ ] Automated restore testing
- [ ] Backup analytics dashboard
- [ ] Export audit logs with backups

## 🎓 Troubleshooting

### Common Issues

#### 1. mongodump not found
```
Error: mongodump is not installed
```
**Solution:** Install MongoDB Database Tools (see Requirements section)

#### 2. Permission denied
```
Error: EACCES: permission denied, mkdir '/backups'
```
**Solution:** Ensure backup directory has write permissions

#### 3. Backup fails with authentication error
```
Error: authentication failed
```
**Solution:** Check MONGODB_URI credentials

#### 4. Scheduled backups not running
**Check:**
- `ENABLE_SCHEDULED_BACKUPS=true` in .env
- Server logs for scheduler start message
- Cron expression is valid

#### 5. Email notifications not received
**Check:**
- SMTP configuration in .env
- ADMIN_EMAIL is set
- Email service is configured

### Debug Mode
Enable detailed logging:
```env
LOG_LEVEL=debug
```

View backup logs:
```bash
tail -f logs/combined.log | grep backup
```

## 🔗 Related Documentation
- [PHASE3_PROGRESS.md](./PHASE3_PROGRESS.md) - Implementation progress
- [AUDIT_TRAIL.md](./AUDIT_TRAIL.md) - Audit logging
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

---

**Status:** ✅ Implemented (Phase 3)  
**Version:** 1.0  
**Last Updated:** October 11, 2025  
**Author:** Agent AI
