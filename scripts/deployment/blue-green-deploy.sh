#!/bin/bash

# CoreFlow360 Blue-Green Deployment Script
# Zero-downtime deployment automation with rollback capabilities

set -euo pipefail

# Configuration
NAMESPACE="${NAMESPACE:-coreflow360-blue-green}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
IMAGE_REGISTRY="${IMAGE_REGISTRY:-coreflow360}"
DEPLOYMENT_TIMEOUT="${DEPLOYMENT_TIMEOUT:-600}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-300}"
TRAFFIC_SPLIT_WAIT="${TRAFFIC_SPLIT_WAIT:-30}"
DRY_RUN="${DRY_RUN:-false}"
VERBOSE="${VERBOSE:-false}"
ROLLBACK_ON_FAILURE="${ROLLBACK_ON_FAILURE:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_deployment() {
    echo -e "${PURPLE}[DEPLOY]${NC} $1"
}

log_traffic() {
    echo -e "${CYAN}[TRAFFIC]${NC} $1"
}

# Function to display usage
usage() {
    cat << EOF
CoreFlow360 Blue-Green Deployment

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    deploy          Deploy new version using blue-green strategy
    switch          Switch traffic between blue and green
    rollback        Rollback to previous version
    status          Show deployment status
    cleanup         Clean up old deployments

Options:
    --image-tag TAG         Docker image tag to deploy (default: latest)
    --namespace NAMESPACE   Kubernetes namespace (default: coreflow360-blue-green)
    --registry REGISTRY     Docker registry (default: coreflow360)
    --dry-run              Show what would be done without executing
    --timeout SECONDS      Deployment timeout (default: 600)
    --health-timeout SEC   Health check timeout (default: 300)
    --verbose              Enable verbose output
    --no-rollback          Disable automatic rollback on failure
    --help                 Show this help message

Environment Variables:
    NAMESPACE              Target namespace
    IMAGE_TAG              Docker image tag
    IMAGE_REGISTRY         Docker registry
    DEPLOYMENT_TIMEOUT     Deployment timeout in seconds
    HEALTH_CHECK_TIMEOUT   Health check timeout in seconds
    DRY_RUN               Dry run mode (true/false)
    VERBOSE               Enable verbose output
    ROLLBACK_ON_FAILURE   Enable automatic rollback (true/false)

Examples:
    $0 deploy --image-tag v2.1.0
    $0 switch --from blue --to green
    $0 rollback
    $0 status

EOF
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    # Check required tools
    for tool in kubectl jq curl; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is not installed"
            exit 1
        fi
    done
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check namespace
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_error "Namespace $NAMESPACE does not exist"
        exit 1
    fi
    
    # Check if deployments exist
    if ! kubectl get deployment coreflow360-blue coreflow360-green -n "$NAMESPACE" &> /dev/null; then
        log_error "Blue-Green deployments not found in namespace $NAMESPACE"
        log_info "Please apply k8s/deployment/blue-green-deployment.yaml first"
        exit 1
    fi
    
    log_success "Prerequisites check completed"
}

# Function to get current active version
get_active_version() {
    local active_selector
    active_selector=$(kubectl get service coreflow360-active -n "$NAMESPACE" -o jsonpath='{.spec.selector.version}')
    echo "$active_selector"
}

# Function to get inactive version
get_inactive_version() {
    local active_version="$1"
    if [ "$active_version" = "blue" ]; then
        echo "green"
    else
        echo "blue"
    fi
}

# Function to check deployment health
check_deployment_health() {
    local version="$1"
    local timeout="$2"
    
    log_info "Checking health of $version deployment..."
    
    # Wait for deployment to be ready
    if ! kubectl wait --for=condition=available --timeout="${timeout}s" deployment/coreflow360-$version -n "$NAMESPACE"; then
        log_error "$version deployment failed to become available"
        return 1
    fi
    
    # Check pod readiness
    local ready_pods
    ready_pods=$(kubectl get deployment coreflow360-$version -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
    local desired_pods
    desired_pods=$(kubectl get deployment coreflow360-$version -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
    
    if [ "$ready_pods" -ne "$desired_pods" ]; then
        log_error "$version deployment: $ready_pods/$desired_pods pods ready"
        return 1
    fi
    
    # Health check via service
    log_info "Performing application health check for $version..."
    local service_name="coreflow360-$version"
    
    # Port forward for health check
    kubectl port-forward service/$service_name 8081:80 -n "$NAMESPACE" &
    local port_forward_pid=$!
    
    # Wait for port forward to establish
    sleep 5
    
    # Perform health check
    local health_check_passed=false
    for i in {1..10}; do
        if curl -f -s http://localhost:8081/api/health > /dev/null; then
            health_check_passed=true
            break
        fi
        log_info "Health check attempt $i/10 failed, retrying..."
        sleep 10
    done
    
    # Clean up port forward
    kill $port_forward_pid 2>/dev/null || true
    
    if [ "$health_check_passed" = "false" ]; then
        log_error "$version deployment failed health check"
        return 1
    fi
    
    log_success "$version deployment is healthy"
    return 0
}

# Function to deploy new version
deploy_version() {
    local target_version="$1"
    local image_tag="$2"
    
    log_deployment "Deploying version $image_tag to $target_version slot..."
    
    # Update deployment image
    local image_name="$IMAGE_REGISTRY/app:$target_version-$image_tag"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would update $target_version deployment with image $image_name"
        return 0
    fi
    
    # Scale up the target deployment
    log_info "Scaling up $target_version deployment..."
    kubectl scale deployment coreflow360-$target_version --replicas=3 -n "$NAMESPACE"
    
    # Update the image
    kubectl set image deployment/coreflow360-$target_version coreflow360="$image_name" -n "$NAMESPACE"
    
    # Wait for rollout to complete
    log_info "Waiting for $target_version deployment rollout..."
    if ! kubectl rollout status deployment/coreflow360-$target_version -n "$NAMESPACE" --timeout="${DEPLOYMENT_TIMEOUT}s"; then
        log_error "$target_version deployment rollout failed"
        return 1
    fi
    
    # Health check
    if ! check_deployment_health "$target_version" "$HEALTH_CHECK_TIMEOUT"; then
        log_error "$target_version deployment health check failed"
        return 1
    fi
    
    log_success "$target_version deployment completed successfully"
    return 0
}

# Function to switch traffic
switch_traffic() {
    local from_version="$1"
    local to_version="$2"
    
    log_traffic "Switching traffic from $from_version to $to_version..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would switch active service selector from $from_version to $to_version"
        return 0
    fi
    
    # Update active service selector
    kubectl patch service coreflow360-active -n "$NAMESPACE" -p "{\"spec\":{\"selector\":{\"version\":\"$to_version\"}}}"
    
    # Wait for traffic switch to stabilize
    log_info "Waiting ${TRAFFIC_SPLIT_WAIT}s for traffic switch to stabilize..."
    sleep "$TRAFFIC_SPLIT_WAIT"
    
    # Verify traffic is routing correctly
    log_info "Verifying traffic routing..."
    
    # Port forward for verification
    kubectl port-forward service/coreflow360-active 8082:80 -n "$NAMESPACE" &
    local port_forward_pid=$!
    sleep 5
    
    # Check if we're hitting the correct version
    local response
    response=$(curl -s http://localhost:8082/api/health | jq -r '.version // "unknown"' 2>/dev/null || echo "unknown")
    
    # Clean up port forward
    kill $port_forward_pid 2>/dev/null || true
    
    if [ "$response" = "unknown" ]; then
        log_warning "Could not verify version from health endpoint"
    else
        log_info "Active service is routing to version: $response"
    fi
    
    log_success "Traffic successfully switched to $to_version"
    return 0
}

# Function to scale down inactive deployment
scale_down_inactive() {
    local inactive_version="$1"
    
    log_info "Scaling down $inactive_version deployment..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would scale down $inactive_version deployment to 0 replicas"
        return 0
    fi
    
    kubectl scale deployment coreflow360-$inactive_version --replicas=0 -n "$NAMESPACE"
    
    log_success "$inactive_version deployment scaled down"
}

# Function to perform blue-green deployment
perform_deployment() {
    local image_tag="$1"
    
    log_deployment "Starting blue-green deployment for image tag: $image_tag"
    
    # Get current active version
    local active_version
    active_version=$(get_active_version)
    local inactive_version
    inactive_version=$(get_inactive_version "$active_version")
    
    log_info "Current active version: $active_version"
    log_info "Deploying to inactive version: $inactive_version"
    
    # Deploy to inactive version
    if ! deploy_version "$inactive_version" "$image_tag"; then
        log_error "Deployment to $inactive_version failed"
        if [ "$ROLLBACK_ON_FAILURE" = "true" ]; then
            log_warning "Scaling down failed $inactive_version deployment"
            scale_down_inactive "$inactive_version"
        fi
        return 1
    fi
    
    # Switch traffic
    if ! switch_traffic "$active_version" "$inactive_version"; then
        log_error "Traffic switch failed"
        if [ "$ROLLBACK_ON_FAILURE" = "true" ]; then
            log_warning "Rolling back traffic switch"
            switch_traffic "$inactive_version" "$active_version" || true
            scale_down_inactive "$inactive_version"
        fi
        return 1
    fi
    
    # Scale down old version
    scale_down_inactive "$active_version"
    
    log_success "Blue-green deployment completed successfully!"
    log_info "Active version is now: $inactive_version"
    
    return 0
}

# Function to rollback deployment
rollback_deployment() {
    log_deployment "Starting rollback process..."
    
    local active_version
    active_version=$(get_active_version)
    local inactive_version
    inactive_version=$(get_inactive_version "$active_version")
    
    log_info "Current active version: $active_version"
    log_info "Rolling back to: $inactive_version"
    
    # Scale up the inactive (previous) version
    log_info "Scaling up $inactive_version deployment..."
    kubectl scale deployment coreflow360-$inactive_version --replicas=3 -n "$NAMESPACE"
    
    # Wait for it to be ready
    if ! kubectl wait --for=condition=available --timeout="${DEPLOYMENT_TIMEOUT}s" deployment/coreflow360-$inactive_version -n "$NAMESPACE"; then
        log_error "Rollback failed: $inactive_version deployment not ready"
        return 1
    fi
    
    # Check health
    if ! check_deployment_health "$inactive_version" "$HEALTH_CHECK_TIMEOUT"; then
        log_error "Rollback failed: $inactive_version deployment health check failed"
        return 1
    fi
    
    # Switch traffic back
    if ! switch_traffic "$active_version" "$inactive_version"; then
        log_error "Rollback failed: traffic switch failed"
        return 1
    fi
    
    # Scale down the current (failed) version
    scale_down_inactive "$active_version"
    
    log_success "Rollback completed successfully!"
    log_info "Active version is now: $inactive_version"
}

# Function to show deployment status
show_status() {
    echo ""
    echo "🚀 COREFLOW360 BLUE-GREEN DEPLOYMENT STATUS"
    echo "=========================================="
    
    local active_version
    active_version=$(get_active_version)
    
    echo "Namespace: $NAMESPACE"
    echo "Active Version: $active_version"
    echo ""
    
    # Blue deployment status
    echo "📘 BLUE DEPLOYMENT STATUS"
    echo "========================"
    kubectl get deployment coreflow360-blue -n "$NAMESPACE" -o wide
    echo ""
    
    # Green deployment status
    echo "📗 GREEN DEPLOYMENT STATUS"
    echo "========================="
    kubectl get deployment coreflow360-green -n "$NAMESPACE" -o wide
    echo ""
    
    # Service status
    echo "🔗 SERVICE STATUS"
    echo "================"
    kubectl get services -n "$NAMESPACE" -l app=coreflow360
    echo ""
    
    # Pod status
    echo "🏃 POD STATUS"
    echo "============"
    kubectl get pods -n "$NAMESPACE" -l app=coreflow360 -o wide
    echo ""
    
    # HPA status
    echo "📊 AUTOSCALER STATUS"
    echo "==================="
    kubectl get hpa -n "$NAMESPACE"
    echo ""
}

# Function to cleanup old deployments
cleanup_deployments() {
    log_info "Cleaning up old deployments..."
    
    # Scale down inactive deployment
    local active_version
    active_version=$(get_active_version)
    local inactive_version
    inactive_version=$(get_inactive_version "$active_version")
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would scale down $inactive_version deployment"
        return 0
    fi
    
    scale_down_inactive "$inactive_version"
    
    # Clean up old ReplicaSets
    log_info "Cleaning up old ReplicaSets..."
    kubectl delete replicaset -n "$NAMESPACE" -l app=coreflow360 --field-selector='status.replicas=0'
    
    log_success "Cleanup completed"
}

# Main function
main() {
    local command="${1:-}"
    
    case "$command" in
        deploy)
            check_prerequisites
            perform_deployment "$IMAGE_TAG"
            ;;
        switch)
            check_prerequisites
            local from_version="${2:-}"
            local to_version="${3:-}"
            if [ -z "$from_version" ] || [ -z "$to_version" ]; then
                log_error "Switch command requires --from and --to versions"
                usage
                exit 1
            fi
            switch_traffic "$from_version" "$to_version"
            ;;
        rollback)
            check_prerequisites
            rollback_deployment
            ;;
        status)
            check_prerequisites
            show_status
            ;;
        cleanup)
            check_prerequisites
            cleanup_deployments
            ;;
        ""|--help|-h)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown command: $command"
            usage
            exit 1
            ;;
    esac
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --image-tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --registry)
            IMAGE_REGISTRY="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --timeout)
            DEPLOYMENT_TIMEOUT="$2"
            shift 2
            ;;
        --health-timeout)
            HEALTH_CHECK_TIMEOUT="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE="true"
            shift
            ;;
        --no-rollback)
            ROLLBACK_ON_FAILURE="false"
            shift
            ;;
        --from)
            FROM_VERSION="$2"
            shift 2
            ;;
        --to)
            TO_VERSION="$2"
            shift 2
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        deploy|switch|rollback|status|cleanup)
            # Commands are handled in main function
            break
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Handle switch command arguments
if [ "${1:-}" = "switch" ] && [ -n "${FROM_VERSION:-}" ] && [ -n "${TO_VERSION:-}" ]; then
    main switch "$FROM_VERSION" "$TO_VERSION"
else
    main "$@"
fi