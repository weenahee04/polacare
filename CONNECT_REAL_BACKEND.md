# 🔌 เชื่อมต่อ Frontend กับ Backend จริง

## 📋 สิ่งที่ต้องทำ

### 1. ตรวจสอบ Backend Deploy แล้วหรือยัง

#### ถ้ายังไม่ได้ Deploy Backend:
👉 ไปที่ [RAILWAY_SETUP_NOW.md](./RAILWAY_SETUP_NOW.md) และ deploy backend ก่อน

#### ถ้า Deploy แล้ว:
1. ไปที่ Railway Dashboard → Project → Service
2. คลิก **"Settings"** → **"Domains"**
3. คัดลอก **Public Domain URL** (เช่น: `https://polacare-api-production.up.railway.app`)
4. เก็บ URL นี้ไว้ (จะใช้ในขั้นตอนถัดไป)

---

## 🔧 ขั้นตอนการเชื่อมต่อ

### Step 1: เปลี่ยน Frontend ให้ใช้ AuthContext จริง

#### 1.1 แก้ไข `App.tsx`

```typescript
// เปลี่ยนจาก:
import { AuthProvider, useAuth } from './contexts/AuthContext.mock';

// เป็น:
import { AuthProvider, useAuth } from './contexts/AuthContext';
```

#### 1.2 แก้ไข `hooks/usePatientData.ts`

ตรวจสอบว่าใช้ `useAuth` จาก `AuthContext` จริง (ไม่ใช่ mock)

#### 1.3 แก้ไข `hooks/useApi.ts`

ตรวจสอบว่าใช้ `useAuth` จาก `AuthContext` จริง

#### 1.4 แก้ไข `hooks/useRequireAuth.ts`

ตรวจสอบว่าใช้ `useAuth` จาก `AuthContext` จริง

#### 1.5 แก้ไข `components/LoginScreen.tsx`

ตรวจสอบว่าใช้ `useAuth` จาก `AuthContext` จริง

#### 1.6 แก้ไข `components/RegisterScreen.tsx`

ตรวจสอบว่าใช้ `useAuth` จาก `AuthContext` จริง

#### 1.7 แก้ไข `hooks/index.ts`

```typescript
// เปลี่ยนจาก:
export { useAuth } from './contexts/AuthContext.mock';

// เป็น:
export { useAuth } from './contexts/AuthContext';
```

---

### Step 2: ตั้งค่า Environment Variable ใน Vercel

#### 2.1 ไปที่ Vercel Dashboard

1. เปิด [vercel.com](https://vercel.com)
2. เลือก Project **polacare** (หรือชื่อ project ของคุณ)
3. ไปที่ **Settings** → **Environment Variables**

#### 2.2 เพิ่ม `VITE_API_URL`

1. คลิก **"Add New"**
2. **Key**: `VITE_API_URL`
3. **Value**: `https://[YOUR-RAILWAY-URL]/api/v1`
   - ตัวอย่าง: `https://polacare-api-production.up.railway.app/api/v1`
4. **Environment**: เลือก **Production**, **Preview**, **Development** (ทั้งหมด)
5. คลิก **"Save"**

#### 2.3 Redeploy

1. ไปที่ **Deployments** tab
2. คลิก **"..."** (3 dots) → **"Redeploy"**
3. เลือก **"Use existing Build Cache"** = **OFF**
4. คลิก **"Redeploy"**

---

### Step 3: ตั้งค่า CORS ใน Backend

#### 3.1 ไปที่ Railway Dashboard

1. เปิด Railway → Project → Backend Service
2. ไปที่ **Variables** tab

#### 3.2 เพิ่ม/แก้ไข `CORS_ORIGIN`

1. คลิก **"New Variable"** (ถ้ายังไม่มี)
2. **Key**: `CORS_ORIGIN`
3. **Value**: `https://[YOUR-VERCEL-URL]`
   - ตัวอย่าง: `https://pola-care.vercel.app`
   - หรือถ้ามีหลาย domain: `https://pola-care.vercel.app,https://polacare.vercel.app`
4. คลิก **"Add"**

#### 3.3 Restart Service

Railway จะ restart อัตโนมัติเมื่อเพิ่ม environment variable

---

## ✅ ตรวจสอบการเชื่อมต่อ

### 1. ตรวจสอบ Backend Health

เปิด browser ไปที่:
```
https://[YOUR-RAILWAY-URL]/health
```

ควรเห็น:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": "..."
}
```

### 2. ตรวจสอบ Frontend

1. เปิด Frontend URL (Vercel)
2. เปิด **Developer Tools** (F12)
3. ไปที่ **Console** tab
4. ลองสมัครสมาชิก
5. ตรวจสอบ Network tab ว่ามี request ไปที่ Backend URL หรือไม่

### 3. ทดสอบ Registration

1. เปิด Frontend
2. คลิก **"สมัครสมาชิก"**
3. กรอกข้อมูล
4. ตรวจสอบว่า:
   - ✅ ไม่มี error ใน Console
   - ✅ Network tab แสดง request ไปที่ Backend
   - ✅ ข้อมูลถูกบันทึกใน Database

---

## 🐛 Troubleshooting

### ปัญหา: CORS Error

**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**แก้ไข**:
1. ตรวจสอบ `CORS_ORIGIN` ใน Railway ถูกต้อง
2. ตรวจสอบว่า URL ไม่มี trailing slash (`/`)
3. Restart Railway service

### ปัญหา: 404 Not Found

**Error**: `404 Not Found` เมื่อเรียก API

**แก้ไข**:
1. ตรวจสอบ `VITE_API_URL` ใน Vercel ถูกต้อง
2. ตรวจสอบว่า URL มี `/api/v1` ต่อท้าย
3. ตรวจสอบว่า Backend deploy สำเร็จ

### ปัญหา: Network Error

**Error**: `Failed to fetch` หรือ `Network request failed`

**แก้ไข**:
1. ตรวจสอบว่า Backend service ทำงานอยู่ (Railway Dashboard)
2. ตรวจสอบ Backend health endpoint
3. ตรวจสอบว่า Database เชื่อมต่อได้

### ปัญหา: 401 Unauthorized

**Error**: `401 Unauthorized` เมื่อเรียก API

**แก้ไข**:
1. ตรวจสอบว่า JWT token ถูกส่งไปใน header
2. ตรวจสอบว่า `JWT_SECRET` ใน Railway ถูกต้อง
3. ลอง logout และ login ใหม่

---

## 📝 Checklist

### Backend
- [ ] Backend deploy บน Railway แล้ว
- [ ] Backend health endpoint ทำงาน (`/health`)
- [ ] `CORS_ORIGIN` ตั้งค่าแล้ว (ชี้ไปที่ Vercel URL)
- [ ] `DATABASE_URL` ตั้งค่าแล้ว
- [ ] `JWT_SECRET` ตั้งค่าแล้ว

### Frontend
- [ ] เปลี่ยน `App.tsx` ให้ใช้ `AuthContext` จริง
- [ ] เปลี่ยนทุกไฟล์ที่ใช้ `AuthContext.mock` → `AuthContext`
- [ ] `VITE_API_URL` ตั้งค่าใน Vercel แล้ว
- [ ] Redeploy Frontend แล้ว

### Testing
- [ ] Backend health check ผ่าน
- [ ] Frontend โหลดได้
- [ ] Registration ทำงานได้
- [ ] Login ทำงานได้
- [ ] ข้อมูลถูกบันทึกใน Database

---

## 🎯 สรุป

1. ✅ Deploy Backend บน Railway
2. ✅ เปลี่ยน Frontend ให้ใช้ `AuthContext` จริง
3. ✅ ตั้งค่า `VITE_API_URL` ใน Vercel
4. ✅ ตั้งค่า `CORS_ORIGIN` ใน Railway
5. ✅ Redeploy ทั้ง Frontend และ Backend
6. ✅ ทดสอบ Registration และ Login

---

**พร้อมแล้ว!** 🚀

ลองทำตามขั้นตอนแล้วบอกผลได้ครับ!

