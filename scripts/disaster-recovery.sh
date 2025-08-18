#!/bin/bash

# CoreFlow360 - Disaster Recovery Script
# Comprehensive disaster recovery automation for production systems

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups/database"
LOG_FILE="${PROJECT_ROOT}/logs/disaster_recovery_$(date +%Y%m%d_%H%M%S).log"
RECOVERY_TEMP_DIR="/tmp/coreflow360_recovery_$$"

# Load environment variables
if [[ -f "$PROJECT_ROOT/.env.local" ]]; then
    source "$PROJECT_ROOT/.env.local"
elif [[ -f "$PROJECT_ROOT/.env" ]]; then
    source "$PROJECT_ROOT/.env"
fi

# Auto-approval environment variables
# COREFLOW_AUTO_APPROVE=1 - Enable auto-approval for all operations
# COREFLOW_AUTO_APPROVE_DB=1 - Enable auto-approval for database operations only
# COREFLOW_AUTO_APPROVE_APP=1 - Enable auto-approval for application operations only
# CI=1 - Automatically enable auto-approval in CI environments
# AUTO_CONFIRM=1 - Legacy variable for backward compatibility

# Check for auto-approval environment variables
if [[ "${COREFLOW_AUTO_APPROVE:-}" == "1" ]] || [[ "${CI:-}" == "true" ]] || [[ "${AUTO_CONFIRM:-}" == "1" ]]; then
    export AUTO_CONFIRM="1"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "${LOG_FILE}"
}

info() { log "INFO" "$@"; }
warn() { log "WARN" "${YELLOW}$@${NC}"; }
error() { log "ERROR" "${RED}$@${NC}"; }
success() { log "SUCCESS" "${GREEN}$@${NC}"; }
critical() { log "CRITICAL" "${PURPLE}$@${NC}"; }

# Auto-approval audit logging
log_auto_approval() {
    local operation="$1"
    local context="$2"
    local audit_file="${PROJECT_ROOT}/logs/auto-approval-audit.log"
    
    # Create logs directory if it doesn't exist
    mkdir -p "$(dirname "$audit_file")"
    
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local user="${USER:-unknown}"
    local environment="${NODE_ENV:-development}"
    local session_id="$$"
    
    echo "[$timestamp] AUTO_APPROVAL: operation=$operation, user=$user, env=$environment, session=$session_id, context=$context" >> "$audit_file"
    
    # Also log to main log
    log "AUDIT" "AUTO_APPROVAL: $operation ($context)"
}

# Cleanup function
cleanup() {
    if [[ -d "$RECOVERY_TEMP_DIR" ]]; then
        rm -rf "$RECOVERY_TEMP_DIR"
        info "Cleaned up temporary recovery directory"
    fi
}

trap cleanup EXIT

# Send notification
send_notification() {
    local status=$1
    local message=$2
    local priority=${3:-"normal"}
    
    if [[ -n "${NOTIFICATION_WEBHOOK:-}" ]]; then
        local color="good"
        [[ $status == *"FAIL"* ]] && color="danger"
        [[ $priority == "critical" ]] && color="danger"
        
        curl -s -X POST "$NOTIFICATION_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"=� CoreFlow360 Disaster Recovery $status\",
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"fields\": [{
                        \"title\": \"Status\",
                        \"value\": \"$status\",
                        \"short\": true
                    }, {
                        \"title\": \"Message\",
                        \"value\": \"$message\",
                        \"short\": false
                    }, {
                        \"title\": \"Priority\",
                        \"value\": \"$priority\",
                        \"short\": true
                    }, {
                        \"title\": \"Timestamp\",
                        \"value\": \"$(date -u '+%Y-%m-%d %H:%M:%S UTC')\",
                        \"short\": true
                    }]
                }]
            }" || warn "Failed to send notification"
    fi
    
    # Send critical alerts via multiple channels
    if [[ $priority == "critical" ]]; then
        # Email alert (if configured)
        if [[ -n "${ALERT_EMAIL:-}" ]] && command -v mail &> /dev/null; then
            echo "$message" | mail -s "=� CRITICAL: CoreFlow360 Disaster Recovery $status" "$ALERT_EMAIL" || warn "Failed to send email alert"
        fi
        
        # SMS alert (if configured)
        if [[ -n "${ALERT_SMS_WEBHOOK:-}" ]]; then
            curl -s -X POST "$ALERT_SMS_WEBHOOK" \
                -d "message=CRITICAL: CoreFlow360 Disaster Recovery $status - $message" || warn "Failed to send SMS alert"
        fi
    fi
}

# Assess system status
assess_system_status() {
    critical "${BLUE}= DISASTER RECOVERY: Assessing System Status${NC}"
    
    local issues=0
    local status_report=""
    
    # Check database connectivity
    info "Checking database connectivity..."
    if [[ -n "${DATABASE_URL:-}" ]]; then
        if PGPASSWORD="$(echo "$DATABASE_URL" | sed 's/.*:\([^@]*\)@.*/\1/')" \
           psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
            success " Database is accessible"
            status_report+="\n Database: ONLINE"
        else
            error "L Database is not accessible"
            status_report+="\nL Database: OFFLINE"
            ((issues++))
        fi
    else
        warn "� DATABASE_URL not configured"
        status_report+="\n� Database: NOT CONFIGURED"
        ((issues++))
    fi
    
    # Check Redis connectivity
    info "Checking Redis connectivity..."
    if [[ -n "${REDIS_URL:-}" ]]; then
        if redis-cli -u "$REDIS_URL" ping &> /dev/null; then
            success " Redis is accessible"
            status_report+="\n Redis: ONLINE"
        else
            error "L Redis is not accessible"
            status_report+="\nL Redis: OFFLINE"
            ((issues++))
        fi
    else
        warn "� REDIS_URL not configured"
        status_report+="\n� Redis: NOT CONFIGURED"
    fi
    
    # Check file system
    info "Checking file system..."
    local disk_usage=$(df -h "$PROJECT_ROOT" | awk 'NR==2{print $5}' | tr -d '%')
    if [[ $disk_usage -gt 90 ]]; then
        error "L Disk usage critical: ${disk_usage}%"
        status_report+="\nL Disk: CRITICAL (${disk_usage}%)"
        ((issues++))
    else
        success " Disk usage acceptable: ${disk_usage}%"
        status_report+="\n Disk: OK (${disk_usage}%)"
    fi
    
    # Check application process
    info "Checking application status..."
    if pgrep -f "next" > /dev/null || pgrep -f "node.*start" > /dev/null; then
        success " Application process is running"
        status_report+="\n Application: RUNNING"
    else
        error "L Application process not found"
        status_report+="\nL Application: STOPPED"
        ((issues++))
    fi
    
    # Check backup availability
    info "Checking backup availability..."
    local backup_count=$(find "$BACKUP_DIR" -name "coreflow360_backup_*.sql*" -mtime -7 | wc -l)
    if [[ $backup_count -gt 0 ]]; then
        success " Recent backups available: $backup_count"
        status_report+="\n Backups: $backup_count recent backups"
    else
        error "L No recent backups found"
        status_report+="\nL Backups: NONE AVAILABLE"
        ((issues++))
    fi
    
    # Overall assessment
    if [[ $issues -eq 0 ]]; then
        success "<� System Status: HEALTHY - No immediate recovery needed"
        send_notification "SYSTEM HEALTHY" "All systems operational. No immediate recovery actions required." "normal"
        return 0
    elif [[ $issues -le 2 ]]; then
        warn "� System Status: DEGRADED - Partial recovery may be needed"
        send_notification "SYSTEM DEGRADED" "System partially operational. $issues issues detected:$status_report" "high"
        return 1
    else
        critical "=� System Status: CRITICAL - Full disaster recovery required"
        send_notification "SYSTEM CRITICAL" "System in critical state. $issues major issues detected:$status_report" "critical"
        return 2
    fi
}

# Database recovery
recover_database() {
    local backup_file=${1:-""}
    
    critical "${BLUE}=� DISASTER RECOVERY: Database Recovery${NC}"
    
    if [[ -z "$backup_file" ]]; then
        info "Finding latest backup..."
        backup_file=$(find "$BACKUP_DIR" -name "coreflow360_backup_*.sql*" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
        
        if [[ -z "$backup_file" ]]; then
            error "No backup files found"
            return 1
        fi
    fi
    
    info "Using backup file: $backup_file"
    
    # Create recovery workspace
    mkdir -p "$RECOVERY_TEMP_DIR"
    
    # Prepare backup file for restoration
    local restore_file="$backup_file"
    
    # Decrypt if encrypted
    if [[ "$backup_file" == *.gpg ]]; then
        info "Decrypting backup..."
        local decrypted_file="${RECOVERY_TEMP_DIR}/$(basename "$backup_file" .gpg)"
        
        if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
            error "BACKUP_ENCRYPTION_KEY required for encrypted backup"
            return 1
        fi
        
        if ! gpg --batch --yes --passphrase "$BACKUP_ENCRYPTION_KEY" \
            --decrypt "$backup_file" > "$decrypted_file"; then
            error "Failed to decrypt backup"
            return 1
        fi
        
        restore_file="$decrypted_file"
        success "Backup decrypted successfully"
    fi
    
    # Decompress if compressed
    if [[ "$restore_file" == *.gz ]]; then
        info "Decompressing backup..."
        if ! gunzip -c "$restore_file" > "${RECOVERY_TEMP_DIR}/decompressed.sql"; then
            error "Failed to decompress backup"
            return 1
        fi
        restore_file="${RECOVERY_TEMP_DIR}/decompressed.sql"
        success "Backup decompressed successfully"
    fi
    
    # Parse database URL
    if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
        local DB_USER="${BASH_REMATCH[1]}"
        local DB_PASSWORD="${BASH_REMATCH[2]}"
        local DB_HOST="${BASH_REMATCH[3]}"
        local DB_PORT="${BASH_REMATCH[4]}"
        local DB_NAME="${BASH_REMATCH[5]%%\?*}"
    else
        error "Invalid DATABASE_URL format"
        return 1
    fi
    
    # Create backup of current database (if accessible)
    info "Creating safety backup of current database..."
    local safety_backup="${RECOVERY_TEMP_DIR}/safety_backup_$(date +%Y%m%d_%H%M%S).sql"
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USER" --dbname="$DB_NAME" \
        --format=custom --compress=9 --no-password --file="$safety_backup" || warn "Could not create safety backup"
    
    # Perform database restoration
    critical "= Performing database restoration..."
    
    # Drop and recreate database (DESTRUCTIVE OPERATION)
    warn "� DESTRUCTIVE OPERATION: Dropping existing database"
    PGPASSWORD="$DB_PASSWORD" psql \
        --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USER" --dbname="postgres" \
        -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" || error "Failed to drop database"
    
    PGPASSWORD="$DB_PASSWORD" psql \
        --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USER" --dbname="postgres" \
        -c "CREATE DATABASE \"$DB_NAME\";" || {
        error "Failed to create database"
        return 1
    }
    
    # Restore from backup
    info "Restoring database from backup..."
    if PGPASSWORD="$DB_PASSWORD" pg_restore \
        --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USER" --dbname="$DB_NAME" \
        --clean --create --if-exists --no-owner --no-privileges --verbose \
        "$restore_file"; then
        success " Database restored successfully"
        send_notification "DATABASE RESTORED" "Database successfully restored from backup: $(basename "$backup_file")" "normal"
        return 0
    else
        critical "L Database restoration failed"
        
        # Attempt to restore safety backup if available
        if [[ -f "$safety_backup" ]]; then
            warn "Attempting to restore safety backup..."
            PGPASSWORD="$DB_PASSWORD" pg_restore \
                --host="$DB_HOST" --port="$DB_PORT" --username="$DB_USER" --dbname="$DB_NAME" \
                --clean --create --if-exists --no-owner --no-privileges \
                "$safety_backup" || error "Failed to restore safety backup"
        fi
        
        send_notification "DATABASE RECOVERY FAILED" "Database restoration failed. Manual intervention required." "critical"
        return 1
    fi
}

# Application recovery
recover_application() {
    critical "${BLUE}= DISASTER RECOVERY: Application Recovery${NC}"
    
    # Stop existing application
    info "Stopping existing application processes..."
    pkill -f "next" || true
    pkill -f "node.*start" || true
    sleep 5
    
    # Check for application updates
    info "Checking for application updates..."
    cd "$PROJECT_ROOT"
    
    # Stash any local changes
    git stash push -u -m "disaster-recovery-stash-$(date +%Y%m%d_%H%M%S)" || warn "Failed to stash changes"
    
    # Pull latest code (if in production branch)
    current_branch=$(git branch --show-current)
    if [[ "$current_branch" == "main" ]] || [[ "$current_branch" == "production" ]]; then
        info "Pulling latest code from $current_branch..."
        git pull origin "$current_branch" || warn "Failed to pull latest code"
    else
        warn "Not on main/production branch. Skipping code update."
    fi
    
    # Reinstall dependencies
    info "Installing/updating dependencies..."
    if [[ -f "package-lock.json" ]]; then
        npm ci || npm install
    else
        npm install
    fi
    
    # Generate Prisma client
    info "Generating Prisma client..."
    npx prisma generate || error "Failed to generate Prisma client"
    
    # Run database migrations
    info "Running database migrations..."
    npx prisma migrate deploy || warn "Database migrations failed"
    
    # Build application
    info "Building application..."
    if npm run build; then
        success " Application built successfully"
    else
        error "L Application build failed"
        return 1
    fi
    
    # Start application using production script
    info "Starting application..."
    if [[ -f "scripts/start-server.js" ]]; then
        nohup node scripts/start-server.js > "${PROJECT_ROOT}/logs/app_$(date +%Y%m%d_%H%M%S).log" 2>&1 &
    else
        nohup npm start > "${PROJECT_ROOT}/logs/app_$(date +%Y%m%d_%H%M%S).log" 2>&1 &
    fi
    
    # Wait for application to start
    info "Waiting for application to start..."
    local retries=0
    while [[ $retries -lt 30 ]]; do
        if curl -f http://localhost:3000/health &> /dev/null; then
            success " Application is responding"
            send_notification "APPLICATION RECOVERED" "Application successfully recovered and is responding to health checks." "normal"
            return 0
        fi
        sleep 2
        ((retries++))
    done
    
    error "L Application failed to start or respond"
    send_notification "APPLICATION RECOVERY FAILED" "Application failed to start after recovery. Manual intervention required." "critical"
    return 1
}

# Full system recovery
full_disaster_recovery() {
    critical "${PURPLE}=� FULL DISASTER RECOVERY INITIATED${NC}"
    send_notification "DISASTER RECOVERY STARTED" "Full disaster recovery procedure initiated. This may take several minutes." "critical"
    
    local start_time=$(date +%s)
    local recovery_steps=0
    local failed_steps=0
    
    # Step 1: Database Recovery
    info "Step 1/3: Database Recovery"
    if recover_database; then
        success " Database recovery completed"
        ((recovery_steps++))
    else
        error "L Database recovery failed"
        ((failed_steps++))
    fi
    
    # Step 2: Application Recovery
    info "Step 2/3: Application Recovery"
    if recover_application; then
        success " Application recovery completed"
        ((recovery_steps++))
    else
        error "L Application recovery failed"
        ((failed_steps++))
    fi
    
    # Step 3: System Verification
    info "Step 3/3: System Verification"
    if verify_recovery; then
        success " System verification completed"
        ((recovery_steps++))
    else
        error "L System verification failed"
        ((failed_steps++))
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [[ $failed_steps -eq 0 ]]; then
        critical "${GREEN}<� DISASTER RECOVERY SUCCESSFUL${NC}"
        success "All recovery steps completed in ${duration} seconds"
        send_notification "DISASTER RECOVERY SUCCESSFUL" "All systems recovered successfully in ${duration}s. Application is fully operational." "normal"
        return 0
    else
        critical "${RED}=� DISASTER RECOVERY PARTIAL/FAILED${NC}"
        error "$failed_steps out of 3 recovery steps failed"
        send_notification "DISASTER RECOVERY PARTIAL" "$recovery_steps/3 recovery steps completed. $failed_steps steps failed. Manual intervention required." "critical"
        return 1
    fi
}

# Verify recovery
verify_recovery() {
    info "Verifying system recovery..."
    
    local checks_passed=0
    local total_checks=4
    
    # Check database
    info "Verifying database..."
    if PGPASSWORD="$(echo "$DATABASE_URL" | sed 's/.*:\([^@]*\)@.*/\1/')" \
       psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" &> /dev/null; then
        success " Database is accessible and contains tables"
        ((checks_passed++))
    else
        error "L Database verification failed"
    fi
    
    # Check application health
    info "Verifying application health..."
    local health_retries=0
    while [[ $health_retries -lt 10 ]]; do
        if curl -f http://localhost:3000/api/health &> /dev/null; then
            success " Application health check passed"
            ((checks_passed++))
            break
        fi
        sleep 3
        ((health_retries++))
    done
    
    if [[ $health_retries -eq 10 ]]; then
        error "L Application health check failed"
    fi
    
    # Check Redis (if configured)
    if [[ -n "${REDIS_URL:-}" ]]; then
        info "Verifying Redis..."
        if redis-cli -u "$REDIS_URL" ping &> /dev/null; then
            success " Redis is accessible"
            ((checks_passed++))
        else
            error "L Redis verification failed"
        fi
    else
        ((checks_passed++)) # Skip Redis check if not configured
    fi
    
    # Check file permissions and directories
    info "Verifying file system..."
    if [[ -w "$PROJECT_ROOT" ]] && [[ -d "$PROJECT_ROOT/.next" ]] && [[ -r "$PROJECT_ROOT/package.json" ]]; then
        success " File system verification passed"
        ((checks_passed++))
    else
        error "L File system verification failed"
    fi
    
    info "Verification Results: $checks_passed/$total_checks checks passed"
    
    if [[ $checks_passed -eq $total_checks ]]; then
        success " All verification checks passed"
        return 0
    else
        error "L Some verification checks failed"
        return 1
    fi
}

# Show help
show_help() {
    cat << EOF
CoreFlow360 Disaster Recovery Script

USAGE:
    $0 [COMMAND] [OPTIONS]

COMMANDS:
    assess              Assess system status and health
    recover-db [file]   Recover database from backup (latest if no file specified)
    recover-app         Recover application processes and code
    full-recovery       Perform complete disaster recovery
    verify              Verify system after recovery

OPTIONS:
    -h, --help          Show this help message
    --auto-confirm      Skip confirmation prompts (dangerous!)
    --backup-file FILE  Specify backup file for database recovery
    --no-notifications  Disable notifications

EXAMPLES:
    $0 assess                           # Check system status
    $0 recover-db                      # Recover from latest backup
    $0 recover-db backup_20240101.sql  # Recover from specific backup
    $0 full-recovery                   # Complete disaster recovery
    $0 verify                          # Verify system health

ENVIRONMENT VARIABLES:
    DATABASE_URL           PostgreSQL connection string (required)
    BACKUP_ENCRYPTION_KEY  Encryption key for backup files
    NOTIFICATION_WEBHOOK   Webhook for notifications
    ALERT_EMAIL           Email for critical alerts
    ALERT_SMS_WEBHOOK     SMS webhook for critical alerts

�  WARNING: This script performs destructive operations.
    Always ensure you have recent backups before proceeding.

EOF
}

# Parse command line arguments
AUTO_CONFIRM=""
BACKUP_FILE=""
NO_NOTIFICATIONS=""
COMMAND=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --auto-confirm)
            AUTO_CONFIRM="1"
            export AUTO_CONFIRM
            info "Auto-confirm mode enabled - skipping all interactive prompts"
            shift
            ;;
        --backup-file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        --no-notifications)
            NO_NOTIFICATIONS="1"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        assess|recover-db|recover-app|full-recovery|verify)
            COMMAND="$1"
            shift
            # Handle additional arguments for specific commands
            if [[ "$COMMAND" == "recover-db" && $# -gt 0 && ! "$1" =~ ^-- ]]; then
                BACKUP_FILE="$1"
                shift
            fi
            break
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Set default command if none provided
COMMAND="${COMMAND:-assess}"

# Main command handling
case "$COMMAND" in
    assess)
        info "Starting system assessment..."
        assess_system_status
        exit_code=$?
        case $exit_code in
            0) info "System is healthy - no recovery needed" ;;
            1) info "System degraded - consider partial recovery" ;;
            2) critical "System critical - full recovery recommended" ;;
        esac
        exit $exit_code
        ;;
    
    recover-db)
        backup_file="$BACKUP_FILE"
        if [[ -z "${AUTO_CONFIRM:-}" ]] && [[ -z "${COREFLOW_AUTO_APPROVE_DB:-}" ]]; then
            warn "� This will replace your current database with backup data!"
            read -p "Are you sure you want to continue? (yes/no): " confirm
            [[ "$confirm" != "yes" ]] && { info "Recovery cancelled"; exit 0; }
        else
            log_auto_approval "recover-db" "backup_file=$backup_file"
            info "Auto-approval enabled for database recovery - proceeding without confirmation"
        fi
        recover_database "$backup_file"
        ;;
    
    recover-app)
        if [[ -z "${AUTO_CONFIRM:-}" ]] && [[ -z "${COREFLOW_AUTO_APPROVE_APP:-}" ]]; then
            warn "� This will restart your application and may cause downtime!"
            read -p "Are you sure you want to continue? (yes/no): " confirm
            [[ "$confirm" != "yes" ]] && { info "Recovery cancelled"; exit 0; }
        else
            log_auto_approval "recover-app" "application_restart"
            info "Auto-approval enabled for application recovery - proceeding without confirmation"
        fi
        recover_application
        ;;
    
    full-recovery)
        if [[ -z "${AUTO_CONFIRM:-}" ]]; then
            critical "� This will perform FULL DISASTER RECOVERY including database replacement!"
            warn "This is a destructive operation that may cause data loss!"
            read -p "Type 'RECOVER' to confirm full disaster recovery: " confirm
            [[ "$confirm" != "RECOVER" ]] && { info "Recovery cancelled"; exit 0; }
        else
            log_auto_approval "full-recovery" "DESTRUCTIVE_OPERATION"
            critical "Auto-approval enabled for FULL DISASTER RECOVERY - proceeding without confirmation"
            warn "This is a destructive operation that may cause data loss!"
        fi
        full_disaster_recovery
        ;;
    
    verify)
        verify_recovery
        ;;
    
    -h|--help)
        show_help
        exit 0
        ;;
    
    *)
        error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac