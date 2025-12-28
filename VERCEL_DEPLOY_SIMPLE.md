# 🚀 Deploy Frontend บน Vercel (ง่ายๆ)

## ✅ ระบบสมัครสมาชิกพร้อมแล้ว!

- ✅ Backend API: `/api/v1/auth/register`
- ✅ Frontend: `RegisterScreen.tsx`
- ✅ ใช้งานใน App แล้ว

---

## 📋 ขั้นตอน Deploy บน Vercel

### 1️⃣ สร้าง Vercel Account

1. ไปที่ [vercel.com](https://vercel.com)
2. คลิก **"Sign Up"** หรือ **"Login"**
3. เลือก **"Continue with GitHub"**
4. Authorize Vercel ให้เข้าถึง repositories

---

### 2️⃣ Import Project

1. หลังจาก login → คลิก **"Add New..."** → **"Project"**
2. เลือก repository: `weenahee04/polacare`
3. Vercel จะ detect อัตโนมัติว่าเป็น **Vite** project

---

### 3️⃣ ตั้งค่า Build Settings

Vercel จะ auto-detect แต่ตรวจสอบให้แน่ใจ:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (root) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

---

### 4️⃣ ตั้งค่า Environment Variables

**สำคัญ!** ต้องตั้งค่า `VITE_API_URL`:

1. ในหน้า **"Configure Project"** → คลิก **"Environment Variables"**
2. คลิก **"+ Add"**
3. ตั้งค่า:

   **Key**: `VITE_API_URL`
   
   **Value**: 
   ```
   https://polacare-api-production.up.railway.app/api/v1
   ```
   
   ⚠️ **ถ้ายังไม่มี Backend URL** → ใช้ mock URL ชั่วคราว:
   ```
   http://localhost:5000/api/v1
   ```
   (จะแก้ทีหลังเมื่อ Backend deploy แล้ว)

4. เลือก **"Production"**, **"Preview"**, และ **"Development"**
5. คลิก **"Save"**

---

### 5️⃣ Deploy!

1. คลิก **"Deploy"** (มุมขวาบน)
2. รอ build (~1-2 นาที)
3. ✅ **เสร็จแล้ว!** ได้ Frontend URL เช่น:
   ```
   https://polacare.vercel.app
   ```

---

## 🧪 ทดสอบ

### 1. เปิด Frontend URL

เปิด browser → ไปที่ Frontend URL ที่ Vercel ให้

### 2. ทดสอบสมัครสมาชิก

1. คลิก **"สมัครสมาชิก"** หรือ **"Register"**
2. กรอกข้อมูล:
   - ชื่อ-นามสกุล
   - เบอร์โทรศัพท์
   - รหัสผ่าน
   - เพศ
   - วันเกิด
   - น้ำหนัก
   - ส่วนสูง
3. คลิก **"สมัครสมาชิก"**

### 3. ตรวจสอบ Console

เปิด Browser DevTools → Console tab → ดูว่ามี errors หรือไม่

---

## ⚠️ ถ้า Backend ยังไม่ได้ Deploy

### ใช้ Mock API ชั่วคราว

1. ใน Vercel → Environment Variables
2. ตั้งค่า `VITE_API_URL` = `http://localhost:5000/api/v1`
3. Frontend จะทำงานได้ แต่ API calls จะ fail
4. **แก้ไข**: เมื่อ Backend deploy แล้ว → อัพเดท `VITE_API_URL` เป็น Backend URL จริง

---

## 🔄 อัพเดท Environment Variables

### หลังจาก Backend Deploy แล้ว:

1. ไปที่ Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. หา `VITE_API_URL`
3. คลิก **Edit**
4. เปลี่ยนเป็น Backend URL จาก Railway:
   ```
   https://polacare-api-production.up.railway.app/api/v1
   ```
5. คลิก **Save**
6. Vercel จะ redeploy อัตโนมัติ

---

## 📝 Checklist

- [ ] Vercel account สร้างแล้ว
- [ ] Project import แล้ว
- [ ] Build settings ถูกต้อง
- [ ] `VITE_API_URL` ตั้งค่าแล้ว
- [ ] Deploy สำเร็จ
- [ ] Frontend URL ได้แล้ว
- [ ] ทดสอบสมัครสมาชิกได้

---

## 🎉 เสร็จแล้ว!

ตอนนี้ Frontend พร้อมใช้งานแล้ว!

**Next Steps:**
1. Deploy Backend บน Railway (ถ้ายังไม่ได้)
2. อัพเดท `VITE_API_URL` ใน Vercel ให้ชี้ไปที่ Backend URL
3. อัพเดท `CORS_ORIGIN` ใน Railway ให้ตรงกับ Frontend URL

---

## 🆘 Troubleshooting

### Build Failed

- ตรวจสอบว่า `package.json` มี `build` script
- ดู Logs ใน Vercel Dashboard → Deployments

### API Calls Failed

- ตรวจสอบ `VITE_API_URL` ถูกต้อง
- ตรวจสอบว่า Backend deploy แล้ว
- ดู Browser Console → Network tab

### Frontend ไม่โหลด

- ตรวจสอบ Build Logs
- ดูว่า `dist` folder ถูกสร้างแล้ว
- ตรวจสอบ `vercel.json` configuration

