Write-Host "Stopping all AI-SUCE dev processes..." -ForegroundColor Yellow

Get-Job | Where-Object { $_.Name -like "aisuce-*" } | Stop-Job -PassThru | Remove-Job

Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
  $_.CommandLine -match "next|nest|pnpm"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "All processes stopped." -ForegroundColor Green
