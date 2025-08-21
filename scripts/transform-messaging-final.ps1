# PowerShell Script for Messaging Transformation
Write-Host "Starting CoreFlow360 Messaging Transformation..." -ForegroundColor Cyan

# Create backup directory
$backupDir = "messaging-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "Created backup directory: $backupDir" -ForegroundColor Green

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
            
            # Apply transformations with case-sensitive replacements
            # Must be done in order from most specific to least specific
            
            # Specific phrases first
            $content = $content -replace "Turn Your Business Into a Revenue Machine That Runs Itself", "The Business Platform That Grows With Your Empire"
            $content = $content -replace "World's first conscious business platform", "Multi-Business Intelligence Platform"
            $content = $content -replace "post-human business architecture", "next-generation business automation"
            $content = $content -replace "consciousness emergence", "intelligent automation"
            
            # Component names
            $content = $content -replace "ConsciousnessMarketing", "BusinessIntelligenceMarketing"
            $content = $content -replace "ConsciousnessDashboard", "BusinessIntelligenceDashboard"
            $content = $content -replace "ConsciousnessParticle", "IntelligenceParticle"
            $content = $content -replace "ConsciousnessSoundEngine", "IntelligenceSoundEngine"
            $content = $content -replace "ConsciousnessAudioEngine", "IntelligenceAudioEngine"
            
            # Module names
            $content = $content -replace "consciousness-orchestrator", "business-intelligence-orchestrator"
            $content = $content -replace "consciousness-recommendations-engine", "business-recommendations-engine"
            $content = $content -replace "consciousness-tier-manager", "intelligence-tier-manager"
            $content = $content -replace "autonomous-decision-engine", "automated-decision-engine"
            $content = $content -replace "base-consciousness-module", "base-intelligence-module"
            $content = $content -replace "synaptic-bridge", "intelligent-bridge"
            $content = $content -replace "accounting-consciousness", "accounting-intelligence"
            $content = $content -replace "crm-consciousness", "crm-intelligence"
            
            # General terms - case variations
            $content = $content -replace "CONSCIOUSNESS", "BUSINESS INTELLIGENCE"
            $content = $content -replace "Consciousness", "Business Intelligence"
            $content = $content -replace "consciousness", "business intelligence"
            
            $content = $content -replace "TRANSCENDENT", "ADVANCED"
            $content = $content -replace "Transcendent", "Advanced"
            $content = $content -replace "transcendent", "advanced"
            
            $content = $content -replace "NEURAL NETWORK", "SMART AUTOMATION"
            $content = $content -replace "Neural Network", "Smart Automation"
            $content = $content -replace "neural network", "smart automation"
            
            $content = $content -replace "NEURAL", "INTELLIGENT"
            $content = $content -replace "Neural", "Intelligent"
            $content = $content -replace "neural", "intelligent"
            
            $content = $content -replace "SYNAPTIC", "INTELLIGENT"
            $content = $content -replace "Synaptic", "Intelligent"
            $content = $content -replace "synaptic", "intelligent"
            
            $content = $content -replace "REVENUE MACHINE", "BUSINESS EMPIRE"
            $content = $content -replace "Revenue Machine", "Business Empire"
            $content = $content -replace "revenue machine", "business empire"
            
            $content = $content -replace "ORGANISM", "ORGANIZATION"
            $content = $content -replace "Organism", "Organization"
            $content = $content -replace "organism", "organization"
            
            if ($originalContent -ne $content) {
                $modified = $true
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
    Write-Host "Updating CLAUDE.md..." -ForegroundColor Yellow
    $claudeContent = Get-Content $claudePath -Raw
    
    # Apply same transformations
    $claudeContent = $claudeContent -replace "CONSCIOUSNESS", "BUSINESS INTELLIGENCE"
    $claudeContent = $claudeContent -replace "Consciousness", "Business Intelligence"
    $claudeContent = $claudeContent -replace "consciousness", "business intelligence"
    
    $claudeContent = $claudeContent -replace "TRANSCENDENT", "ADVANCED"
    $claudeContent = $claudeContent -replace "Transcendent", "Advanced"
    $claudeContent = $claudeContent -replace "transcendent", "advanced"
    
    $claudeContent = $claudeContent -replace "NEURAL NETWORK", "SMART AUTOMATION"
    $claudeContent = $claudeContent -replace "Neural Network", "Smart Automation"
    $claudeContent = $claudeContent -replace "neural network", "smart automation"
    
    $claudeContent = $claudeContent -replace "NEURAL", "INTELLIGENT"
    $claudeContent = $claudeContent -replace "Neural", "Intelligent"
    $claudeContent = $claudeContent -replace "neural", "intelligent"
    
    $claudeContent = $claudeContent -replace "SYNAPTIC", "INTELLIGENT"
    $claudeContent = $claudeContent -replace "Synaptic", "Intelligent"
    $claudeContent = $claudeContent -replace "synaptic", "intelligent"
    
    $claudeContent = $claudeContent -replace "ORGANISM", "ORGANIZATION"
    $claudeContent = $claudeContent -replace "Organism", "Organization"
    $claudeContent = $claudeContent -replace "organism", "organization"
    
    Set-Content -Path $claudePath -Value $claudeContent -NoNewline
    Write-Host "Updated: CLAUDE.md" -ForegroundColor Green
}

Write-Host "`nTransformation Complete!" -ForegroundColor Cyan
Write-Host "Files Processed: $totalFiles" -ForegroundColor Yellow
Write-Host "Files Updated: $updatedFiles" -ForegroundColor Green
Write-Host "Backup Location: $backupDir" -ForegroundColor Cyan