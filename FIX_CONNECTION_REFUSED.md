# 🔧 แก้ปัญหา ERR_CONNECTION_REFUSED

## ❌ ปัญหา
```
ERR_CONNECTION_REFUSED
localhost ปฏิเสธการเชื่อมต่อ
```

## ✅ วิธีแก้ (ทำตามลำดับ)

### ขั้นตอนที่ 1: ติดตั้ง Dependencies

**ถ้ายังไม่ได้ติดตั้ง dependencies:**

1. ดับเบิลคลิก: **`install-dependencies.bat`**
2. รอให้ติดตั้งเสร็จ (1-2 นาที)

หรือใช้ PowerShell:
```powershell
# Frontend
npm install

# Backend
cd backend
npm install
```

---

### ขั้นตอนที่ 2: เริ่ม Servers

**วิธีที่ 1: ใช้ Batch Files (ง่ายที่สุด!)**

1. ดับเบิลคลิก: **`start-backend.bat`**
2. ดับเบิลคลิก: **`start-frontend.bat`**

**วิธีที่ 2: ใช้ PowerShell**

เปิด PowerShell 2 หน้าต่าง:

**Terminal 1:**
```powershell
cd C:\Users\ADMIN\Downloads\polacare\backend
npm run dev
```

**Terminal 2:**
```powershell
cd C:\Users\ADMIN\Downloads\polacare
npm run dev
```

---

### ขั้นตอนที่ 3: รอให้ Compile เสร็จ

**รอ 15-30 วินาที** จนเห็น:

- **Backend window**: "🚀 Server running on port 5000"
- **Frontend window**: "Local: http://localhost:3001"

---

### ขั้นตอนที่ 4: เปิด Browser

👉 **http://localhost:3001**

---

## 🔍 ตรวจสอบว่า Servers ทำงาน

### ดู Terminal Windows

**Backend:**
- ✅ ควรเห็น: "Server running on port 5000"
- ❌ ถ้าเห็น error → บอกฉันมา

**Frontend:**
- ✅ ควรเห็น: "Local: http://localhost:3001"
- ❌ ถ้าเห็น error → บอกฉันมา

---

## ❌ Error ที่พบบ่อย

### 1. "Cannot find module"
**แก้:** รัน `install-dependencies.bat` อีกครั้ง

### 2. "Port already in use"
**แก้:**
```powershell
# หา process
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### 3. "Database connection error"
**ไม่เป็นไร!** Backend จะทำงานได้แม้ไม่มี database

---

## 📝 Checklist

- [ ] ติดตั้ง dependencies แล้ว (`install-dependencies.bat`)
- [ ] Backend window เปิดอยู่
- [ ] Frontend window เปิดอยู่
- [ ] เห็น "running" หรือ "ready" ใน terminal
- [ ] รอ compile เสร็จแล้ว (15-30 วินาที)
- [ ] ไม่มี error messages สีแดง

---

## 💡 ถ้ายังไม่ได้

1. **ดู terminal windows** - มี error messages อะไรบ้าง?
2. **Copy error message** มาให้ฉันดู
3. **บอกฉันว่า:**
   - Backend window แสดงอะไร?
   - Frontend window แสดงอะไร?

---

**ลองทำตามขั้นตอนที่ 1-4 ดูครับ!** 🚀
