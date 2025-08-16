#!/bin/bash

# CoreFlow360 Incident Response Playbook
# Automated incident detection, response, and recovery procedures

set -euo pipefail

# Configuration
NAMESPACE="${NAMESPACE:-coreflow360}"
INCIDENT_ID="${INCIDENT_ID:-INC-$(date +%Y%m%d-%H%M%S)}"
SEVERITY="${SEVERITY:-medium}"
INCIDENT_TYPE="${INCIDENT_TYPE:-unknown}"
DRY_RUN="${DRY_RUN:-false}"
VERBOSE="${VERBOSE:-false}"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}"
SLACK_CHANNEL="${SLACK_CHANNEL:-#incidents}"
PAGERDUTY_KEY="${PAGERDUTY_KEY:-}"
RESPONSE_TEAM="${RESPONSE_TEAM:-devops,security,engineering}"

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

log_incident() {
    echo -e "${PURPLE}[INCIDENT]${NC} $1"
}

log_response() {
    echo -e "${CYAN}[RESPONSE]${NC} $1"
}

# Function to display usage
usage() {
    cat << EOF
CoreFlow360 Incident Response Playbook

Usage: $0 [COMMAND] [OPTIONS]

Commands:
    detect              Detect and classify incidents
    respond             Execute incident response procedure
    escalate            Escalate incident to higher severity
    resolve             Mark incident as resolved
    post-mortem         Generate post-mortem report
    runbook             Execute specific runbook procedure

Incident Types:
    security-breach     Security incident response
    performance-degradation   Performance issue response
    service-outage      Service availability response
    data-loss          Data integrity response
    compliance-violation   Compliance incident response

Options:
    --incident-id ID       Incident identifier (auto-generated if not provided)
    --severity LEVEL       Incident severity: low, medium, high, critical
    --type TYPE           Incident type (see above)
    --namespace NAMESPACE  Target namespace (default: coreflow360)
    --dry-run             Show what would be done without executing
    --verbose             Enable verbose output
    --alert-webhook URL   Webhook URL for alerts
    --slack-channel CH    Slack channel for notifications
    --pagerduty-key KEY   PagerDuty integration key
    --response-team TEAM  Comma-separated list of response teams
    --help                Show this help message

Examples:
    $0 detect --type security-breach --severity high
    $0 respond --incident-id INC-20250815-001 --type service-outage
    $0 escalate --incident-id INC-20250815-001 --severity critical
    $0 post-mortem --incident-id INC-20250815-001

EOF
}

# Function to send notification
send_notification() {
    local message="$1"
    local severity="${2:-info}"
    local channel="${3:-$SLACK_CHANNEL}"
    
    local emoji
    case "$severity" in
        critical) emoji="🚨" ;;
        high) emoji="⚠️" ;;
        medium) emoji="⚡" ;;
        low) emoji="ℹ️" ;;
        *) emoji="📢" ;;
    esac
    
    # Send to Slack
    if [ -n "$ALERT_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"text\": \"$emoji CoreFlow360 Incident Response: $message\",
                \"channel\": \"$channel\",
                \"username\": \"Incident Response Bot\",
                \"icon_emoji\": \":warning:\"
            }" \
            "$ALERT_WEBHOOK" &>/dev/null || true
    fi
    
    # Send to PagerDuty for critical incidents
    if [ "$severity" = "critical" ] && [ -n "$PAGERDUTY_KEY" ]; then
        curl -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Token token=$PAGERDUTY_KEY" \
            -d "{
                \"incident\": {
                    \"type\": \"incident\",
                    \"title\": \"CoreFlow360 Critical Incident: $INCIDENT_ID\",
                    \"service\": {
                        \"id\": \"COREFLOW360\",
                        \"type\": \"service_reference\"
                    },
                    \"body\": {
                        \"type\": \"incident_body\",
                        \"details\": \"$message\"
                    }
                }
            }" \
            "https://api.pagerduty.com/incidents" &>/dev/null || true
    fi
    
    log_incident "NOTIFICATION: $message"
}

# Function to create incident record
create_incident_record() {
    local incident_file="/tmp/incident-$INCIDENT_ID.json"
    
    cat > "$incident_file" << EOF
{
  "incident_id": "$INCIDENT_ID",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "severity": "$SEVERITY",
  "type": "$INCIDENT_TYPE",
  "namespace": "$NAMESPACE",
  "status": "active",
  "response_team": "$RESPONSE_TEAM",
  "timeline": [
    {
      "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
      "action": "incident_created",
      "details": "Incident $INCIDENT_ID created with severity $SEVERITY"
    }
  ],
  "metrics": {
    "detection_time": "$(date +%s)",
    "response_time": null,
    "resolution_time": null
  },
  "affected_services": [],
  "actions_taken": [],
  "evidence": []
}
EOF
    
    log_incident "Incident record created: $incident_file"
    echo "$incident_file"
}

# Function to update incident record
update_incident_record() {
    local incident_file="$1"
    local action="$2"
    local details="$3"
    
    # Add timeline entry
    local tmp_file=$(mktemp)
    jq --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
       --arg action "$action" \
       --arg details "$details" \
       '.timeline += [{
         "timestamp": $timestamp,
         "action": $action,
         "details": $details
       }]' "$incident_file" > "$tmp_file"
    
    mv "$tmp_file" "$incident_file"
    log_incident "Incident record updated: $action"
}

# Function to detect incidents
detect_incidents() {
    log_incident "Detecting incidents in namespace: $NAMESPACE"
    
    local incidents_detected=false
    
    # Check pod failures
    local failed_pods
    failed_pods=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Failed --no-headers | wc -l)
    if [ "$failed_pods" -gt 0 ]; then
        log_warning "Detected $failed_pods failed pods"
        INCIDENT_TYPE="service-outage"
        incidents_detected=true
    fi
    
    # Check pending pods
    local pending_pods
    pending_pods=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase=Pending --no-headers | wc -l)
    if [ "$pending_pods" -gt 5 ]; then
        log_warning "Detected $pending_pods pending pods"
        INCIDENT_TYPE="performance-degradation"
        incidents_detected=true
    fi
    
    # Check for restart loops
    local restarting_pods
    restarting_pods=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{.items[*].status.containerStatuses[*].restartCount}' | tr ' ' '\n' | awk '$1 > 5' | wc -l)
    if [ "$restarting_pods" -gt 0 ]; then
        log_warning "Detected $restarting_pods pods with high restart counts"
        INCIDENT_TYPE="service-outage"
        incidents_detected=true
    fi
    
    # Check for security violations
    local security_violations
    security_violations=$(kubectl get pods -n "$NAMESPACE" -l security.alert=true --no-headers | wc -l)
    if [ "$security_violations" -gt 0 ]; then
        log_error "Detected $security_violations security violations"
        INCIDENT_TYPE="security-breach"
        SEVERITY="high"
        incidents_detected=true
    fi
    
    # Check service availability
    local unavailable_services
    unavailable_services=$(kubectl get services -n "$NAMESPACE" -o json | jq '.items[] | select(.spec.type == "LoadBalancer") | select(.status.loadBalancer.ingress == null) | .metadata.name' | wc -l)
    if [ "$unavailable_services" -gt 0 ]; then
        log_warning "Detected $unavailable_services services without external access"
        INCIDENT_TYPE="service-outage"
        incidents_detected=true
    fi
    
    if [ "$incidents_detected" = "true" ]; then
        log_incident "Incidents detected - initiating response"
        return 0
    else
        log_success "No incidents detected"
        return 1
    fi
}

# Function to execute incident response
execute_incident_response() {
    log_response "Executing incident response for: $INCIDENT_TYPE (Severity: $SEVERITY)"
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "DRY RUN: Would execute incident response procedures"
        return 0
    fi
    
    local incident_file
    incident_file=$(create_incident_record)
    
    # Set response time
    jq --arg time "$(date +%s)" '.metrics.response_time = $time' "$incident_file" > "${incident_file}.tmp"
    mv "${incident_file}.tmp" "$incident_file"
    
    case "$INCIDENT_TYPE" in
        security-breach)
            execute_security_response "$incident_file"
            ;;
        service-outage)
            execute_service_outage_response "$incident_file"
            ;;
        performance-degradation)
            execute_performance_response "$incident_file"
            ;;
        data-loss)
            execute_data_loss_response "$incident_file"
            ;;
        compliance-violation)
            execute_compliance_response "$incident_file"
            ;;
        *)
            execute_generic_response "$incident_file"
            ;;
    esac
    
    log_success "Incident response execution completed"
}

# Function to execute security incident response
execute_security_response() {
    local incident_file="$1"
    
    log_response "Executing security incident response..."
    
    send_notification "🚨 SECURITY INCIDENT: $INCIDENT_ID - Immediate response initiated" "critical"
    
    # Step 1: Isolate affected systems
    log_response "Step 1: Isolating affected systems"
    update_incident_record "$incident_file" "isolation_started" "Isolating pods with security violations"
    
    # Apply quarantine labels
    kubectl label pods -l security.alert=true -n "$NAMESPACE" quarantine=true --overwrite
    
    # Create isolation network policy
    cat << EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: security-quarantine-$INCIDENT_ID
  namespace: $NAMESPACE
spec:
  podSelector:
    matchLabels:
      quarantine: "true"
  policyTypes:
  - Ingress
  - Egress
  # Deny all traffic for quarantined pods
EOF
    
    # Step 2: Collect evidence
    log_response "Step 2: Collecting forensic evidence"
    update_incident_record "$incident_file" "evidence_collection" "Collecting logs and system state"
    
    local evidence_dir="/tmp/incident-evidence-$INCIDENT_ID"
    mkdir -p "$evidence_dir"
    
    # Collect pod logs
    kubectl logs -l security.alert=true -n "$NAMESPACE" --all-containers=true > "$evidence_dir/security-violation-logs.txt" || true
    
    # Collect pod descriptions
    kubectl describe pods -l security.alert=true -n "$NAMESPACE" > "$evidence_dir/pod-descriptions.txt" || true
    
    # Collect events
    kubectl get events -n "$NAMESPACE" --sort-by='.firstTimestamp' > "$evidence_dir/events.txt" || true
    
    # Step 3: Notify security team
    log_response "Step 3: Notifying security team"
    send_notification "🔒 Security team required for incident $INCIDENT_ID - Evidence collected in $evidence_dir" "critical" "#security"
    
    # Step 4: Remove threats
    log_response "Step 4: Removing identified threats"
    update_incident_record "$incident_file" "threat_removal" "Removing compromised pods"
    
    kubectl delete pods -l security.alert=true -n "$NAMESPACE" --grace-period=0 --force || true
    
    update_incident_record "$incident_file" "security_response_completed" "Security incident response procedures completed"
    log_success "Security incident response completed"
}

# Function to execute service outage response
execute_service_outage_response() {
    local incident_file="$1"
    
    log_response "Executing service outage response..."
    
    send_notification "⚠️ SERVICE OUTAGE: $INCIDENT_ID - Restoration in progress" "high"
    
    # Step 1: Assess impact
    log_response "Step 1: Assessing service impact"
    update_incident_record "$incident_file" "impact_assessment" "Assessing affected services and users"
    
    local failed_deployments
    failed_deployments=$(kubectl get deployments -n "$NAMESPACE" -o json | jq -r '.items[] | select(.status.readyReplicas != .status.replicas) | .metadata.name')
    
    if [ -n "$failed_deployments" ]; then
        update_incident_record "$incident_file" "affected_services_identified" "Failed deployments: $failed_deployments"
    fi
    
    # Step 2: Attempt automatic recovery
    log_response "Step 2: Attempting automatic recovery"
    update_incident_record "$incident_file" "auto_recovery_started" "Restarting failed pods and scaling deployments"
    
    # Restart failed pods
    kubectl delete pods --field-selector=status.phase=Failed -n "$NAMESPACE" || true
    
    # Scale up deployments with insufficient replicas
    for deployment in $failed_deployments; do
        local current_replicas
        current_replicas=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
        local target_replicas=$((current_replicas + 1))
        
        log_response "Scaling deployment $deployment to $target_replicas replicas"
        kubectl scale deployment "$deployment" --replicas="$target_replicas" -n "$NAMESPACE"
    done
    
    # Step 3: Monitor recovery
    log_response "Step 3: Monitoring recovery progress"
    
    local recovery_timeout=300
    local start_time=$(date +%s)
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [ $elapsed -gt $recovery_timeout ]; then
            log_warning "Recovery timeout exceeded - escalating incident"
            update_incident_record "$incident_file" "recovery_timeout" "Automatic recovery failed - manual intervention required"
            escalate_incident "$incident_file"
            break
        fi
        
        # Check if services are recovered
        local unhealthy_pods
        unhealthy_pods=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running --no-headers | wc -l)
        
        if [ "$unhealthy_pods" -eq 0 ]; then
            log_success "Service recovery completed"
            update_incident_record "$incident_file" "recovery_completed" "All services restored successfully"
            break
        fi
        
        log_response "Recovery in progress... ($elapsed/$recovery_timeout seconds)"
        sleep 10
    done
    
    log_success "Service outage response completed"
}

# Function to execute performance degradation response
execute_performance_response() {
    local incident_file="$1"
    
    log_response "Executing performance degradation response..."
    
    send_notification "⚡ PERFORMANCE ISSUE: $INCIDENT_ID - Investigation started" "medium"
    
    # Step 1: Collect performance metrics
    log_response "Step 1: Collecting performance metrics"
    update_incident_record "$incident_file" "metrics_collection" "Gathering CPU, memory, and network metrics"
    
    # Get resource usage
    kubectl top pods -n "$NAMESPACE" > "/tmp/performance-metrics-$INCIDENT_ID.txt" 2>/dev/null || true
    
    # Step 2: Identify resource bottlenecks
    log_response "Step 2: Identifying resource bottlenecks"
    
    # Check for high CPU usage
    local high_cpu_pods
    high_cpu_pods=$(kubectl top pods -n "$NAMESPACE" --no-headers 2>/dev/null | awk '$2 ~ /[0-9]+m/ && $2+0 > 500 {print $1}' | wc -l || echo "0")
    
    if [ "$high_cpu_pods" -gt 0 ]; then
        update_incident_record "$incident_file" "high_cpu_detected" "Found $high_cpu_pods pods with high CPU usage"
    fi
    
    # Step 3: Apply performance optimizations
    log_response "Step 3: Applying performance optimizations"
    
    # Scale up deployments with high load
    local deployments_to_scale
    deployments_to_scale=$(kubectl get deployments -n "$NAMESPACE" -o json | jq -r '.items[] | select(.status.replicas < 3) | .metadata.name')
    
    for deployment in $deployments_to_scale; do
        log_response "Scaling up deployment: $deployment"
        kubectl scale deployment "$deployment" --replicas=3 -n "$NAMESPACE"
    done
    
    update_incident_record "$incident_file" "performance_response_completed" "Performance optimizations applied"
    log_success "Performance degradation response completed"
}

# Function to execute generic response
execute_generic_response() {
    local incident_file="$1"
    
    log_response "Executing generic incident response..."
    
    send_notification "📢 INCIDENT: $INCIDENT_ID - Generic response initiated" "medium"
    
    # Basic health checks and recovery
    log_response "Performing basic health checks and recovery"
    
    # Restart unhealthy pods
    kubectl get pods -n "$NAMESPACE" | grep -E "(Error|CrashLoopBackOff|ImagePullBackOff)" | awk '{print $1}' | xargs -r kubectl delete pod -n "$NAMESPACE"
    
    update_incident_record "$incident_file" "generic_response_completed" "Basic recovery procedures applied"
    log_success "Generic incident response completed"
}

# Function to escalate incident
escalate_incident() {
    local incident_file="${1:-/tmp/incident-$INCIDENT_ID.json}"
    
    log_incident "Escalating incident $INCIDENT_ID"
    
    # Increase severity
    case "$SEVERITY" in
        low) SEVERITY="medium" ;;
        medium) SEVERITY="high" ;;
        high) SEVERITY="critical" ;;
        critical) 
            log_warning "Incident already at critical severity"
            return 0
            ;;
    esac
    
    # Update incident record
    jq --arg severity "$SEVERITY" '.severity = $severity' "$incident_file" > "${incident_file}.tmp"
    mv "${incident_file}.tmp" "$incident_file"
    
    update_incident_record "$incident_file" "escalated" "Incident escalated to $SEVERITY severity"
    
    # Send escalation notification
    send_notification "🚨 ESCALATION: Incident $INCIDENT_ID escalated to $SEVERITY severity" "$SEVERITY"
    
    log_success "Incident escalated to $SEVERITY severity"
}

# Function to resolve incident
resolve_incident() {
    local incident_file="${1:-/tmp/incident-$INCIDENT_ID.json}"
    
    log_incident "Resolving incident $INCIDENT_ID"
    
    if [ ! -f "$incident_file" ]; then
        log_error "Incident file not found: $incident_file"
        return 1
    fi
    
    # Set resolution time
    jq --arg time "$(date +%s)" --arg status "resolved" '.metrics.resolution_time = $time | .status = $status' "$incident_file" > "${incident_file}.tmp"
    mv "${incident_file}.tmp" "$incident_file"
    
    update_incident_record "$incident_file" "resolved" "Incident marked as resolved"
    
    # Clean up incident-specific resources
    kubectl delete networkpolicy -l incident="$INCIDENT_ID" -n "$NAMESPACE" || true
    kubectl label pods -l quarantine=true -n "$NAMESPACE" quarantine- || true
    
    send_notification "✅ RESOLVED: Incident $INCIDENT_ID has been resolved" "info"
    
    log_success "Incident $INCIDENT_ID resolved"
}

# Function to generate post-mortem
generate_post_mortem() {
    local incident_file="${1:-/tmp/incident-$INCIDENT_ID.json}"
    
    log_incident "Generating post-mortem for incident $INCIDENT_ID"
    
    if [ ! -f "$incident_file" ]; then
        log_error "Incident file not found: $incident_file"
        return 1
    fi
    
    local post_mortem_file="post-mortem-$INCIDENT_ID.md"
    
    # Extract data from incident file
    local created_at severity incident_type
    created_at=$(jq -r '.created_at' "$incident_file")
    severity=$(jq -r '.severity' "$incident_file")
    incident_type=$(jq -r '.type' "$incident_file")
    
    cat > "$post_mortem_file" << EOF
# 📋 Post-Mortem Report: $INCIDENT_ID

## Incident Summary
- **Incident ID:** $INCIDENT_ID
- **Severity:** $severity
- **Type:** $incident_type
- **Date:** $created_at
- **Duration:** $(calculate_incident_duration "$incident_file")
- **Status:** $(jq -r '.status' "$incident_file")

## Timeline
$(jq -r '.timeline[] | "- **\(.timestamp):** \(.action) - \(.details)"' "$incident_file")

## Impact Assessment
- **Affected Services:** $(jq -r '.affected_services[]?' "$incident_file" | tr '\n' ',' | sed 's/,$//')
- **Users Affected:** To be determined
- **Data Loss:** None reported
- **Financial Impact:** To be assessed

## Root Cause Analysis
### Primary Cause
[To be filled based on investigation]

### Contributing Factors
[To be filled based on investigation]

## Response Evaluation
### What Went Well
- Incident detected within expected timeframe
- Automated response procedures executed successfully
- Clear communication maintained throughout

### What Could Be Improved
- [To be filled based on lessons learned]
- [To be filled based on team feedback]

## Actions Taken
$(jq -r '.actions_taken[]?' "$incident_file" | sed 's/^/- /')

## Follow-up Actions
### Immediate (Next 24 hours)
- [ ] Complete root cause analysis
- [ ] Implement immediate fixes
- [ ] Update monitoring and alerting

### Short-term (Next week)
- [ ] Improve incident response procedures
- [ ] Enhance system resilience
- [ ] Conduct team retrospective

### Long-term (Next month)
- [ ] Implement preventive measures
- [ ] Update disaster recovery plans
- [ ] Conduct chaos engineering tests

## Lessons Learned
1. [Key lesson 1]
2. [Key lesson 2]
3. [Key lesson 3]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

---
*Generated on $(date) by CoreFlow360 Incident Response System*
EOF
    
    log_success "Post-mortem report generated: $post_mortem_file"
    echo "$post_mortem_file"
}

# Helper function to calculate incident duration
calculate_incident_duration() {
    local incident_file="$1"
    
    local detection_time resolution_time
    detection_time=$(jq -r '.metrics.detection_time' "$incident_file")
    resolution_time=$(jq -r '.metrics.resolution_time' "$incident_file")
    
    if [ "$resolution_time" = "null" ]; then
        echo "Ongoing"
    else
        local duration=$((resolution_time - detection_time))
        echo "${duration} seconds"
    fi
}

# Main function
main() {
    local command="${1:-}"
    
    case "$command" in
        detect)
            if detect_incidents; then
                execute_incident_response
            fi
            ;;
        respond)
            execute_incident_response
            ;;
        escalate)
            escalate_incident
            ;;
        resolve)
            resolve_incident
            ;;
        post-mortem)
            generate_post_mortem
            ;;
        runbook)
            log_warning "Runbook execution not implemented yet"
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
        --incident-id)
            INCIDENT_ID="$2"
            shift 2
            ;;
        --severity)
            SEVERITY="$2"
            shift 2
            ;;
        --type)
            INCIDENT_TYPE="$2"
            shift 2
            ;;
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --verbose)
            VERBOSE="true"
            shift
            ;;
        --alert-webhook)
            ALERT_WEBHOOK="$2"
            shift 2
            ;;
        --slack-channel)
            SLACK_CHANNEL="$2"
            shift 2
            ;;
        --pagerduty-key)
            PAGERDUTY_KEY="$2"
            shift 2
            ;;
        --response-team)
            RESPONSE_TEAM="$2"
            shift 2
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        detect|respond|escalate|resolve|post-mortem|runbook)
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