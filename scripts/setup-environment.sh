#!/bin/bash
# CoreFlow360 Environment Setup Script

echo "🔧 Setting up CoreFlow360 Environment Configuration..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📁 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your actual values."
else
    echo "ℹ️  .env file already exists."
fi

# Validate required tools
echo "🔍 Validating required tools..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ All required tools are available"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run environment validation
echo "🧪 Validating environment configuration..."
node scripts/validate-environment.js

echo "🎉 Environment setup complete!"
echo "👉 Next steps:"
echo "   1. Edit .env file with your actual values"
echo "   2. Run 'npm run dev' to start development"
echo "   3. Run 'npm run build' to build for production"
