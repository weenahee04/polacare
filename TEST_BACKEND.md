# 🧪 ทดสอบ Backend API

## ✅ Backend Server Status

Backend server กำลังรันอยู่ที่: **http://localhost:5000**

## 🔗 API Endpoints

### Health Check
```bash
GET http://localhost:5000/health
```

### Authentication
```bash
# Request OTP
POST http://localhost:5000/api/v1/auth/otp/request
Content-Type: application/json

{
  "phoneNumber": "0812345678"
}

# Verify OTP & Login
POST http://localhost:5000/api/v1/auth/otp/verify
Content-Type: application/json

{
  "phoneNumber": "0812345678",
  "code": "123456"
}
```

### Admin Endpoints (ต้อง login เป็น admin ก่อน)
```bash
# Get Dashboard Stats
GET http://localhost:5000/api/v1/admin/dashboard/stats
Authorization: Bearer <admin-token>

# Get All Users
GET http://localhost:5000/api/v1/admin/users
Authorization: Bearer <admin-token>

# Create Doctor
POST http://localhost:5000/api/v1/admin/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "phoneNumber": "0811111111",
  "password": "SecurePass123!",
  "name": "Dr. Test",
  "hn": "DOC-002",
  "role": "doctor",
  "gender": "Male",
  "dateOfBirth": "1980-01-01",
  "weight": 70,
  "height": 175,
  "licenseNumber": "MD-99999",
  "specialization": "Ophthalmology",
  "department": "Eye Clinic"
}
```

### Doctor Endpoints (ต้อง login เป็น doctor ก่อน)
```bash
# Get Doctor Dashboard
GET http://localhost:5000/api/v1/doctor/dashboard
Authorization: Bearer <doctor-token>

# Get All Cases
GET http://localhost:5000/api/v1/doctor/cases
Authorization: Bearer <doctor-token>

# Get All Patients
GET http://localhost:5000/api/v1/doctor/patients
Authorization: Bearer <doctor-token>

# Create Case
POST http://localhost:5000/api/v1/doctor/cases
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "patientId": "patient-uuid-here",
  "diagnosis": "Bacterial Keratitis",
  "imageUrl": "https://example.com/image.jpg",
  "doctorNotes": "Patient requires follow-up",
  "status": "Finalized"
}
```

## 🧪 Test Accounts (หลังจาก run seed)

```bash
# Seed data
cd backend
npm run seed
```

### Sample Accounts:
- **Admin**: `+66800000001` / `admin123`
- **Doctor**: `+66800000002` / `doctor123`
- **Patient**: `+66812345678` / `password123`

## 📝 Quick Test Script

### PowerShell
```powershell
# Test Health
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing

# Test OTP Request
$body = @{
    phoneNumber = "0812345678"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/otp/request" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing
```

### cURL
```bash
# Health Check
curl http://localhost:5000/health

# Request OTP
curl -X POST http://localhost:5000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0812345678"}'

# Verify OTP
curl -X POST http://localhost:5000/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0812345678", "code": "123456"}'
```

## 🔍 Check Server Status

### Windows
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Check process
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### View Logs
```bash
# Backend logs จะแสดงใน terminal ที่รัน npm run dev
# หรือดูใน backend/logs/
```

## 🛠️ Troubleshooting

### Server ไม่ทำงาน
```bash
# ตรวจสอบว่า dependencies ติดตั้งแล้ว
cd backend
npm install

# ตรวจสอบ .env file
cat .env

# Start server
npm run dev
```

### Database Connection Error
```bash
# ตรวจสอบว่า PostgreSQL ทำงานอยู่
# Windows: Services → PostgreSQL
# หรือใช้ Docker:
docker-compose up -d postgres

# Run migration
npm run migrate
```

### Port 5000 ถูกใช้งาน
```bash
# หา process ที่ใช้ port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

## 📚 API Documentation

ดูรายละเอียดเพิ่มเติม:
- `ADMIN_DOCTOR_API.md` - Admin & Doctor API docs
- `ROLES_SETUP.md` - Role setup guide
- `backend/README.md` - Backend documentation

---

**Backend พร้อมทดสอบแล้ว! 🚀**

