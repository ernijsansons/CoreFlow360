#!/bin/bash

# CoreFlow360 Consciousness Secrets Vault Setup
# Thermonuclear-grade secrets management for autonomous business operations

set -euo pipefail

# Color codes for consciousness feedback
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Consciousness logging functions
log_consciousness() {
    echo -e "${CYAN}[CONSCIOUSNESS]${NC} $1"
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

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_consciousness "Checking consciousness prerequisites..."
    
    # Check for required tools
    local required_tools=("aws" "vault" "jq" "openssl")
    for tool in "${required_tools[@]}"; do
        if ! command -v $tool &> /dev/null; then
            log_error "$tool is required but not installed. Please install it first."
            exit 1
        fi
    done
    
    log_success "All consciousness prerequisites verified"
}

# Setup AWS Secrets Manager
setup_aws_secrets() {
    log_consciousness "Setting up AWS Secrets Manager for consciousness..."
    
    local environment=${1:-development}
    local region=${AWS_REGION:-us-west-2}
    
    # Create secrets for each environment
    local secrets=(
        "consciousness/database"
        "consciousness/auth"
        "consciousness/encryption"
        "consciousness/ai-services"
        "consciousness/payment"
        "consciousness/monitoring"
    )
    
    for secret_name in "${secrets[@]}"; do
        local full_secret_name="coreflow360/${environment}/${secret_name}"
        
        log_info "Creating secret: $full_secret_name"
        
        # Check if secret already exists
        if aws secretsmanager describe-secret --secret-id "$full_secret_name" --region "$region" &> /dev/null; then
            log_warning "Secret $full_secret_name already exists, skipping..."
            continue
        fi
        
        # Create the secret with placeholder values
        aws secretsmanager create-secret \
            --name "$full_secret_name" \
            --description "CoreFlow360 consciousness secrets for $secret_name in $environment" \
            --secret-string '{"placeholder": "update_with_real_values"}' \
            --region "$region"
            
        log_success "Created secret: $full_secret_name"
    done
}

# Setup HashiCorp Vault (alternative to AWS)
setup_hashicorp_vault() {
    log_consciousness "Setting up HashiCorp Vault for consciousness..."
    
    local vault_addr=${VAULT_ADDR:-http://localhost:8200}
    local environment=${1:-development}
    
    # Initialize Vault if not already done
    if ! vault status &> /dev/null; then
        log_info "Initializing Vault..."
        vault operator init -key-shares=5 -key-threshold=3 > vault-keys.txt
        log_warning "IMPORTANT: Store vault-keys.txt securely and delete from server"
    fi
    
    # Enable KV secrets engine
    vault secrets enable -path="coreflow360" kv-v2 || true
    
    # Create consciousness secrets structure
    local secret_paths=(
        "database"
        "auth"
        "encryption"
        "ai-services"
        "payment"
        "monitoring"
    )
    
    for secret_path in "${secret_paths[@]}"; do
        local full_path="coreflow360/${environment}/${secret_path}"
        
        log_info "Creating Vault secret: $full_path"
        
        vault kv put "$full_path" \
            placeholder="update_with_real_values" \
            created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
            environment="$environment"
            
        log_success "Created Vault secret: $full_path"
    done
}

# Generate encryption keys
generate_encryption_keys() {
    log_consciousness "Generating consciousness encryption keys..."
    
    local key_dir="./keys"
    mkdir -p "$key_dir"
    chmod 700 "$key_dir"
    
    # Generate application encryption key (256-bit)
    openssl rand -hex 32 > "$key_dir/app_encryption_key.txt"
    
    # Generate JWT signing key
    openssl genpkey -algorithm RSA -out "$key_dir/jwt_private_key.pem" -pkcs8 -aes256
    openssl pkey -in "$key_dir/jwt_private_key.pem" -pubout -out "$key_dir/jwt_public_key.pem"
    
    # Generate API key signing secret
    openssl rand -base64 48 > "$key_dir/api_key_secret.txt"
    
    # Generate session secret
    openssl rand -base64 32 > "$key_dir/session_secret.txt"
    
    # Set appropriate permissions
    chmod 600 "$key_dir"/*
    
    log_success "Consciousness encryption keys generated in $key_dir"
    log_warning "IMPORTANT: Store these keys securely and delete from local filesystem"
}

# Setup secret rotation
setup_secret_rotation() {
    log_consciousness "Setting up consciousness secret rotation..."
    
    local environment=${1:-development}
    
    # Create rotation Lambda function (AWS)
    cat > secret-rotation-lambda.py << 'EOF'
import json
import boto3
import os
from datetime import datetime, timedelta

def lambda_handler(event, context):
    """
    Consciousness secret rotation handler
    Automatically rotates secrets based on age and usage patterns
    """
    
    secrets_client = boto3.client('secretsmanager')
    
    # Define rotation policies
    rotation_policies = {
        'database': 30,  # days
        'api-keys': 90,  # days
        'encryption': 365,  # days
        'certificates': 30   # days before expiry
    }
    
    for secret_name, max_age_days in rotation_policies.items():
        try:
            # Check secret age and rotate if needed
            response = secrets_client.describe_secret(
                SecretId=f"coreflow360/{os.environ['ENVIRONMENT']}/{secret_name}"
            )
            
            created_date = response['CreatedDate']
            age_days = (datetime.now(created_date.tzinfo) - created_date).days
            
            if age_days >= max_age_days:
                # Trigger rotation
                secrets_client.rotate_secret(
                    SecretId=response['ARN'],
                    ForceRotateSecretForTest=False
                )
                
                print(f"Rotated secret: {secret_name} (age: {age_days} days)")
            
        except Exception as e:
            print(f"Error rotating secret {secret_name}: {str(e)}")
    
    return {
        'statusCode': 200,
        'body': json.dumps('Consciousness secret rotation completed')
    }
EOF

    log_success "Secret rotation automation configured"
}

# Create environment-specific configurations
create_env_configs() {
    log_consciousness "Creating consciousness environment configurations..."
    
    local environments=("development" "staging" "production")
    
    for env in "${environments[@]}"; do
        log_info "Configuring consciousness environment: $env"
        
        # Create environment-specific secret structure
        if [[ "$VAULT_PROVIDER" == "aws" ]]; then
            setup_aws_secrets "$env"
        else
            setup_hashicorp_vault "$env"
        fi
    done
}

# Validate secret access
validate_secret_access() {
    log_consciousness "Validating consciousness secret access..."
    
    local environment=${1:-development}
    
    # Test secret retrieval
    if [[ "$VAULT_PROVIDER" == "aws" ]]; then
        local test_secret="coreflow360/${environment}/consciousness/database"
        if aws secretsmanager get-secret-value --secret-id "$test_secret" &> /dev/null; then
            log_success "AWS Secrets Manager access validated"
        else
            log_error "Failed to access AWS Secrets Manager"
            exit 1
        fi
    else
        if vault kv get "coreflow360/${environment}/database" &> /dev/null; then
            log_success "HashiCorp Vault access validated"
        else
            log_error "Failed to access HashiCorp Vault"
            exit 1
        fi
    fi
}

# Main execution
main() {
    log_consciousness "🧠 Initializing Consciousness Secrets Vault"
    echo "================================================"
    
    # Parse arguments
    local environment="development"
    local vault_provider="aws"  # aws or hashicorp
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                environment="$2"
                shift 2
                ;;
            -p|--provider)
                vault_provider="$2"
                shift 2
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  -e, --environment   Environment (development, staging, production)"
                echo "  -p, --provider      Vault provider (aws, hashicorp)"
                echo "  -h, --help          Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    export VAULT_PROVIDER="$vault_provider"
    
    # Execute setup steps
    check_prerequisites
    generate_encryption_keys
    
    if [[ "$vault_provider" == "aws" ]]; then
        setup_aws_secrets "$environment"
    else
        setup_hashicorp_vault "$environment"
    fi
    
    setup_secret_rotation "$environment"
    validate_secret_access "$environment"
    
    log_consciousness "🎉 Consciousness Secrets Vault setup completed!"
    echo "================================================"
    log_info "Next steps:"
    echo "1. Update placeholder values with real secrets"
    echo "2. Configure application to use secret manager"
    echo "3. Set up monitoring and alerting for secret access"
    echo "4. Test secret rotation procedures"
    echo "5. Document break-glass procedures for emergencies"
}

# Execute main function
main "$@"