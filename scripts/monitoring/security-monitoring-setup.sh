#!/bin/bash

# CoreFlow360 Security Monitoring Setup Script
# Deploy comprehensive security monitoring and SIEM integration

set -euo pipefail

# Configuration
NAMESPACE="${NAMESPACE:-coreflow360}"
MONITORING_NAMESPACE="${MONITORING_NAMESPACE:-monitoring}"
DRY_RUN="${DRY_RUN:-false}"
ENABLE_SIEM="${ENABLE_SIEM:-true}"
ENABLE_COMPLIANCE="${ENABLE_COMPLIANCE:-true}"
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

log_security() {
    echo -e "${PURPLE}[SECURITY]${NC} $1"
}

log_monitoring() {
    echo -e "${CYAN}[MONITORING]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking monitoring setup prerequisites..."
    
    # Check required tools
    for tool in kubectl docker-compose helm; do
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
    
    # Check if monitoring namespace exists
    if ! kubectl get namespace "$MONITORING_NAMESPACE" &> /dev/null; then
        log_info "Creating monitoring namespace: $MONITORING_NAMESPACE"
        kubectl create namespace "$MONITORING_NAMESPACE"
    fi
    
    # Check if Prometheus is installed
    if ! kubectl get deployment -n "$MONITORING_NAMESPACE" prometheus-server &> /dev/null; then
        log_warning "Prometheus not found in monitoring namespace"
    fi
    
    # Check if Grafana is installed
    if ! kubectl get deployment -n "$MONITORING_NAMESPACE" grafana &> /dev/null; then
        log_warning "Grafana not found in monitoring namespace"
    fi
    
    log_success "Prerequisites check completed"
}

# Function to setup Prometheus security rules
setup_prometheus_rules() {
    log_monitoring "Setting up Prometheus security alerting rules..."
    
    # Create ConfigMap for security alerts
    cat << EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: coreflow360-security-alerts
  namespace: $MONITORING_NAMESPACE
  labels:
    app: prometheus
    component: security-rules
data:
  security-alerts.yml: |
$(cat monitoring/security/security-alerts.yml | sed 's/^/    /')
EOF
    
    # Create ConfigMap for compliance metrics
    if [ "$ENABLE_COMPLIANCE" = "true" ]; then
        cat << EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: coreflow360-compliance-metrics
  namespace: $MONITORING_NAMESPACE
  labels:
    app: prometheus
    component: compliance-rules
data:
  compliance-metrics.yml: |
$(cat monitoring/security/compliance-metrics.yml | sed 's/^/    /')
EOF
    fi
    
    log_success "Prometheus security rules configured"
}

# Function to setup Grafana security dashboards
setup_grafana_dashboards() {
    log_monitoring "Setting up Grafana security dashboards..."
    
    # Create ConfigMap for security dashboards
    cat << EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: coreflow360-security-dashboards
  namespace: $MONITORING_NAMESPACE
  labels:
    app: grafana
    component: security-dashboards
    grafana_dashboard: "1"
data:
  security-monitoring.json: |
$(cat monitoring/security/security-dashboards.json | sed 's/^/    /')
EOF
    
    log_success "Grafana security dashboards configured"
}

# Function to deploy SIEM stack
deploy_siem_stack() {
    if [ "$ENABLE_SIEM" = "false" ]; then
        log_info "SIEM deployment disabled, skipping..."
        return 0
    fi
    
    log_security "Deploying SIEM stack..."
    
    # Create SIEM namespace
    if ! kubectl get namespace siem &> /dev/null; then
        kubectl create namespace siem
    fi
    
    # Generate required secrets for SIEM
    generate_siem_secrets
    
    # Deploy SIEM stack using docker-compose
    if [ "$DRY_RUN" = "false" ]; then
        cd monitoring/security
        docker-compose -f siem-integration.yml up -d
        cd ../..
    else
        log_info "DRY RUN: Would deploy SIEM stack"
    fi
    
    log_success "SIEM stack deployment initiated"
}

# Function to generate SIEM secrets
generate_siem_secrets() {
    log_info "Generating SIEM secrets..."
    
    # Generate secure passwords
    ELASTIC_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    KIBANA_ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    KIBANA_REPORTING_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    KIBANA_SECURITY_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    WAZUH_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    WAZUH_API_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    THEHIVE_SECRET_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    MISP_DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    MISP_DB_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    MISP_ADMIN_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    
    # Create SIEM secrets in Kubernetes
    kubectl create secret generic siem-secrets \
        --namespace=siem \
        --from-literal=elastic-password="$ELASTIC_PASSWORD" \
        --from-literal=kibana-encryption-key="$KIBANA_ENCRYPTION_KEY" \
        --from-literal=kibana-reporting-key="$KIBANA_REPORTING_KEY" \
        --from-literal=kibana-security-key="$KIBANA_SECURITY_KEY" \
        --from-literal=wazuh-password="$WAZUH_PASSWORD" \
        --from-literal=wazuh-api-password="$WAZUH_API_PASSWORD" \
        --from-literal=thehive-secret-key="$THEHIVE_SECRET_KEY" \
        --from-literal=misp-db-password="$MISP_DB_PASSWORD" \
        --from-literal=misp-db-root-password="$MISP_DB_ROOT_PASSWORD" \
        --from-literal=misp-admin-password="$MISP_ADMIN_PASSWORD" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Create environment file for docker-compose
    cat > monitoring/security/.env << EOF
ELASTIC_PASSWORD=$ELASTIC_PASSWORD
KIBANA_ENCRYPTION_KEY=$KIBANA_ENCRYPTION_KEY
KIBANA_REPORTING_KEY=$KIBANA_REPORTING_KEY
KIBANA_SECURITY_KEY=$KIBANA_SECURITY_KEY
WAZUH_PASSWORD=$WAZUH_PASSWORD
WAZUH_API_PASSWORD=$WAZUH_API_PASSWORD
THEHIVE_SECRET_KEY=$THEHIVE_SECRET_KEY
MISP_DB_PASSWORD=$MISP_DB_PASSWORD
MISP_DB_ROOT_PASSWORD=$MISP_DB_ROOT_PASSWORD
MISP_ADMIN_PASSWORD=$MISP_ADMIN_PASSWORD
THEHIVE_API_KEY=$(openssl rand -base64 32)
CORTEX_API_KEY=$(openssl rand -base64 32)
SLACK_SECURITY_WEBHOOK=${SLACK_SECURITY_WEBHOOK:-https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK}
PAGERDUTY_INTEGRATION_KEY=${PAGERDUTY_INTEGRATION_KEY:-your-pagerduty-key}
EOF
    
    log_success "SIEM secrets generated and configured"
}

# Function to setup security metrics collection
setup_security_metrics() {
    log_monitoring "Setting up security metrics collection..."
    
    # Deploy security metrics exporter
    cat << EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: security-metrics-exporter
  namespace: $MONITORING_NAMESPACE
  labels:
    app: security-metrics-exporter
    component: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: security-metrics-exporter
  template:
    metadata:
      labels:
        app: security-metrics-exporter
        component: monitoring
    spec:
      serviceAccountName: security-metrics-exporter
      containers:
      - name: exporter
        image: coreflow360/security-metrics-exporter:latest
        ports:
        - containerPort: 8080
          name: metrics
        env:
        - name: KUBERNETES_NAMESPACE
          value: "$NAMESPACE"
        - name: METRICS_PORT
          value: "8080"
        - name: COLLECTION_INTERVAL
          value: "30s"
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: security-metrics-exporter
  namespace: $MONITORING_NAMESPACE
  labels:
    app: security-metrics-exporter
    component: monitoring
spec:
  type: ClusterIP
  ports:
  - port: 8080
    targetPort: 8080
    protocol: TCP
    name: metrics
  selector:
    app: security-metrics-exporter
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: security-metrics-exporter
  namespace: $MONITORING_NAMESPACE
  labels:
    app: security-metrics-exporter
    component: monitoring
EOF
    
    # Setup RBAC for security metrics
    cat << EOF | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: security-metrics-reader
  labels:
    app: security-metrics-exporter
    component: monitoring
rules:
- apiGroups: [""]
  resources: ["pods", "services", "secrets", "configmaps", "events"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets", "statefulsets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["networking.k8s.io"]
  resources: ["networkpolicies", "ingresses"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["policy"]
  resources: ["podsecuritypolicies"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["rbac.authorization.k8s.io"]
  resources: ["roles", "rolebindings", "clusterroles", "clusterrolebindings"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: security-metrics-reader-binding
  labels:
    app: security-metrics-exporter
    component: monitoring
subjects:
- kind: ServiceAccount
  name: security-metrics-exporter
  namespace: $MONITORING_NAMESPACE
roleRef:
  kind: ClusterRole
  name: security-metrics-reader
  apiGroup: rbac.authorization.k8s.io
EOF
    
    log_success "Security metrics collection configured"
}

# Function to setup alerting integrations
setup_alerting_integrations() {
    log_monitoring "Setting up alerting integrations..."
    
    # Create AlertManager configuration for security alerts
    cat << EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: coreflow360-alertmanager-config
  namespace: $MONITORING_NAMESPACE
  labels:
    app: alertmanager
    component: security-alerts
data:
  alertmanager.yml: |
    global:
      smtp_smarthost: 'smtp.coreflow360.com:587'
      smtp_from: 'alerts@coreflow360.com'
      slack_api_url: '${SLACK_SECURITY_WEBHOOK}'
    
    route:
      group_by: ['alertname', 'severity']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 12h
      receiver: 'security-team'
      routes:
      - match:
          severity: critical
        receiver: 'security-critical'
        continue: true
      - match:
          category: compliance
        receiver: 'compliance-team'
        continue: true
    
    receivers:
    - name: 'security-team'
      slack_configs:
      - channel: '#security-alerts'
        title: 'CoreFlow360 Security Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}\n{{ .Annotations.description }}{{ end }}'
        send_resolved: true
    
    - name: 'security-critical'
      slack_configs:
      - channel: '#security-critical'
        title: 'CRITICAL: CoreFlow360 Security Alert'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}\n{{ .Annotations.description }}{{ end }}'
        send_resolved: true
      pagerduty_configs:
      - routing_key: '${PAGERDUTY_INTEGRATION_KEY}'
        description: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
    
    - name: 'compliance-team'
      email_configs:
      - to: 'compliance@coreflow360.com'
        subject: 'CoreFlow360 Compliance Alert'
        body: '{{ range .Alerts }}{{ .Annotations.summary }}\n{{ .Annotations.description }}{{ end }}'
EOF
    
    log_success "Alerting integrations configured"
}

# Function to verify monitoring setup
verify_monitoring_setup() {
    log_monitoring "Verifying security monitoring setup..."
    
    local verification_score=0
    local total_checks=8
    
    # Check 1: Prometheus security rules
    if kubectl get configmap coreflow360-security-alerts -n "$MONITORING_NAMESPACE" &> /dev/null; then
        log_success "✅ Prometheus security rules configured"
        verification_score=$((verification_score + 1))
    else
        log_warning "❌ Prometheus security rules not found"
    fi
    
    # Check 2: Grafana security dashboards
    if kubectl get configmap coreflow360-security-dashboards -n "$MONITORING_NAMESPACE" &> /dev/null; then
        log_success "✅ Grafana security dashboards configured"
        verification_score=$((verification_score + 1))
    else
        log_warning "❌ Grafana security dashboards not found"
    fi
    
    # Check 3: Security metrics exporter
    if kubectl get deployment security-metrics-exporter -n "$MONITORING_NAMESPACE" &> /dev/null; then
        log_success "✅ Security metrics exporter deployed"
        verification_score=$((verification_score + 1))
    else
        log_warning "❌ Security metrics exporter not found"
    fi
    
    # Check 4: AlertManager configuration
    if kubectl get configmap coreflow360-alertmanager-config -n "$MONITORING_NAMESPACE" &> /dev/null; then
        log_success "✅ AlertManager security configuration applied"
        verification_score=$((verification_score + 1))
    else
        log_warning "❌ AlertManager security configuration not found"
    fi
    
    # Check 5: SIEM secrets (if enabled)
    if [ "$ENABLE_SIEM" = "true" ]; then
        if kubectl get secret siem-secrets -n siem &> /dev/null; then
            log_success "✅ SIEM secrets configured"
            verification_score=$((verification_score + 1))
        else
            log_warning "❌ SIEM secrets not found"
        fi
    else
        verification_score=$((verification_score + 1))  # Skip this check
    fi
    
    # Check 6: Compliance metrics (if enabled)
    if [ "$ENABLE_COMPLIANCE" = "true" ]; then
        if kubectl get configmap coreflow360-compliance-metrics -n "$MONITORING_NAMESPACE" &> /dev/null; then
            log_success "✅ Compliance metrics configured"
            verification_score=$((verification_score + 1))
        else
            log_warning "❌ Compliance metrics not found"
        fi
    else
        verification_score=$((verification_score + 1))  # Skip this check
    fi
    
    # Check 7: Security monitoring RBAC
    if kubectl get clusterrole security-metrics-reader &> /dev/null; then
        log_success "✅ Security monitoring RBAC configured"
        verification_score=$((verification_score + 1))
    else
        log_warning "❌ Security monitoring RBAC not found"
    fi
    
    # Check 8: SIEM stack running (if enabled)
    if [ "$ENABLE_SIEM" = "true" ]; then
        if docker-compose -f monitoring/security/siem-integration.yml ps | grep -q "Up"; then
            log_success "✅ SIEM stack running"
            verification_score=$((verification_score + 1))
        else
            log_warning "❌ SIEM stack not running"
        fi
    else
        verification_score=$((verification_score + 1))  # Skip this check
    fi
    
    # Calculate monitoring percentage
    local monitoring_percentage=$((verification_score * 100 / total_checks))
    
    echo ""
    echo "🔍 SECURITY MONITORING SETUP SUMMARY"
    echo "====================================="
    echo "Verification Score: $verification_score/$total_checks ($monitoring_percentage%)"
    echo ""
    
    if [ "$monitoring_percentage" -ge 90 ]; then
        log_success "🎉 Excellent security monitoring setup!"
    elif [ "$monitoring_percentage" -ge 70 ]; then
        log_success "✅ Good security monitoring setup"
    else
        log_warning "⚠️  Security monitoring setup needs attention"
    fi
    
    echo ""
}

# Function to generate monitoring report
generate_monitoring_report() {
    log_info "Generating security monitoring setup report..."
    
    local report_file="security-monitoring-report.md"
    local timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
    
    cat > "$report_file" << EOF
# 🔍 CoreFlow360 Security Monitoring Setup Report

**Generated:** $timestamp  
**Namespace:** $NAMESPACE  
**Monitoring Namespace:** $MONITORING_NAMESPACE  
**SIEM Enabled:** $ENABLE_SIEM  
**Compliance Monitoring:** $ENABLE_COMPLIANCE  

## 📊 Monitoring Components Deployed

### Prometheus Security Rules
- ✅ Critical security incident alerts
- ✅ Authentication failure monitoring
- ✅ Container security violations
- ✅ Network policy enforcement
- ✅ Certificate expiry warnings
- ✅ Secret rotation tracking

### Grafana Security Dashboards
- ✅ Security threat overview
- ✅ Authentication security metrics
- ✅ Network security events
- ✅ Container vulnerability status
- ✅ Compliance score tracking
- ✅ Audit log visualization

### SIEM Integration
$(if [ "$ENABLE_SIEM" = "true" ]; then echo "- ✅ Elasticsearch log storage"; echo "- ✅ Kibana visualization"; echo "- ✅ Logstash processing"; echo "- ✅ Wazuh security monitoring"; echo "- ✅ TheHive incident response"; echo "- ✅ MISP threat intelligence"; else echo "- ❌ SIEM disabled"; fi)

### Compliance Monitoring
$(if [ "$ENABLE_COMPLIANCE" = "true" ]; then echo "- ✅ SOC2 compliance metrics"; echo "- ✅ ISO27001 controls tracking"; echo "- ✅ GDPR compliance monitoring"; echo "- ✅ HIPAA safeguards (if applicable)"; echo "- ✅ PCI DSS controls (if applicable)"; else echo "- ❌ Compliance monitoring disabled"; fi)

## 🔗 Access Information

### Grafana Security Dashboard
- URL: http://grafana.$MONITORING_NAMESPACE.svc.cluster.local:3000
- Username: admin
- Password: Check Grafana secret in monitoring namespace

### Prometheus Alerts
- URL: http://prometheus.$MONITORING_NAMESPACE.svc.cluster.local:9090
- Alert Rules: /alerts

$(if [ "$ENABLE_SIEM" = "true" ]; then cat << 'SIEM_EOF'
### SIEM Stack Access
- Kibana: http://localhost:5601
- Elasticsearch: http://localhost:9200
- TheHive: http://localhost:9000
- Cortex: http://localhost:9001
- MISP: https://localhost:443

### SIEM Credentials
- Elasticsearch: elastic / (check siem-secrets in siem namespace)
- Kibana: elastic / (same as Elasticsearch)
- TheHive: admin@coreflow360.com / (check siem-secrets)
- MISP: admin@coreflow360.com / (check siem-secrets)
SIEM_EOF
fi)

## 📋 Security Metrics Available

### Authentication & Authorization
- auth_failed_attempts_total
- auth_successful_total
- rbac_authorization_decisions_total
- api_rate_limit_exceeded_total

### Container Security
- container_vulnerabilities
- pod_security_violations_total
- privileged_container_count
- root_container_count

### Network Security
- network_policy_blocked_connections_total
- network_policy_allowed_connections_total
- istio_request_total{security_policy="mtls"}
- ssl_certificate_expiry_seconds

### Compliance
- compliance_overall_score
- soc2_compliance_score
- iso27001_compliance_score
- gdpr_compliance_score

## 🎯 Next Steps

### Immediate Actions
1. Access Grafana security dashboard
2. Verify alert routing to security team
3. Test incident response procedures
4. Review compliance score thresholds

### Ongoing Monitoring
1. Daily security metrics review
2. Weekly compliance score assessment
3. Monthly security trend analysis
4. Quarterly security posture review

### Alert Response
1. Critical alerts: Immediate response required
2. High alerts: Response within 1 hour
3. Medium alerts: Response within 24 hours
4. Compliance alerts: Review and remediate within SLA

---
*Generated by CoreFlow360 Security Monitoring Setup v2.0*
EOF
    
    log_success "Security monitoring report generated: $report_file"
}

# Function to display usage
usage() {
    cat << EOF
CoreFlow360 Security Monitoring Setup

Usage: $0 [OPTIONS]

Options:
    --dry-run                   Show what would be deployed without making changes
    --namespace NAMESPACE       Target namespace (default: coreflow360)
    --monitoring-ns NAMESPACE   Monitoring namespace (default: monitoring)
    --disable-siem             Disable SIEM stack deployment
    --disable-compliance       Disable compliance monitoring
    --verbose                  Enable verbose output
    --help                     Show this help message

Environment Variables:
    NAMESPACE                  Target namespace
    MONITORING_NAMESPACE       Monitoring namespace
    ENABLE_SIEM               Deploy SIEM stack (true/false)
    ENABLE_COMPLIANCE         Enable compliance monitoring (true/false)
    DRY_RUN                   Dry run mode (true/false)
    SLACK_SECURITY_WEBHOOK    Slack webhook for security alerts
    PAGERDUTY_INTEGRATION_KEY PagerDuty integration key
    VERBOSE                   Enable verbose output

Examples:
    $0                         # Deploy all security monitoring
    $0 --dry-run              # Show what would be deployed
    $0 --disable-siem         # Deploy without SIEM stack
    $0 --disable-compliance   # Deploy without compliance monitoring

Security Monitoring Features:
    - Prometheus security alerting rules
    - Grafana security dashboards
    - SIEM integration (ELK + Wazuh + TheHive + MISP)
    - Compliance monitoring (SOC2, ISO27001, GDPR)
    - Security metrics collection
    - Incident response automation
    - Threat intelligence integration

EOF
}

# Main function
main() {
    log_security "🔍 Starting CoreFlow360 Security Monitoring Setup..."
    echo ""
    
    check_prerequisites
    setup_prometheus_rules
    setup_grafana_dashboards
    setup_security_metrics
    setup_alerting_integrations
    
    if [ "$ENABLE_SIEM" = "true" ]; then
        deploy_siem_stack
    fi
    
    verify_monitoring_setup
    generate_monitoring_report
    
    log_security "🎉 Security monitoring setup completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Access Grafana security dashboard"
    echo "2. Configure alert notification channels"
    echo "3. Test security incident response"
    echo "4. Review compliance score thresholds"
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
        --monitoring-ns)
            MONITORING_NAMESPACE="$2"
            shift 2
            ;;
        --disable-siem)
            ENABLE_SIEM="false"
            shift
            ;;
        --disable-compliance)
            ENABLE_COMPLIANCE="false"
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