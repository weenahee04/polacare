# Admin & Doctor API Documentation

## 🔐 Authentication

ทุก endpoint ต้องใช้ JWT token ใน header:
```
Authorization: Bearer <token>
```

## 👨‍⚕️ Doctor Endpoints

### Dashboard
- `GET /api/v1/doctor/dashboard` - Get doctor dashboard stats

### Cases Management
- `GET /api/v1/doctor/cases` - Get all cases (with pagination)
  - Query params: `patientId`, `status`, `page`, `limit`, `search`
- `GET /api/v1/doctor/cases/:id` - Get case by ID
- `POST /api/v1/doctor/cases` - Create new case
- `PUT /api/v1/doctor/cases/:id` - Update case

### Patients
- `GET /api/v1/doctor/patients` - Get all patients
  - Query params: `search`, `page`, `limit`

## 👨‍💼 Admin Endpoints

### Dashboard
- `GET /api/v1/admin/dashboard/stats` - Get admin dashboard statistics

### User Management
- `GET /api/v1/admin/users` - Get all users
  - Query params: `role`, `search`, `page`, `limit`
- `GET /api/v1/admin/users/:id` - Get user by ID
- `POST /api/v1/admin/users` - Create new user
- `PUT /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Deactivate user

## 📋 Request Examples

### Create Doctor User (Admin only)
```bash
POST /api/v1/admin/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "phoneNumber": "0812345678",
  "password": "SecurePass123!",
  "name": "Dr. Somchai",
  "hn": "DOC-001",
  "role": "doctor",
  "gender": "Male",
  "dateOfBirth": "1980-01-01",
  "weight": 70,
  "height": 175,
  "licenseNumber": "MD-12345",
  "specialization": "Ophthalmology",
  "department": "Eye Clinic"
}
```

### Create Case (Doctor)
```bash
POST /api/v1/doctor/cases
Authorization: Bearer <doctor-token>
Content-Type: application/json

{
  "patientId": "uuid-here",
  "diagnosis": "Bacterial Keratitis",
  "imageUrl": "https://...",
  "doctorNotes": "Patient requires follow-up",
  "leftEye": {
    "visualAcuity": "20/20",
    "intraocularPressure": "15",
    "diagnosis": "Normal"
  },
  "rightEye": {
    "visualAcuity": "20/40",
    "intraocularPressure": "18",
    "diagnosis": "Bacterial Keratitis"
  },
  "checklist": {
    "items": [
      {
        "category": "Cornea",
        "label": "Infiltrate",
        "isObserved": true,
        "isVerified": true
      }
    ]
  },
  "status": "Finalized"
}
```

### Get All Cases (Doctor)
```bash
GET /api/v1/doctor/cases?page=1&limit=20&status=Finalized
Authorization: Bearer <doctor-token>
```

### Get Dashboard Stats (Admin)
```bash
GET /api/v1/admin/dashboard/stats
Authorization: Bearer <admin-token>
```

## 🔑 Roles & Permissions

### Patient
- ดูข้อมูลของตัวเองเท่านั้น
- จัดการ medications ของตัวเอง
- ทำ vision tests

### Doctor
- ดู cases ทั้งหมด
- สร้าง/แก้ไข cases
- ดูข้อมูล patients
- เข้าถึง doctor dashboard

### Admin
- จัดการ users ทั้งหมด (สร้าง/แก้ไข/ลบ)
- ดู dashboard statistics
- เข้าถึงทุก endpoint

## 🚀 Setup Initial Admin

```sql
-- Run in database
UPDATE users 
SET role = 'admin', is_active = true 
WHERE phone_number = '+66812345678';
```

หรือใช้ API:
```bash
POST /api/v1/admin/users
# Create admin user with role='admin'
```

## 📝 Notes

1. **Role-based Access**: ใช้ middleware `requireRole()` เพื่อควบคุมการเข้าถึง
2. **Soft Delete**: การลบ user จะเป็นการ deactivate (`isActive = false`) แทนการลบจริง
3. **Doctor Fields**: Doctors สามารถมี `licenseNumber`, `specialization`, `department`
4. **Case Ownership**: Doctors สามารถสร้าง case ให้ patient ใดก็ได้

