#!/bin/bash

# CoreFlow360 Auto-Approval Helper
# Loads auto-approval configuration and sets environment variables

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_ROOT/.coreflow-auto-approval.json"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq not found. Auto-approval configuration will not be loaded.${NC}"
    exit 0
fi

# Check if config file exists
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo -e "${YELLOW}Warning: Auto-approval config file not found at $CONFIG_FILE${NC}"
    exit 0
fi

# Determine environment
ENVIRONMENT="${NODE_ENV:-development}"
if [[ "${CI:-}" == "true" ]]; then
    ENVIRONMENT="ci"
elif [[ "${VERCEL_ENV:-}" == "production" ]]; then
    ENVIRONMENT="production"
elif [[ "${VERCEL_ENV:-}" == "preview" ]]; then
    ENVIRONMENT="staging"
fi

echo -e "${BLUE}Loading auto-approval configuration for environment: $ENVIRONMENT${NC}"

# Load configuration for the current environment
CONFIG=$(cat "$CONFIG_FILE")

# Extract environment-specific settings
AUTO_APPROVE_ALL=$(echo "$CONFIG" | jq -r ".environments.$ENVIRONMENT.auto_approve_all // false")
AUTO_APPROVE_DB=$(echo "$CONFIG" | jq -r ".environments.$ENVIRONMENT.auto_approve_database // false")
AUTO_APPROVE_APP=$(echo "$CONFIG" | jq -r ".environments.$ENVIRONMENT.auto_approve_application // false")
AUTO_APPROVE_DEPLOY=$(echo "$CONFIG" | jq -r ".environments.$ENVIRONMENT.auto_approve_deployment // false")
CONFIRMATION_DELAY=$(echo "$CONFIG" | jq -r ".environments.$ENVIRONMENT.confirmation_delay_seconds // 0")

# Export environment variables
if [[ "$AUTO_APPROVE_ALL" == "true" ]]; then
    export COREFLOW_AUTO_APPROVE=1
    echo -e "${GREEN}✓ Auto-approval enabled for ALL operations${NC}"
fi

if [[ "$AUTO_APPROVE_DB" == "true" ]]; then
    export COREFLOW_AUTO_APPROVE_DB=1
    echo -e "${GREEN}✓ Auto-approval enabled for DATABASE operations${NC}"
fi

if [[ "$AUTO_APPROVE_APP" == "true" ]]; then
    export COREFLOW_AUTO_APPROVE_APP=1
    echo -e "${GREEN}✓ Auto-approval enabled for APPLICATION operations${NC}"
fi

if [[ "$AUTO_APPROVE_DEPLOY" == "true" ]]; then
    export COREFLOW_AUTO_APPROVE_DEPLOY=1
    echo -e "${GREEN}✓ Auto-approval enabled for DEPLOYMENT operations${NC}"
fi

if [[ "$CONFIRMATION_DELAY" -gt 0 ]]; then
    export COREFLOW_CONFIRMATION_DELAY="$CONFIRMATION_DELAY"
    echo -e "${YELLOW}⏱️  Confirmation delay set to $CONFIRMATION_DELAY seconds${NC}"
fi

# Function to display current auto-approval status
show_auto_approval_status() {
    echo -e "\n${BLUE}Current Auto-Approval Status:${NC}"
    echo "Environment: $ENVIRONMENT"
    echo "Auto-approve all: ${COREFLOW_AUTO_APPROVE:-false}"
    echo "Auto-approve database: ${COREFLOW_AUTO_APPROVE_DB:-false}"
    echo "Auto-approve application: ${COREFLOW_AUTO_APPROVE_APP:-false}"
    echo "Auto-approve deployment: ${COREFLOW_AUTO_APPROVE_DEPLOY:-false}"
    echo "Confirmation delay: ${COREFLOW_CONFIRMATION_DELAY:-0} seconds"
    echo ""
}

# If script is called directly (not sourced), show status
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    show_auto_approval_status
fi