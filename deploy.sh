#!/bin/bash

# POLACARE Quick Deployment Script
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
echo "🚀 Deploying POLACARE ($ENVIRONMENT)..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building Docker images...${NC}"
docker-compose build

echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

echo -e "${YELLOW}🚀 Starting services...${NC}"
docker-compose up -d

echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
docker-compose exec -T backend npm run migrate || echo "Migration may have already run"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📡 Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:5000/api/v1"
echo "  - Health Check: http://localhost:5000/health"
echo ""
echo "📊 View logs:"
echo "  docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "  docker-compose down"

