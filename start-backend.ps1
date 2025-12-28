# POLACARE Backend Startup Script
Write-Host "🚀 Starting POLACARE Backend..." -ForegroundColor Green

# Check if in backend directory
if (-not (Test-Path "package.json")) {
    Write-Host "⚠️  Not in backend directory. Changing to backend..." -ForegroundColor Yellow
    Set-Location backend
}

# Check dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check .env file
if (-not (Test-Path ".env")) {
    Write-Host "⚙️  Creating .env file..." -ForegroundColor Yellow
    @"
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=polacare
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev-secret-key-change-in-production-$(Get-Random)
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
GEMINI_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "✅ .env file created" -ForegroundColor Green
}

# Check if port is available
$portInUse = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Port 5000 is already in use!" -ForegroundColor Yellow
    Write-Host "   Backend might already be running." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Test: http://localhost:5000/health" -ForegroundColor Cyan
    Write-Host "   Or stop existing process and try again." -ForegroundColor Cyan
    exit
}

Write-Host ""
Write-Host "📡 Starting server on http://localhost:5000" -ForegroundColor Cyan
Write-Host "📊 API: http://localhost:5000/api/v1" -ForegroundColor Cyan
Write-Host "🏥 Health: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start server
npm run dev

