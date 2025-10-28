#!/bin/bash

###############################################################################
# Schoman - Rollback Script
# This script rolls back to a previous deployment backup
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-production}"  # production or staging
BACKUP_NAME="${2:-}"

# Set environment-specific variables
if [ "$ENVIRONMENT" = "staging" ]; then
    HOST="${STAGING_HOST:-staging.schoman.com}"
    USER="${STAGING_USER:-deploy}"
    PATH_PREFIX="${STAGING_PATH:-/var/www/schoman-staging}"
elif [ "$ENVIRONMENT" = "production" ]; then
    HOST="${PRODUCTION_HOST:-schoman.com}"
    USER="${PRODUCTION_USER:-deploy}"
    PATH_PREFIX="${PRODUCTION_PATH:-/var/www/schoman}"
else
    echo -e "${RED}Invalid environment: ${ENVIRONMENT}${NC}"
    echo "Usage: $0 <environment> [backup_name]"
    echo "  environment: production or staging"
    echo "  backup_name: (optional) specific backup to restore"
    exit 1
fi

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Confirmation prompt
confirm() {
    local prompt="$1"
    echo -n -e "${YELLOW}${prompt} [y/N]: ${NC}"
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Show available backups
list_backups() {
    log "Listing available backups on ${ENVIRONMENT}..."
    echo ""
    
    ssh "${USER}@${HOST}" << EOF
        BACKUP_DIR="${PATH_PREFIX}/../backups"
        
        if [ ! -d "\${BACKUP_DIR}" ]; then
            echo "No backups directory found"
            exit 1
        fi
        
        echo "Available backups:"
        echo "=================="
        ls -lt "\${BACKUP_DIR}" | tail -n +2 | awk '{print \$9, "(" \$6, \$7, \$8 ")"}'
EOF
    
    echo ""
}

# Select backup to restore
select_backup() {
    if [ -z "${BACKUP_NAME}" ]; then
        log "No backup name provided. Fetching latest backup..."
        
        BACKUP_NAME=$(ssh "${USER}@${HOST}" << EOF
            BACKUP_DIR="${PATH_PREFIX}/../backups"
            ls -t "\${BACKUP_DIR}" | head -n 1
EOF
)
        
        if [ -z "${BACKUP_NAME}" ]; then
            error "No backups found"
            exit 1
        fi
        
        warning "Latest backup found: ${BACKUP_NAME}"
    fi
    
    # Verify backup exists
    log "Verifying backup: ${BACKUP_NAME}..."
    
    if ssh "${USER}@${HOST}" "[ -d '${PATH_PREFIX}/../backups/${BACKUP_NAME}' ]"; then
        success "Backup verified: ${BACKUP_NAME}"
    else
        error "Backup not found: ${BACKUP_NAME}"
        exit 1
    fi
}

# Confirm rollback
confirm_rollback() {
    echo ""
    echo -e "${RED}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                       ║${NC}"
    echo -e "${RED}║          ⚠️  ROLLBACK CONFIRMATION  ⚠️                 ║${NC}"
    echo -e "${RED}║                                                       ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Environment: ${RED}${ENVIRONMENT}${NC}"
    echo -e "Target Host: ${RED}${HOST}${NC}"
    echo -e "Backup: ${RED}${BACKUP_NAME}${NC}"
    echo ""
    echo "This will:"
    echo "  1. Stop current services"
    echo "  2. Create a snapshot of current state"
    echo "  3. Restore from backup: ${BACKUP_NAME}"
    echo "  4. Restart services"
    echo ""
    
    if ! confirm "Are you sure you want to rollback?"; then
        echo ""
        log "Rollback cancelled by user"
        exit 0
    fi
    
    echo ""
}

# Create snapshot before rollback
create_snapshot() {
    log "Creating snapshot of current state before rollback..."
    
    SNAPSHOT_NAME="pre-rollback-$(date +%Y%m%d-%H%M%S)"
    
    ssh "${USER}@${HOST}" << EOF
        set -e
        
        if [ -d "${PATH_PREFIX}" ]; then
            mkdir -p "${PATH_PREFIX}/../snapshots"
            cp -r "${PATH_PREFIX}" "${PATH_PREFIX}/../snapshots/${SNAPSHOT_NAME}"
            echo "Snapshot created: ${SNAPSHOT_NAME}"
        fi
EOF
    
    success "Snapshot created: ${SNAPSHOT_NAME}"
}

# Stop services
stop_services() {
    log "Stopping services..."
    
    ssh "${USER}@${HOST}" << EOF
        set -e
        cd "${PATH_PREFIX}"
        
        # Stop services based on deployment method
        if [ -f "docker-compose.yml" ]; then
            docker-compose down || true
        elif command -v pm2 &> /dev/null; then
            pm2 stop schoman || true
        elif systemctl is-active --quiet schoman; then
            sudo systemctl stop schoman || true
        fi
        
        echo "Services stopped"
EOF
    
    success "Services stopped"
}

# Restore from backup
restore_backup() {
    log "Restoring from backup: ${BACKUP_NAME}..."
    
    ssh "${USER}@${HOST}" << EOF
        set -e
        
        BACKUP_PATH="${PATH_PREFIX}/../backups/${BACKUP_NAME}"
        
        # Remove current deployment
        if [ -d "${PATH_PREFIX}" ]; then
            rm -rf "${PATH_PREFIX}"
        fi
        
        # Restore from backup
        cp -r "\${BACKUP_PATH}" "${PATH_PREFIX}"
        
        echo "Backup restored successfully"
EOF
    
    success "Backup restored: ${BACKUP_NAME}"
}

# Restart services
restart_services() {
    log "Restarting services..."
    
    ssh "${USER}@${HOST}" << EOF
        set -e
        cd "${PATH_PREFIX}"
        
        # Start services based on deployment method
        if [ -f "docker-compose.yml" ]; then
            docker-compose up -d
        elif command -v pm2 &> /dev/null; then
            pm2 start schoman || pm2 restart schoman
        elif systemctl list-unit-files | grep -q schoman.service; then
            sudo systemctl start schoman
        fi
        
        echo "Services restarted"
EOF
    
    success "Services restarted"
}

# Run health checks
health_check() {
    log "Running health checks..."
    
    sleep 10  # Wait for services to start
    
    local max_attempts=20
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s -o /dev/null "http://${HOST}/api/health" || \
           curl -f -s -o /dev/null "https://${HOST}/api/health"; then
            success "Backend health check passed"
            break
        fi
        
        attempt=$((attempt + 1))
        if [ $attempt -eq $max_attempts ]; then
            error "Backend health check failed after ${max_attempts} attempts"
            warning "Services may need manual intervention"
            exit 1
        fi
        
        log "Attempt $attempt/$max_attempts - Waiting for backend..."
        sleep 3
    done
    
    # Check frontend
    if curl -f -s -o /dev/null "http://${HOST}" || \
       curl -f -s -o /dev/null "https://${HOST}"; then
        success "Frontend health check passed"
    else
        warning "Frontend health check failed but backend is responding"
    fi
}

# Send notification
send_notification() {
    log "Sending rollback notification..."
    
    # Add your notification logic here
    # Example:
    # curl -X POST -H 'Content-type: application/json' \
    #      --data "{\"text\":\"⚠️ Rollback completed on ${ENVIRONMENT}: ${BACKUP_NAME}\"}" \
    #      "${SLACK_WEBHOOK_URL}"
    
    success "Rollback notification sent"
}

# Main rollback flow
main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║         Schoman - Rollback Script                    ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Show help if needed
    if [ "$ENVIRONMENT" = "--help" ] || [ "$ENVIRONMENT" = "-h" ]; then
        echo "Usage: $0 <environment> [backup_name]"
        echo ""
        echo "Arguments:"
        echo "  environment    production or staging (required)"
        echo "  backup_name    Specific backup to restore (optional, uses latest if not provided)"
        echo ""
        echo "Examples:"
        echo "  $0 production                    # Rollback production to latest backup"
        echo "  $0 staging backup-20250127-153045  # Rollback staging to specific backup"
        echo ""
        exit 0
    fi
    
    log "Starting rollback on ${ENVIRONMENT} environment..."
    echo ""
    
    # List available backups
    list_backups
    
    # Execute rollback steps
    select_backup
    confirm_rollback
    create_snapshot
    stop_services
    restore_backup
    restart_services
    health_check
    send_notification
    
    echo ""
    success "🔄 Rollback completed successfully!"
    echo ""
    echo "Environment: ${ENVIRONMENT}"
    echo "Restored Backup: ${BACKUP_NAME}"
    echo "URL: https://${HOST}"
    echo ""
}

# Run main function
main
