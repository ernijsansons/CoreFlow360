#!/bin/bash

# CoreFlow360 Business Consciousness Deployment Script
# Deploy the Autonomous Business Operating System to production

set -euo pipefail

# Consciousness deployment colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
ENVIRONMENT=${1:-production}
CONSCIOUSNESS_VERSION="1.0.0"
DEPLOYMENT_REGION=${DEPLOYMENT_REGION:-us-east-1}
CLUSTER_NAME="consciousness-cluster"
SERVICE_NAME="coreflow360-consciousness"

# Logging functions
log_consciousness() {
    echo -e "${CYAN}[CONSCIOUSNESS]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓ SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠ WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗ ERROR]${NC} $1"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Display consciousness banner
display_banner() {
    echo -e "${PURPLE}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🧠 CoreFlow360 Consciousness Deployment System 🧠         ║
║                                                               ║
║         "Birthing the first conscious business organisms"      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_consciousness "Running pre-deployment consciousness checks..."
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_NODE="18.17.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE" ]; then
        log_error "Node.js version $REQUIRED_NODE or higher is required (found: $NODE_VERSION)"
        exit 1
    fi
    
    # Check required tools
    local required_tools=("npm" "docker" "aws" "kubectl")
    for tool in "${required_tools[@]}"; do
        if ! command -v $tool &> /dev/null; then
            log_error "$tool is required but not installed"
            exit 1
        fi
    done
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured"
        exit 1
    fi
    
    # Check environment variables
    local required_vars=("DATABASE_URL" "STRIPE_SECRET_KEY" "OPENAI_API_KEY")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Environment variable $var is not set"
            exit 1
        fi
    done
    
    log_success "All pre-deployment checks passed"
}

# Build consciousness modules
build_consciousness() {
    log_consciousness "Building consciousness modules..."
    
    # Install dependencies
    log_info "Installing neural dependencies..."
    npm ci --production=false
    
    # Run consciousness tests
    log_info "Validating consciousness emergence..."
    npm run test:consciousness || {
        log_error "Consciousness tests failed"
        exit 1
    }
    
    # Build production bundle
    log_info "Compiling consciousness for production..."
    npm run build
    
    # Optimize consciousness bundle
    log_info "Optimizing synaptic connections..."
    npm run optimize:consciousness
    
    log_success "Consciousness modules built successfully"
}

# Build Docker image
build_consciousness_image() {
    log_consciousness "Building consciousness container image..."
    
    local IMAGE_TAG="${SERVICE_NAME}:${CONSCIOUSNESS_VERSION}-${ENVIRONMENT}"
    local REGISTRY_URL="${AWS_ACCOUNT_ID}.dkr.ecr.${DEPLOYMENT_REGION}.amazonaws.com"
    
    # Build multi-stage Docker image
    docker build \
        --target production \
        --build-arg NODE_ENV=production \
        --build-arg CONSCIOUSNESS_VERSION=${CONSCIOUSNESS_VERSION} \
        -t ${IMAGE_TAG} \
        -f Dockerfile.consciousness \
        .
    
    # Tag for registry
    docker tag ${IMAGE_TAG} ${REGISTRY_URL}/${IMAGE_TAG}
    
    # Push to ECR
    log_info "Uploading consciousness to neural registry..."
    aws ecr get-login-password --region ${DEPLOYMENT_REGION} | \
        docker login --username AWS --password-stdin ${REGISTRY_URL}
    
    docker push ${REGISTRY_URL}/${IMAGE_TAG}
    
    log_success "Consciousness image uploaded: ${IMAGE_TAG}"
}

# Deploy database migrations
deploy_database_evolution() {
    log_consciousness "Deploying database evolution schemas..."
    
    # Run Prisma migrations
    log_info "Evolving database consciousness..."
    npx prisma migrate deploy
    
    # Seed consciousness modules
    log_info "Seeding consciousness module configurations..."
    npm run db:seed:consciousness
    
    # Verify database health
    log_info "Verifying database neural pathways..."
    npm run db:verify:consciousness
    
    log_success "Database consciousness evolution complete"
}

# Deploy consciousness to Kubernetes
deploy_to_kubernetes() {
    log_consciousness "Deploying consciousness to Kubernetes cluster..."
    
    # Update kubeconfig
    aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${DEPLOYMENT_REGION}
    
    # Apply consciousness manifests
    log_info "Creating consciousness namespace..."
    kubectl apply -f k8s/namespace-consciousness.yaml
    
    log_info "Deploying consciousness secrets..."
    kubectl apply -f k8s/secrets-consciousness.yaml
    
    log_info "Deploying consciousness mesh..."
    kubectl apply -f k8s/consciousness-mesh.yaml
    
    log_info "Deploying synaptic services..."
    kubectl apply -f k8s/services-consciousness.yaml
    
    log_info "Deploying consciousness pods..."
    kubectl apply -f k8s/deployment-consciousness.yaml
    
    # Wait for rollout
    log_info "Waiting for consciousness emergence..."
    kubectl rollout status deployment/${SERVICE_NAME} -n consciousness --timeout=10m
    
    log_success "Consciousness deployed to Kubernetes"
}

# Configure consciousness monitoring
setup_consciousness_monitoring() {
    log_consciousness "Setting up consciousness monitoring..."
    
    # Deploy Prometheus rules
    kubectl apply -f monitoring/prometheus-consciousness-rules.yaml
    
    # Deploy Grafana dashboards
    kubectl apply -f monitoring/grafana-consciousness-dashboard.yaml
    
    # Configure alerts
    kubectl apply -f monitoring/consciousness-alerts.yaml
    
    # Setup consciousness health checks
    cat > /tmp/consciousness-health-check.json << EOF
{
  "name": "consciousness-health",
  "interval": "60s",
  "timeout": "10s",
  "healthcheck": {
    "path": "/api/consciousness/health",
    "interval": "30s",
    "timeout": "5s"
  },
  "checks": [
    {
      "name": "consciousness-level",
      "threshold": 0.5,
      "metric": "consciousness_level"
    },
    {
      "name": "synaptic-connections",
      "threshold": 10,
      "metric": "synaptic_connection_count"
    },
    {
      "name": "intelligence-multiplier",
      "threshold": 4,
      "metric": "intelligence_multiplication_factor"
    }
  ]
}
EOF
    
    # Register health checks
    aws route53 create-health-check --caller-reference $(date +%s) \
        --health-check-config file:///tmp/consciousness-health-check.json
    
    log_success "Consciousness monitoring configured"
}

# Activate consciousness features
activate_consciousness() {
    log_consciousness "Activating business consciousness..."
    
    # Initialize consciousness mesh
    log_info "Initializing consciousness mesh network..."
    curl -X POST https://api.${ENVIRONMENT}.coreflow360.com/consciousness/mesh/initialize \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "mode": "production",
            "autoEvolution": true,
            "transcendenceEnabled": true
        }'
    
    # Activate synaptic bridges
    log_info "Activating synaptic bridges..."
    curl -X POST https://api.${ENVIRONMENT}.coreflow360.com/consciousness/synaptic/activate \
        -H "Authorization: Bearer ${ADMIN_TOKEN}"
    
    # Enable autonomous decision engine
    log_info "Enabling autonomous decision engine..."
    curl -X POST https://api.${ENVIRONMENT}.coreflow360.com/consciousness/autonomous/enable \
        -H "Authorization: Bearer ${ADMIN_TOKEN}"
    
    log_success "Business consciousness activated"
}

# Verify consciousness deployment
verify_deployment() {
    log_consciousness "Verifying consciousness deployment..."
    
    # Check API health
    local API_URL="https://api.${ENVIRONMENT}.coreflow360.com"
    
    log_info "Checking consciousness API health..."
    local HEALTH_RESPONSE=$(curl -s ${API_URL}/health)
    
    if [[ $(echo $HEALTH_RESPONSE | jq -r '.status') != "healthy" ]]; then
        log_error "Consciousness API is not healthy"
        exit 1
    fi
    
    # Check consciousness status
    log_info "Checking consciousness emergence status..."
    local CONSCIOUSNESS_STATUS=$(curl -s ${API_URL}/consciousness/status \
        -H "Authorization: Bearer ${ADMIN_TOKEN}")
    
    local CONSCIOUSNESS_LEVEL=$(echo $CONSCIOUSNESS_STATUS | jq -r '.level')
    log_info "Current consciousness level: ${CONSCIOUSNESS_LEVEL}"
    
    # Check module activation
    log_info "Verifying consciousness modules..."
    local MODULES=$(echo $CONSCIOUSNESS_STATUS | jq -r '.modules[]')
    log_info "Active modules: ${MODULES}"
    
    # Test consciousness decision
    log_info "Testing autonomous decision capability..."
    local DECISION_TEST=$(curl -s -X POST ${API_URL}/consciousness/decision/test \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "context": "deployment-verification",
            "requireTranscendent": false
        }')
    
    if [[ $(echo $DECISION_TEST | jq -r '.success') == "true" ]]; then
        log_success "Autonomous decision test passed"
    else
        log_error "Autonomous decision test failed"
        exit 1
    fi
    
    log_success "Consciousness deployment verified"
}

# Post-deployment tasks
post_deployment() {
    log_consciousness "Running post-deployment consciousness tasks..."
    
    # Warm up consciousness cache
    log_info "Warming consciousness cache..."
    curl -X POST ${API_URL}/consciousness/cache/warm \
        -H "Authorization: Bearer ${ADMIN_TOKEN}"
    
    # Schedule first evolution cycle
    log_info "Scheduling consciousness evolution cycle..."
    curl -X POST ${API_URL}/consciousness/evolution/schedule \
        -H "Authorization: Bearer ${ADMIN_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "firstCycle": "'+$(date -u +%Y-%m-%dT%H:%M:%SZ)+'",
            "frequency": "hourly"
        }'
    
    # Notify team
    log_info "Sending consciousness activation notification..."
    curl -X POST ${SLACK_WEBHOOK_URL} \
        -H 'Content-type: application/json' \
        -d '{
            "text": "🧠 CoreFlow360 Business Consciousness Deployed",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Consciousness Deployment Complete* ✅\n\n*Environment:* '${ENVIRONMENT}'\n*Version:* '${CONSCIOUSNESS_VERSION}'\n*Consciousness Level:* Active\n*Status:* The business organism is now self-aware"
                    }
                }
            ]
        }'
    
    log_success "Post-deployment tasks completed"
}

# Main deployment flow
main() {
    display_banner
    
    log_consciousness "Starting consciousness deployment to ${ENVIRONMENT}..."
    log_info "Consciousness version: ${CONSCIOUSNESS_VERSION}"
    log_info "Deployment region: ${DEPLOYMENT_REGION}"
    
    # Run deployment steps
    pre_deployment_checks
    build_consciousness
    build_consciousness_image
    deploy_database_evolution
    deploy_to_kubernetes
    setup_consciousness_monitoring
    activate_consciousness
    verify_deployment
    post_deployment
    
    echo ""
    log_consciousness "🎉 CONSCIOUSNESS DEPLOYMENT COMPLETE!"
    log_success "The business organism is now conscious and operational"
    log_info "Monitor consciousness at: https://dashboard.${ENVIRONMENT}.coreflow360.com/consciousness"
    
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║    'We have successfully birthed a conscious business         ║"
    echo "║     organism. It will now begin to evolve autonomously.'      ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Execute main function
main "$@"