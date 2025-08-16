#!/bin/bash

# CoreFlow360 - Database Backup Script
# Comprehensive database backup with compression, encryption, and cloud storage

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups/database"
TEMP_DIR="/tmp/coreflow360_backup_$$"
LOG_FILE="${PROJECT_ROOT}/logs/backup_$(date +%Y%m%d_%H%M%S).log"

# Load environment variables
if [[ -f "$PROJECT_ROOT/.env.local" ]]; then
    source "$PROJECT_ROOT/.env.local"
elif [[ -f "$PROJECT_ROOT/.env" ]]; then
    source "$PROJECT_ROOT/.env"
fi

# Default configuration
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}
ENCRYPT_BACKUP=${ENCRYPT_BACKUP:-true}
COMPRESS_BACKUP=${COMPRESS_BACKUP:-true}
UPLOAD_TO_CLOUD=${UPLOAD_TO_CLOUD:-false}
NOTIFICATION_WEBHOOK=${NOTIFICATION_WEBHOOK:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Cleanup function
cleanup() {
    if [[ -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
        info "Cleaned up temporary directory"
    fi
}

# Error handler
handle_error() {
    local exit_code=$?
    error "Backup failed with exit code $exit_code"
    cleanup
    send_notification "FAILED" "Database backup failed with exit code $exit_code"
    exit $exit_code
}

# Set error trap
trap handle_error ERR
trap cleanup EXIT

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    if [[ -n "$NOTIFICATION_WEBHOOK" ]]; then
        curl -s -X POST "$NOTIFICATION_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"CoreFlow360 Backup $status\",
                \"attachments\": [{
                    \"color\": \"$(if [[ $status == 'SUCCESS' ]]; then echo 'good'; else echo 'danger'; fi)\",
                    \"fields\": [{
                        \"title\": \"Message\",
                        \"value\": \"$message\",
                        \"short\": false
                    }, {
                        \"title\": \"Timestamp\",
                        \"value\": \"$(date -u '+%Y-%m-%d %H:%M:%S UTC')\",
                        \"short\": true
                    }]
                }]
            }" || warn "Failed to send notification"
    fi
}

# Parse database URL
parse_database_url() {
    if [[ -z "${DATABASE_URL:-}" ]]; then
        error "DATABASE_URL environment variable not set"
        exit 1
    fi
    
    # Parse PostgreSQL URL: postgresql://user:password@host:port/database
    if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASSWORD="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        # Remove query parameters
        DB_NAME="${DB_NAME%%\?*}"
    else
        error "Invalid DATABASE_URL format"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    info "Checking prerequisites..."
    
    # Check for required tools
    local missing_tools=()
    
    if ! command -v pg_dump &> /dev/null; then
        missing_tools+=("pg_dump")
    fi
    
    if [[ "$COMPRESS_BACKUP" == "true" ]] && ! command -v gzip &> /dev/null; then
        missing_tools+=("gzip")
    fi
    
    if [[ "$ENCRYPT_BACKUP" == "true" ]] && ! command -v gpg &> /dev/null; then
        missing_tools+=("gpg")
    fi
    
    if [[ "$UPLOAD_TO_CLOUD" == "true" ]] && ! command -v aws &> /dev/null; then
        missing_tools+=("aws")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi
    
    # Check database connectivity
    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
        error "Cannot connect to database"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Create backup directories
setup_directories() {
    info "Setting up backup directories..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$TEMP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    
    success "Backup directories created"
}

# Perform database backup
backup_database() {
    info "Starting database backup..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_base_name="coreflow360_backup_${timestamp}"
    local backup_file="${TEMP_DIR}/${backup_base_name}.sql"
    
    # Create database dump
    info "Creating database dump..."
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --username="$DB_USER" \
        --dbname="$DB_NAME" \
        --format=custom \
        --compress=9 \
        --verbose \
        --no-password \
        --file="$backup_file" || {
        error "Database dump failed"
        exit 1
    }
    
    local backup_size=$(du -h "$backup_file" | cut -f1)
    info "Database dump completed: $backup_size"
    
    # Compress backup if enabled
    if [[ "$COMPRESS_BACKUP" == "true" ]]; then
        info "Compressing backup..."
        gzip "$backup_file"
        backup_file="${backup_file}.gz"
        local compressed_size=$(du -h "$backup_file" | cut -f1)
        info "Backup compressed: $compressed_size"
    fi
    
    # Encrypt backup if enabled
    if [[ "$ENCRYPT_BACKUP" == "true" ]]; then
        info "Encrypting backup..."
        
        if [[ -z "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
            warn "BACKUP_ENCRYPTION_KEY not set, using default passphrase"
            BACKUP_ENCRYPTION_KEY="coreflow360-backup-key"
        fi
        
        gpg --batch --yes --passphrase "$BACKUP_ENCRYPTION_KEY" \
            --cipher-algo AES256 --compress-algo 1 \
            --symmetric "$backup_file"
        
        rm "$backup_file"
        backup_file="${backup_file}.gpg"
        info "Backup encrypted"
    fi
    
    # Move to final location
    local final_backup_path="${BACKUP_DIR}/$(basename "$backup_file")"
    mv "$backup_file" "$final_backup_path"
    
    # Set file permissions
    chmod 600 "$final_backup_path"
    
    success "Backup completed: $final_backup_path"
    echo "$final_backup_path" # Return the backup file path
}

# Upload to cloud storage
upload_to_cloud() {
    local backup_file=$1
    
    if [[ "$UPLOAD_TO_CLOUD" != "true" ]]; then
        return 0
    fi
    
    info "Uploading backup to cloud storage..."
    
    local s3_bucket="${AWS_BACKUP_BUCKET:-coreflow360-backups}"
    local s3_key="database/$(basename "$backup_file")"
    
    if aws s3 cp "$backup_file" "s3://${s3_bucket}/${s3_key}" --storage-class STANDARD_IA; then
        success "Backup uploaded to S3: s3://${s3_bucket}/${s3_key}"
        
        # Set lifecycle policy for automatic cleanup
        aws s3api put-object-lifecycle-configuration \
            --bucket "$s3_bucket" \
            --lifecycle-configuration file://<(cat <<EOF
{
    "Rules": [{
        "ID": "DatabaseBackupCleanup",
        "Status": "Enabled",
        "Transitions": [{
            "Days": 30,
            "StorageClass": "GLACIER"
        }, {
            "Days": 90,
            "StorageClass": "DEEP_ARCHIVE"
        }],
        "Expiration": {
            "Days": 2555
        }
    }]
}
EOF
) 2>/dev/null || warn "Failed to set S3 lifecycle policy"
    else
        warn "Failed to upload backup to S3"
    fi
}

# Clean old backups
cleanup_old_backups() {
    info "Cleaning up old backups (keeping ${BACKUP_RETENTION_DAYS} days)..."
    
    # Local cleanup
    find "$BACKUP_DIR" -name "coreflow360_backup_*.sql*" -type f -mtime +$BACKUP_RETENTION_DAYS -delete || warn "Failed to clean local backups"
    
    # Cloud cleanup (if enabled)
    if [[ "$UPLOAD_TO_CLOUD" == "true" ]]; then
        local s3_bucket="${AWS_BACKUP_BUCKET:-coreflow360-backups}"
        local cutoff_date=$(date -d "${BACKUP_RETENTION_DAYS} days ago" +%Y-%m-%d)
        
        aws s3 ls "s3://${s3_bucket}/database/" --recursive | \
            awk -v cutoff="$cutoff_date" '$1 < cutoff {print $4}' | \
            while read -r key; do
                aws s3 rm "s3://${s3_bucket}/${key}" || warn "Failed to delete s3://${s3_bucket}/${key}"
            done
    fi
    
    success "Old backup cleanup completed"
}

# Verify backup integrity
verify_backup() {
    local backup_file=$1
    
    info "Verifying backup integrity..."
    
    local temp_verify_file="${TEMP_DIR}/verify_$(basename "$backup_file")"
    
    # Decrypt if needed
    if [[ "$backup_file" == *.gpg ]]; then
        if ! gpg --batch --yes --passphrase "$BACKUP_ENCRYPTION_KEY" \
            --decrypt "$backup_file" > "$temp_verify_file"; then
            error "Failed to decrypt backup for verification"
            return 1
        fi
        backup_file="$temp_verify_file"
    fi
    
    # Decompress if needed
    if [[ "$backup_file" == *.gz ]]; then
        if ! gzip -t "$backup_file"; then
            error "Backup file is corrupted (gzip test failed)"
            return 1
        fi
        info "Backup file passed compression integrity check"
    fi
    
    # Verify PostgreSQL dump
    if [[ "$backup_file" == *.sql ]] || [[ "$backup_file" == *backup* ]]; then
        if ! pg_restore --list "$backup_file" &> /dev/null; then
            error "Backup file is corrupted (pg_restore test failed)"
            return 1
        fi
        info "Backup file passed PostgreSQL integrity check"
    fi
    
    success "Backup integrity verification passed"
}

# Generate backup report
generate_report() {
    local backup_file=$1
    local start_time=$2
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local backup_size=$(du -h "$backup_file" | cut -f1)
    
    local report_file="${PROJECT_ROOT}/logs/backup_report_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
    "backup_info": {
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "database": {
            "host": "$DB_HOST",
            "port": $DB_PORT,
            "name": "$DB_NAME"
        },
        "backup_file": "$backup_file",
        "backup_size": "$backup_size",
        "duration_seconds": $duration,
        "compression_enabled": $COMPRESS_BACKUP,
        "encryption_enabled": $ENCRYPT_BACKUP,
        "cloud_upload_enabled": $UPLOAD_TO_CLOUD
    },
    "verification": {
        "integrity_check_passed": true,
        "verification_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    },
    "retention": {
        "retention_days": $BACKUP_RETENTION_DAYS,
        "cleanup_performed": true
    }
}
EOF
    
    info "Backup report generated: $report_file"
}

# Main execution
main() {
    local start_time=$(date +%s)
    
    info "${BLUE}CoreFlow360 Database Backup Started${NC}"
    info "Timestamp: $(date)"
    
    # Parse database configuration
    parse_database_url
    
    # Setup
    check_prerequisites
    setup_directories
    
    # Perform backup
    local backup_file
    backup_file=$(backup_database)
    
    # Verify backup
    verify_backup "$backup_file"
    
    # Upload to cloud if enabled
    upload_to_cloud "$backup_file"
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Generate report
    generate_report "$backup_file" "$start_time"
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local backup_size=$(du -h "$backup_file" | cut -f1)
    
    success "${GREEN}Backup completed successfully!${NC}"
    info "Duration: ${duration}s"
    info "Backup size: $backup_size"
    info "Backup location: $backup_file"
    
    # Send success notification
    send_notification "SUCCESS" "Database backup completed successfully in ${duration}s. Size: $backup_size"
}

# Show help
show_help() {
    cat << EOF
CoreFlow360 Database Backup Script

USAGE:
    $0 [OPTIONS]

OPTIONS:
    -h, --help              Show this help message
    --no-compress          Disable backup compression
    --no-encrypt           Disable backup encryption
    --cloud                Enable cloud upload
    --retention-days N     Set backup retention days (default: 7)
    --dry-run              Show what would be done without executing

ENVIRONMENT VARIABLES:
    DATABASE_URL           PostgreSQL connection string (required)
    BACKUP_ENCRYPTION_KEY  Encryption key for backup files
    BACKUP_RETENTION_DAYS  Days to keep backups (default: 7)
    AWS_BACKUP_BUCKET      S3 bucket for cloud backups
    NOTIFICATION_WEBHOOK   Webhook URL for backup notifications

EXAMPLES:
    $0                                 # Basic backup with default settings
    $0 --cloud --retention-days 30    # Backup with cloud upload, 30-day retention
    $0 --no-encrypt --dry-run         # Test backup without encryption

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        --no-compress)
            COMPRESS_BACKUP=false
            shift
            ;;
        --no-encrypt)
            ENCRYPT_BACKUP=false
            shift
            ;;
        --cloud)
            UPLOAD_TO_CLOUD=true
            shift
            ;;
        --retention-days)
            BACKUP_RETENTION_DAYS="$2"
            shift 2
            ;;
        --dry-run)
            info "DRY RUN MODE - No actual backup will be performed"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Execute main function
main "$@"