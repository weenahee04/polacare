# ✅ แก้ไข Batch Files แล้ว!

## 🔧 ปัญหาที่แก้ไข

Batch files ตอนนี้จะ:
- ✅ เปลี่ยนไป directory ที่ถูกต้องอัตโนมัติ
- ✅ ตรวจสอบว่า path ถูกต้องก่อนรัน
- ✅ แสดง error message ถ้า path ไม่ถูกต้อง

## 🚀 วิธีใช้

### 1. ติดตั้ง Dependencies

**ดับเบิลคลิก:** `install-dependencies.bat`

หรือใช้ PowerShell:
```powershell
cd C:\Users\ADMIN\Downloads\polacare
npm install
cd backend
npm install
```

### 2. เริ่ม Servers

**ดับเบิลคลิก:**
- `start-backend.bat` (Backend)
- `start-frontend.bat` (Frontend)

หรือใช้ PowerShell:

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

### 3. รอ 15-30 วินาที

รอจนเห็น:
- Backend: "Server running on port 5000"
- Frontend: "Local: http://localhost:3001"

### 4. เปิด Browser

👉 **http://localhost:3001**

---

## 💡 ถ้ายังมีปัญหา

**ใช้ PowerShell แทน batch files:**

```powershell
# Terminal 1 - Backend
cd C:\Users\ADMIN\Downloads\polacare\backend
npm run dev

# Terminal 2 - Frontend  
cd C:\Users\ADMIN\Downloads\polacare
npm run dev
```

---

**ลองใช้ batch files ใหม่ดูครับ!** 🎉
