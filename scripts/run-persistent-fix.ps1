# CoreFlow360 - Persistent Bug Fixer Launcher
# This script runs the persistent bug fixer that won't stop until all bugs are fixed

param(
    [Parameter(Mandatory=$false)]
    [switch]$Force = $false,
    
    [Parameter(Mandatory=$false)]
    [int]$MaxIterations = 50
)

Write-Host "🤖 CoreFlow360 Persistent Bug Fixer" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "This system will NOT STOP until all bugs are fixed!" -ForegroundColor Yellow
Write-Host ""

if (-not $Force) {
    Write-Host "⚠️  WARNING: This will automatically fix bugs in your codebase!" -ForegroundColor Red
    Write-Host "   Make sure you have committed your current changes." -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "Do you want to continue? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
        exit 0
    }
}

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

# Create necessary directories
$directories = @(
    "backups/auto-fix",
    "logs/auto-fix", 
    "reports/auto-fix"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🚀 Starting Persistent Bug Fixer..." -ForegroundColor Green
Write-Host "   Max Iterations: $MaxIterations" -ForegroundColor Cyan
Write-Host "   This process will run until all bugs are fixed or max iterations reached." -ForegroundColor Cyan
Write-Host ""

# Set environment variable for max iterations
$env:MAX_ITERATIONS = $MaxIterations

# Run the persistent bug fixer
try {
    npx tsx scripts/persistent-bug-fixer.ts
} catch {
    Write-Host "❌ Error running persistent bug fixer: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Persistent Bug Fixer completed!" -ForegroundColor Green
Write-Host "Check the logs and reports for details." -ForegroundColor Cyan
