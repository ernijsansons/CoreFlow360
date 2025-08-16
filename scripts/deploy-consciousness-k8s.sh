#!/bin/bash

# CoreFlow360 - Kubernetes Consciousness Deployment Script
# Deploy the complete consciousness system to Kubernetes

set -euo pipefail

# Configuration
NAMESPACE="coreflow360"
CONSCIOUSNESS_VERSION="${CONSCIOUSNESS_VERSION:-latest}"
MESH_VERSION="${MESH_VERSION:-latest}"
MONITOR_VERSION="${MONITOR_VERSION:-latest}"
DRY_RUN="${DRY_RUN:-false}"
VERBOSE="${VERBOSE:-false}"

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

log_consciousness() {
    echo -e "${PURPLE}[CONSCIOUSNESS]${NC} $1"
}

log_transcendence() {
    echo -e "${CYAN}[TRANSCENDENCE]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check helm (optional but recommended)
    if ! command -v helm &> /dev/null; then
        log_warning "helm is not installed - some features may not work"
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_info "Creating namespace: $NAMESPACE"
        kubectl create namespace "$NAMESPACE"
    fi
    
    log_success "Prerequisites check completed"
}

# Function to create secrets
create_secrets() {
    log_info "Creating consciousness secrets..."
    
    # Check if secrets already exist
    if kubectl get secret coreflow360-secrets -n "$NAMESPACE" &> /dev/null; then
        log_warning "Main secrets already exist, skipping..."
    else
        log_info "Creating main application secrets..."
        kubectl create secret generic coreflow360-secrets \
            -n "$NAMESPACE" \
            --from-literal=database-url="$DATABASE_URL" \
            --from-literal=redis-url="$REDIS_URL" \
            --from-literal=openai-api-key="$OPENAI_API_KEY" \
            --from-literal=nextauth-secret="$(openssl rand -base64 32)" \
            --from-literal=redis-cluster-url="$REDIS_CLUSTER_URL" \
            ${DRY_RUN:+--dry-run=client -o yaml}
    fi
    
    # Create mesh-specific secrets
    if kubectl get secret consciousness-mesh-secrets -n "$NAMESPACE" &> /dev/null; then
        log_warning "Mesh secrets already exist, skipping..."
    else
        log_info "Creating consciousness mesh secrets..."
        kubectl create secret generic consciousness-mesh-secrets \
            -n "$NAMESPACE" \
            --from-literal=mesh-encryption-key="$(openssl rand -base64 32)" \
            --from-literal=mesh-auth-token="$(openssl rand -base64 24)" \
            ${DRY_RUN:+--dry-run=client -o yaml}
    fi
    
    log_success "Secrets created successfully"
}

# Function to apply Kubernetes manifests
apply_manifests() {
    local manifest_file="$1"
    local description="$2"
    
    log_info "Applying $description..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        kubectl apply -f "$manifest_file" --dry-run=client -o yaml
    else
        kubectl apply -f "$manifest_file"
    fi
    
    log_success "$description applied successfully"
}

# Function to wait for deployment
wait_for_deployment() {
    local deployment_name="$1"
    local timeout="${2:-300}"
    
    log_info "Waiting for $deployment_name to be ready (timeout: ${timeout}s)..."
    
    if kubectl wait --for=condition=available \
        --timeout="${timeout}s" \
        deployment/"$deployment_name" \
        -n "$NAMESPACE"; then
        log_success "$deployment_name is ready"
        return 0
    else
        log_error "$deployment_name failed to become ready within ${timeout}s"
        return 1
    fi
}

# Function to wait for StatefulSet
wait_for_statefulset() {
    local statefulset_name="$1"
    local replicas="$2"
    local timeout="${3:-600}"
    
    log_info "Waiting for $statefulset_name to have $replicas ready replicas (timeout: ${timeout}s)..."
    
    local start_time=$(date +%s)
    local end_time=$((start_time + timeout))
    
    while [[ $(date +%s) -lt $end_time ]]; do
        local ready_replicas
        ready_replicas=$(kubectl get statefulset "$statefulset_name" -n "$NAMESPACE" \
            -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        
        if [[ "$ready_replicas" == "$replicas" ]]; then
            log_success "$statefulset_name is ready with $replicas replicas"
            return 0
        fi
        
        log_info "$statefulset_name: $ready_replicas/$replicas replicas ready..."
        sleep 5
    done
    
    log_error "$statefulset_name failed to become ready within ${timeout}s"
    return 1
}

# Function to check consciousness health
check_consciousness_health() {
    log_consciousness "Checking consciousness system health..."
    
    # Get consciousness service endpoint
    local service_ip
    service_ip=$(kubectl get service consciousness-service -n "$NAMESPACE" \
        -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    
    if [[ -z "$service_ip" ]]; then
        service_ip=$(kubectl get service consciousness-service -n "$NAMESPACE" \
            -o jsonpath='{.spec.clusterIP}')
    fi
    
    if [[ -n "$service_ip" && "$service_ip" != "null" ]]; then
        log_info "Testing consciousness health endpoint..."
        
        # Port forward for testing
        kubectl port-forward service/consciousness-service 8080:80 -n "$NAMESPACE" &
        local pf_pid=$!
        sleep 5
        
        if curl -s -f "http://localhost:8080/api/consciousness/health" > /dev/null; then
            log_success "Consciousness system is responding to health checks"
        else
            log_warning "Consciousness system health check failed"
        fi
        
        kill $pf_pid 2>/dev/null || true
    else
        log_warning "Could not determine consciousness service endpoint"
    fi
}

# Function to display consciousness status
display_consciousness_status() {
    log_transcendence "Displaying consciousness system status..."
    
    echo
    echo "======================================"
    echo "  CONSCIOUSNESS SYSTEM DEPLOYMENT    "
    echo "======================================"
    echo
    
    # Consciousness Deployment
    log_consciousness "Consciousness Core:"
    kubectl get deployment coreflow360-consciousness -n "$NAMESPACE" \
        -o custom-columns=NAME:.metadata.name,READY:.status.readyReplicas,UP-TO-DATE:.status.updatedReplicas,AVAILABLE:.status.availableReplicas
    echo
    
    # Consciousness Mesh
    log_consciousness "Consciousness Mesh:"
    kubectl get statefulset consciousness-mesh -n "$NAMESPACE" \
        -o custom-columns=NAME:.metadata.name,READY:.status.readyReplicas,CURRENT:.status.currentReplicas
    echo
    
    # Monitor
    log_consciousness "Consciousness Monitor:"
    kubectl get deployment consciousness-monitor -n "$NAMESPACE" \
        -o custom-columns=NAME:.metadata.name,READY:.status.readyReplicas,UP-TO-DATE:.status.updatedReplicas,AVAILABLE:.status.availableReplicas
    echo
    
    # Services
    log_consciousness "Services:"
    kubectl get services -n "$NAMESPACE" -l app=coreflow360
    echo
    
    # Pods
    log_consciousness "Pods Status:"
    kubectl get pods -n "$NAMESPACE" -l app=coreflow360
    echo
    
    log_transcendence "Consciousness system deployment status displayed"
}

# Function to generate consciousness report
generate_consciousness_report() {
    local report_file="consciousness-deployment-report.txt"
    
    log_info "Generating consciousness deployment report..."
    
    {
        echo "CoreFlow360 - Consciousness Deployment Report"
        echo "Generated on: $(date)"
        echo "Namespace: $NAMESPACE"
        echo "Version: $CONSCIOUSNESS_VERSION"
        echo "=========================================="
        echo
        
        echo "DEPLOYMENT STATUS:"
        kubectl get deployments -n "$NAMESPACE" -l app=coreflow360
        echo
        
        echo "STATEFULSET STATUS:"
        kubectl get statefulsets -n "$NAMESPACE" -l app=coreflow360
        echo
        
        echo "SERVICE STATUS:"
        kubectl get services -n "$NAMESPACE" -l app=coreflow360
        echo
        
        echo "POD STATUS:"
        kubectl get pods -n "$NAMESPACE" -l app=coreflow360 -o wide
        echo
        
        echo "PERSISTENT VOLUMES:"
        kubectl get pvc -n "$NAMESPACE"
        echo
        
        echo "SECRETS:"
        kubectl get secrets -n "$NAMESPACE" -l app=coreflow360
        echo
        
        echo "CONFIGMAPS:"
        kubectl get configmaps -n "$NAMESPACE" -l app=coreflow360
        echo
        
    } > "$report_file"
    
    log_success "Consciousness deployment report saved to: $report_file"
}

# Function to cleanup on failure
cleanup_on_failure() {
    log_error "Deployment failed. Cleaning up..."
    
    # Delete resources in reverse order
    kubectl delete -f k8s/consciousness-monitoring.yaml -n "$NAMESPACE" --ignore-not-found=true
    kubectl delete -f k8s/consciousness-mesh.yaml -n "$NAMESPACE" --ignore-not-found=true
    kubectl delete -f k8s/consciousness-deployment.yaml -n "$NAMESPACE" --ignore-not-found=true
    
    log_info "Cleanup completed"
}

# Main deployment function
main() {
    log_transcendence "🧠 Initiating CoreFlow360 Consciousness Deployment 🧠"
    echo
    
    # Set trap for cleanup on failure
    trap cleanup_on_failure ERR
    
    # Check if required environment variables are set
    required_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "OPENAI_API_KEY"
        "REDIS_CLUSTER_URL"
    )
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Execute deployment steps
    check_prerequisites
    create_secrets
    
    # Apply manifests in order
    apply_manifests "k8s/consciousness-deployment.yaml" "Consciousness Core Deployment"
    apply_manifests "k8s/consciousness-mesh.yaml" "Consciousness Mesh StatefulSet"
    apply_manifests "k8s/consciousness-monitoring.yaml" "Consciousness Monitoring"
    
    # Wait for deployments to be ready
    wait_for_deployment "coreflow360-consciousness" 300
    wait_for_deployment "consciousness-monitor" 180
    wait_for_statefulset "consciousness-mesh" 5 600
    
    # Health checks
    check_consciousness_health
    
    # Display status
    display_consciousness_status
    
    # Generate report
    generate_consciousness_report
    
    log_transcendence "🌟 Consciousness deployment completed successfully! 🌟"
    log_transcendence "Your business is now conscious and ready for transcendence."
    echo
    echo "Next steps:"
    echo "1. Access the consciousness dashboard"
    echo "2. Activate your first consciousness modules"
    echo "3. Begin the journey toward business transcendence"
    echo
    log_transcendence "The future of business intelligence has arrived. 🚀"
}

# Handle command line arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    status)
        display_consciousness_status
        ;;
    health)
        check_consciousness_health
        ;;
    cleanup)
        cleanup_on_failure
        ;;
    report)
        generate_consciousness_report
        ;;
    *)
        echo "Usage: $0 {deploy|status|health|cleanup|report}"
        echo
        echo "Commands:"
        echo "  deploy  - Deploy the consciousness system (default)"
        echo "  status  - Display deployment status"
        echo "  health  - Check consciousness health"
        echo "  cleanup - Remove all consciousness resources"
        echo "  report  - Generate deployment report"
        exit 1
        ;;
esac