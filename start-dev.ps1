param(
  [switch]$NoApi,
  [switch]$NoFrontends
)

$RootDir = Split-Path -Parent $PSCommandPath
$PnpmCmd = "C:\Users\ifeol\AppData\Roaming\npm\pnpm.cmd"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI-SUCE Development Server Starter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ─── Check prerequisites ────────────────────────────────
$PgAvailable = $null -ne (Get-Command psql -ErrorAction SilentlyContinue)
$PgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
$PgRunning = $PgService -and $PgService.Status -eq 'Running'

if (-not $PgRunning) {
  Write-Host "⚠  PostgreSQL is not running." -ForegroundColor Yellow
  Write-Host "   The API will fail to connect to the database." -ForegroundColor Yellow
  Write-Host "   Install PostgreSQL via: winget install PostgreSQL.PostgreSQL" -ForegroundColor Yellow
  Write-Host "   Or start Docker: docker compose up -d db cache" -ForegroundColor Yellow
  Write-Host ""
}

# ─── Kill existing dev processes ────────────────────────
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
  $_.CommandLine -match "next dev|nest start|pnpm"
} | Stop-Process -Force -ErrorAction SilentlyContinue

# ─── Start API ──────────────────────────────────────────
if (-not $NoApi) {
  Write-Host "▶ Starting API (port 4000)..." -ForegroundColor Green
  $apiJob = Start-Job -Name "aisuce-api" -ScriptBlock {
    param($dir, $cmd)
    Set-Location $dir
    & $cmd run dev
  } -ArgumentList $RootDir, $PnpmCmd
  Start-Sleep -Seconds 2
}

# ─── Start Frontends ────────────────────────────────────
if (-not $NoFrontends) {
  $frontends = @(
    @{ Name = "aisuce-web-greenpurse";  Dir = "apps/web-greenpurse";  Port = 3000 }
    @{ Name = "aisuce-web-greensc";     Dir = "apps/web-greensc";     Port = 3001 }
    @{ Name = "aisuce-web-virtualfarm"; Dir = "apps/web-virtualfarm"; Port = 3002 }
    @{ Name = "aisuce-web-admin";       Dir = "apps/web-admin";       Port = 3003 }
  )

  foreach ($fe in $frontends) {
    Write-Host "▶ Starting $($fe.Name) (port $($fe.Port))..." -ForegroundColor Green
    Start-Job -Name $fe.Name -ScriptBlock {
      param($dir, $cmd, $port)
      Set-Location $dir
      $env:PORT = $port
      & $cmd run dev
    } -ArgumentList (Join-Path $RootDir $fe.Dir), $PnpmCmd, $fe.Port
    Start-Sleep -Seconds 1
  }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All processes starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontends:" -ForegroundColor White
Write-Host "    GreenPurse:      http://localhost:3000" -ForegroundColor White
Write-Host "    GreenSC:         http://localhost:3001" -ForegroundColor White
Write-Host "    MyVirtualFarm:   http://localhost:3002" -ForegroundColor White
Write-Host "    Admin:           http://localhost:3003" -ForegroundColor White
Write-Host ""
Write-Host "  API:" -ForegroundColor White
Write-Host "    NestJS API:      http://localhost:4000" -ForegroundColor White
Write-Host "    Swagger Docs:    http://localhost:4000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "  To stop:          .\stop-dev.ps1" -ForegroundColor Yellow
Write-Host "  To check status:  Get-Job | Where-Object State -eq 'Running'" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Keep script alive to maintain background jobs
while ($true) {
  $running = Get-Job | Where-Object { $_.State -eq 'Running' }
  if ($running.Count -eq 0) {
    Write-Host "`nAll processes have stopped." -ForegroundColor Red
    break
  }
  Start-Sleep -Seconds 5
}
