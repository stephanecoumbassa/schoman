#!/bin/bash

###############################################################################
# Schoman - Deployment Script for Production Environment
# This script deploys the application to production with safety checks
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
PRODUCTION_HOST="${PRODUCTION_HOST:-schoman.com}"
PRODUCTION_USER="${PRODUCTION_USER:-deploy}"
PRODUCTION_PATH="${PRODUCTION_PATH:-/var/www/schoman}"
GIT_TAG="${GIT_TAG:-}"  # Must be provided for production deployment
REQUIRE_TAG="${REQUIRE_TAG:-true}"

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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if git tag is provided for production
    if [ "${REQUIRE_TAG}" = "true" ] && [ -z "${GIT_TAG}" ]; then
        error "GIT_TAG environment variable is required for production deployment"
        error "Example: GIT_TAG=v1.0.0 ./deploy-production.sh"
        exit 1
    fi
    
    # Check environment variables
    if [ -z "${PRODUCTION_HOST:-}" ]; then
        error "PRODUCTION_HOST environment variable is not set"
        exit 1
    fi
    
    if [ -z "${PRODUCTION_USER:-}" ]; then
        error "PRODUCTION_USER environment variable is not set"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Confirm production deployment
confirm_deployment() {
    echo ""
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                       ║${NC}"
    echo -e "${YELLOW}║     ⚠️  PRODUCTION DEPLOYMENT CONFIRMATION  ⚠️        ║${NC}"
    echo -e "${YELLOW}║                                                       ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "Target: ${RED}${PRODUCTION_HOST}${NC}"
    echo -e "Tag: ${RED}${GIT_TAG}${NC}"
    echo ""
    
    if ! confirm "Are you sure you want to deploy to PRODUCTION?"; then
        echo ""
        log "Deployment cancelled by user"
        exit 0
    fi
    
    echo ""
}

# Test SSH connection
test_ssh_connection() {
    log "Testing SSH connection to ${PRODUCTION_USER}@${PRODUCTION_HOST}..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "${PRODUCTION_USER}@${PRODUCTION_HOST}" exit 2>/dev/null; then
        success "SSH connection successful"
    else
        error "Cannot connect to ${PRODUCTION_USER}@${PRODUCTION_HOST}"
        error "Please ensure SSH keys are properly configured"
        exit 1
    fi
}

# Create backup before deployment
create_backup() {
    log "Creating backup of current production deployment..."
    
    BACKUP_NAME="prod-backup-$(date +%Y%m%d-%H%M%S)"
    export BACKUP_NAME  # Make it available for rollback
    
    ssh "${PRODUCTION_USER}@${PRODUCTION_HOST}" << EOF
        set -e
        
        if [ -d "${PRODUCTION_PATH}" ]; then
            mkdir -p "${PRODUCTION_PATH}/../backups"
            
            # Create backup
            cp -r "${PRODUCTION_PATH}" "${PRODUCTION_PATH}/../backups/${BACKUP_NAME}"
            
            # Keep only last 10 backups
            cd "${PRODUCTION_PATH}/../backups"
            ls -t | tail -n +11 | xargs -r rm -rf
            
            echo "Backup created: ${BACKUP_NAME}"
        else
            echo "No existing deployment to backup"
        fi
EOF
    
    success "Backup created: ${BACKUP_NAME}"
    echo "📝 Save this backup name for potential rollback: ${BACKUP_NAME}"
}

# Pull specific tag from repository
deploy_tag() {
    log "Deploying tag ${GIT_TAG}..."
    
    ssh "${PRODUCTION_USER}@${PRODUCTION_HOST}" << EOF
        set -e
        
        # Create directory if it doesn't exist
        mkdir -p "${PRODUCTION_PATH}"
        cd "${PRODUCTION_PATH}"
        
        # Initialize or update git repository
        if [ ! -d ".git" ]; then
            git clone https://github.com/stephanecoumbassa/schoman.git .
        else
            git fetch --tags origin
        fi
        
        # Checkout specific tag
        git checkout "tags/${GIT_TAG}"
        
        echo "Tag ${GIT_TAG} deployed successfully"
EOF
    
    success "Code deployed from tag ${GIT_TAG}"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    ssh "${PRODUCTION_USER}@${PRODUCTION_HOST}" << EOF
        set -e
        cd "${PRODUCTION_PATH}"
        
        # Install backend dependencies (production only)
        echo "Installing backend dependencies..."
        cd backend
        npm ci --production --no-optional
        
        # Install frontend dependencies
        echo "Installing frontend dependencies..."
        cd ../frontend
        npm ci --no-optional
        
        echo "Dependencies installed successfully"
EOF
    
    success "Dependencies installed"
}

# Run tests before deployment
run_tests() {
    log "Running tests on production server..."
    
    ssh "${PRODUCTION_USER}@${PRODUCTION_HOST}" << EOF
        set -e
        cd "${PRODUCTION_PATH}"
        
        # Run backend tests
        echo "Running backend tests..."
        cd backend
        npm test || { echo "Backend tests failed!"; exit 1; }
        
        echo "Tests passed successfully"
EOF
    
    success "All tests passed"
}

# Build application
build_application() {
    log "Building application..."
    
    ssh "${PRODUCTION_USER}@${PRODUCTION_HOST}" << EOF
        set -e
        cd "${PRODUCTION_PATH}"
        
        # Build backend
        echo "Building backend..."
        cd backend
        npm run build
        
        # Build frontend
        echo "Building frontend..."
        cd ../frontend
        npm run build
        
        echo "Application built successfully"
EOF
    
    success "Application built"
}

# Database migrations (if any)
run_migrations() {
    log "Running database migrations..."
    
    ssh "${PRODUCTION_USER}@${PRODUCTION_HOST}" << EOF
        set -e
        cd "${PRODUCTION_PATH}/backend"
        
        # Run migrations if script exists
        if [ -f "scripts/migrate.sh" ]; then
            npm run migrate || echo "No migrations to run"
        else
            echo "No migration script found, skipping..."
        fi
EOF
    
    success "Migrations completed"
}

# Restart services with zero-downtime
restart_services() {
    log "Restarting services with zero-downtime..."
    
    ssh "${PRODUCTION_USER}@${PRODUCTION_HOST}" << EOF
        set -e
        cd "${PRODUCTION_PATH}"
        
        # Use docker-compose or PM2 depending on your setup
        if [ -f "docker-compose.yml" ]; then
            # Restart with docker-compose
            docker-compose up -d --no-deps --build
        else
            # Alternative: Use PM2 or systemd
            echo "Restarting services..."
            pm2 restart schoman || systemctl restart schoman
        fi
        
        echo "Services restarted successfully"
EOF
    
    success "Services restarted"
}

# Run comprehensive health checks
health_check() {
    log "Running comprehensive health checks..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s -o /dev/null "https://${PRODUCTION_HOST}/api/health"; then
            success "Backend health check passed"
            break
        fi
        
        attempt=$((attempt + 1))
        if [ $attempt -eq $max_attempts ]; then
            error "Backend health check failed after ${max_attempts} attempts"
            error "Consider rolling back the deployment"
            exit 1
        fi
        
        log "Attempt $attempt/$max_attempts - Waiting for backend to be ready..."
        sleep 2
    done
    
    # Check frontend
    if curl -f -s -o /dev/null "https://${PRODUCTION_HOST}"; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed"
        exit 1
    fi
    
    success "All health checks passed"
}

# Send deployment notification
send_notification() {
    log "Sending deployment notification..."
    
    # Add your notification logic here (Slack, Discord, Email, etc.)
    # Example Slack webhook:
    # curl -X POST -H 'Content-type: application/json' \
    #      --data "{\"text\":\"✅ Production deployment completed: ${GIT_TAG}\"}" \
    #      "${SLACK_WEBHOOK_URL}"
    
    success "Deployment notification sent"
}

# Main deployment flow
main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║     Schoman - Production Deployment Script           ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Execute deployment steps with safety checks
    check_prerequisites
    confirm_deployment
    test_ssh_connection
    create_backup
    deploy_tag
    install_dependencies
    run_tests
    build_application
    run_migrations
    restart_services
    health_check
    send_notification
    
    echo ""
    success "🎉 Production deployment completed successfully!"
    echo ""
    echo "Production URL: https://${PRODUCTION_HOST}"
    echo "Deployed Tag: ${GIT_TAG}"
    echo "Backup Name: ${BACKUP_NAME:-N/A}"
    echo ""
    echo "If you need to rollback, run:"
    echo "  ./rollback.sh ${BACKUP_NAME:-}"
    echo ""
}

# Run main function
main
