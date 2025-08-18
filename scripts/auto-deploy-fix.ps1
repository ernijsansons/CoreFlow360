# CoreFlow360 - Automated Deployment Fix Script (PowerShell)
# Runs the Node.js automation script and handles Windows-specific issues

Write-Host "🚀 CoreFlow360 - Automated Deployment Fixer" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is available
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Not in project root. Please run this from the project directory." -ForegroundColor Red
    exit 1
}

# Make the script executable (if needed)
if (Test-Path "scripts/auto-deploy-fix.js") {
    Write-Host "✅ Auto-deploy script found" -ForegroundColor Green
} else {
    Write-Host "❌ Auto-deploy script not found" -ForegroundColor Red
    exit 1
}

# Run the automation
Write-Host "`n🚀 Starting automated deployment fixer..." -ForegroundColor Cyan
Write-Host "This will monitor deployments and automatically fix issues until success." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop at any time.`n" -ForegroundColor Yellow

try {
    node scripts/auto-deploy-fix.js
} catch {
    Write-Host "`n❌ Automation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Automation completed!" -ForegroundColor Green
