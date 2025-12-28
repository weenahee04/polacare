# 🧪 ทดสอบ Local Server

## ✅ Servers กำลังเริ่มทำงาน

### 🌐 Frontend
- **URL**: http://localhost:3000
- **Status**: กำลัง compile และ start...

### 📡 Backend  
- **URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Base**: http://localhost:5000/api/v1
- **Status**: กำลัง compile และ start...

## ⏳ รอสักครู่...

Servers กำลัง compile TypeScript และเริ่มทำงาน อาจใช้เวลา:
- **Backend**: 10-20 วินาที
- **Frontend**: 15-30 วินาที

## 🔍 ตรวจสอบ Status

### วิธีที่ 1: เปิด Browser
1. **Frontend**: http://localhost:3000
2. **Backend Health**: http://localhost:5000/health

### วิธีที่ 2: ใช้ PowerShell
```powershell
# Test Backend
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing

# Test Frontend
Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
```

## 📝 วิธีเริ่ม Server ใหม่

### ใช้ Script (แนะนำ)
```powershell
.\start-local.ps1
```

### Manual
```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 🧪 Test Accounts

หลังจาก seed database:
```bash
cd backend
npm run seed
```

**Sample Accounts:**
- **Admin**: `0800000001` / OTP: `123456` (check console)
- **Doctor**: `0800000002` / OTP: `123456` (check console)
- **Patient**: `0812345678` / OTP: `123456` (check console)

## 🛑 หยุด Servers

กด `Ctrl+C` ใน terminal windows ที่รัน servers

หรือ:
```powershell
# หา process
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Kill (replace PID)
Stop-Process -Id <PID>
```

## 🔧 Troubleshooting

### Port ถูกใช้งาน
```powershell
# หา process
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill
taskkill /PID <PID> /F
```

### Backend ไม่ทำงาน
- ตรวจสอบ terminal window ที่รัน backend
- ดู error messages
- ตรวจสอบ `.env` file
- ตรวจสอบ database connection (ไม่จำเป็นต้องมี database)

### Frontend ไม่ทำงาน
- ตรวจสอบ terminal window ที่รัน frontend
- ตรวจสอบ `.env.local` file
- ตรวจสอบว่า backend ทำงานอยู่

### Database Error
- **ไม่เป็นไร!** Backend จะทำงานได้แม้ไม่มี database
- แต่บาง features จะไม่ทำงาน
- ถ้าต้องการ database: ต้องมี PostgreSQL running

---

**รอสักครู่แล้วเปิด browser ไปที่ http://localhost:3000** 🎉

