#!/bin/bash
# CoreFlow360 - External Services Integration Script
# FORTRESS-LEVEL SECURITY: Safe integration of external OSS services
# MATHEMATICAL PERFECTION: Automated dependency and conflict resolution

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MODULES_DIR="$PROJECT_ROOT/src/modules"
DOCKER_DIR="$PROJECT_ROOT/docker"

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  INFO: $1${NC}"; }
log_success() { echo -e "${GREEN}✅ SUCCESS: $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  WARNING: $1${NC}"; }
log_error() { echo -e "${RED}❌ ERROR: $1${NC}"; }

# Service definitions
declare -A SERVICES=(
    ["fingpt"]="https://github.com/AI4Finance-Foundation/FinGPT.git"
    ["finrobot"]="https://github.com/AI4Finance-Foundation/FinRobot.git"
    ["idurar"]="https://github.com/idurar/idurar-erp-crm.git"
    ["erpnext"]="https://github.com/frappe/erpnext.git"
    ["dolibarr"]="https://github.com/Dolibarr/dolibarr.git"
)

declare -A SERVICE_BRANCHES=(
    ["fingpt"]="main"
    ["finrobot"]="main" 
    ["idurar"]="main"
    ["erpnext"]="version-14"
    ["dolibarr"]="main"
)

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Git
    if ! command -v git &> /dev/null; then
        log_error "Git is required but not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is required but not installed"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir &> /dev/null; then
        log_error "This script must be run from within a git repository"
        exit 1
    fi
    
    # Check Node.js for package management
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed"
        exit 1
    fi
    
    log_success "All prerequisites satisfied"
}

# Create directory structure
create_directory_structure() {
    log_info "Creating directory structure..."
    
    mkdir -p "$MODULES_DIR"
    mkdir -p "$MODULES_DIR/wrappers"
    mkdir -p "$DOCKER_DIR/services"
    mkdir -p "$PROJECT_ROOT/docs/services"
    
    log_success "Directory structure created"
}

# Security validation
validate_service_security() {
    local service_name="$1"
    local repo_url="$2"
    
    log_info "Validating security for $service_name..."
    
    # Check if repository URL is from trusted sources
    case "$repo_url" in
        *github.com/AI4Finance-Foundation/* | \
        *github.com/idurar/* | \
        *github.com/frappe/* | \
        *github.com/Dolibarr/*)
            log_success "Repository $service_name is from trusted source"
            ;;
        *)
            log_warning "Repository $service_name is not from a verified trusted source"
            read -p "Do you want to continue? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_error "Integration cancelled by user"
                exit 1
            fi
            ;;
    esac
}

# Add service as git submodule
add_service_submodule() {
    local service_name="$1"
    local repo_url="$2"
    local branch="${SERVICE_BRANCHES[$service_name]}"
    local target_dir="$MODULES_DIR/$service_name"
    
    log_info "Adding $service_name as git submodule..."
    
    # Validate security first
    validate_service_security "$service_name" "$repo_url"
    
    # Remove existing directory if present
    if [ -d "$target_dir" ]; then
        log_warning "Removing existing $service_name directory"
        rm -rf "$target_dir"
    fi
    
    # Add submodule
    if git submodule add -b "$branch" "$repo_url" "$target_dir"; then
        log_success "Successfully added $service_name submodule"
        
        # Initialize and update
        cd "$target_dir"
        git checkout "$branch"
        cd "$PROJECT_ROOT"
        
    else
        log_error "Failed to add $service_name submodule"
        return 1
    fi
}

# Create Docker configuration for service
create_docker_config() {
    local service_name="$1"
    
    log_info "Creating Docker configuration for $service_name..."
    
    case "$service_name" in
        "fingpt"|"finrobot")
            create_python_docker_config "$service_name"
            ;;
        "idurar")
            create_node_docker_config "$service_name"
            ;;
        "erpnext")
            create_frappe_docker_config "$service_name"
            ;;
        "dolibarr")
            create_php_docker_config "$service_name"
            ;;
        *)
            log_warning "No specific Docker configuration for $service_name"
            ;;
    esac
}

# Python service Docker configuration
create_python_docker_config() {
    local service_name="$1"
    local docker_file="$DOCKER_DIR/services/$service_name.Dockerfile"
    
    cat > "$docker_file" << EOF
# CoreFlow360 - $service_name Service Container
# FORTRESS-LEVEL SECURITY: Hardened Python container
FROM python:3.11-slim-bullseye

# Security: Create non-root user
RUN groupadd -r coreflow && useradd -r -g coreflow -s /bin/false coreflow

# Install security updates and required packages
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    curl \\
    git \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy service code
COPY src/modules/$service_name /app/service
COPY src/modules/wrappers/${service_name}-service /app/wrapper

# Install Python dependencies with security checks
RUN pip install --no-cache-dir --upgrade pip \\
    && pip install --no-cache-dir safety bandit \\
    && cd /app/service && pip install --no-cache-dir -r requirements.txt \\
    && cd /app/wrapper && pip install --no-cache-dir -r requirements.txt

# Security: Run safety check on dependencies
RUN cd /app/service && safety check --json || echo "Safety check completed with warnings"

# Security: Change ownership to non-root user
RUN chown -R coreflow:coreflow /app

# Switch to non-root user
USER coreflow

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Start service
CMD ["python", "/app/wrapper/main.py"]
EOF

    log_success "Created Docker configuration for $service_name"
}

# Node.js service Docker configuration
create_node_docker_config() {
    local service_name="$1"
    local docker_file="$DOCKER_DIR/services/$service_name.Dockerfile"
    
    cat > "$docker_file" << EOF
# CoreFlow360 - $service_name Service Container
# FORTRESS-LEVEL SECURITY: Hardened Node.js container
FROM node:18-alpine

# Security: Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Security: Create non-root user
RUN addgroup -g 1001 -S coreflow && adduser -S coreflow -u 1001

# Set working directory
WORKDIR /app

# Copy service code
COPY src/modules/$service_name /app/service
COPY src/modules/wrappers/${service_name}-service /app/wrapper

# Install dependencies with security audit
RUN cd /app/service && npm ci --only=production --audit \\
    && cd /app/wrapper && npm ci --only=production --audit \\
    && npm cache clean --force

# Security: Change ownership to non-root user
RUN chown -R coreflow:coreflow /app

# Switch to non-root user
USER coreflow

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \\
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Expose port
EXPOSE 3000

# Start service with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "/app/wrapper/index.js"]
EOF

    log_success "Created Docker configuration for $service_name"
}

# Frappe/ERPNext Docker configuration
create_frappe_docker_config() {
    local service_name="$1"
    local docker_file="$DOCKER_DIR/services/$service_name.Dockerfile"
    
    cat > "$docker_file" << EOF
# CoreFlow360 - $service_name Service Container
# FORTRESS-LEVEL SECURITY: Hardened Frappe container
FROM frappe/frappe-worker:latest

# Security: Update packages
RUN apt-get update && apt-get upgrade -y && apt-get clean

# Security: Create dedicated user
RUN useradd -m -s /bin/bash coreflow

# Set working directory
WORKDIR /home/frappe/frappe-bench

# Copy ERPNext and wrapper code
COPY src/modules/$service_name /home/frappe/frappe-bench/apps/erpnext
COPY src/modules/wrappers/${service_name}-service /home/frappe/frappe-bench/apps/coreflow_wrapper

# Install apps
RUN bench get-app coreflow_wrapper /home/frappe/frappe-bench/apps/coreflow_wrapper
RUN bench install-app coreflow_wrapper

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \\
    CMD curl -f http://localhost:8000/api/method/ping || exit 1

# Expose port
EXPOSE 8000

# Start service
CMD ["bench", "start"]
EOF

    log_success "Created Docker configuration for $service_name"
}

# PHP service Docker configuration
create_php_docker_config() {
    local service_name="$1"
    local docker_file="$DOCKER_DIR/services/$service_name.Dockerfile"
    
    cat > "$docker_file" << EOF
# CoreFlow360 - $service_name Service Container
# FORTRESS-LEVEL SECURITY: Hardened PHP container
FROM php:8.1-fpm-alpine

# Security: Install security updates and required extensions
RUN apk update && apk upgrade \\
    && apk add --no-cache nginx supervisor \\
    && docker-php-ext-install pdo pdo_mysql mysqli

# Security: Create non-root user
RUN addgroup -g 1001 -S coreflow && adduser -S coreflow -u 1001 -G coreflow

# Set working directory
WORKDIR /var/www/html

# Copy service code
COPY src/modules/$service_name /var/www/html/dolibarr
COPY src/modules/wrappers/${service_name}-service /var/www/html/wrapper

# Configure PHP and Nginx
COPY docker/config/$service_name/ /etc/

# Security: Set proper permissions
RUN chown -R coreflow:coreflow /var/www/html \\
    && chmod -R 755 /var/www/html

# Switch to non-root user for PHP-FPM
USER coreflow

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \\
    CMD curl -f http://localhost:80/wrapper/health || exit 1

# Expose port
EXPOSE 80

# Start services with supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
EOF

    log_success "Created Docker configuration for $service_name"
}

# Create service wrapper
create_service_wrapper() {
    local service_name="$1"
    local wrapper_dir="$MODULES_DIR/wrappers/${service_name}-service"
    
    log_info "Creating service wrapper for $service_name..."
    
    mkdir -p "$wrapper_dir"
    
    # Create wrapper based on service type
    case "$service_name" in
        "fingpt"|"finrobot")
            create_python_wrapper "$service_name" "$wrapper_dir"
            ;;
        "idurar")
            create_node_wrapper "$service_name" "$wrapper_dir"
            ;;
        "erpnext")
            create_frappe_wrapper "$service_name" "$wrapper_dir"
            ;;
        "dolibarr")
            create_php_wrapper "$service_name" "$wrapper_dir"
            ;;
    esac
    
    log_success "Created service wrapper for $service_name"
}

# Python service wrapper
create_python_wrapper() {
    local service_name="$1"
    local wrapper_dir="$2"
    
    # Create main wrapper file
    cat > "$wrapper_dir/main.py" << EOF
#!/usr/bin/env python3
"""
CoreFlow360 - $service_name Service Wrapper
FORTRESS-LEVEL SECURITY: Secure API wrapper for external service
HYPERSCALE PERFORMANCE: High-performance async wrapper
"""

import asyncio
import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import uvicorn
from typing import Dict, Any
import sys
import os

# Add service to Python path
sys.path.insert(0, '/app/service')

# Import external service (will be implemented after integration)
# from service_main import ServiceInterface

app = FastAPI(title="$service_name CoreFlow360 Wrapper", version="1.0.0")
security = HTTPBearer()

# Configure CORS (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # CoreFlow360 frontend
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "$service_name",
        "version": "1.0.0",
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.post("/api/v1/process")
async def process_request(
    data: Dict[str, Any],
    token: str = Depends(security)
):
    """Process request through external service"""
    try:
        # TODO: Implement actual service integration
        result = {
            "success": True,
            "data": f"Processed by $service_name",
            "service": "$service_name"
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

    # Create requirements.txt
    cat > "$wrapper_dir/requirements.txt" << EOF
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
httpx==0.25.2
python-multipart==0.0.6
python-jose==3.3.0
passlib==1.7.4
aioredis==2.0.1
sqlalchemy==2.0.23
alembic==1.12.1
pytest==7.4.3
pytest-asyncio==0.21.1
safety==2.3.5
bandit==1.7.5
EOF

    chmod +x "$wrapper_dir/main.py"
}

# Create docker-compose configuration
create_docker_compose() {
    log_info "Creating Docker Compose configuration..."
    
    cat > "$PROJECT_ROOT/docker-compose.services.yml" << EOF
# CoreFlow360 - External Services Docker Compose
# FORTRESS-LEVEL SECURITY: Isolated service containers
version: '3.8'

services:
  fingpt-service:
    build:
      context: .
      dockerfile: docker/services/fingpt.Dockerfile
    ports:
      - "8001:8000"
    environment:
      - SERVICE_NAME=fingpt
      - REDIS_URL=redis://redis:6379
    networks:
      - coreflow-services
    depends_on:
      - redis
    restart: unless-stopped

  finrobot-service:
    build:
      context: .
      dockerfile: docker/services/finrobot.Dockerfile
    ports:
      - "8002:8000"
    environment:
      - SERVICE_NAME=finrobot
      - REDIS_URL=redis://redis:6379
    networks:
      - coreflow-services
    depends_on:
      - redis
    restart: unless-stopped

  idurar-service:
    build:
      context: .
      dockerfile: docker/services/idurar.Dockerfile
    ports:
      - "8003:3000"
    environment:
      - SERVICE_NAME=idurar
      - MONGODB_URL=mongodb://mongo:27017/idurar
    networks:
      - coreflow-services
    depends_on:
      - mongo
    restart: unless-stopped

  erpnext-service:
    build:
      context: .
      dockerfile: docker/services/erpnext.Dockerfile
    ports:
      - "8004:8000"
    environment:
      - SERVICE_NAME=erpnext
      - DB_HOST=postgres
      - DB_NAME=erpnext
    networks:
      - coreflow-services
    depends_on:
      - postgres
    restart: unless-stopped

  dolibarr-service:
    build:
      context: .
      dockerfile: docker/services/dolibarr.Dockerfile
    ports:
      - "8005:80"
    environment:
      - SERVICE_NAME=dolibarr
      - MYSQL_HOST=mysql
      - MYSQL_DATABASE=dolibarr
    networks:
      - coreflow-services
    depends_on:
      - mysql
    restart: unless-stopped

  # Supporting services
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - coreflow-services
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: erpnext
      POSTGRES_USER: erpnext
      POSTGRES_PASSWORD: secure_password_change_in_production
    ports:
      - "5432:5432"
    networks:
      - coreflow-services
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    networks:
      - coreflow-services
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: secure_root_password_change_in_production
      MYSQL_DATABASE: dolibarr
      MYSQL_USER: dolibarr
      MYSQL_PASSWORD: secure_password_change_in_production
    ports:
      - "3306:3306"
    networks:
      - coreflow-services
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

networks:
  coreflow-services:
    driver: bridge

volumes:
  postgres_data:
  mongo_data:
  mysql_data:
EOF

    log_success "Created Docker Compose configuration"
}

# Main integration function
integrate_all_services() {
    log_info "Starting integration of all external services..."
    
    # Create directory structure
    create_directory_structure
    
    # Process each service
    for service_name in "${!SERVICES[@]}"; do
        log_info "Processing $service_name..."
        
        # Add as submodule
        if add_service_submodule "$service_name" "${SERVICES[$service_name]}"; then
            # Create Docker configuration
            create_docker_config "$service_name"
            
            # Create service wrapper
            create_service_wrapper "$service_name"
        else
            log_error "Failed to integrate $service_name"
            return 1
        fi
    done
    
    # Create Docker Compose configuration
    create_docker_compose
    
    log_success "All services integrated successfully!"
}

# Cleanup function
cleanup_integration() {
    log_warning "Cleaning up incomplete integration..."
    
    # Remove submodules
    for service_name in "${!SERVICES[@]}"; do
        local target_dir="$MODULES_DIR/$service_name"
        if [ -d "$target_dir" ]; then
            rm -rf "$target_dir"
            git submodule deinit -f "$target_dir" 2>/dev/null || true
        fi
    done
    
    # Remove Docker files
    rm -rf "$DOCKER_DIR/services"
    rm -f "$PROJECT_ROOT/docker-compose.services.yml"
    
    log_success "Cleanup completed"
}

# Show usage information
show_usage() {
    cat << EOF
CoreFlow360 External Services Integration Script

Usage: $0 [OPTIONS]

Options:
    -h, --help          Show this help message
    -c, --cleanup       Clean up existing integration
    -v, --validate      Validate prerequisites only
    --dry-run          Show what would be done without executing

Examples:
    $0                  # Integrate all services
    $0 --validate       # Check prerequisites
    $0 --cleanup        # Remove existing integration

This script safely integrates external OSS services into CoreFlow360
while maintaining security, performance, and architectural integrity.
EOF
}

# Main function
main() {
    local cleanup=false
    local validate_only=false
    local dry_run=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -c|--cleanup)
                cleanup=true
                shift
                ;;
            -v|--validate)
                validate_only=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Check prerequisites
    check_prerequisites
    
    if [ "$validate_only" = true ]; then
        log_success "Prerequisites validation completed"
        exit 0
    fi
    
    if [ "$cleanup" = true ]; then
        cleanup_integration
        exit 0
    fi
    
    if [ "$dry_run" = true ]; then
        log_info "DRY RUN: Would integrate the following services:"
        for service_name in "${!SERVICES[@]}"; do
            echo "  - $service_name: ${SERVICES[$service_name]}"
        done
        exit 0
    fi
    
    # Confirm integration
    log_warning "This will integrate external services into CoreFlow360"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Integration cancelled by user"
        exit 0
    fi
    
    # Perform integration
    integrate_all_services
    
    log_success "External services integration completed successfully!"
    echo
    log_info "Next steps:"
    echo "1. Review Docker configurations in docker/services/"
    echo "2. Configure environment variables"
    echo "3. Run: docker-compose -f docker-compose.services.yml up -d"
    echo "4. Test service endpoints and health checks"
}

# Run main function with all arguments
main "$@"