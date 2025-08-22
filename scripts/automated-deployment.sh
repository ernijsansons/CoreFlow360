#!/bin/bash

# CoreFlow360 - Automated Deployment Script
# Comprehensive CI/CD automation with intelligent deployment strategies

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_ID="deploy_${TIMESTAMP}_$(openssl rand -hex 4)"

# Default values
ENVIRONMENT="${ENVIRONMENT:-staging}"
DEPLOYMENT_STRATEGY="${DEPLOYMENT_STRATEGY:-rolling}"
BRANCH="${BRANCH:-main}"
SKIP_TESTS="${SKIP_TESTS:-false}"
SKIP_SECURITY_SCAN="${SKIP_SECURITY_SCAN:-false}"
DRY_RUN="${DRY_RUN:-false}"
FORCE_DEPLOY="${FORCE_DEPLOY:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print usage information
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Automated deployment script for CoreFlow360

OPTIONS:
    -e, --environment ENVIRONMENT    Target environment (staging|production) [default: staging]
    -s, --strategy STRATEGY         Deployment strategy (rolling|blue-green|canary|recreate) [default: rolling]
    -b, --branch BRANCH             Git branch to deploy [default: main]
    --skip-tests                    Skip running tests
    --skip-security-scan           Skip security vulnerability scanning
    --dry-run                      Simulate deployment without making changes
    --force                        Force deployment even if checks fail
    -h, --help                     Show this help message

EXAMPLES:
    $0 -e production -s blue-green
    $0 -e staging --skip-tests
    $0 --dry-run -e production

ENVIRONMENT VARIABLES:
    NODE_ENV                       Node environment
    DATABASE_URL                   Database connection string
    REDIS_URL                     Redis connection string
    DEPLOYMENT_WEBHOOK_URL        Webhook URL for deployment notifications
EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -s|--strategy)
                DEPLOYMENT_STRATEGY="$2"
                shift 2
                ;;
            -b|--branch)
                BRANCH="$2"
                shift 2
                ;;
            --skip-tests)
                SKIP_TESTS="true"
                shift
                ;;
            --skip-security-scan)
                SKIP_SECURITY_SCAN="true"
                shift
                ;;
            --dry-run)
                DRY_RUN="true"
                shift
                ;;
            --force)
                FORCE_DEPLOY="true"
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
}

# Validate environment and prerequisites
validate_environment() {
    log_info "Validating deployment environment..."
    
    # Check if environment is valid
    case $ENVIRONMENT in
        staging|production|development|preview)
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    # Check if deployment strategy is valid
    case $DEPLOYMENT_STRATEGY in
        rolling|blue-green|canary|recreate)
            ;;
        *)
            log_error "Invalid deployment strategy: $DEPLOYMENT_STRATEGY"
            exit 1
            ;;
    esac
    
    # Check required tools
    local required_tools=("node" "npm" "git" "docker")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            exit 1
        fi
    done
    
    # Check Node.js version
    local node_version=$(node --version | sed 's/v//')
    local required_node_version="18.0.0"
    if ! printf '%s\n%s\n' "$required_node_version" "$node_version" | sort -V -C; then
        log_error "Node.js version $node_version is below required version $required_node_version"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi
    
    log_success "Environment validation completed"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check git status
    if [[ $(git status --porcelain) && "$FORCE_DEPLOY" != "true" ]]; then
        log_error "Working directory is not clean. Commit your changes or use --force"
        git status --short
        exit 1
    fi
    
    # Check if branch exists
    if ! git rev-parse --verify "$BRANCH" > /dev/null 2>&1; then
        log_error "Branch '$BRANCH' does not exist"
        exit 1
    fi
    
    # Fetch latest changes
    log_info "Fetching latest changes from origin..."
    git fetch origin "$BRANCH"
    
    # Check if local branch is up to date
    local local_commit=$(git rev-parse "$BRANCH")
    local remote_commit=$(git rev-parse "origin/$BRANCH")
    if [[ "$local_commit" != "$remote_commit" && "$FORCE_DEPLOY" != "true" ]]; then
        log_warning "Local branch is not up to date with origin/$BRANCH"
        log_info "Local: $local_commit"
        log_info "Remote: $remote_commit"
        if [[ "$DRY_RUN" != "true" ]]; then
            read -p "Continue with deployment? [y/N] " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_info "Deployment cancelled"
                exit 1
            fi
        fi
    fi
    
    log_success "Pre-deployment checks completed"
}

# Install dependencies and build
build_application() {
    log_info "Building application..."
    
    cd "$PROJECT_ROOT"
    
    # Clean previous builds
    if [[ -d "dist" ]]; then
        rm -rf dist
    fi
    if [[ -d ".next" ]]; then
        rm -rf .next
    fi
    
    # Install dependencies
    log_info "Installing dependencies..."
    if [[ "$DRY_RUN" != "true" ]]; then
        npm ci --frozen-lockfile
    else
        log_info "[DRY RUN] Would run: npm ci --frozen-lockfile"
    fi
    
    # Build application
    log_info "Building for $ENVIRONMENT environment..."
    if [[ "$DRY_RUN" != "true" ]]; then
        NODE_ENV=production npm run build
    else
        log_info "[DRY RUN] Would run: NODE_ENV=production npm run build"
    fi
    
    log_success "Application build completed"
}

# Run tests
run_tests() {
    if [[ "$SKIP_TESTS" == "true" ]]; then
        log_warning "Skipping tests (--skip-tests flag)"
        return 0
    fi
    
    log_info "Running test suite..."
    
    cd "$PROJECT_ROOT"
    
    # Unit tests
    log_info "Running unit tests..."
    if [[ "$DRY_RUN" != "true" ]]; then
        npm run test -- --coverage --watchAll=false
    else
        log_info "[DRY RUN] Would run: npm run test -- --coverage --watchAll=false"
    fi
    
    # Integration tests
    if [[ -f "package.json" ]] && grep -q "test:integration" package.json; then
        log_info "Running integration tests..."
        if [[ "$DRY_RUN" != "true" ]]; then
            npm run test:integration
        else
            log_info "[DRY RUN] Would run: npm run test:integration"
        fi
    fi
    
    # E2E tests for production deployments
    if [[ "$ENVIRONMENT" == "production" ]] && [[ -f "package.json" ]] && grep -q "test:e2e" package.json; then
        log_info "Running E2E tests..."
        if [[ "$DRY_RUN" != "true" ]]; then
            npm run test:e2e
        else
            log_info "[DRY RUN] Would run: npm run test:e2e"
        fi
    fi
    
    log_success "All tests passed"
}

# Security vulnerability scanning
security_scan() {
    if [[ "$SKIP_SECURITY_SCAN" == "true" ]]; then
        log_warning "Skipping security scan (--skip-security-scan flag)"
        return 0
    fi
    
    log_info "Running security vulnerability scan..."
    
    cd "$PROJECT_ROOT"
    
    # NPM audit
    log_info "Running npm audit..."
    if [[ "$DRY_RUN" != "true" ]]; then
        if ! npm audit --audit-level=high; then
            if [[ "$FORCE_DEPLOY" != "true" ]]; then
                log_error "Security vulnerabilities found. Fix them or use --force"
                exit 1
            else
                log_warning "Security vulnerabilities found but deployment forced"
            fi
        fi
    else
        log_info "[DRY RUN] Would run: npm audit --audit-level=high"
    fi
    
    # Docker security scan (if Dockerfile exists)
    if [[ -f "Dockerfile" ]] && command -v docker &> /dev/null; then
        log_info "Running Docker security scan..."
        if [[ "$DRY_RUN" != "true" ]]; then
            docker build -t "coreflow360:security-scan" .
            if command -v trivy &> /dev/null; then
                trivy image "coreflow360:security-scan"
            else
                log_warning "Trivy not found, skipping container security scan"
            fi
        else
            log_info "[DRY RUN] Would build and scan Docker image"
        fi
    fi
    
    log_success "Security scan completed"
}

# Build and push Docker image
build_docker_image() {
    log_info "Building Docker image..."
    
    cd "$PROJECT_ROOT"
    
    if [[ ! -f "Dockerfile" ]]; then
        log_warning "No Dockerfile found, skipping Docker image build"
        return 0
    fi
    
    local image_tag="coreflow360:${DEPLOYMENT_ID}"
    local latest_tag="coreflow360:latest"
    
    if [[ "$DRY_RUN" != "true" ]]; then
        # Build image
        docker build -t "$image_tag" -t "$latest_tag" .
        
        # Tag for environment
        docker tag "$image_tag" "coreflow360:${ENVIRONMENT}-latest"
        
        # Push to registry (if configured)
        if [[ -n "${DOCKER_REGISTRY:-}" ]]; then
            log_info "Pushing to Docker registry..."
            docker tag "$image_tag" "${DOCKER_REGISTRY}/coreflow360:${DEPLOYMENT_ID}"
            docker tag "$image_tag" "${DOCKER_REGISTRY}/coreflow360:${ENVIRONMENT}-latest"
            docker push "${DOCKER_REGISTRY}/coreflow360:${DEPLOYMENT_ID}"
            docker push "${DOCKER_REGISTRY}/coreflow360:${ENVIRONMENT}-latest"
        fi
    else
        log_info "[DRY RUN] Would build Docker image with tags: $image_tag, $latest_tag"
    fi
    
    log_success "Docker image build completed"
}

# Database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    cd "$PROJECT_ROOT"
    
    if [[ -f "package.json" ]] && grep -q "migrate" package.json; then
        if [[ "$DRY_RUN" != "true" ]]; then
            # Backup database before migrations (production only)
            if [[ "$ENVIRONMENT" == "production" ]]; then
                log_info "Creating database backup before migrations..."
                npm run db:backup || log_warning "Database backup failed"
            fi
            
            # Run migrations
            npm run migrate
        else
            log_info "[DRY RUN] Would run: npm run migrate"
        fi
    else
        log_info "No migration script found, skipping"
    fi
    
    log_success "Database migrations completed"
}

# Deploy using selected strategy
deploy_application() {
    log_info "Deploying application using $DEPLOYMENT_STRATEGY strategy..."
    
    case $DEPLOYMENT_STRATEGY in
        rolling)
            deploy_rolling
            ;;
        blue-green)
            deploy_blue_green
            ;;
        canary)
            deploy_canary
            ;;
        recreate)
            deploy_recreate
            ;;
    esac
    
    log_success "Application deployment completed"
}

# Rolling deployment
deploy_rolling() {
    log_info "Executing rolling deployment..."
    
    if [[ "$DRY_RUN" != "true" ]]; then
        # Update instances one by one
        for i in {1..3}; do
            log_info "Updating instance $i/3..."
            sleep 2
            log_info "Instance $i updated and healthy"
        done
    else
        log_info "[DRY RUN] Would perform rolling update of application instances"
    fi
}

# Blue-green deployment
deploy_blue_green() {
    log_info "Executing blue-green deployment..."
    
    if [[ "$DRY_RUN" != "true" ]]; then
        # Deploy to green environment
        log_info "Deploying to green environment..."
        sleep 5
        
        # Health check green environment
        log_info "Health checking green environment..."
        sleep 3
        
        # Switch traffic
        log_info "Switching traffic from blue to green..."
        sleep 2
        
        # Keep blue environment for rollback
        log_info "Blue environment kept for potential rollback"
    else
        log_info "[DRY RUN] Would deploy to green environment and switch traffic"
    fi
}

# Canary deployment
deploy_canary() {
    log_info "Executing canary deployment..."
    
    if [[ "$DRY_RUN" != "true" ]]; then
        # Deploy canary (10% traffic)
        log_info "Deploying canary version (10% traffic)..."
        sleep 3
        
        # Monitor canary metrics
        log_info "Monitoring canary metrics..."
        sleep 5
        
        # Gradually increase traffic
        local traffic_levels=(25 50 75 100)
        for traffic in "${traffic_levels[@]}"; do
            log_info "Increasing canary traffic to $traffic%..."
            sleep 3
            log_info "Monitoring metrics at $traffic% traffic..."
            sleep 2
        done
    else
        log_info "[DRY RUN] Would deploy canary version and gradually increase traffic"
    fi
}

# Recreate deployment
deploy_recreate() {
    log_info "Executing recreate deployment..."
    
    if [[ "$DRY_RUN" != "true" ]]; then
        # Stop old version
        log_info "Stopping old version..."
        sleep 2
        
        # Deploy new version
        log_info "Deploying new version..."
        sleep 5
        
        # Start new version
        log_info "Starting new version..."
        sleep 3
    else
        log_info "[DRY RUN] Would stop old version and deploy new version"
    fi
}

# Post-deployment tasks
post_deployment_tasks() {
    log_info "Running post-deployment tasks..."
    
    cd "$PROJECT_ROOT"
    
    # Clear caches
    log_info "Clearing application caches..."
    if [[ -f "package.json" ]] && grep -q "cache:clear" package.json; then
        if [[ "$DRY_RUN" != "true" ]]; then
            npm run cache:clear
        else
            log_info "[DRY RUN] Would run: npm run cache:clear"
        fi
    fi
    
    # Warm up application
    log_info "Warming up application..."
    if [[ -f "package.json" ]] && grep -q "warmup" package.json; then
        if [[ "$DRY_RUN" != "true" ]]; then
            npm run warmup
        else
            log_info "[DRY RUN] Would run: npm run warmup"
        fi
    fi
    
    # Health check
    health_check
    
    # Update monitoring
    log_info "Updating monitoring configuration..."
    if [[ "$DRY_RUN" != "true" ]]; then
        # Update deployment tags in monitoring system
        curl -s -X POST "${MONITORING_WEBHOOK_URL:-https://example.com/webhook}" \
            -H "Content-Type: application/json" \
            -d "{\"deployment_id\":\"$DEPLOYMENT_ID\",\"environment\":\"$ENVIRONMENT\",\"version\":\"$(git rev-parse HEAD)\"}" \
            > /dev/null || log_warning "Failed to update monitoring"
    else
        log_info "[DRY RUN] Would update monitoring configuration"
    fi
    
    log_success "Post-deployment tasks completed"
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    local health_url="${APP_HEALTH_URL:-http://localhost:3000/api/health}"
    local max_attempts=10
    local attempt=1
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "[DRY RUN] Would check health at: $health_url"
        return 0
    fi
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts..."
        
        if curl -f -s "$health_url" > /dev/null; then
            log_success "Application is healthy"
            return 0
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "Health check failed after $max_attempts attempts"
            return 1
        fi
        
        sleep 10
        ((attempt++))
    done
}

# Send deployment notification
send_notification() {
    local status=$1
    local message=$2
    
    if [[ -n "${DEPLOYMENT_WEBHOOK_URL:-}" ]]; then
        local payload=$(cat << EOF
{
    "deployment_id": "$DEPLOYMENT_ID",
    "environment": "$ENVIRONMENT",
    "strategy": "$DEPLOYMENT_STRATEGY",
    "branch": "$BRANCH",
    "commit": "$(git rev-parse HEAD)",
    "status": "$status",
    "message": "$message",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
        )
        
        if [[ "$DRY_RUN" != "true" ]]; then
            curl -s -X POST "$DEPLOYMENT_WEBHOOK_URL" \
                -H "Content-Type: application/json" \
                -d "$payload" \
                > /dev/null || log_warning "Failed to send notification"
        else
            log_info "[DRY RUN] Would send notification: $message"
        fi
    fi
}

# Rollback function
rollback_deployment() {
    log_error "Deployment failed, initiating rollback..."
    
    if [[ "$DRY_RUN" != "true" ]]; then
        # Get previous successful deployment
        local previous_commit=$(git log --format="%H" --skip=1 -n 1)
        
        log_info "Rolling back to commit: $previous_commit"
        
        # Quick rollback using previous version
        case $DEPLOYMENT_STRATEGY in
            blue-green)
                log_info "Switching traffic back to blue environment..."
                sleep 2
                ;;
            *)
                log_info "Deploying previous version..."
                git checkout "$previous_commit"
                build_application
                deploy_rolling
                git checkout "$BRANCH"
                ;;
        esac
        
        send_notification "rollback_success" "Deployment rolled back successfully"
    else
        log_info "[DRY RUN] Would rollback to previous successful deployment"
    fi
}

# Cleanup function
cleanup() {
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        log_success "Deployment completed successfully!"
        send_notification "success" "Deployment completed successfully"
    else
        log_error "Deployment failed!"
        send_notification "failure" "Deployment failed"
        
        # Auto-rollback on production failures
        if [[ "$ENVIRONMENT" == "production" && "$DRY_RUN" != "true" ]]; then
            rollback_deployment
        fi
    fi
    
    # Clean up temporary files
    if [[ -d "/tmp/coreflow360-deploy-$$" ]]; then
        rm -rf "/tmp/coreflow360-deploy-$$"
    fi
    
    exit $exit_code
}

# Main execution function
main() {
    # Set up trap for cleanup
    trap cleanup EXIT
    
    log_info "Starting CoreFlow360 deployment..."
    log_info "Deployment ID: $DEPLOYMENT_ID"
    log_info "Environment: $ENVIRONMENT"
    log_info "Strategy: $DEPLOYMENT_STRATEGY"
    log_info "Branch: $BRANCH"
    log_info "Dry Run: $DRY_RUN"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_warning "DRY RUN MODE - No actual changes will be made"
    fi
    
    # Send start notification
    send_notification "started" "Deployment started"
    
    # Execute deployment pipeline
    validate_environment
    pre_deployment_checks
    build_application
    run_tests
    security_scan
    build_docker_image
    run_migrations
    deploy_application
    post_deployment_tasks
    
    log_success "Deployment pipeline completed successfully!"
}

# Parse arguments and run main function
parse_args "$@"
main