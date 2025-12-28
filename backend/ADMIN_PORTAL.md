# Staff/Admin Portal

## Overview

A minimal staff portal for doctors and admins to manage patient cases.

## Features

- ✅ Staff login (seeded accounts)
- ✅ Create/Edit PatientCase
  - Diagnosis
  - Doctor notes
  - Checklist items (slit lamp exam)
  - Eye examination data (OD/OS)
  - Status: Draft/Finalized
- ✅ Upload slit lamp images
- ✅ Assign case to patient (search by HN/phone)
- ✅ Audit trail for all edits
- ✅ RBAC enforcement

## API Endpoints

### Staff Routes (Doctor + Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/patients/search` | Search patients by HN/phone/name |
| GET | `/api/v1/admin/cases` | Get all cases (with filters) |
| GET | `/api/v1/admin/cases/:id` | Get case by ID |
| POST | `/api/v1/admin/cases` | Create new case |
| PUT | `/api/v1/admin/cases/:id` | Update case |
| POST | `/api/v1/admin/cases/:id/finalize` | Finalize case |
| GET | `/api/v1/admin/cases/:id/audit` | Get case audit trail |
| GET | `/api/v1/admin/cases/checklist/default` | Get default checklist items |

### Admin-Only Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/dashboard/stats` | Dashboard statistics |
| GET | `/api/v1/admin/audit-logs` | All audit logs |
| GET | `/api/v1/admin/users` | User management |
| POST | `/api/v1/admin/users` | Create user |
| PUT | `/api/v1/admin/users/:id` | Update user |
| DELETE | `/api/v1/admin/users/:id` | Deactivate user |

## RBAC Matrix

| Feature | Patient | Doctor | Admin |
|---------|---------|--------|-------|
| View own cases | ✅ | ✅ | ✅ |
| View all cases | ❌ | ✅ | ✅ |
| Create case | ❌ | ✅ | ✅ |
| Edit case | ❌ | ✅ | ✅ |
| Finalize case | ❌ | ✅ | ✅ |
| Upload images | ❌ | ✅ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Dashboard stats | ❌ | ❌ | ✅ |

## Seeded Staff Accounts

Run the seed script to create staff accounts:

```bash
cd backend
npx tsx src/db/seedStaff.ts
```

### Default Credentials

| Role | Phone | Password |
|------|-------|----------|
| Doctor | 0800000001 | doctor123 |
| Admin | 0800000002 | admin123 |
| Doctor | 0800000003 | doctor456 |

## Frontend Components

### Location
All admin components are in `components/admin/`:

- `AdminLayout.tsx` - Main layout with sidebar
- `AdminPortal.tsx` - Main portal entry
- `CaseList.tsx` - List all cases
- `CaseEditor.tsx` - Create/edit case
- `StaffLogin.tsx` - Staff login page

### Usage

```tsx
import AdminPortal from '@/components/admin/AdminPortal';
import StaffLogin from '@/components/admin/StaffLogin';

// In your router
<Route path="/admin/login" element={
  <StaffLogin onLoginSuccess={() => navigate('/admin')} />
} />
<Route path="/admin/*" element={<AdminPortal />} />
```

## Audit Trail

All case changes are logged with:
- User ID and name
- Action type (CREATE, UPDATE, DELETE)
- Resource type and ID
- Change details (before/after)
- Timestamp
- IP address

### View Audit Logs

**API:**
```bash
GET /api/v1/admin/audit-logs?limit=50&resourceType=PatientCase
```

**UI:**
Navigate to "Audit Logs" in the admin sidebar (Admin only).

## Security

### Authentication
- JWT tokens required for all endpoints
- Token stored in localStorage
- Auto-redirect to login if expired

### Authorization
- Role checked on every request
- `requireDoctor` middleware for doctor/admin routes
- `requireAdmin` middleware for admin-only routes
- Patient data filtered by ownership

### Row-Level Security
- Patients can only see their own cases
- Doctors/Admins can see all cases
- All data access is logged

## Files Created

### Backend
- `src/services/auditService.ts` - Audit logging
- `src/controllers/staffCaseController.ts` - Case management
- `src/routes/adminRoutes.ts` - Updated with new routes
- `src/db/seedStaff.ts` - Staff account seeding

### Frontend
- `components/admin/AdminLayout.tsx`
- `components/admin/AdminPortal.tsx`
- `components/admin/CaseList.tsx`
- `components/admin/CaseEditor.tsx`
- `components/admin/StaffLogin.tsx`

---

**Status**: Implementation Complete ✅

