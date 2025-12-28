# POLACARE Quick Deployment Script for Windows PowerShell
# Usage: .\deploy.ps1

Write-Host "🚀 Deploying POLACARE..." -ForegroundColor Green

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Building Docker images..." -ForegroundColor Yellow
docker-compose build

Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

Write-Host "🚀 Starting services..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
docker-compose exec -T backend npm run migrate

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Services:" -ForegroundColor Cyan
Write-Host "  - Frontend: http://localhost:3000"
Write-Host "  - Backend API: http://localhost:5000/api/v1"
Write-Host "  - Health Check: http://localhost:5000/health"
Write-Host ""
Write-Host "📊 View logs:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f"
Write-Host ""
Write-Host "🛑 Stop services:" -ForegroundColor Cyan
Write-Host "  docker-compose down"

