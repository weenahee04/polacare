#!/bin/bash
# ===========================================
# POLACARE Backend Development Setup Script
# ===========================================
# Run: chmod +x scripts/setup-dev.sh && ./scripts/setup-dev.sh
# ===========================================

set -e

echo ""
echo "==========================================="
echo "  POLACARE Backend Development Setup"
echo "==========================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "Error: Run this script from the backend directory"
    exit 1
fi

# Step 1: Install dependencies
echo "[1/6] Installing dependencies..."
npm install
echo "Done!"

# Step 2: Check for .env file
echo ""
echo "[2/6] Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "No .env file found. Creating from template..."
    if [ -f "env.example.txt" ]; then
        cp env.example.txt .env
        echo "Created .env from template. Please edit it with your values."
    else
        # Create minimal .env
        cat > .env << EOF
DATABASE_URL="postgresql://postgres:password@localhost:5432/polacare?schema=public"
PORT=5000
NODE_ENV=development
API_VERSION=v1
CORS_ORIGIN=http://localhost:3001,http://localhost:3000
JWT_SECRET=dev-secret-key-change-in-production-$(openssl rand -hex 16)
JWT_EXPIRES_IN=7d
OTP_LENGTH=6
OTP_EXPIRES_IN=300
STORAGE_PROVIDER=local
UPLOAD_PATH=./uploads
EOF
        echo "Created minimal .env file"
    fi
else
    echo ".env file exists"
fi

# Step 3: Generate Prisma client
echo ""
echo "[3/6] Generating Prisma client..."
npx prisma generate
echo "Done!"

# Step 4: Check database connection
echo ""
echo "[4/6] Testing database connection..."
echo "Note: Make sure PostgreSQL is running on localhost:5432"

if npx prisma db pull --force 2>/dev/null; then
    echo "Database connection OK"
    
    # Step 5: Run migrations
    echo ""
    echo "[5/6] Running database migrations..."
    npx prisma migrate dev --name init || echo "Warning: Migration may have issues"
    
    # Step 6: Seed database
    echo ""
    echo "[6/6] Seeding database with sample data..."
    npm run seed || echo "Warning: Seeding failed. Database may already have data."
else
    echo "Warning: Could not connect to database"
    echo "Make sure PostgreSQL is running and DATABASE_URL is correct in .env"
    echo ""
    echo "To create the database manually:"
    echo "  1. Open psql: psql -U postgres"
    echo "  2. Run: CREATE DATABASE polacare;"
    echo "  3. Then run: npx prisma migrate dev --name init"
fi

# Create uploads directory
mkdir -p uploads
echo "Created uploads directory"

# Summary
echo ""
echo "==========================================="
echo "  Setup Complete!"
echo "==========================================="
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Server will run at: http://localhost:5000"
echo "Health check: http://localhost:5000/health"
echo ""
echo "Sample Accounts:"
echo "  Admin:   +66800000001 / admin123"
echo "  Doctor:  +66800000002 / doctor123"
echo "  Patient: +66812345678 / password123"
echo ""

