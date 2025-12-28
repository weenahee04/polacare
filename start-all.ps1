Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🚀 POLACARE - Starting Servers" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "📡 Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\ADMIN\Downloads\polacare\backend'; Write-Host '🚀 POLACARE Backend Server' -ForegroundColor Green; Write-Host '📡 http://localhost:5000' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "🌐 Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\ADMIN\Downloads\polacare'; Write-Host '🚀 POLACARE Frontend Server' -ForegroundColor Green; Write-Host '🌐 http://localhost:3001' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Write-Host ""
Write-Host "✅ Servers are starting in new windows!" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Please wait 15-30 seconds..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Check the 2 PowerShell windows:" -ForegroundColor Cyan
Write-Host "   - Backend: Look for 'Server running on port 5000'" -ForegroundColor White
Write-Host "   - Frontend: Look for 'Local: http://localhost:3001'" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Then open: http://localhost:3001" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

