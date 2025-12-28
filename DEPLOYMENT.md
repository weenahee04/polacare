# POLACARE Deployment Guide

## Deployment Stack (FREE Tier)

| Component | Service | Cost | URL |
|-----------|---------|------|-----|
| Backend API | Render | Free | render.com |
| Frontend | Vercel | Free | vercel.com |
| Database | Supabase | Free | supabase.com |
| Auth/Storage | Supabase | Free | (included) |

---

## Prerequisites

1. GitHub repository with the code
2. Accounts on:
   - [Render](https://render.com) (backend)
   - [Vercel](https://vercel.com) (frontend)
   - [Supabase](https://supabase.com) (database)

---

## Step 1: Supabase Setup (Database)

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) → Sign in
2. Click "New Project"
3. Settings:
   - **Name**: `polacare`
   - **Database Password**: Generate strong password (SAVE THIS!)
   - **Region**: Singapore (closest to Thailand)
   - **Plan**: Free

### 1.2 Get Connection String

1. Go to Project Settings → Database
2. Copy the "Connection string (URI)"
3. Replace `[YOUR-PASSWORD]` with your database password

```
postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 1.3 Configure Database

The backend will run migrations automatically on deploy. For initial setup:

```bash
# Local setup (optional)
cd backend
export DATABASE_URL="your-supabase-connection-string"
npx prisma migrate deploy
npx prisma db seed
```

---

## Step 2: Render Setup (Backend)

### 2.1 Connect Repository

1. Go to [render.com](https://render.com) → Sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

### 2.2 Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `polacare-api` |
| **Region** | Singapore |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm ci && npx prisma generate && npm run build` |
| **Start Command** | `npx prisma migrate deploy && npm start` |
| **Plan** | Free |

### 2.3 Environment Variables

Add these in Render Dashboard → Environment:

```bash
# Required
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
JWT_SECRET=<click-generate-or-paste-64-char-string>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://polacare.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Optional (for OTP)
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
TWILIO_PHONE_NUMBER=<your-twilio-phone>

# Optional (for AI features)
GEMINI_API_KEY=<your-gemini-key>

# Optional (for S3 storage)
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_KEY=<your-supabase-anon-key>
```

### 2.4 Deploy

1. Click "Create Web Service"
2. Wait for build + deploy (~3-5 minutes)
3. Note the URL: `https://polacare-api.onrender.com`

### 2.5 Verify Backend

```bash
curl https://polacare-api.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-12-28T..."
}
```

---

## Step 3: Vercel Setup (Frontend)

### 3.1 Connect Repository

1. Go to [vercel.com](https://vercel.com) → Sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository

### 3.2 Configure Project

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (root) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm ci` |

### 3.3 Environment Variables

Add in Vercel Dashboard → Settings → Environment Variables:

```bash
VITE_API_URL=https://polacare-api.onrender.com/api/v1
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build (~1-2 minutes)
3. Note the URL: `https://polacare.vercel.app`

### 3.5 Update CORS

Go back to Render and update `CORS_ORIGIN`:

```
CORS_ORIGIN=https://polacare.vercel.app
```

Redeploy the backend (Manual Deploy or push a commit).

---

## Step 4: Verify Deployment

### 4.1 Health Check

```bash
# Backend
curl https://polacare-api.onrender.com/health

# Frontend
curl https://polacare.vercel.app
```

### 4.2 Test Login Flow

1. Open `https://polacare.vercel.app`
2. Try requesting OTP (if Twilio configured)
3. Register a test account
4. Verify data appears in Supabase dashboard

---

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | ✅ | Set to `production` |
| `PORT` | ✅ | `5000` |
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string |
| `JWT_SECRET` | ✅ | 64+ character random string |
| `JWT_EXPIRES_IN` | ✅ | Token expiry (e.g., `7d`) |
| `CORS_ORIGIN` | ✅ | Vercel domain |
| `TWILIO_ACCOUNT_SID` | ❌ | For OTP SMS |
| `TWILIO_AUTH_TOKEN` | ❌ | For OTP SMS |
| `TWILIO_PHONE_NUMBER` | ❌ | For OTP SMS |
| `GEMINI_API_KEY` | ❌ | For AI features |
| `SUPABASE_URL` | ❌ | For file storage |
| `SUPABASE_KEY` | ❌ | For file storage |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API URL |

---

## Free Tier Limitations

### Render (Free)

- ⚠️ **Spins down after 15 min inactivity**
- First request after spin-down: ~30 seconds
- 750 hours/month (enough for 1 service 24/7)
- Custom domain: ✅ Supported

**Workaround for cold starts:**
- Use a cron job to ping `/health` every 14 minutes
- Or upgrade to paid plan ($7/month)

### Vercel (Hobby)

- 100 GB bandwidth/month
- Unlimited static sites
- Custom domain: ✅ Supported
- No limitations for this project

### Supabase (Free)

- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users
- Pauses after 1 week inactivity (re-activates on request)

---

## Custom Domain Setup

### Backend (Render)

1. Go to Service → Settings → Custom Domain
2. Add domain: `api.yourdomain.com`
3. Update DNS:
   ```
   CNAME api → polacare-api.onrender.com
   ```
4. Update Vercel's `VITE_API_URL`

### Frontend (Vercel)

1. Go to Project → Settings → Domains
2. Add domain: `app.yourdomain.com`
3. Update DNS:
   ```
   CNAME app → cname.vercel-dns.com
   ```
4. Update Render's `CORS_ORIGIN`

---

## Monitoring & Logs

### Render Logs

```bash
# View in dashboard
Render → Service → Logs

# Or via CLI
render logs polacare-api
```

### Vercel Logs

```bash
# View in dashboard
Vercel → Project → Logs
```

### Supabase Logs

```bash
# View in dashboard
Supabase → Project → Logs → Postgres
```

---

## Backup & Recovery

### Database Backup (Supabase)

1. **Automatic Backups**: Supabase creates daily backups (retained 7 days on free)

2. **Manual Backup**:
   ```bash
   pg_dump "postgresql://..." > backup_$(date +%Y%m%d).sql
   ```

3. **Export via Dashboard**:
   - Supabase → Database → Backups → Download

### Restore

```bash
psql "postgresql://..." < backup_20241228.sql
```

---

## Troubleshooting

### Backend Won't Start

1. Check Render logs for errors
2. Verify `DATABASE_URL` is correct
3. Ensure Prisma migrations are applied:
   ```bash
   npx prisma migrate status
   ```

### CORS Errors

1. Verify `CORS_ORIGIN` matches Vercel URL exactly
2. Include `https://` prefix
3. Redeploy backend after changing

### Database Connection Failed

1. Check Supabase project status (not paused)
2. Verify connection string format
3. Check if IP is blocked (Supabase → Database → Connection Pooling)

### Frontend Build Failed

1. Check Vercel build logs
2. Verify `VITE_API_URL` is set
3. Ensure no TypeScript errors locally first

---

## Security Checklist for Production

- [ ] Strong `JWT_SECRET` (64+ chars)
- [ ] `NODE_ENV=production`
- [ ] HTTPS enforced (automatic on Render/Vercel)
- [ ] CORS limited to Vercel domain only
- [ ] Rate limiting configured
- [ ] No secrets in git
- [ ] Supabase Row Level Security enabled
- [ ] Database password is strong

---

## Deployment Commands Quick Reference

```bash
# Trigger backend redeploy
git push origin main

# Or manually in Render dashboard
# Service → Manual Deploy → Deploy latest commit

# Check backend status
curl https://polacare-api.onrender.com/health

# Check database connection
curl https://polacare-api.onrender.com/health | jq .database
```

---

## Cost Projection

| Usage Level | Render | Vercel | Supabase | Total |
|-------------|--------|--------|----------|-------|
| MVP/Testing | $0 | $0 | $0 | **$0** |
| Small (100 users) | $0 | $0 | $0 | **$0** |
| Medium (1000 users) | $7* | $0 | $0 | **$7** |
| Large (10000 users) | $25* | $0 | $25* | **$50** |

*Estimated based on usage patterns

---

## Next Steps After Deployment

1. ✅ Verify health check works
2. ✅ Test login/registration flow
3. ✅ Check data appears in Supabase
4. ⬜ Configure custom domain (optional)
5. ⬜ Set up monitoring alerts
6. ⬜ Configure Twilio for real OTP
7. ⬜ Enable Supabase RLS policies
