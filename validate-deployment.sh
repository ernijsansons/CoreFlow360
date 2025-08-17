#!/bin/bash

# CoreFlow360 - Deployment Validation Script
# Checks if all required environment variables are set

echo "🔍 CoreFlow360 - Deployment Validation"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
ISSUES=0

# Function to check variable
check_var() {
    local var_name=$1
    local required=$2
    local description=$3
    
    if [ -z "${!var_name}" ]; then
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ $var_name - MISSING (Required)${NC}"
            echo "   $description"
            ((ISSUES++))
        else
            echo -e "${YELLOW}⚠️  $var_name - Not set (Optional)${NC}"
            echo "   $description"
        fi
    else
        # Mask sensitive values
        if [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"KEY"* ]] || [[ "$var_name" == *"TOKEN"* ]] || [[ "$var_name" == *"PASSWORD"* ]]; then
            echo -e "${GREEN}✅ $var_name - Set (${#!var_name} chars)${NC}"
        else
            echo -e "${GREEN}✅ $var_name - ${!var_name}${NC}"
        fi
    fi
}

echo "📋 Required Variables:"
echo "---------------------"
check_var "DATABASE_URL" true "PostgreSQL connection string"
check_var "NEXTAUTH_URL" true "Authentication callback URL"
check_var "NEXTAUTH_SECRET" true "Session encryption key (min 32 chars)"
check_var "API_KEY_SECRET" true "API key encryption (32 hex chars)"
check_var "ENCRYPTION_KEY" true "Field encryption (64 hex chars)"

echo ""
echo "🔧 Service Variables (Required for features):"
echo "-------------------------------------------"
check_var "TWILIO_ACCOUNT_SID" false "Twilio account for voice calls"
check_var "TWILIO_AUTH_TOKEN" false "Twilio authentication"
check_var "TWILIO_PHONE_NUMBER" false "Twilio phone number"
check_var "STRIPE_SECRET_KEY" false "Stripe payment processing"
check_var "STRIPE_PUBLISHABLE_KEY" false "Stripe public key"
check_var "OPENAI_API_KEY" false "OpenAI integration"
check_var "SENDGRID_API_KEY" false "Email service"

echo ""
echo "⚙️  Configuration Variables:"
echo "--------------------------"
check_var "NODE_ENV" true "Environment (production/development)"
check_var "RATE_LIMIT_WINDOW" false "Rate limit window (milliseconds)"
check_var "ENABLE_AI_FEATURES" false "AI features flag"
check_var "ENABLE_STRIPE_INTEGRATION" false "Stripe flag"

echo ""
echo "📊 Validation Summary:"
echo "--------------------"

# Special validations
if [ ! -z "$ENCRYPTION_KEY" ] && [ ${#ENCRYPTION_KEY} -ne 64 ]; then
    echo -e "${RED}❌ ENCRYPTION_KEY must be exactly 64 characters (current: ${#ENCRYPTION_KEY})${NC}"
    ((ISSUES++))
fi

if [ ! -z "$NEXTAUTH_SECRET" ] && [ ${#NEXTAUTH_SECRET} -lt 32 ]; then
    echo -e "${RED}❌ NEXTAUTH_SECRET must be at least 32 characters (current: ${#NEXTAUTH_SECRET})${NC}"
    ((ISSUES++))
fi

if [ ! -z "$RATE_LIMIT_WINDOW" ]; then
    if ! [[ "$RATE_LIMIT_WINDOW" =~ ^[0-9]+$ ]] || [ "$RATE_LIMIT_WINDOW" -gt 3600000 ]; then
        echo -e "${RED}❌ RATE_LIMIT_WINDOW must be a number ≤ 3600000 (current: $RATE_LIMIT_WINDOW)${NC}"
        ((ISSUES++))
    fi
fi

echo ""
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All required variables are properly configured!${NC}"
    echo "   Deployment should succeed."
    exit 0
else
    echo -e "${RED}❌ Found $ISSUES critical issues that will prevent deployment${NC}"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Set missing required variables in Vercel dashboard"
    echo "   2. Fix any validation errors"
    echo "   3. Run this script again to verify"
    echo ""
    echo "📚 Reference: .env.example for all variables"
    exit 1
fi