# 🚀 วิธีเริ่ม Servers สำหรับทดสอบ

## ⚡ วิธีง่ายๆ (2 ขั้นตอน)

### 1. เปิด Terminal/PowerShell ใหม่ (2 หน้าต่าง)

### 2. Terminal 1 - Backend
```powershell
cd C:\Users\ADMIN\Downloads\polacare\backend
npm run dev
```

### 3. Terminal 2 - Frontend
```powershell
cd C:\Users\ADMIN\Downloads\polacare
npm run dev
```

## ⏳ รอสักครู่

- **Backend**: รอ 10-20 วินาที (จะเห็น "Server running on port 5000")
- **Frontend**: รอ 15-30 วินาที (จะเห็น "Local: http://localhost:3001")

## ✅ ตรวจสอบ

เปิด browser ไปที่:
- **Frontend**: http://localhost:3001
- **Backend Health**: http://localhost:5000/health

## 🔍 ถ้าเห็น Error

### Backend Error
- **Database error** → ไม่เป็นไร server จะทำงานได้
- **Port 5000 in use** → Kill process: `taskkill /PID <PID> /F`
- **Module not found** → Run: `npm install`

### Frontend Error  
- **Port 3001 in use** → Kill process
- **Cannot connect** → ตรวจสอบว่า backend ทำงานอยู่

## 📝 หมายเหตุ

- Frontend ใช้ port **3001** (ไม่ใช่ 3000)
- Backend ใช้ port **5000**
- ต้องรอให้ compile เสร็จก่อน (เห็น "ready" ใน terminal)

---

**เปิด 2 terminal windows แล้วรันคำสั่งตามด้านบน!** 🎉

