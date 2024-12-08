#!/bin/bash

# List of tasks that require human attention:
# 1. Ensure AWS CLI v2.0+ is installed and configured with appropriate permissions
# 2. Verify PostgreSQL client tools (pg_dump) v15+ are installed
# 3. Confirm Redis CLI v7.0+ is installed
# 4. Validate that backup directory exists and has correct permissions
# 5. Check that credentials files are properly configured with correct permissions
# 6. Verify S3 bucket exists and has appropriate bucket policy

# Requirement: Disaster Recovery
# Technical Specification/System Architecture/Deployment Architecture
# Implements automated backup of critical infrastructure components

set -euo pipefail
IFS=$'\n\t'

# Global variables
BACKUP_DIR="/var/backups"
AWS_S3_BUCKET="workflow-backups"
DB_CREDENTIALS="/etc/secrets/db_credentials"
REDIS_CREDENTIALS="/etc/secrets/redis_credentials"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.log"

# Logging function
log() {
    local level=$1
    shift
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [${level}] $*" | tee -a "${LOG_FILE}"
}

# Error handling
error_handler() {
    local line_no=$1
    local error_code=$2
    log "ERROR" "Error occurred in script $0 at line $line_no (exit code: $error_code)"
    cleanup
    exit 1
}

trap 'error_handler ${LINENO} $?' ERR

# Cleanup function
cleanup() {
    log "INFO" "Performing cleanup..."
    find "${BACKUP_DIR}" -name "*.tmp" -type f -delete
    find "${BACKUP_DIR}" -name "*.dump" -type f -mtime +7 -delete
}

# Requirement: Data Security
# Technical Specification/Security Architecture/Data Security
# Validates backup directory and credentials
validate_environment() {
    log "INFO" "Validating environment..."
    
    # Check required directories
    if [[ ! -d "${BACKUP_DIR}" ]]; then
        log "ERROR" "Backup directory ${BACKUP_DIR} does not exist"
        exit 1
    fi
    
    # Check credentials files
    if [[ ! -f "${DB_CREDENTIALS}" ]] || [[ ! -f "${REDIS_CREDENTIALS}" ]]; then
        log "ERROR" "Credentials files not found"
        exit 1
    }
    
    # Check required tools
    for cmd in aws pg_dump redis-cli gzip; do
        if ! command -v "${cmd}" &> /dev/null; then
            log "ERROR" "Required command '${cmd}' not found"
            exit 1
        fi
    done
}

# Requirement: Disaster Recovery
# Technical Specification/System Architecture/Deployment Architecture
# Implements PostgreSQL database backup
backup_postgresql() {
    log "INFO" "Starting PostgreSQL backup..."
    
    # Load credentials
    source "${DB_CREDENTIALS}"
    
    if [[ -z "${PGHOST:-}" ]] || [[ -z "${PGUSER:-}" ]] || [[ -z "${PGPASSWORD:-}" ]]; then
        log "ERROR" "PostgreSQL credentials not properly configured"
        return 1
    }
    
    local backup_file="${BACKUP_DIR}/postgresql_${TIMESTAMP}.dump"
    local compressed_file="${backup_file}.gz"
    
    # Perform backup
    PGPASSWORD="${PGPASSWORD}" pg_dump \
        -h "${PGHOST}" \
        -U "${PGUSER}" \
        -Fc \
        -v \
        -f "${backup_file}" \
        workflow_db
    
    # Compress backup
    gzip -9 "${backup_file}"
    
    log "INFO" "PostgreSQL backup completed: ${compressed_file}"
    return 0
}

# Requirement: Disaster Recovery
# Technical Specification/System Architecture/Deployment Architecture
# Implements Redis data backup
backup_redis() {
    log "INFO" "Starting Redis backup..."
    
    # Load credentials
    source "${REDIS_CREDENTIALS}"
    
    if [[ -z "${REDIS_HOST:-}" ]] || [[ -z "${REDIS_PORT:-}" ]] || [[ -z "${REDIS_AUTH:-}" ]]; then
        log "ERROR" "Redis credentials not properly configured"
        return 1
    }
    
    local backup_file="${BACKUP_DIR}/redis_${TIMESTAMP}.rdb"
    local compressed_file="${backup_file}.gz"
    
    # Perform backup using SAVE command
    redis-cli \
        -h "${REDIS_HOST}" \
        -p "${REDIS_PORT}" \
        -a "${REDIS_AUTH}" \
        --rdb "${backup_file}"
    
    # Compress backup
    gzip -9 "${backup_file}"
    
    log "INFO" "Redis backup completed: ${compressed_file}"
    return 0
}

# Requirement: Data Security
# Technical Specification/Security Architecture/Data Security
# Implements secure upload of backups to S3
upload_to_s3() {
    log "INFO" "Starting upload to S3..."
    
    local upload_status=0
    
    # Upload all compressed backup files
    for backup_file in "${BACKUP_DIR}"/*_"${TIMESTAMP}".*.gz; do
        if [[ -f "${backup_file}" ]]; then
            log "INFO" "Uploading ${backup_file} to s3://${AWS_S3_BUCKET}/"
            
            if aws s3 cp "${backup_file}" "s3://${AWS_S3_BUCKET}/"; then
                log "INFO" "Successfully uploaded ${backup_file}"
            else
                log "ERROR" "Failed to upload ${backup_file}"
                upload_status=1
            fi
        fi
    done
    
    return "${upload_status}"
}

# Main execution
main() {
    log "INFO" "Starting backup process..."
    
    # Validate environment
    validate_environment
    
    # Create temporary working directory
    local temp_dir=$(mktemp -d)
    trap 'rm -rf ${temp_dir}' EXIT
    
    # Perform backups
    backup_postgresql || log "ERROR" "PostgreSQL backup failed"
    backup_redis || log "ERROR" "Redis backup failed"
    
    # Upload backups to S3
    upload_to_s3 || log "ERROR" "S3 upload failed"
    
    # Cleanup old backups
    cleanup
    
    log "INFO" "Backup process completed"
}

# Execute main function
main "$@"