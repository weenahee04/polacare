# POLACARE Local Development Server Startup
Write-Host "🚀 Starting POLACARE Local Servers..." -ForegroundColor Green
Write-Host ""

# Check if ports are available
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "⚠️  Port 3000 is already in use!" -ForegroundColor Yellow
    Write-Host "   Frontend might already be running" -ForegroundColor Yellow
}

if ($port5000) {
    Write-Host "⚠️  Port 5000 is already in use!" -ForegroundColor Yellow
    Write-Host "   Backend might already be running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📡 Starting Backend Server..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🚀 POLACARE Backend' -ForegroundColor Green; Write-Host '📡 http://localhost:5000' -ForegroundColor Cyan; Write-Host '🏥 Health: http://localhost:5000/health' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Start-Sleep -Seconds 2

Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Cyan
$frontendPath = $PSScriptRoot
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🚀 POLACARE Frontend' -ForegroundColor Green; Write-Host '🌐 http://localhost:3000' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Write-Host ""
Write-Host "✅ Servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Access URLs:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Health:   http://localhost:5000/health" -ForegroundColor White
Write-Host "   API:      http://localhost:5000/api/v1" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Please wait 10-30 seconds for servers to start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Tip: Check the PowerShell windows that opened for server status" -ForegroundColor Cyan

