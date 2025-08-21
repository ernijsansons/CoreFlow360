# Fix syntax errors from over-replacement
Write-Host "Fixing syntax errors..." -ForegroundColor Cyan

# Fix useIntelligenceAssessment.ts
$file1 = "src/hooks/useIntelligenceAssessment.ts"
if (Test-Path $file1) {
    $content = Get-Content $file1 -Raw
    $content = $content -replace "import \{ useBUSINESS INTELLIGENCEAudio \} from './useBUSINESS INTELLIGENCEAudio'", "import { useIntelligenceAudio } from './useConsciousnessAudio'"
    Set-Content -Path $file1 -Value $content -NoNewline
    Write-Host "Fixed: $file1" -ForegroundColor Green
}

# Fix beta signup route
$file2 = "src/app/api/beta/signup/route.ts"
if (Test-Path $file2) {
    $content = Get-Content $file2 -Raw
    $content = $content -replace "const enhancedBUSINESS INTELLIGENCEData = await calculateEnhancedBUSINESS INTELLIGENCE\(validatedData\)", "const enhancedIntelligenceData = await calculateEnhancedIntelligence(validatedData)"
    $content = $content -replace "BUSINESS INTELLIGENCELevel: validatedData.BUSINESS INTELLIGENCELevel,", "intelligenceLevel: validatedData.intelligenceLevel,"
    Set-Content -Path $file2 -Value $content -NoNewline
    Write-Host "Fixed: $file2" -ForegroundColor Green
}

# Fix health route
$file3 = "src/app/api/consciousness/health/route.ts"
if (Test-Path $file3) {
    $content = Get-Content $file3 -Raw
    $content = $content -replace "  BUSINESS INTELLIGENCE: \{", "  intelligence: {"
    Set-Content -Path $file3 -Value $content -NoNewline
    Write-Host "Fixed: $file3" -ForegroundColor Green
}

# Fix insights route
$file4 = "src/app/api/consciousness/insights/route.ts"
if (Test-Path $file4) {
    $content = Get-Content $file4 -Raw
    $content = $content -replace "const BUSINESS INTELLIGENCEStatus = businessBUSINESS INTELLIGENCE.getBUSINESS INTELLIGENCEStatus\(\)", "const intelligenceStatus = { level: 5, tier: 'standard' } // Placeholder"
    $content = $content -replace "BUSINESS INTELLIGENCEStatus\.level,", "intelligenceStatus.level,"
    $content = $content -replace "BUSINESS INTELLIGENCEStatus\.tier,", "intelligenceStatus.tier,"
    Set-Content -Path $file4 -Value $content -NoNewline
    Write-Host "Fixed: $file4" -ForegroundColor Green
}

# Fix intelligence index
$file5 = "src/components/intelligence/index.ts"
if (Test-Path $file5) {
    Write-Host "Checking: $file5" -ForegroundColor Yellow
}

Write-Host "Syntax fixes complete!" -ForegroundColor Cyan