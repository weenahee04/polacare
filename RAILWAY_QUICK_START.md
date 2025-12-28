# 🚂 Railway Quick Start (5 นาที)

## ⚡ ขั้นตอนสั้นๆ

### 1️⃣ สร้าง Account
- ไปที่ [railway.app](https://railway.app)
- Login with GitHub

### 2️⃣ สร้าง Project
- New Project → Deploy from GitHub repo
- เลือก `weenahee04/polacare`

### 3️⃣ สร้าง Database
- ใน Project → "+ New" → "Database" → "Add PostgreSQL"
- Copy `DATABASE_URL` จาก Database service → Variables tab

### 4️⃣ Deploy Backend
- ใน Project → "+ New" → "GitHub Repo" → เลือก `polacare`
- Settings → Root Directory: `backend`
- Settings → Build Command: `npm install --legacy-peer-deps && npx prisma@5.7.1 generate && npm run build`
- Settings → Start Command: `npx prisma@5.7.1 migrate deploy && npm start`

⚠️ **สำคัญ**: ใช้ `prisma@5.7.1` เพื่อ lock version

### 5️⃣ ตั้งค่า Variables
ใน Backend service → Variables tab → เพิ่ม:

```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate-64-char-string>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://polacare.vercel.app
```

### 6️⃣ เชื่อม Database
- Backend → Variables → "+ New Variable"
- Key: `DATABASE_URL`
- คลิก "Reference Variable" → เลือก Database service → `DATABASE_URL`

### 7️⃣ Done! 🎉
- Railway จะ deploy อัตโนมัติ
- ได้ URL: `https://polacare-api-production.up.railway.app`

---

## 📝 Generate JWT_SECRET

**PowerShell:**
```powershell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**หรือใช้**: https://randomkeygen.com/

---

## 🔍 ตรวจสอบ

```bash
curl https://polacare-api-production.up.railway.app/health
```

ควรได้: `{"status":"ok",...}`

---

## 📚 ดูคู่มือเต็ม: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

