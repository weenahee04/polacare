# 🚀 เริ่ม Local Server สำหรับทดสอบ

## ✅ Servers กำลังเริ่มทำงาน

### Frontend
- **URL**: http://localhost:3000
- **Status**: กำลังเริ่ม...

### Backend
- **URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Base**: http://localhost:5000/api/v1
- **Status**: กำลังเริ่ม...

## ⏳ รอสักครู่...

Servers กำลัง compile และเริ่มทำงาน อาจใช้เวลา 10-30 วินาที

## 🔍 ตรวจสอบ Status

### ตรวจสอบ Backend
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing
```

### ตรวจสอบ Frontend
เปิด browser ไปที่: http://localhost:3000

## 📝 Test Accounts (หลังจาก seed database)

```bash
cd backend
npm run seed
```

**Sample Accounts:**
- **Admin**: `+66800000001` / `admin123`
- **Doctor**: `+66800000002` / `doctor123`
- **Patient**: `+66812345678` / `password123`

## 🛑 หยุด Servers

กด `Ctrl+C` ใน terminal windows ที่รัน servers

หรือ:
```powershell
# หา process
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Kill process (replace PID)
Stop-Process -Id <PID>
```

## 🔧 Troubleshooting

### Port ถูกใช้งาน
```powershell
# หา process ที่ใช้ port
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Database Error
- Backend จะทำงานได้แม้ไม่มี database
- แต่บาง features จะไม่ทำงาน
- ถ้าต้องการ database: ต้องมี PostgreSQL running

### Frontend ไม่โหลด
- ตรวจสอบว่า backend ทำงานอยู่
- ตรวจสอบ `.env.local` มี `VITE_API_URL` ถูกต้อง

---

**Servers กำลังเริ่มทำงาน! รอสักครู่แล้วเปิด browser ไปที่ http://localhost:3000** 🎉

