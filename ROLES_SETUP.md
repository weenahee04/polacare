# 🔐 Role-Based Access Control Setup

## ✅ สิ่งที่เพิ่มแล้ว

### 1. User Roles
- ✅ เพิ่ม `role` field ใน User model (patient, doctor, admin)
- ✅ เพิ่ม fields สำหรับ doctor (licenseNumber, specialization, department)
- ✅ เพิ่ม `isActive` field สำหรับ soft delete

### 2. Middleware
- ✅ `requireRole()` - Role-based access control
- ✅ `requireAdmin()` - Admin only
- ✅ `requireDoctor()` - Doctor & Admin
- ✅ `requirePatient()` - All roles

### 3. Admin Endpoints
- ✅ `/api/v1/admin/dashboard/stats` - Dashboard statistics
- ✅ `/api/v1/admin/users` - User management (CRUD)
- ✅ `/api/v1/admin/users/:id` - Get/Update/Delete user

### 4. Doctor Endpoints
- ✅ `/api/v1/doctor/dashboard` - Doctor dashboard
- ✅ `/api/v1/doctor/cases` - Case management
- ✅ `/api/v1/doctor/cases/:id` - Get/Update case
- ✅ `/api/v1/doctor/patients` - Patient list

## 🚀 Setup

### 1. Run Migration
```bash
# Add role column to users table
cd backend
npm run migrate
# หรือรัน SQL migration manually
psql -U postgres -d polacare -f src/db/migrations/002_add_user_roles.sql
```

### 2. Create Initial Admin
```sql
-- Option 1: Update existing user
UPDATE users 
SET role = 'admin', is_active = true 
WHERE phone_number = '+66812345678';

-- Option 2: Create new admin via API (after first admin exists)
```

### 3. Seed Sample Data
```bash
npm run seed
# จะสร้าง:
# - Admin: +66800000001 / admin123
# - Doctor: +66800000002 / doctor123
# - Patient: +66812345678 / password123
```

## 📋 API Usage

### Login as Admin
```bash
POST /api/v1/auth/otp/request
{ "phoneNumber": "0800000001" }

POST /api/v1/auth/otp/verify
{ "phoneNumber": "0800000001", "code": "123456" }
```

### Create Doctor (Admin only)
```bash
POST /api/v1/admin/users
Authorization: Bearer <admin-token>

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

### Create Case (Doctor)
```bash
POST /api/v1/doctor/cases
Authorization: Bearer <doctor-token>

{
  "patientId": "patient-uuid",
  "diagnosis": "Bacterial Keratitis",
  "imageUrl": "https://...",
  "doctorNotes": "Patient requires follow-up",
  "status": "Finalized"
}
```

## 🔑 Role Permissions

| Feature | Patient | Doctor | Admin |
|---------|---------|--------|-------|
| View own profile | ✅ | ✅ | ✅ |
| View own cases | ✅ | ✅ | ✅ |
| View all cases | ❌ | ✅ | ✅ |
| Create case | ❌ | ✅ | ✅ |
| Update case | ❌ | ✅ | ✅ |
| View patients | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Dashboard stats | ❌ | ✅ | ✅ |
| Admin dashboard | ❌ | ❌ | ✅ |

## 📝 Notes

1. **Default Role**: Users สร้างใหม่จะเป็น `patient` โดยอัตโนมัติ
2. **Soft Delete**: การลบ user จะเป็นการ deactivate (`isActive = false`)
3. **Doctor Fields**: Doctors ต้องมี `licenseNumber`, `specialization`, `department`
4. **Token Includes Role**: JWT token จะมี role อยู่ใน payload

## 🧪 Testing

### Test Admin Access
```bash
# Login as admin
curl -X POST http://localhost:5000/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0800000001", "code": "123456"}'

# Get admin dashboard
curl http://localhost:5000/api/v1/admin/dashboard/stats \
  -H "Authorization: Bearer <admin-token>"
```

### Test Doctor Access
```bash
# Login as doctor
curl -X POST http://localhost:5000/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0800000002", "code": "123456"}'

# Get doctor dashboard
curl http://localhost:5000/api/v1/doctor/dashboard \
  -H "Authorization: Bearer <doctor-token>"
```

---

**ระบบ Role-Based Access Control พร้อมใช้งานแล้ว! 🎉**

