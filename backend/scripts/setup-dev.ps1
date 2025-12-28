# ===========================================
# POLACARE Backend Development Setup Script
# ===========================================
# Run: .\scripts\setup-dev.ps1
# ===========================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  POLACARE Backend Development Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Check if we're in the backend directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Run this script from the backend directory" -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host "[1/6] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "Done!" -ForegroundColor Green

# Step 2: Check for .env file
Write-Host ""
Write-Host "[2/6] Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "No .env file found. Creating from template..." -ForegroundColor Yellow
    if (Test-Path "env.example.txt") {
        Copy-Item "env.example.txt" ".env"
        Write-Host "Created .env from template. Please edit it with your values." -ForegroundColor Yellow
    } else {
        # Create minimal .env
        @"
DATABASE_URL="postgresql://postgres:password@localhost:5432/polacare?schema=public"
PORT=5000
NODE_ENV=development
API_VERSION=v1
CORS_ORIGIN=http://localhost:3001,http://localhost:3000
JWT_SECRET=dev-secret-key-change-in-production-$(Get-Random)
JWT_EXPIRES_IN=7d
OTP_LENGTH=6
OTP_EXPIRES_IN=300
STORAGE_PROVIDER=local
UPLOAD_PATH=./uploads
"@ | Out-File -FilePath ".env" -Encoding utf8
        Write-Host "Created minimal .env file" -ForegroundColor Green
    }
} else {
    Write-Host ".env file exists" -ForegroundColor Green
}

# Step 3: Generate Prisma client
Write-Host ""
Write-Host "[3/6] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Prisma generate failed" -ForegroundColor Red
    exit 1
}
Write-Host "Done!" -ForegroundColor Green

# Step 4: Check database connection
Write-Host ""
Write-Host "[4/6] Testing database connection..." -ForegroundColor Yellow
Write-Host "Note: Make sure PostgreSQL is running on localhost:5432" -ForegroundColor Gray

# Try to run a simple Prisma command
$testResult = npx prisma db pull --force 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Could not connect to database" -ForegroundColor Yellow
    Write-Host "Make sure PostgreSQL is running and DATABASE_URL is correct in .env" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To create the database manually:" -ForegroundColor Cyan
    Write-Host "  1. Open pgAdmin or psql" -ForegroundColor Gray
    Write-Host "  2. Run: CREATE DATABASE polacare;" -ForegroundColor Gray
    Write-Host "  3. Then run: npx prisma migrate dev --name init" -ForegroundColor Gray
} else {
    Write-Host "Database connection OK" -ForegroundColor Green
    
    # Step 5: Run migrations
    Write-Host ""
    Write-Host "[5/6] Running database migrations..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Migration may have issues. Check output above." -ForegroundColor Yellow
    } else {
        Write-Host "Done!" -ForegroundColor Green
    }
    
    # Step 6: Seed database
    Write-Host ""
    Write-Host "[6/6] Seeding database with sample data..." -ForegroundColor Yellow
    npm run seed
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Warning: Seeding failed. Database may already have data." -ForegroundColor Yellow
    } else {
        Write-Host "Done!" -ForegroundColor Green
    }
}

# Create uploads directory
if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" | Out-Null
    Write-Host "Created uploads directory" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the development server:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Server will run at: http://localhost:5000" -ForegroundColor Gray
Write-Host "Health check: http://localhost:5000/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Sample Accounts:" -ForegroundColor Yellow
Write-Host "  Admin:   +66800000001 / admin123" -ForegroundColor Gray
Write-Host "  Doctor:  +66800000002 / doctor123" -ForegroundColor Gray
Write-Host "  Patient: +66812345678 / password123" -ForegroundColor Gray
Write-Host ""

