#!/bin/bash

# CoreFlow360 Canary Deployment Script
# Progressive traffic shifting with automated rollback

set -euo pipefail

# Configuration
NAMESPACE="${NAMESPACE:-coreflow360-canary}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
IMAGE_REGISTRY="${IMAGE_REGISTRY:-coreflow360}"
CANARY_STEPS="${CANARY_STEPS:-5,10,20,50,100}"
STEP_DURATION="${STEP_DURATION:-300}"
SUCCESS_THRESHOLD="${SUCCESS_THRESHOLD:-95}"
ERROR_THRESHOLD="${ERROR_THRESHOLD:-5}"
RESPONSE_TIME_THRESHOLD="${RESPONSE_TIME_THRESHOLD:-1000}"
DRY_RUN="${DRY_RUN:-false}"
VERBOSE="${VERBOSE:-false}"
AUTO_PROMOTE="${AUTO_PROMOTE:-false}"

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

log_canary() {
    echo -e "${PURPLE}[CANARY]${NC} $1"
}

log_metrics() {
    echo -e "${CYAN}[METRICS]${NC} $1"
}

# Function to display usage
usage() {
    cat << EOF
CoreFlow360 Canary Deployment

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    deploy          Start canary deployment
    promote         Promote canary to stable
    abort           Abort canary deployment and rollback
    status          Show canary deployment status
    metrics         Show canary metrics

Options:
    --image-tag TAG         Docker image tag to deploy (default: latest)
    --namespace NAMESPACE   Kubernetes namespace (default: coreflow360-canary)
    --registry REGISTRY     Docker registry (default: coreflow360)
    --steps STEPS           Canary traffic steps (default: 5,10,20,50,100)
    --step-duration SECS    Duration for each step (default: 300)
    --success-threshold %   Success rate threshold (default: 95)
    --error-threshold %     Error rate threshold (default: 5)
    --response-threshold MS Response time threshold (default: 1000)
    --auto-promote          Automatically promote if metrics are good
    --dry-run              Show what would be done without executing
    --verbose              Enable verbose output
    --help                 Show this help message

Environment Variables:
    NAMESPACE               Target namespace
    IMAGE_TAG               Docker image tag
    IMAGE_REGISTRY          Docker registry
    CANARY_STEPS           Traffic percentage steps
    STEP_DURATION          Step duration in seconds
    SUCCESS_THRESHOLD      Success rate threshold
    ERROR_THRESHOLD        Error rate threshold
    RESPONSE_TIME_THRESHOLD Response time threshold
    AUTO_PROMOTE           Auto-promotion enabled
    DRY_RUN                Dry run mode
    VERBOSE                Verbose output

Examples:
    $0 deploy --image-tag v2.1.0
    $0 deploy --steps "10,25,50,75,100" --auto-promote
    $0 status
    $0 promote
    $0 abort

EOF
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking canary deployment prerequisites..."
    
    # Check required tools
    for tool in kubectl jq curl; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "$tool is not installed"
            exit 1
        fi
    done
    
    # Check for Istio
    if ! kubectl get crd virtualservices.networking.istio.io &> /dev/null; then
        log_error "Istio is not installed in the cluster"
        exit 1
    fi
    
    # Check for Flagger (optional)
    if ! kubectl get crd canaries.flagger.app &> /dev/null; then
        log_warning "Flagger not detected - using manual canary deployment"
    fi
    
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
    
    log_success "Prerequisites check completed"
}

# Function to get current traffic weights
get_traffic_weights() {
    local stable_weight canary_weight
    
    stable_weight=$(kubectl get virtualservice coreflow360-canary-traffic -n "$NAMESPACE" -o jsonpath='{.spec.http[1].route[0].weight}' 2>/dev/null || echo "100")
    canary_weight=$(kubectl get virtualservice coreflow360-canary-traffic -n "$NAMESPACE" -o jsonpath='{.spec.http[1].route[1].weight}' 2>/dev/null || echo "0")
    
    echo "stable:$stable_weight,canary:$canary_weight"
}

# Function to update traffic weights
update_traffic_weights() {
    local stable_weight="$1"
    local canary_weight="$2"
    
    log_canary "Updating traffic weights - Stable: ${stable_weight}%, Canary: ${canary_weight}%"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would update traffic weights to stable:${stable_weight}%, canary:${canary_weight}%"
        return 0
    fi
    
    # Update VirtualService
    kubectl patch virtualservice coreflow360-canary-traffic -n "$NAMESPACE" --type='merge' -p="
{
  \"spec\": {
    \"http\": [
      {
        \"match\": [
          {
            \"headers\": {
              \"canary\": {
                \"exact\": \"true\"
              }
            }
          }
        ],
        \"route\": [
          {
            \"destination\": {
              \"host\": \"coreflow360-canary\",
              \"port\": {
                \"number\": 80
              }
            }
          }
        ]
      },
      {
        \"route\": [
          {
            \"destination\": {
              \"host\": \"coreflow360-stable\",
              \"port\": {
                \"number\": 80
              }
            },
            \"weight\": $stable_weight
          },
          {
            \"destination\": {
              \"host\": \"coreflow360-canary\",
              \"port\": {
                \"number\": 80
              }
            },
            \"weight\": $canary_weight
          }
        ]
      }
    ]
  }
}"
    
    log_success "Traffic weights updated successfully"
}

# Function to collect metrics
collect_metrics() {
    local version="$1"
    local duration="$2"
    
    log_metrics "Collecting metrics for $version version over ${duration}s..."
    
    # Wait for metrics collection period
    sleep "$duration"
    
    # Query Prometheus for metrics
    local success_rate error_rate avg_response_time
    
    # Get success rate (assuming Prometheus is available)
    success_rate=$(kubectl exec -n monitoring deployment/prometheus-server -- \
        promtool query instant 'rate(http_requests_total{job="coreflow360",version="'$version'",code!~"5.."}[5m]) / rate(http_requests_total{job="coreflow360",version="'$version'"}[5m]) * 100' \
        2>/dev/null | tail -1 | awk '{print $2}' || echo "0")
    
    # Get error rate
    error_rate=$(kubectl exec -n monitoring deployment/prometheus-server -- \
        promtool query instant 'rate(http_requests_total{job="coreflow360",version="'$version'",code=~"5.."}[5m]) / rate(http_requests_total{job="coreflow360",version="'$version'"}[5m]) * 100' \
        2>/dev/null | tail -1 | awk '{print $2}' || echo "0")
    
    # Get average response time
    avg_response_time=$(kubectl exec -n monitoring deployment/prometheus-server -- \
        promtool query instant 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="coreflow360",version="'$version'"}[5m])) * 1000' \
        2>/dev/null | tail -1 | awk '{print $2}' || echo "0")
    
    # Fallback to basic health check if Prometheus not available
    if [ "$success_rate" = "0" ]; then
        log_warning "Prometheus metrics not available, using basic health checks"
        
        # Port forward and test
        kubectl port-forward service/coreflow360-$version 8080:80 -n "$NAMESPACE" &
        local port_forward_pid=$!
        sleep 3
        
        local health_checks=0
        local successful_checks=0
        
        for i in {1..10}; do
            health_checks=$((health_checks + 1))
            if curl -f -s http://localhost:8080/api/health > /dev/null; then
                successful_checks=$((successful_checks + 1))
            fi
            sleep 1
        done
        
        kill $port_forward_pid 2>/dev/null || true
        
        success_rate=$(echo "scale=2; $successful_checks * 100 / $health_checks" | bc -l)
        error_rate=$(echo "scale=2; 100 - $success_rate" | bc -l)
        avg_response_time="200"  # Default assumption
    fi
    
    echo "$success_rate,$error_rate,$avg_response_time"
}

# Function to evaluate metrics
evaluate_metrics() {
    local metrics="$1"
    local success_rate error_rate avg_response_time
    
    IFS=',' read -r success_rate error_rate avg_response_time <<< "$metrics"
    
    log_metrics "Metrics - Success: ${success_rate}%, Error: ${error_rate}%, Avg Response: ${avg_response_time}ms"
    
    # Check thresholds
    local metrics_good=true
    
    if (( $(echo "$success_rate < $SUCCESS_THRESHOLD" | bc -l) )); then
        log_error "Success rate ${success_rate}% below threshold ${SUCCESS_THRESHOLD}%"
        metrics_good=false
    fi
    
    if (( $(echo "$error_rate > $ERROR_THRESHOLD" | bc -l) )); then
        log_error "Error rate ${error_rate}% above threshold ${ERROR_THRESHOLD}%"
        metrics_good=false
    fi
    
    if (( $(echo "$avg_response_time > $RESPONSE_TIME_THRESHOLD" | bc -l) )); then
        log_error "Response time ${avg_response_time}ms above threshold ${RESPONSE_TIME_THRESHOLD}ms"
        metrics_good=false
    fi
    
    if [ "$metrics_good" = "true" ]; then
        log_success "✅ All metrics within acceptable thresholds"
        return 0
    else
        log_error "❌ Metrics failed quality gates"
        return 1
    fi
}

# Function to deploy canary
deploy_canary() {
    local image_tag="$1"
    
    log_canary "Starting canary deployment for image tag: $image_tag"
    
    # Update canary deployment image
    local image_name="$IMAGE_REGISTRY/app:canary-$image_tag"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would deploy canary with image $image_name"
        return 0
    fi
    
    # Scale canary to 1 replica initially
    kubectl scale deployment coreflow360-canary --replicas=1 -n "$NAMESPACE"
    
    # Update canary image
    kubectl set image deployment/coreflow360-canary coreflow360="$image_name" -n "$NAMESPACE"
    
    # Wait for canary deployment
    if ! kubectl rollout status deployment/coreflow360-canary -n "$NAMESPACE" --timeout=300s; then
        log_error "Canary deployment failed"
        return 1
    fi
    
    # Health check
    if ! check_canary_health; then
        log_error "Canary health check failed"
        return 1
    fi
    
    log_success "Canary deployment successful"
    
    # Progressive traffic shifting
    IFS=',' read -ra STEPS <<< "$CANARY_STEPS"
    
    for step in "${STEPS[@]}"; do
        local stable_weight=$((100 - step))
        
        log_canary "Shifting ${step}% traffic to canary..."
        update_traffic_weights "$stable_weight" "$step"
        
        # Collect and evaluate metrics
        local metrics
        metrics=$(collect_metrics "canary" "$STEP_DURATION")
        
        if ! evaluate_metrics "$metrics"; then
            log_error "Metrics evaluation failed at ${step}% traffic"
            log_canary "Initiating automatic rollback..."
            abort_canary
            return 1
        fi
        
        log_success "Step ${step}% completed successfully"
        
        # Auto-promote if this is the final step and auto-promote is enabled
        if [ "$step" = "100" ] && [ "$AUTO_PROMOTE" = "true" ]; then
            log_canary "Auto-promoting canary to stable..."
            promote_canary
            return 0
        fi
        
        # Pause between steps (except for the last step)
        if [ "$step" != "100" ]; then
            log_info "Waiting before next step..."
            sleep 30
        fi
    done
    
    log_success "Canary deployment completed - ready for promotion"
}

# Function to check canary health
check_canary_health() {
    log_info "Checking canary deployment health..."
    
    # Check pod readiness
    local ready_pods
    ready_pods=$(kubectl get deployment coreflow360-canary -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
    local desired_pods
    desired_pods=$(kubectl get deployment coreflow360-canary -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
    
    if [ "$ready_pods" != "$desired_pods" ]; then
        log_error "Canary deployment: $ready_pods/$desired_pods pods ready"
        return 1
    fi
    
    # Test canary endpoint
    kubectl port-forward service/coreflow360-canary 8081:80 -n "$NAMESPACE" &
    local port_forward_pid=$!
    sleep 3
    
    local health_check_passed=false
    for i in {1..5}; do
        if curl -f -s http://localhost:8081/api/health > /dev/null; then
            health_check_passed=true
            break
        fi
        sleep 2
    done
    
    kill $port_forward_pid 2>/dev/null || true
    
    if [ "$health_check_passed" = "false" ]; then
        log_error "Canary health check failed"
        return 1
    fi
    
    log_success "Canary deployment is healthy"
    return 0
}

# Function to promote canary
promote_canary() {
    log_canary "Promoting canary to stable..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would promote canary to stable"
        return 0
    fi
    
    # Get canary image
    local canary_image
    canary_image=$(kubectl get deployment coreflow360-canary -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}')
    
    # Update stable deployment with canary image
    kubectl set image deployment/coreflow360-stable coreflow360="$canary_image" -n "$NAMESPACE"
    
    # Wait for stable deployment rollout
    kubectl rollout status deployment/coreflow360-stable -n "$NAMESPACE" --timeout=600s
    
    # Route all traffic to stable
    update_traffic_weights 100 0
    
    # Scale down canary
    kubectl scale deployment coreflow360-canary --replicas=0 -n "$NAMESPACE"
    
    log_success "Canary promoted to stable successfully!"
}

# Function to abort canary
abort_canary() {
    log_canary "Aborting canary deployment and rolling back..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would abort canary and rollback"
        return 0
    fi
    
    # Route all traffic back to stable
    update_traffic_weights 100 0
    
    # Scale down canary
    kubectl scale deployment coreflow360-canary --replicas=0 -n "$NAMESPACE"
    
    log_success "Canary deployment aborted, traffic routed to stable"
}

# Function to show status
show_status() {
    echo ""
    echo "🐦 COREFLOW360 CANARY DEPLOYMENT STATUS"
    echo "======================================"
    
    local traffic_weights
    traffic_weights=$(get_traffic_weights)
    
    echo "Namespace: $NAMESPACE"
    echo "Traffic Distribution: $traffic_weights"
    echo ""
    
    # Stable deployment
    echo "🔵 STABLE DEPLOYMENT"
    echo "==================="
    kubectl get deployment coreflow360-stable -n "$NAMESPACE" -o wide
    echo ""
    
    # Canary deployment
    echo "🟡 CANARY DEPLOYMENT"
    echo "==================="
    kubectl get deployment coreflow360-canary -n "$NAMESPACE" -o wide
    echo ""
    
    # Services
    echo "🔗 SERVICES"
    echo "==========="
    kubectl get services -n "$NAMESPACE"
    echo ""
    
    # Traffic routing
    echo "🚦 TRAFFIC ROUTING"
    echo "=================="
    kubectl get virtualservice coreflow360-canary-traffic -n "$NAMESPACE" -o yaml | grep -A 20 "route:"
    echo ""
}

# Function to show metrics
show_metrics() {
    log_metrics "Collecting current metrics..."
    
    echo ""
    echo "📊 CANARY METRICS DASHBOARD"
    echo "=========================="
    
    # Stable metrics
    echo "🔵 Stable Version Metrics"
    echo "------------------------"
    local stable_metrics
    stable_metrics=$(collect_metrics "stable" 30)
    echo "Metrics: $stable_metrics"
    evaluate_metrics "$stable_metrics" || true
    echo ""
    
    # Canary metrics
    echo "🟡 Canary Version Metrics"
    echo "------------------------"
    local canary_metrics
    canary_metrics=$(collect_metrics "canary" 30)
    echo "Metrics: $canary_metrics"
    evaluate_metrics "$canary_metrics" || true
    echo ""
}

# Main function
main() {
    local command="${1:-}"
    
    case "$command" in
        deploy)
            check_prerequisites
            deploy_canary "$IMAGE_TAG"
            ;;
        promote)
            check_prerequisites
            promote_canary
            ;;
        abort)
            check_prerequisites
            abort_canary
            ;;
        status)
            check_prerequisites
            show_status
            ;;
        metrics)
            check_prerequisites
            show_metrics
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
        --steps)
            CANARY_STEPS="$2"
            shift 2
            ;;
        --step-duration)
            STEP_DURATION="$2"
            shift 2
            ;;
        --success-threshold)
            SUCCESS_THRESHOLD="$2"
            shift 2
            ;;
        --error-threshold)
            ERROR_THRESHOLD="$2"
            shift 2
            ;;
        --response-threshold)
            RESPONSE_TIME_THRESHOLD="$2"
            shift 2
            ;;
        --auto-promote)
            AUTO_PROMOTE="true"
            shift
            ;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --verbose)
            VERBOSE="true"
            shift
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        deploy|promote|abort|status|metrics)
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

# Run main function
main "$@"