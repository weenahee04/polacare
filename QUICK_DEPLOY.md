# 🚀 Quick Deployment Guide - POLACARE

## วิธีที่ 1: Docker Compose (แนะนำ - ง่ายที่สุด)

### ขั้นตอน

1. **เตรียมไฟล์ Environment**
```bash
# Copy environment files
cp backend/.env.example backend/.env
```

2. **แก้ไข backend/.env** (ขั้นต่ำที่ต้องมี):
```env
NODE_ENV=production
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=polacare
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-key-change-this
CORS_ORIGIN=http://localhost:3000
GEMINI_API_KEY=your-gemini-key
```

3. **Deploy**
```bash
# Windows (PowerShell)
docker-compose up -d

# หรือใช้ script
chmod +x deploy.sh
./deploy.sh

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

4. **Initialize Database**
```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed  # Optional: sample data
```

5. **เข้าถึงแอป**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api/v1
- Health: http://localhost:5000/health

### ดู Logs
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### หยุด Services
```bash
docker-compose down
```

---

## วิธีที่ 2: Deploy บน Cloud (Production)

### Option A: Railway.app (แนะนำ - ง่ายมาก)

1. **ติดตั้ง Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

2. **Deploy Backend**
```bash
cd backend
railway init
railway up
```

3. **Setup Environment Variables** ใน Railway Dashboard:
   - `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `CORS_ORIGIN`

4. **Deploy Frontend**
```bash
cd ..  # กลับไป root
railway init
railway up
```

### Option B: Render.com

1. **สร้าง PostgreSQL Database** ใน Render Dashboard
2. **Deploy Backend**:
   - New → Web Service
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables: ตั้งค่าตาม `.env.example`

3. **Deploy Frontend**:
   - New → Static Site
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### Option C: DigitalOcean App Platform

1. **สร้าง App** ใน DigitalOcean Dashboard
2. **Add Database** (PostgreSQL)
3. **Add Backend Component**:
   - Source: GitHub
   - Build Command: `cd backend && npm install && npm run build`
   - Run Command: `cd backend && npm start`
4. **Add Frontend Component**:
   - Source: GitHub
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`

### Option D: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel):**
```bash
npm install -g vercel
vercel
```

**Backend (Railway/Render):**
ตาม Option A หรือ B ด้านบน

---

## วิธีที่ 3: Manual Deployment (VPS)

### Requirements
- Ubuntu 20.04+ หรือ CentOS 7+
- Node.js 20+
- PostgreSQL 15+
- Nginx

### ขั้นตอน

1. **Setup Server**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

2. **Setup Database**
```bash
sudo -u postgres psql
CREATE DATABASE polacare;
CREATE USER polacare_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE polacare TO polacare_user;
\q
```

3. **Deploy Backend**
```bash
cd /var/www
git clone <your-repo> polacare
cd polacare/backend
npm install
cp .env.example .env
# แก้ไข .env
npm run build
npm run migrate
pm2 start ecosystem.config.js --env production
pm2 save
```

4. **Deploy Frontend**
```bash
cd /var/www/polacare
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

5. **Setup Nginx**
```nginx
# /etc/nginx/sites-available/polacare
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/polacare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

6. **Setup SSL (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables Checklist

### Backend (.env)
```env
# Required
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_NAME=polacare
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-very-secure-secret-key
CORS_ORIGIN=https://your-domain.com

# Optional but Recommended
GEMINI_API_KEY=your-key
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
LOG_LEVEL=info
```

### Frontend (.env.local)
```env
VITE_API_URL=https://api.your-domain.com/api/v1
```

---

## Quick Test Commands

### Test Backend
```bash
# Health check
curl http://localhost:5000/health

# Test API
curl http://localhost:5000/api/v1/articles
```

### Test Frontend
เปิด browser ไปที่ http://localhost:3000

---

## Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -d polacare
```

### Port Already in Use
```bash
# Find process using port
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>
```

### Docker Issues
```bash
# Restart Docker
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs backend
```

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] SSL/HTTPS enabled
- [ ] Domain configured
- [ ] CORS origins set correctly
- [ ] JWT secret changed
- [ ] Database password changed
- [ ] Logs directory has write permissions
- [ ] Backup script configured
- [ ] PM2 or process manager running
- [ ] Firewall configured
- [ ] Monitoring setup

---

## Support

หากมีปัญหา:
1. ตรวจสอบ logs: `docker-compose logs` หรือ `pm2 logs`
2. ตรวจสอบ health endpoint: `/health`
3. ตรวจสอบ environment variables
4. ตรวจสอบ database connection

---

**เลือกวิธีที่เหมาะสมกับคุณและเริ่ม deploy ได้เลย! 🚀**

