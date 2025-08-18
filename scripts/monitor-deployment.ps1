# CoreFlow360 - Deployment Monitor
# Shows real-time deployment status

Write-Host "🔍 CoreFlow360 - Deployment Monitor" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Monitoring deployments in real-time..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow

while ($true) {
    try {
        $deployments = vercel ls --json | ConvertFrom-Json
        
        if ($deployments.Count -gt 0) {
            $latest = $deployments[0]
            
            $statusColor = switch ($latest.status) {
                "Ready" { "Green" }
                "Error" { "Red" }
                "Building" { "Yellow" }
                default { "White" }
            }
            
            Write-Host "🕐 $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan -NoNewline
            Write-Host " | " -NoNewline
            Write-Host "Status: $($latest.status)" -ForegroundColor $statusColor -NoNewline
            Write-Host " | " -NoNewline
            Write-Host "Age: $($latest.age)" -NoNewline
            Write-Host " | " -NoNewline
            Write-Host "URL: $($latest.url)" -ForegroundColor Blue
            
            if ($latest.status -eq "Ready") {
                Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
                break
            }
        }
        
        Start-Sleep -Seconds 10
    } catch {
        Write-Host "❌ Error monitoring deployments: $($_.Exception.Message)" -ForegroundColor Red
        Start-Sleep -Seconds 30
    }
}
