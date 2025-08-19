#!/bin/bash

# CoreFlow360 - Automated Fix Workflow Launcher
# This script launches the automated fix workflow that reads audits, fixes issues, and tests with Bug Bot

set -e

echo "🤖 CoreFlow360 Automated Fix Workflow Launcher"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the CoreFlow360 project root"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if TypeScript is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not available"
    exit 1
fi

echo "✅ Environment check passed"
echo ""

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p temp
mkdir -p backups/enhanced-auto-fix
mkdir -p reports
echo "✅ Directories created"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Choose workflow type
echo "🔧 Choose workflow type:"
echo "1. Basic Auto-Fix Workflow (faster, less comprehensive)"
echo "2. Enhanced Auto-Fix Workflow (slower, more comprehensive)"
echo "3. Quick Fix (just run audit and show results)"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🚀 Starting Basic Auto-Fix Workflow..."
        npx tsx scripts/auto-fix-workflow.ts
        ;;
    2)
        echo "🚀 Starting Enhanced Auto-Fix Workflow..."
        npx tsx scripts/enhanced-auto-fix.ts
        ;;
    3)
        echo "🔍 Running Quick Audit..."
        node scripts/audit-code.js
        echo ""
        echo "📊 Audit completed. Check reports/audit/ for results."
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 Workflow completed!"
echo ""
echo "📋 Next steps:"
echo "   - Check the generated reports in reports/"
echo "   - Review any remaining issues that need manual attention"
echo "   - Test the application to ensure fixes work correctly"
echo ""
echo "📄 Reports available:"
echo "   - Audit results: reports/audit/"
echo "   - Workflow logs: logs/"
echo "   - Backups: backups/"
echo ""
