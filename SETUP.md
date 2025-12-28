# POLACARE Setup Guide

## Quick Start

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL 15+ (or Docker)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd polacare
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

```bash
# Create database
createdb polacare

# Run migrations
npm run migrate

# Seed sample data (optional)
npm run seed
```

### 4. Start Backend

```bash
npm run dev
```

Backend will run on http://localhost:5000

### 5. Frontend Setup

```bash
# From project root
npm install
cp .env.example .env.local
# Edit .env.local if needed
```

### 6. Start Frontend

```bash
npm run dev
```

Frontend will run on http://localhost:3000

## Docker Setup (Recommended)

### 1. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env

# Frontend (optional)
cp .env.example .env.local
```

### 2. Start All Services

```bash
docker-compose up -d
```

### 3. Initialize Database

```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- Health Check: http://localhost:5000/health

## Environment Variables

### Backend (.env)
See `backend/.env.example` for all variables.

Key variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` - Must be changed in production
- `GEMINI_API_KEY` - For AI features
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` - For SMS OTP

### Frontend (.env.local)
- `VITE_API_URL` - Backend API URL
- `VITE_GEMINI_API_KEY` - Optional, for client-side AI

## Development

### Backend Commands
```bash
npm run dev      # Start with hot reload
npm run build    # Build for production
npm start        # Start production server
npm run migrate  # Run database migrations
npm run seed     # Seed sample data
npm run lint     # Run linter
```

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Testing

### Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# Request OTP
curl -X POST http://localhost:5000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0812345678"}'
```

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL is running
- Verify credentials in `.env`
- Check database exists: `psql -l | grep polacare`

### Port Already in Use
- Change ports in `vite.config.ts` (frontend) or `.env` (backend)
- Or stop conflicting services

### Build Errors
- Clear `node_modules` and reinstall
- Check Node.js version (20+)
- Verify TypeScript version

## Next Steps

1. Configure production environment variables
2. Set up SSL/HTTPS
3. Configure domain and DNS
4. Set up monitoring and logging
5. Review security checklist (see PRODUCTION_CHECKLIST.md)

## Support

For issues, check:
- `DEPLOYMENT.md` for production deployment
- `PRODUCTION_CHECKLIST.md` for production checklist
- `backend/README.md` for backend documentation

