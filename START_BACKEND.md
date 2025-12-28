# 🚀 วิธีเปิด Backend Server

## วิธีที่ 1: ใช้ Script (แนะนำ)

### Windows
```powershell
.\start-backend.ps1
```

### Mac/Linux
```bash
chmod +x start-backend.sh
./start-backend.sh
```

## วิธีที่ 2: Manual

```bash
cd backend
npm install          # ถ้ายังไม่ได้ติดตั้ง dependencies
npm run dev          # Start development server
```

## ✅ ตรวจสอบว่า Server ทำงาน

เปิด browser ไปที่:
- **Health Check**: http://localhost:5000/health
- **API Base**: http://localhost:5000/api/v1

## 📝 Test API

### Health Check
```bash
curl http://localhost:5000/health
```

### Request OTP
```bash
curl -X POST http://localhost:5000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0812345678"}'
```

## 🔧 Troubleshooting

### Port 5000 ถูกใช้งาน
```powershell
# หา process
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Database Connection Error
- ตรวจสอบว่า PostgreSQL ทำงานอยู่
- ตรวจสอบ `.env` file
- Run migration: `npm run migrate`

### Build Errors
```bash
cd backend
npm install
npm run build
```

---

**Backend พร้อมทดสอบ! 🎉**

