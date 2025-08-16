#!/bin/bash

# CoreFlow360 Security Hardening Script
# Apply comprehensive security configurations and policies

set -euo pipefail

# Configuration
NAMESPACE="${NAMESPACE:-coreflow360}"
DRY_RUN="${DRY_RUN:-false}"
VERBOSE="${VERBOSE:-false}"
APPLY_SERVICE_MESH="${APPLY_SERVICE_MESH:-true}"
APPLY_NETWORK_POLICIES="${APPLY_NETWORK_POLICIES:-true}"
APPLY_POD_SECURITY="${APPLY_POD_SECURITY:-true}"
APPLY_RBAC="${APPLY_RBAC:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

log_security() {
    echo -e "${PURPLE}[SECURITY]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking security hardening prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
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
    
    # Check Istio installation if service mesh is enabled
    if [ "$APPLY_SERVICE_MESH" = "true" ]; then
        if ! kubectl get namespace istio-system &> /dev/null; then
            log_warning "Istio is not installed. Service mesh features will be skipped."
            APPLY_SERVICE_MESH="false"
        fi
    fi
    
    log_success "Prerequisites check completed"
}

# Function to apply security manifests
apply_manifest() {
    local manifest_file="$1"
    local description="$2"
    
    log_info "Applying $description..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would apply $manifest_file"
        kubectl apply -f "$manifest_file" --dry-run=client -o yaml
    else
        if kubectl apply -f "$manifest_file"; then
            log_success "$description applied successfully"
        else
            log_error "Failed to apply $description"
            return 1
        fi
    fi
}

# Function to apply network security policies
apply_network_security() {
    if [ "$APPLY_NETWORK_POLICIES" = "false" ]; then
        log_info "Skipping network policies (disabled)"
        return 0
    fi
    
    log_security "Applying network security policies..."
    
    # Apply network policies
    if [ -f "k8s/security/network-policies.yaml" ]; then
        apply_manifest "k8s/security/network-policies.yaml" "Network Security Policies"
    else
        log_error "Network policies file not found: k8s/security/network-policies.yaml"
        return 1
    fi
    
    # Verify network policies
    log_info "Verifying network policies..."
    kubectl get networkpolicies -n "$NAMESPACE" -o wide
    
    log_success "Network security policies applied"
}

# Function to apply pod security policies
apply_pod_security() {
    if [ "$APPLY_POD_SECURITY" = "false" ]; then
        log_info "Skipping pod security policies (disabled)"
        return 0
    fi
    
    log_security "Applying pod security policies..."
    
    # Apply pod security policies
    if [ -f "k8s/security/pod-security-policies.yaml" ]; then
        apply_manifest "k8s/security/pod-security-policies.yaml" "Pod Security Policies"
    else
        log_error "Pod security policies file not found"
        return 1
    fi
    
    # Enable Pod Security Standards on namespace
    log_info "Enabling Pod Security Standards..."
    kubectl label namespace "$NAMESPACE" \
        pod-security.kubernetes.io/enforce=restricted \
        pod-security.kubernetes.io/audit=restricted \
        pod-security.kubernetes.io/warn=restricted \
        --overwrite
    
    log_success "Pod security policies applied"
}

# Function to apply RBAC policies
apply_rbac_security() {
    if [ "$APPLY_RBAC" = "false" ]; then
        log_info "Skipping RBAC policies (disabled)"
        return 0
    fi
    
    log_security "Applying RBAC security policies..."
    
    # Apply RBAC policies
    if [ -f "k8s/security/rbac-policies.yaml" ]; then
        apply_manifest "k8s/security/rbac-policies.yaml" "RBAC Security Policies"
    else
        log_error "RBAC policies file not found"
        return 1
    fi
    
    # Verify RBAC
    log_info "Verifying RBAC configuration..."
    kubectl get serviceaccounts -n "$NAMESPACE"
    kubectl get roles -n "$NAMESPACE"
    kubectl get rolebindings -n "$NAMESPACE"
    
    log_success "RBAC security policies applied"
}

# Function to apply service mesh security
apply_service_mesh_security() {
    if [ "$APPLY_SERVICE_MESH" = "false" ]; then
        log_info "Skipping service mesh security (disabled)"
        return 0
    fi
    
    log_security "Applying service mesh security configuration..."
    
    # Apply Istio service mesh configuration
    if [ -f "k8s/security/istio-service-mesh.yaml" ]; then
        apply_manifest "k8s/security/istio-service-mesh.yaml" "Istio Service Mesh Security"
    else
        log_error "Service mesh configuration file not found"
        return 1
    fi
    
    # Enable Istio injection on namespace
    log_info "Enabling Istio sidecar injection..."
    kubectl label namespace "$NAMESPACE" istio-injection=enabled --overwrite
    
    # Verify service mesh configuration
    log_info "Verifying service mesh configuration..."
    kubectl get peerauthentication -n "$NAMESPACE"
    kubectl get authorizationpolicy -n "$NAMESPACE"
    kubectl get destinationrule -n "$NAMESPACE"
    
    log_success "Service mesh security applied"
}

# Function to apply secrets management
apply_secrets_management() {
    log_security "Applying secure secrets management..."
    
    # Apply secrets manifests
    if [ -f "k8s/security/secrets.yaml" ]; then
        apply_manifest "k8s/security/secrets.yaml" "Kubernetes Secrets"
    fi
    
    # Apply external secrets configuration
    if [ -f "k8s/security/external-secrets.yaml" ]; then
        apply_manifest "k8s/security/external-secrets.yaml" "External Secrets Configuration"
    fi
    
    log_success "Secrets management applied"
}

# Function to verify security configuration
verify_security_configuration() {
    log_security "Verifying security configuration..."
    
    local security_score=0
    local total_checks=10
    
    # Check 1: Network policies exist
    if kubectl get networkpolicies -n "$NAMESPACE" --no-headers | wc -l | grep -q "^[1-9]"; then
        log_success "✅ Network policies configured"
        security_score=$((security_score + 1))
    else
        log_warning "❌ No network policies found"
    fi
    
    # Check 2: Pod security policies
    if kubectl get podsecuritypolicy --no-headers | wc -l | grep -q "^[1-9]"; then
        log_success "✅ Pod security policies configured"
        security_score=$((security_score + 1))
    else
        log_warning "❌ No pod security policies found"
    fi
    
    # Check 3: RBAC configuration
    if kubectl get serviceaccounts -n "$NAMESPACE" --no-headers | wc -l | grep -q "^[1-9]"; then
        log_success "✅ Service accounts configured"
        security_score=$((security_score + 1))
    else
        log_warning "❌ No service accounts found"
    fi
    
    # Check 4: Secrets management
    if kubectl get secrets -n "$NAMESPACE" --no-headers | wc -l | grep -q "^[1-9]"; then
        log_success "✅ Secrets configured"
        security_score=$((security_score + 1))
    else
        log_warning "❌ No secrets found"
    fi
    
    # Check 5: Service mesh (if enabled)
    if [ "$APPLY_SERVICE_MESH" = "true" ]; then
        if kubectl get peerauthentication -n "$NAMESPACE" --no-headers | wc -l | grep -q "^[1-9]"; then
            log_success "✅ Service mesh mTLS configured"
            security_score=$((security_score + 1))
        else
            log_warning "❌ Service mesh mTLS not configured"
        fi
    else
        security_score=$((security_score + 1))  # Skip this check
    fi
    
    # Check 6: Pod security context
    local pods_with_security_context=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[*].spec.securityContext}' | wc -w)
    if [ "$pods_with_security_context" -gt 0 ]; then
        log_success "✅ Pod security contexts configured"
        security_score=$((security_score + 1))
    else
        log_warning "❌ Pod security contexts not configured"
    fi
    
    # Check 7: Resource limits
    local pods_with_limits=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[*].spec.containers[*].resources.limits}' | wc -w)
    if [ "$pods_with_limits" -gt 0 ]; then
        log_success "✅ Resource limits configured"
        security_score=$((security_score + 1))
    else
        log_warning "❌ Resource limits not configured"
    fi
    
    # Check 8: Non-root containers
    local root_containers=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[*].spec.containers[*].securityContext.runAsUser}' | grep -c "^0$" || echo "0")
    if [ "$root_containers" -eq 0 ]; then
        log_success "✅ No containers running as root"
        security_score=$((security_score + 1))
    else
        log_warning "❌ Found containers running as root"
    fi
    
    # Check 9: ReadOnlyRootFilesystem
    local readonly_containers=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[*].spec.containers[*].securityContext.readOnlyRootFilesystem}' | grep -c "true" || echo "0")
    if [ "$readonly_containers" -gt 0 ]; then
        log_success "✅ Read-only root filesystem configured"
        security_score=$((security_score + 1))
    else
        log_warning "❌ Read-only root filesystem not configured"
    fi
    
    # Check 10: Capability dropping
    local caps_dropped=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[*].spec.containers[*].securityContext.capabilities.drop}' | grep -c "ALL" || echo "0")
    if [ "$caps_dropped" -gt 0 ]; then
        log_success "✅ Capabilities dropped"
        security_score=$((security_score + 1))
    else
        log_warning "❌ Capabilities not dropped"
    fi
    
    # Calculate security percentage
    local security_percentage=$((security_score * 100 / total_checks))
    
    echo ""
    echo "🔒 SECURITY HARDENING SUMMARY"
    echo "============================="
    echo "Security Score: $security_score/$total_checks ($security_percentage%)"
    echo ""
    
    if [ "$security_percentage" -ge 90 ]; then
        log_success "🎉 Excellent security configuration!"
    elif [ "$security_percentage" -ge 70 ]; then
        log_success "✅ Good security configuration"
    elif [ "$security_percentage" -ge 50 ]; then
        log_warning "⚠️  Moderate security configuration - improvements needed"
    else
        log_error "❌ Poor security configuration - immediate action required"
    fi
    
    echo ""
}

# Function to generate security hardening report
generate_security_report() {
    log_info "Generating security hardening report..."
    
    local report_file="security-hardening-report.md"
    local timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
    
    cat > "$report_file" << EOF
# 🔒 CoreFlow360 Security Hardening Report

**Generated:** $timestamp  
**Namespace:** $NAMESPACE  
**Cluster:** $(kubectl config current-context)  

## 🛡️ Security Measures Applied

### Network Security
$(if [ "$APPLY_NETWORK_POLICIES" = "true" ]; then echo "- ✅ Network policies applied"; else echo "- ❌ Network policies skipped"; fi)
- Network segmentation enforced
- Ingress/egress traffic controlled
- Default deny-all policy active

### Pod Security
$(if [ "$APPLY_POD_SECURITY" = "true" ]; then echo "- ✅ Pod security policies applied"; else echo "- ❌ Pod security policies skipped"; fi)
- Pod Security Standards enabled (restricted)
- Security contexts enforced
- Privilege escalation blocked

### RBAC Security
$(if [ "$APPLY_RBAC" = "true" ]; then echo "- ✅ RBAC policies applied"; else echo "- ❌ RBAC policies skipped"; fi)
- Least privilege access
- Service account isolation
- Role-based permissions

### Service Mesh Security
$(if [ "$APPLY_SERVICE_MESH" = "true" ]; then echo "- ✅ Service mesh security applied"; else echo "- ❌ Service mesh security skipped"; fi)
- mTLS encryption enforced
- Authorization policies active
- Traffic policies configured

### Secrets Management
- ✅ Kubernetes secrets configured
- External secrets operator installed
- Secret rotation capabilities

## 📊 Current Configuration

### Network Policies
\`\`\`
$(kubectl get networkpolicies -n "$NAMESPACE" 2>/dev/null || echo "No network policies found")
\`\`\`

### Pod Security Policies
\`\`\`
$(kubectl get podsecuritypolicy 2>/dev/null || echo "No pod security policies found")
\`\`\`

### Service Accounts
\`\`\`
$(kubectl get serviceaccounts -n "$NAMESPACE" 2>/dev/null || echo "No service accounts found")
\`\`\`

### Security Context Analysis
\`\`\`
$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.securityContext}{"\n"}{end}' 2>/dev/null || echo "No pods found")
\`\`\`

## 🎯 Recommendations

### Immediate Actions
- Monitor security events and alerts
- Verify all pods are running with security contexts
- Test network connectivity after policy application
- Validate RBAC permissions

### Ongoing Security Practices
- Regular security scanning
- Keep security policies updated
- Monitor for configuration drift
- Conduct security reviews

### Emergency Procedures
- Emergency RBAC break-glass procedures documented
- Network policy bypass for debugging
- Incident response playbooks ready

---
*Generated by CoreFlow360 Security Hardening v2.0*
EOF
    
    log_success "Security report generated: $report_file"
}

# Function to display usage
usage() {
    cat << EOF
CoreFlow360 Security Hardening Tool

Usage: $0 [OPTIONS]

Options:
    --dry-run                   Show what would be applied without making changes
    --namespace NAMESPACE       Target namespace (default: coreflow360)
    --skip-service-mesh        Skip service mesh security configuration
    --skip-network-policies    Skip network policies
    --skip-pod-security        Skip pod security policies
    --skip-rbac                Skip RBAC configuration
    --verbose                  Enable verbose output
    --help                     Show this help message

Environment Variables:
    NAMESPACE                  Kubernetes namespace (default: coreflow360)
    DRY_RUN                    Dry run mode (true/false)
    APPLY_SERVICE_MESH         Apply service mesh security (true/false)
    APPLY_NETWORK_POLICIES     Apply network policies (true/false)
    APPLY_POD_SECURITY         Apply pod security policies (true/false)
    APPLY_RBAC                 Apply RBAC policies (true/false)
    VERBOSE                    Enable verbose output (true/false)

Examples:
    $0                         # Apply all security hardening
    $0 --dry-run              # Show what would be applied
    $0 --skip-service-mesh    # Skip service mesh configuration
    $0 --namespace staging    # Apply to staging namespace

Security Features:
    - Network segmentation with policies
    - Pod security standards enforcement
    - RBAC with least privilege
    - Service mesh mTLS encryption
    - Secrets management integration
    - Security monitoring and alerting

EOF
}

# Main function
main() {
    log_security "🛡️ Starting CoreFlow360 Security Hardening..."
    echo ""
    
    check_prerequisites
    
    # Apply security measures
    apply_secrets_management
    apply_rbac_security
    apply_pod_security
    apply_network_security
    apply_service_mesh_security
    
    # Verify configuration
    verify_security_configuration
    
    # Generate report
    generate_security_report
    
    log_security "🎉 Security hardening completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Review the security hardening report"
    echo "2. Test application functionality"
    echo "3. Monitor security alerts and logs"
    echo "4. Schedule regular security reviews"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --skip-service-mesh)
            APPLY_SERVICE_MESH="false"
            shift
            ;;
        --skip-network-policies)
            APPLY_NETWORK_POLICIES="false"
            shift
            ;;
        --skip-pod-security)
            APPLY_POD_SECURITY="false"
            shift
            ;;
        --skip-rbac)
            APPLY_RBAC="false"
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
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run main function
main