#!/bin/bash

###############################################################################
# Schoman - Deployment Script for Staging Environment
# This script deploys the application to a staging environment
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
STAGING_HOST="${STAGING_HOST:-staging.schoman.com}"
STAGING_USER="${STAGING_USER:-deploy}"
STAGING_PATH="${STAGING_PATH:-/var/www/schoman-staging}"
GIT_BRANCH="${GIT_BRANCH:-staging}"

# Logging function
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

# Check if required environment variables are set
check_environment() {
    log "Checking environment variables..."
    
    if [ -z "${STAGING_HOST:-}" ]; then
        error "STAGING_HOST environment variable is not set"
        exit 1
    fi
    
    if [ -z "${STAGING_USER:-}" ]; then
        error "STAGING_USER environment variable is not set"
        exit 1
    fi
    
    success "Environment variables configured"
}

# Test SSH connection
test_ssh_connection() {
    log "Testing SSH connection to ${STAGING_USER}@${STAGING_HOST}..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "${STAGING_USER}@${STAGING_HOST}" exit 2>/dev/null; then
        success "SSH connection successful"
    else
        error "Cannot connect to ${STAGING_USER}@${STAGING_HOST}"
        error "Please ensure SSH keys are properly configured"
        exit 1
    fi
}

# Create backup before deployment
create_backup() {
    log "Creating backup of current deployment..."
    
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    
    ssh "${STAGING_USER}@${STAGING_HOST}" << EOF
        if [ -d "${STAGING_PATH}" ]; then
            mkdir -p "${STAGING_PATH}/../backups"
            cp -r "${STAGING_PATH}" "${STAGING_PATH}/../backups/${BACKUP_NAME}"
            echo "Backup created: ${BACKUP_NAME}"
        else
            echo "No existing deployment to backup"
        fi
EOF
    
    success "Backup created: ${BACKUP_NAME}"
}

# Pull latest code from repository
pull_latest_code() {
    log "Pulling latest code from ${GIT_BRANCH} branch..."
    
    ssh "${STAGING_USER}@${STAGING_HOST}" << EOF
        set -e
        
        # Create directory if it doesn't exist
        mkdir -p "${STAGING_PATH}"
        cd "${STAGING_PATH}"
        
        # Initialize or update git repository
        if [ ! -d ".git" ]; then
            git clone --branch ${GIT_BRANCH} https://github.com/stephanecoumbassa/schoman.git .
        else
            git fetch origin
            git checkout ${GIT_BRANCH}
            git pull origin ${GIT_BRANCH}
        fi
        
        echo "Latest code pulled successfully"
EOF
    
    success "Code updated from ${GIT_BRANCH} branch"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    ssh "${STAGING_USER}@${STAGING_HOST}" << EOF
        set -e
        cd "${STAGING_PATH}"
        
        # Install backend dependencies
        echo "Installing backend dependencies..."
        cd backend
        npm ci --production
        
        # Install frontend dependencies
        echo "Installing frontend dependencies..."
        cd ../frontend
        npm ci
        
        echo "Dependencies installed successfully"
EOF
    
    success "Dependencies installed"
}

# Build application
build_application() {
    log "Building application..."
    
    ssh "${STAGING_USER}@${STAGING_HOST}" << EOF
        set -e
        cd "${STAGING_PATH}"
        
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

# Copy environment files
setup_environment() {
    log "Setting up environment configuration..."
    
    ssh "${STAGING_USER}@${STAGING_HOST}" << EOF
        set -e
        cd "${STAGING_PATH}"
        
        # Copy environment files if they don't exist
        if [ ! -f "backend/.env" ]; then
            if [ -f "backend/.env.example" ]; then
                cp backend/.env.example backend/.env
                echo "Created backend/.env from example file"
                echo "⚠️  Please update backend/.env with actual staging credentials"
            fi
        fi
        
        if [ ! -f "frontend/.env" ]; then
            if [ -f "frontend/.env.example" ]; then
                cp frontend/.env.example frontend/.env
                echo "Created frontend/.env from example file"
            fi
        fi
EOF
    
    warning "Please ensure environment files are configured with staging credentials"
}

# Restart services
restart_services() {
    log "Restarting services..."
    
    ssh "${STAGING_USER}@${STAGING_HOST}" << EOF
        set -e
        cd "${STAGING_PATH}"
        
        # Stop services
        echo "Stopping services..."
        docker-compose -f docker-compose.staging.yml down || true
        
        # Start services
        echo "Starting services..."
        docker-compose -f docker-compose.staging.yml up -d
        
        echo "Services restarted successfully"
EOF
    
    success "Services restarted"
}

# Run health check
health_check() {
    log "Running health checks..."
    
    sleep 10  # Wait for services to start
    
    # Check if backend is responding
    if curl -f -s -o /dev/null "http://${STAGING_HOST}/api/health" || \
       curl -f -s -o /dev/null "https://${STAGING_HOST}/api/health"; then
        success "Backend health check passed"
    else
        warning "Backend health check failed or endpoint not accessible"
    fi
    
    # Check if frontend is responding
    if curl -f -s -o /dev/null "http://${STAGING_HOST}" || \
       curl -f -s -o /dev/null "https://${STAGING_HOST}"; then
        success "Frontend health check passed"
    else
        warning "Frontend health check failed or site not accessible"
    fi
}

# Send deployment notification
send_notification() {
    log "Deployment completed successfully!"
    success "Staging environment deployed: https://${STAGING_HOST}"
    
    # You can add Slack/Discord/Email notification here
    # Example: curl -X POST -H 'Content-type: application/json' \
    #          --data '{"text":"Staging deployment completed"}' \
    #          YOUR_WEBHOOK_URL
}

# Main deployment flow
main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║     Schoman - Staging Deployment Script              ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log "Starting deployment to staging environment..."
    echo ""
    
    # Execute deployment steps
    check_environment
    test_ssh_connection
    create_backup
    pull_latest_code
    install_dependencies
    build_application
    setup_environment
    restart_services
    health_check
    send_notification
    
    echo ""
    success "🎉 Deployment completed successfully!"
    echo ""
    echo "Staging URL: https://${STAGING_HOST}"
    echo ""
}

# Run main function
main
