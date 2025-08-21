# PowerShell Script for Strategic Messaging Transformation
# CoreFlow360 - Business Empire Platform Transformation

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CoreFlow360 MESSAGING TRANSFORMATION" -ForegroundColor Cyan
Write-Host "From: Consciousness/Neural Terminology" -ForegroundColor Yellow
Write-Host "To: Business Intelligence/Empire Building" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create backup directory
$backupDir = "messaging-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "Created backup directory: $backupDir" -ForegroundColor Green

# Define transformation mappings
$transformations = @{
    # Core terminology transformations
    "consciousness" = "business intelligence"
    "Consciousness" = "Business Intelligence"
    "CONSCIOUSNESS" = "BUSINESS INTELLIGENCE"
    
    "neural network" = "smart automation"
    "Neural Network" = "Smart Automation"
    "NEURAL NETWORK" = "SMART AUTOMATION"
    
    "synaptic" = "intelligent"
    "Synaptic" = "Intelligent"
    "SYNAPTIC" = "INTELLIGENT"
    
    "transcendent" = "advanced"
    "Transcendent" = "Advanced"
    "TRANSCENDENT" = "ADVANCED"
    
    "organism" = "platform"
    "Organism" = "Platform"
    "ORGANISM" = "PLATFORM"
    
    "singularity" = "scale"
    "Singularity" = "Scale"
    "SINGULARITY" = "SCALE"
    
    # Main value propositions
    "Turn Your Business Into a Revenue Machine That Runs Itself" = "The Business Platform That Grows With Your Empire"
    "Revenue Machine" = "Business Empire"
    "REVENUE MACHINE" = "BUSINESS EMPIRE"
    
    # Module names
    "consciousness emergence" = "business intelligence activation"
    "Consciousness Emergence" = "Business Intelligence Activation"
    
    "autonomous decision engine" = "smart decision system"
    "Autonomous Decision Engine" = "Smart Decision System"
    
    "meta-consciousness" = "enterprise intelligence"
    "Meta-Consciousness" = "Enterprise Intelligence"
    
    # Feature descriptions
    "consciousness-aware" = "intelligence-driven"
    "consciousness growth" = "intelligence expansion"
    "consciousness evolution" = "platform evolution"
    "consciousness boundaries" = "security boundaries"
    "consciousness state" = "system state"
}

# Files to transform
$targetFiles = @(
    "src\components\home\*.tsx",
    "src\components\consciousness\*.tsx",
    "src\components\marketing\*.tsx",
    "src\components\pricing\*.tsx",
    "src\components\layout\*.tsx",
    "src\app\*.tsx",
    "src\app\(authenticated)\dashboard\*.tsx",
    "src\lib\marketing\*.ts",
    "src\lib\ai\*consciousness*.ts"
)

$totalFiles = 0
$updatedFiles = 0

foreach ($pattern in $targetFiles) {
    $files = Get-ChildItem -Path $pattern -Recurse -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        $totalFiles++
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        $hasChanges = $false
        
        # Apply transformations
        foreach ($old in $transformations.Keys) {
            if ($content -match [regex]::Escape($old)) {
                $content = $content -replace [regex]::Escape($old), $transformations[$old]
                $hasChanges = $true
            }
        }
        
        if ($hasChanges) {
            # Backup original file
            $backupPath = Join-Path $backupDir $file.Name
            Copy-Item $file.FullName $backupPath
            
            # Write updated content
            Set-Content -Path $file.FullName -Value $content
            $updatedFiles++
            
            Write-Host "✓ Updated: $($file.FullName)" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TRANSFORMATION COMPLETE" -ForegroundColor Green
Write-Host "Files Processed: $totalFiles" -ForegroundColor Yellow
Write-Host "Files Updated: $updatedFiles" -ForegroundColor Green
Write-Host "Backup Location: $backupDir" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Generate transformation report
$reportPath = "messaging-transformation-report.md"
$transformList = foreach ($key in $transformations.Keys) {
    "- '$key' -> '$($transformations[$key])'"
}
$transformListString = $transformList -join "`n"

$report = "# Messaging Transformation Report`n" +
"Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n" +
"## Summary`n" +
"* Files Processed: $totalFiles`n" +
"* Files Updated: $updatedFiles`n" +
"* Backup Directory: $backupDir`n`n" +
"## Transformations Applied`n" +
"$transformListString`n`n" +
"## Next Steps`n" +
"1. Review updated files for context accuracy`n" +
"2. Test all components for proper rendering`n" +
"3. Update SEO metadata and page titles`n" +
"4. Update marketing materials and documentation`n" +
"5. Deploy changes to staging for testing"

Set-Content -Path $reportPath -Value $report
Write-Host ""
Write-Host "Report generated: $reportPath" -ForegroundColor Cyan