# PowerShell Script to fix syntax errors from over-replacement
Write-Host "Fixing syntax errors from over-replacement..." -ForegroundColor Cyan

# Fix files with broken syntax
$fixes = @(
    @{
        File = "src/hooks/useIntelligenceAssessment.ts"
        Replacements = @(
            @{Old = "import { useBUSINESS INTELLIGENCEAudio } from './useBUSINESS INTELLIGENCEAudio'"; New = "import { useIntelligenceAudio } from './useConsciousnessAudio'"}
        )
    },
    @{
        File = "src/app/api/beta/signup/route.ts"
        Replacements = @(
            @{Old = "const enhancedBUSINESS INTELLIGENCEData = await calculateEnhancedBUSINESS INTELLIGENCE(validatedData)"; New = "const enhancedIntelligenceData = await calculateEnhancedIntelligence(validatedData)"}
            @{Old = "BUSINESS INTELLIGENCELevel: validatedData.BUSINESS INTELLIGENCELevel,"; New = "intelligenceLevel: validatedData.intelligenceLevel,"}
        )
    },
    @{
        File = "src/app/api/consciousness/health/route.ts"
        Replacements = @(
            @{Old = "  BUSINESS INTELLIGENCE: {"; New = "  intelligence: {"}
        )
    },
    @{
        File = "src/app/api/consciousness/insights/route.ts"
        Replacements = @(
            @{Old = "const BUSINESS INTELLIGENCEStatus = businessBUSINESS INTELLIGENCE.getBUSINESS INTELLIGENCEStatus()"; New = "const intelligenceStatus = { level: 5, tier: 'standard' } // Placeholder"}
            @{Old = "BUSINESS INTELLIGENCEStatus.level,"; New = "intelligenceStatus.level,"}
            @{Old = "BUSINESS INTELLIGENCEStatus.tier,"; New = "intelligenceStatus.tier,"}
        )
    }
)

foreach ($fix in $fixes) {
    $filePath = $fix.File
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $modified = $false
        
        foreach ($replacement in $fix.Replacements) {
            if ($content -match [regex]::Escape($replacement.Old)) {
                $content = $content -replace [regex]::Escape($replacement.Old), $replacement.New
                $modified = $true
                Write-Host "  Fixed: $($replacement.Old -replace '(.{40}).*', '$1...')" -ForegroundColor Yellow
            }
        }
        
        if ($modified) {
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "✓ Fixed: $filePath" -ForegroundColor Green
        }
    }
}

Write-Host "`nSyntax error fixes complete!" -ForegroundColor Cyan