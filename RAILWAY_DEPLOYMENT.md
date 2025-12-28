# 🚂 Railway Deployment Guide - POLACARE

## 📋 สารบัญ
1. [Prerequisites](#prerequisites)
2. [Step 1: สร้าง Account และ Project](#step-1-สร้าง-account-และ-project)
3. [Step 2: สร้าง PostgreSQL Database](#step-2-สร้าง-postgresql-database)
4. [Step 3: Deploy Backend](#step-3-deploy-backend)
5. [Step 4: ตั้งค่า Environment Variables](#step-4-ตั้งค่า-environment-variables)
6. [Step 5: เชื่อม Database กับ Backend](#step-5-เชื่อม-database-กับ-backend)
7. [Step 6: ตรวจสอบ Deployment](#step-6-ตรวจสอบ-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

✅ สิ่งที่ต้องมี:
- GitHub repository: `https://github.com/weenahee04/polacare`
- GitHub account
- Railway account (จะสร้างในขั้นตอนถัดไป)

---

## Step 1: สร้าง Account และ Project

### 1.1 สร้าง Railway Account

1. ไปที่ [railway.app](https://railway.app)
2. คลิก **"Start a New Project"** หรือ **"Login"**
3. เลือก **"Login with GitHub"**
4. Authorize Railway ให้เข้าถึง GitHub repositories

### 1.2 สร้าง Project ใหม่

1. หลังจาก login แล้ว → คลิก **"New Project"**
2. เลือก **"Deploy from GitHub repo"**
3. Railway จะแสดง list ของ repositories
4. **เลือก** `weenahee04/polacare`
5. Railway จะสร้าง Project ให้อัตโนมัติ

✅ **ตอนนี้คุณจะมี Project เปล่าๆ อยู่แล้ว**

---

## Step 2: สร้าง PostgreSQL Database

### 2.1 เพิ่ม Database Service

1. ใน Project → คลิก **"+ New"** (มุมขวาบน)
2. เลือก **"Database"**
3. เลือก **"Add PostgreSQL"**

### 2.2 ตั้งชื่อ Database (Optional)

- Railway จะตั้งชื่อให้อัตโนมัติ เช่น `Postgres`
- หรือเปลี่ยนชื่อเป็น `polacare-db` ก็ได้

### 2.3 รอ Database สร้างเสร็จ

- Railway จะสร้าง PostgreSQL database ให้อัตโนมัติ
- รอประมาณ 1-2 นาที
- Status จะเป็น **"Active"** เมื่อพร้อม

### 2.4 ดู Connection String

1. คลิกที่ Database service (Postgres)
2. ไปที่ **"Variables"** tab
3. คุณจะเห็น `DATABASE_URL` ที่ Railway สร้างให้อัตโนมัติ
4. **Copy ค่า `DATABASE_URL` ไว้** (จะใช้ในขั้นตอนถัดไป)

📝 **ตัวอย่าง `DATABASE_URL`:**
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

✅ **Database พร้อมแล้ว!**

---

## Step 3: Deploy Backend

### 3.1 เพิ่ม Backend Service

1. ใน Project → คลิก **"+ New"**
2. เลือก **"GitHub Repo"**
3. เลือก repository `weenahee04/polacare`

### 3.2 ตั้งค่า Service

Railway จะ detect อัตโนมัติว่าเป็น Node.js project แต่ต้องตั้งค่าเพิ่มเติม:

1. คลิกที่ Service ที่เพิ่งสร้าง
2. ไปที่ **"Settings"** tab
3. ตั้งค่าดังนี้:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install --legacy-peer-deps && npx prisma@5.7.1 generate && npm run build` |
| **Start Command** | `npx prisma@5.7.1 migrate deploy && npm start` |

⚠️ **สำคัญ**: ใช้ `prisma@5.7.1` เพื่อ lock version (Railway อาจ install Prisma 7 ที่ไม่ compatible)

### 3.3 Save และ Deploy

1. คลิก **"Save"**
2. Railway จะเริ่ม build และ deploy อัตโนมัติ
3. รอประมาณ 3-5 นาที

⚠️ **ตอนนี้ยังไม่มี `DATABASE_URL` ดังนั้น deploy อาจ fail - ไม่เป็นไร จะแก้ในขั้นตอนถัดไป**

---

## Step 4: ตั้งค่า Environment Variables

### 4.1 เปิด Variables Tab

1. คลิกที่ Backend service
2. ไปที่ **"Variables"** tab

### 4.2 เพิ่ม Environment Variables

คลิก **"+ New Variable"** แล้วเพิ่มทีละตัว:

#### 4.2.1 Required Variables

```bash
# Server
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Authentication
JWT_SECRET=<generate-64-char-string>
JWT_EXPIRES_IN=7d

# CORS (จะอัพเดทหลังจาก deploy frontend)
CORS_ORIGIN=https://polacare.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### 4.2.2 Generate JWT_SECRET

**วิธีที่ 1: ใช้ Railway Generate**
- คลิก **"Generate"** ข้าง `JWT_SECRET` (ถ้ามี)
- หรือใช้วิธีที่ 2

**วิธีที่ 2: Generate เอง**
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# หรือใช้ online tool: https://randomkeygen.com/
```

#### 4.2.3 Optional Variables (ถ้ามี)

```bash
# Twilio (สำหรับ OTP SMS)
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
TWILIO_PHONE_NUMBER=<your-twilio-phone>

# Google Gemini (สำหรับ AI features)
GEMINI_API_KEY=<your-gemini-key>

# Storage
STORAGE_PROVIDER=local
UPLOAD_PATH=./uploads
```

✅ **Save ทุกตัวแปร**

---

## Step 5: เชื่อม Database กับ Backend

### 5.1 Reference Database URL

1. ใน Backend service → **"Variables"** tab
2. คลิก **"+ New Variable"**
3. **Key**: `DATABASE_URL`
4. คลิก **"Reference Variable"** (หรือ **"Connect"**)
5. เลือก **Database service** (Postgres)
6. เลือก variable: `DATABASE_URL`
7. คลิก **"Add"**

✅ **Railway จะ inject `DATABASE_URL` จาก Database service อัตโนมัติ**

### 5.2 Redeploy

1. Railway จะ redeploy อัตโนมัติเมื่อมีการเปลี่ยนแปลง variables
2. หรือคลิก **"Deploy"** → **"Redeploy"** (ถ้าไม่ auto-deploy)
3. รอ 2-3 นาที

---

## Step 6: ตรวจสอบ Deployment

### 6.1 ดู Logs

1. ใน Backend service → **"Deployments"** tab
2. คลิก deployment ล่าสุด
3. ดู **"Logs"** tab

✅ **ควรเห็น:**
```
✔ Prisma migrations applied
🚀 Server running on port 5000
Database connected successfully
```

### 6.2 ดู Service URL

1. ใน Backend service → **"Settings"** tab
2. หา **"Domains"** section
3. Railway จะสร้าง URL ให้อัตโนมัติ เช่น:
   ```
   https://polacare-api-production.up.railway.app
   ```

### 6.3 ทดสอบ API

เปิด browser หรือใช้ curl:

```bash
# Health check
curl https://polacare-api-production.up.railway.app/health

# ควรได้ response:
# {"status":"ok","timestamp":"..."}
```

### 6.4 ตั้ง Custom Domain (Optional)

1. ใน **"Settings"** → **"Domains"**
2. คลิก **"Generate Domain"** (ถ้ายังไม่มี)
3. หรือ **"Custom Domain"** → ใส่ domain ของคุณ

---

## Troubleshooting

### ❌ Build Failed

**ปัญหา**: Build command ไม่ทำงาน

**แก้ไข**:
1. ตรวจสอบ **Root Directory** = `backend`
2. ตรวจสอบ **Build Command** = `npm install && npx prisma generate && npm run build`
3. ดู Logs → หา error message

---

### ❌ Database Connection Failed

**ปัญหา**: `Error: P1001: Can't reach database server`

**แก้ไข**:
1. ตรวจสอบว่า Database service **Active** อยู่
2. ตรวจสอบว่า `DATABASE_URL` ถูก reference จาก Database service
3. ตรวจสอบว่า Backend service และ Database service อยู่ใน **Project เดียวกัน**

---

### ❌ Prisma Migration Failed

**ปัญหา**: `Error: Migration failed`

**แก้ไข**:
1. ตรวจสอบ `DATABASE_URL` ถูกต้อง
2. ตรวจสอบว่า Prisma schema ถูกต้อง
3. ลอง run migration ใหม่:
   - ใน Backend service → **"Deployments"** → **"Redeploy"**

---

### ❌ Port Error

**ปัญหา**: `Error: Port already in use`

**แก้ไข**:
1. ตรวจสอบ `PORT=5000` ใน Environment Variables
2. Railway จะ inject `PORT` อัตโนมัติ - **อย่า override** (หรือใช้ `PORT` ที่ Railway ให้)

---

### ❌ CORS Error

**ปัญหา**: Frontend ไม่สามารถเรียก API ได้

**แก้ไข**:
1. ตรวจสอบ `CORS_ORIGIN` ใน Environment Variables
2. ตั้งค่าให้ตรงกับ Frontend URL:
   ```
   CORS_ORIGIN=https://polacare.vercel.app
   ```
3. Redeploy Backend

---

## 📝 Checklist

- [ ] Railway account สร้างแล้ว
- [ ] Project สร้างแล้ว
- [ ] PostgreSQL Database สร้างแล้ว
- [ ] Backend service deploy แล้ว
- [ ] Environment Variables ตั้งค่าแล้ว (NODE_ENV, PORT, JWT_SECRET, CORS_ORIGIN)
- [ ] DATABASE_URL reference จาก Database service แล้ว
- [ ] Deploy สำเร็จ (ดู Logs)
- [ ] Health check ผ่าน (`/health` endpoint)
- [ ] API URL ได้แล้ว

---

## 🎉 เสร็จแล้ว!

ตอนนี้ Backend พร้อมใช้งานแล้ว:

**Backend URL**: `https://polacare-api-production.up.railway.app`

**Next Steps**:
1. Deploy Frontend บน Vercel (ตาม `DEPLOYMENT.md`)
2. อัพเดท `CORS_ORIGIN` ใน Railway ให้ตรงกับ Vercel URL
3. อัพเดท Frontend `VITE_API_URL` ให้ชี้ไปที่ Railway URL

---

## 💡 Tips

1. **Auto-deploy**: Railway จะ auto-deploy เมื่อ push code ขึ้น GitHub
2. **Logs**: ดู Logs ได้ใน **"Deployments"** tab
3. **Variables**: เปลี่ยน Variables แล้ว Railway จะ redeploy อัตโนมัติ
4. **Free Tier**: Railway free tier ดีมาก - ไม่มี spin-down
5. **Database Backup**: Railway จะ backup database อัตโนมัติ

---

## 📚 Resources

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [POLACARE Deployment Guide](./DEPLOYMENT.md)

