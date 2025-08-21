# Simple PowerShell Script for Messaging Transformation
Write-Host "Starting CoreFlow360 Messaging Transformation..." -ForegroundColor Cyan

# Create backup directory
$backupDir = "messaging-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "Created backup directory: $backupDir" -ForegroundColor Green

# Define transformations
$replacements = @{
    'consciousness' = 'business intelligence'
    'Consciousness' = 'Business Intelligence'
    'CONSCIOUSNESS' = 'BUSINESS INTELLIGENCE'
    'transcendent' = 'advanced'
    'Transcendent' = 'Advanced'
    'neural network' = 'smart automation'
    'Neural Network' = 'Smart Automation'
    'synaptic' = 'intelligent'
    'Synaptic' = 'Intelligent'
    'Revenue Machine' = 'Business Empire'
    'revenue machine' = 'business empire'
    'organism' = 'organization'
    'Organism' = 'Organization'
    'neural' = 'intelligent'
    'Neural' = 'Intelligent'
}

# Process all TypeScript/React files
$files = Get-ChildItem -Path "src" -Include "*.ts","*.tsx" -Recurse -ErrorAction SilentlyContinue
$totalFiles = $files.Count
$updatedFiles = 0

foreach ($file in $files) {
    if ($file.FullName) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $modified = $false
            $originalContent = $content
            
            foreach ($key in $replacements.Keys) {
                if ($content -match [regex]::Escape($key)) {
                    $content = $content -replace [regex]::Escape($key), $replacements[$key]
                    $modified = $true
                }
            }
            
            if ($modified) {
                # Backup original
                $backupPath = Join-Path $backupDir $file.Name
                Copy-Item $file.FullName $backupPath -Force
                
                # Write updated content
                Set-Content -Path $file.FullName -Value $content -NoNewline
                Write-Host "Updated: $($file.Name)" -ForegroundColor Green
                $updatedFiles++
            }
        }
    }
}

# Update CLAUDE.md if it exists
$claudePath = "CLAUDE.md"
if (Test-Path $claudePath) {
    $claudeContent = Get-Content $claudePath -Raw
    foreach ($key in $replacements.Keys) {
        $claudeContent = $claudeContent -replace [regex]::Escape($key), $replacements[$key]
    }
    Set-Content -Path $claudePath -Value $claudeContent -NoNewline
    Write-Host "Updated: CLAUDE.md" -ForegroundColor Green
}

Write-Host "`nTransformation Complete!" -ForegroundColor Cyan
Write-Host "Files Processed: $totalFiles" -ForegroundColor Yellow
Write-Host "Files Updated: $updatedFiles" -ForegroundColor Green
Write-Host "Backup Location: $backupDir" -ForegroundColor Cyan