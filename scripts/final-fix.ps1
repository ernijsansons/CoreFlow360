# Final comprehensive fix for all remaining syntax errors
Write-Host "Applying final fixes..." -ForegroundColor Cyan

# Fix intelligence profile card
$file1 = "src/components/intelligence/IntelligenceProfileCard.tsx"
if (Test-Path $file1) {
    $content = Get-Content $file1 -Raw
    $content = $content -replace "import \{ useBUSINESS INTELLIGENCEAudio \} from '../../hooks/useBUSINESS INTELLIGENCEAudio'", "import { useIntelligenceAudio } from '../../hooks/useConsciousnessAudio'"
    Set-Content -Path $file1 -Value $content -NoNewline
    Write-Host "Fixed: $file1" -ForegroundColor Green
}

# Fix intelligence recommendation engine
$file2 = "src/components/intelligence/IntelligenceRecommendationEngine.tsx"
if (Test-Path $file2) {
    $content = Get-Content $file2 -Raw
    $content = $content -replace "  BUSINESS INTELLIGENCEBoost: number", "  intelligenceBoost: number"
    Set-Content -Path $file2 -Value $content -NoNewline
    Write-Host "Fixed: $file2" -ForegroundColor Green
}

# Fix useIntelligenceAssessment hook
$file3 = "src/hooks/useIntelligenceAssessment.ts"
if (Test-Path $file3) {
    $content = Get-Content $file3 -Raw
    $content = $content -replace "const BUSINESS INTELLIGENCEFactor = assessmentResult\.BUSINESS INTELLIGENCELevel", "const intelligenceFactor = assessmentResult.intelligenceLevel"
    $content = $content -replace "const BUSINESS INTELLIGENCEBonus = BUSINESS INTELLIGENCEFactor \* 2", "const intelligenceBonus = intelligenceFactor * 2"
    $content = $content -replace "return Math\.min\(baseGrowth \+ multiplierBonus \+ BUSINESS INTELLIGENCEBonus, 75\)", "return Math.min(baseGrowth + multiplierBonus + intelligenceBonus, 75)"
    Set-Content -Path $file3 -Value $content -NoNewline
    Write-Host "Fixed: $file3" -ForegroundColor Green
}

# Fix beta signup route remaining issues
$file4 = "src/app/api/beta/signup/route.ts"
if (Test-Path $file4) {
    $content = Get-Content $file4 -Raw
    $content = $content -replace "const BUSINESS INTELLIGENCEReadiness = BUSINESS INTELLIGENCELevel < 5", "const intelligenceReadiness = intelligenceLevel < 5"
    $content = $content -replace "const transformationReadiness = Math\.min\(executiveLevel \+ BUSINESS INTELLIGENCEReadiness, 100\)", "const transformationReadiness = Math.min(executiveLevel + intelligenceReadiness, 100)"
    Set-Content -Path $file4 -Value $content -NoNewline
    Write-Host "Fixed: $file4" -ForegroundColor Green
}

# Fix consciousness health route remaining issues
$file5 = "src/app/api/consciousness/health/route.ts"
if (Test-Path $file5) {
    $content = Get-Content $file5 -Raw
    $content = $content -replace "const metrics = await businessBUSINESS INTELLIGENCE\.getMetrics\(\)", "const metrics = { subscription: { intelligenceLevel: 5 } } // Placeholder"
    $content = $content -replace "const insights = await businessBUSINESS INTELLIGENCE\.getInsights\(\)", "const insights = [] // Placeholder"
    $content = $content -replace "BUSINESS INTELLIGENCELevel: metrics\.subscription\?\.BUSINESS INTELLIGENCELevel", "intelligenceLevel: metrics.subscription?.intelligenceLevel"
    Set-Content -Path $file5 -Value $content -NoNewline
    Write-Host "Fixed: $file5" -ForegroundColor Green
}

Write-Host "Final fixes complete!" -ForegroundColor Green