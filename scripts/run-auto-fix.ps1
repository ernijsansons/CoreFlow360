# CoreFlow360 - Automated Fix Workflow Launcher (PowerShell)
# This script launches the automated fix workflow that reads audits, fixes issues, and tests with Bug Bot

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("basic", "enhanced", "quick")]
    [string]$WorkflowType = "enhanced"
)

Write-Host "🤖 CoreFlow360 Automated Fix Workflow Launcher" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the CoreFlow360 project root" -ForegroundColor Red
    exit 1
}

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if npx is available
try {
    $npxVersion = npx --version
    Write-Host "✅ npx version: $npxVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: npx is not available" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment check passed" -ForegroundColor Green
Write-Host ""

# Create necessary directories
Write-Host "📁 Creating necessary directories..." -ForegroundColor Yellow
$directories = @("logs", "temp", "backups/enhanced-auto-fix", "reports")

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   Created: $dir" -ForegroundColor Green
    }
}
Write-Host "✅ Directories created" -ForegroundColor Green
Write-Host ""

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Run workflow based on type
switch ($WorkflowType) {
    "basic" {
        Write-Host "🚀 Starting Basic Auto-Fix Workflow..." -ForegroundColor Green
        npx tsx scripts/auto-fix-workflow.ts
    }
    "enhanced" {
        Write-Host "🚀 Starting Enhanced Auto-Fix Workflow..." -ForegroundColor Green
        npx tsx scripts/enhanced-auto-fix.ts
    }
    "quick" {
        Write-Host "🔍 Running Quick Audit..." -ForegroundColor Green
        node scripts/audit-code.js
        Write-Host ""
        Write-Host "📊 Audit completed. Check reports/audit/ for results." -ForegroundColor Cyan
    }
    default {
        Write-Host "❌ Invalid workflow type. Use: basic, enhanced, or quick" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Workflow completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   - Check the generated reports in reports/" -ForegroundColor White
Write-Host "   - Review any remaining issues that need manual attention" -ForegroundColor White
Write-Host "   - Test the application to ensure fixes work correctly" -ForegroundColor White
Write-Host ""
Write-Host "📄 Reports available:" -ForegroundColor Cyan
Write-Host "   - Audit results: reports/audit/" -ForegroundColor White
Write-Host "   - Workflow logs: logs/" -ForegroundColor White
Write-Host "   - Backups: backups/" -ForegroundColor White
Write-Host ""
