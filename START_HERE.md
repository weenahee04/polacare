# 🚀 เริ่มต้น Deploy POLACARE

## ⚡ Quick Start (5 นาที)

### Windows
```powershell
# 1. เปิด PowerShell ในโฟลเดอร์โปรเจกต์
# 2. รันคำสั่ง:
.\deploy.ps1
```

### Mac/Linux
```bash
# 1. เปิด Terminal ในโฟลเดอร์โปรเจกต์
# 2. รันคำสั่ง:
chmod +x deploy.sh
./deploy.sh
```

### หรือใช้ Docker Compose โดยตรง
```bash
# 1. สร้างไฟล์ .env
cp backend/.env.example backend/.env

# 2. แก้ไข backend/.env (ขั้นต่ำ):
#    - JWT_SECRET=your-secret-key
#    - GEMINI_API_KEY=your-key (optional)

# 3. Deploy
docker-compose up -d

# 4. Initialize database
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed  # Optional
```

## 📍 เข้าถึงแอป

หลังจาก deploy สำเร็จ:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/health

## 🔧 ตรวจสอบ Status

```bash
# ดู logs
docker-compose logs -f

# ดู status
docker-compose ps

# Test API
curl http://localhost:5000/health
```

## 🛑 หยุด Services

```bash
docker-compose down
```

## 📚 เอกสารเพิ่มเติม

- **Quick Deploy Guide**: `QUICK_DEPLOY.md` - วิธี deploy แบบละเอียด
- **Production Setup**: `DEPLOYMENT.md` - Production deployment
- **Missing Items**: `PRODUCTION_MISSING_ITEMS.md` - สิ่งที่ยังต้องทำ

## ⚠️ หมายเหตุ

1. **ต้องมี Docker Desktop ติดตั้ง** (Windows/Mac) หรือ Docker (Linux)
2. **Port 3000 และ 5000 ต้องว่าง**
3. **Environment Variables**: แก้ไข `backend/.env` ก่อน deploy

## 🆘 ปัญหาที่พบบ่อย

### Port ถูกใช้งานแล้ว
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :3000
lsof -i :5000
```

### Docker ไม่ทำงาน
- ตรวจสอบว่า Docker Desktop เปิดอยู่
- รัน `docker ps` เพื่อทดสอบ

### Database Error
```bash
# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

---

**พร้อมแล้ว! เริ่ม deploy ได้เลย 🚀**

