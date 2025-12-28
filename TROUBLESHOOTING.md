# 🔧 แก้ปัญหาเข้าเว็บไม่ได้

## 🔍 ตรวจสอบปัญหา

### 1. ตรวจสอบว่า Servers ทำงานอยู่

```powershell
# Test Backend
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing

# Test Frontend
Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing
```

### 2. ตรวจสอบ Ports

```powershell
# ดูว่า port ถูกใช้งานหรือไม่
Get-NetTCPConnection -LocalPort 3001,5000 -ErrorAction SilentlyContinue
```

### 3. ตรวจสอบ Node Processes

```powershell
Get-Process | Where-Object {$_.ProcessName -eq "node"}
```

## 🚀 วิธีเริ่มใหม่

### วิธีที่ 1: ใช้ Script
```powershell
.\start-local.ps1
```

### วิธีที่ 2: Manual

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

## 🔧 แก้ปัญหาที่พบบ่อย

### Port ถูกใช้งาน

```powershell
# หา process
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Backend Error

**ตรวจสอบ:**
1. `.env` file มีอยู่และถูกต้อง
2. Dependencies ติดตั้งแล้ว: `npm install`
3. TypeScript compile สำเร็จ: `npm run build`

**Error ที่พบบ่อย:**
- Database connection error → **ไม่เป็นไร** server จะทำงานได้
- Port 5000 ถูกใช้งาน → Kill process ที่ใช้ port
- Module not found → Run `npm install`

### Frontend Error

**ตรวจสอบ:**
1. `.env.local` file มี `VITE_API_URL=http://localhost:5000/api/v1`
2. Dependencies ติดตั้งแล้ว: `npm install`
3. Port 3001 ว่าง

**Error ที่พบบ่อย:**
- Port 3001 ถูกใช้งาน → Kill process
- Cannot connect to backend → ตรวจสอบว่า backend ทำงานอยู่
- Module not found → Run `npm install`

## 📋 Checklist

- [ ] Backend terminal window เปิดอยู่
- [ ] Frontend terminal window เปิดอยู่
- [ ] ไม่มี error messages ใน terminal
- [ ] Port 3001 และ 5000 ว่าง
- [ ] `.env` และ `.env.local` มีอยู่

## 🆘 ถ้ายังไม่ได้

1. **ดู Terminal Windows** - ดู error messages
2. **Restart Servers** - ปิดแล้วเริ่มใหม่
3. **Check Logs** - ดู logs ใน terminal
4. **Clear Cache** - ลบ `node_modules` และ reinstall

---

**ลองดู terminal windows ที่เปิดไว้เพื่อดู error messages ครับ**

