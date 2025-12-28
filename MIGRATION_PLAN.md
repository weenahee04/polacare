# POLACARE - Sequelize to Prisma Migration Plan

**Date**: December 2024  
**Priority**: 🔴 CRITICAL  
**Status**: ✅ **COMPLETED**  
**Completion Date**: December 2024

---

## ✅ Migration Complete Summary

| Phase | Status |
|-------|--------|
| Controllers Migration | ✅ Complete (7/7) |
| Services Migration | ✅ Complete (1/1) |
| Models Removal | ✅ Complete (8/8) |
| Dependencies Cleanup | ✅ Complete |

**All code now uses Prisma exclusively. Sequelize has been completely removed.**

---

## Original Goal

The backend previously used **two ORMs**: Sequelize (most controllers) and Prisma (staffCaseController only). This created:
- Potential data inconsistencies
- Maintenance overhead
- Migration complexity

**Goal**: Standardize to **Prisma ONLY**. ✅ **ACHIEVED**

---

## Phase 1: Preparation ✅

### 1.1 Prerequisites

```bash
# Ensure Prisma client is generated
cd backend
npx prisma generate

# Verify DATABASE_URL is set
echo $env:DATABASE_URL
```

### 1.2 Backup Strategy

```bash
# Before migration, backup database
pg_dump -U postgres -d polacare > backup_before_migration.sql
```

---

## Phase 2: File Changes Checklist

### 2.1 Controllers to Migrate

| File | Sequelize Usage | Priority | Status |
|------|-----------------|----------|--------|
| `authController.ts` | User model | 🔴 Critical | ✅ |
| `caseController.ts` | PatientCase, ChecklistItem | 🔴 Critical | ✅ |
| `doctorController.ts` | PatientCase, ChecklistItem, User | 🟡 High | ✅ |
| `adminController.ts` | User, PatientCase | 🟡 High | ✅ |
| `visionTestController.ts` | VisionTest | 🟢 Medium | ✅ |
| `medicationController.ts` | Medication | 🟢 Medium | ✅ |
| `articleController.ts` | Article | 🟢 Medium | ✅ |

### 2.2 Services to Migrate

| File | Sequelize Usage | Priority | Status |
|------|-----------------|----------|--------|
| `otpService.ts` | OTP, Op | 🔴 Critical | ✅ |

### 2.3 Files to Remove/Disable

| File | Action | Status |
|------|--------|--------|
| `models/User.ts` | Remove | ✅ |
| `models/OTP.ts` | Remove | ✅ |
| `models/PatientCase.ts` | Remove | ✅ |
| `models/ChecklistItem.ts` | Remove | ✅ |
| `models/Medication.ts` | Remove | ✅ |
| `models/VisionTest.ts` | Remove | ✅ |
| `models/Article.ts` | Remove | ✅ |
| `models/index.ts` | Remove | ✅ |
| `config/database.ts` | Remove Sequelize config | ✅ |
| `db/seed.ts` | Rewrite for Prisma | ✅ |

### 2.4 Dependencies to Remove

```json
// Remove from package.json
{
  "sequelize": "^6.x",
  "pg": "^8.x" (if only used by Sequelize)
}
```

---

## Phase 3: Migration Steps

### Step 1: Migrate authController.ts

**Changes Required:**

```typescript
// BEFORE (Sequelize)
import User from '../models/User';
const user = await User.findOne({ where: { phoneNumber } });
await user.update({ isVerified: true });

// AFTER (Prisma)
import prisma from '../config/prisma';
const user = await prisma.user.findUnique({ where: { phoneNumber } });
await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
```

**Test Plan:**
```bash
# 1. Request OTP
curl -X POST http://localhost:5000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0812345678"}'

# 2. Verify OTP (use code from console)
curl -X POST http://localhost:5000/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0812345678", "code": "123456"}'

# 3. Register user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0812345678",
    "password": "Test@123456",
    "firstName": "Test",
    "lastName": "User",
    "gender": "Male",
    "dateOfBirth": "1990-01-01",
    "weight": 70,
    "height": 175
  }'

# 4. Get profile
curl http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer <token>"
```

---

### Step 2: Migrate caseController.ts

**Changes Required:**

```typescript
// BEFORE (Sequelize)
import PatientCase from '../models/PatientCase';
import ChecklistItem from '../models/ChecklistItem';

const cases = await PatientCase.findAll({
  where: { userId: req.user.id },
  include: [{ model: ChecklistItem, as: 'checklistItems' }]
});

// AFTER (Prisma)
import prisma from '../config/prisma';

const cases = await prisma.patientCase.findMany({
  where: { patientId: req.user.id },
  include: { checklistItems: true },
  orderBy: { date: 'desc' }
});
```

**Test Plan:**
```bash
# 1. Get cases
curl http://localhost:5000/api/v1/cases \
  -H "Authorization: Bearer <patient_token>"

# 2. Get case by ID
curl http://localhost:5000/api/v1/cases/<case_id> \
  -H "Authorization: Bearer <patient_token>"

# 3. Verify only own cases returned
```

---

### Step 3: Migrate doctorController.ts

**Changes Required:**
- Replace `PatientCase` with `prisma.patientCase`
- Replace `User` with `prisma.user`
- Replace `Op.iLike` with Prisma's `contains` with `mode: 'insensitive'`

**Test Plan:**
```bash
# 1. Login as doctor
# 2. Get all cases
curl http://localhost:5000/api/v1/doctor/cases \
  -H "Authorization: Bearer <doctor_token>"

# 3. Search patients
curl "http://localhost:5000/api/v1/doctor/cases?search=HN-123" \
  -H "Authorization: Bearer <doctor_token>"

# 4. Get dashboard
curl http://localhost:5000/api/v1/doctor/dashboard \
  -H "Authorization: Bearer <doctor_token>"
```

---

### Step 4: Migrate adminController.ts

**Changes Required:**
- Same pattern as doctorController
- Replace `Op.or` with Prisma's `OR`

**Test Plan:**
```bash
# 1. Login as admin
# 2. Get all users
curl http://localhost:5000/api/v1/admin/users \
  -H "Authorization: Bearer <admin_token>"

# 3. Create user
curl -X POST http://localhost:5000/api/v1/admin/users \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "phoneNumber": "0899999999", ...}'

# 4. Get dashboard stats
curl http://localhost:5000/api/v1/admin/dashboard \
  -H "Authorization: Bearer <admin_token>"
```

---

### Step 5: Migrate visionTestController.ts

**Changes Required:**
- Replace `VisionTest.findAll()` with `prisma.visionTestResult.findMany()`
- Field name: `userId` → `patientId`
- Model name: `VisionTest` → `visionTestResult`

**Test Plan:**
```bash
# 1. Get vision tests
curl http://localhost:5000/api/v1/vision-tests \
  -H "Authorization: Bearer <patient_token>"

# 2. Create vision test
curl -X POST http://localhost:5000/api/v1/vision-tests \
  -H "Authorization: Bearer <patient_token>" \
  -H "Content-Type: application/json" \
  -d '{"testName": "Amsler Grid", "testType": "AmslerGrid", "result": "Normal"}'
```

---

### Step 6: Migrate medicationController.ts

**Changes Required:**
- Replace `Medication.findAll()` with `prisma.medication.findMany()`
- Field name: `userId` → `patientId`

**Test Plan:**
```bash
# 1. Get medications
curl http://localhost:5000/api/v1/medications \
  -H "Authorization: Bearer <patient_token>"

# 2. Create medication
curl -X POST http://localhost:5000/api/v1/medications \
  -H "Authorization: Bearer <patient_token>" \
  -H "Content-Type: application/json" \
  -d '{"medicineName": "Test Eye Drop", "frequency": "4x daily", "nextTime": "08:00"}'

# 3. Update medication
curl -X PUT http://localhost:5000/api/v1/medications/<id> \
  -H "Authorization: Bearer <patient_token>" \
  -H "Content-Type: application/json" \
  -d '{"taken": true}'
```

---

### Step 7: Migrate articleController.ts

**Changes Required:**
- Replace `Article.findAll()` with `prisma.article.findMany()`

**Test Plan:**
```bash
# 1. Get articles (public)
curl http://localhost:5000/api/v1/articles

# 2. Get article by ID
curl http://localhost:5000/api/v1/articles/<id>
```

---

### Step 8: Migrate otpService.ts

**Changes Required:**
- Replace `OTP` model with `prisma.oTP`
- Replace `Op.gt` with Prisma's `gt`

**Test Plan:**
```bash
# 1. Request OTP
# 2. Check console for OTP code
# 3. Verify OTP
# 4. Check OTP is marked as used
```

---

### Step 9: Remove Sequelize

**Actions:**
1. Delete `backend/src/models/*.ts`
2. Delete `backend/src/config/database.ts`
3. Remove Sequelize from `package.json`
4. Update `healthCheck.ts` if needed

---

## Phase 4: Verification

### 4.1 Test Checklist

| Test | Expected | Status |
|------|----------|--------|
| OTP Request | Returns success | ⬜ |
| OTP Verify | Returns token | ⬜ |
| Register User | Creates user | ⬜ |
| Get Profile | Returns user data | ⬜ |
| Get Cases (Patient) | Returns own cases | ⬜ |
| Get Cases (Doctor) | Returns all cases | ⬜ |
| Create Case (Admin) | Creates with audit | ⬜ |
| Get Medications | Returns medications | ⬜ |
| Get Articles | Returns articles | ⬜ |
| Get Vision Tests | Returns tests | ⬜ |
| Admin Dashboard | Returns stats | ⬜ |

### 4.2 Regression Tests

```bash
# Run all tests
npm test

# Check linting
npm run lint

# Type check
npm run build
```

---

## Phase 5: Rollback Plan

If migration fails:

```bash
# 1. Restore backup
psql -U postgres -d polacare < backup_before_migration.sql

# 2. Revert code changes
git checkout -- backend/src/controllers
git checkout -- backend/src/services

# 3. Restore Sequelize dependencies
npm install sequelize pg
```

---

## Migration Sequence (Execution Order)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. authController.ts + otpService.ts (Auth flow critical)   │
├─────────────────────────────────────────────────────────────┤
│ 2. caseController.ts (Patient viewing records)              │
├─────────────────────────────────────────────────────────────┤
│ 3. doctorController.ts (Doctor functionality)               │
├─────────────────────────────────────────────────────────────┤
│ 4. adminController.ts (Admin functionality)                 │
├─────────────────────────────────────────────────────────────┤
│ 5. medicationController.ts                                  │
├─────────────────────────────────────────────────────────────┤
│ 6. visionTestController.ts                                  │
├─────────────────────────────────────────────────────────────┤
│ 7. articleController.ts                                     │
├─────────────────────────────────────────────────────────────┤
│ 8. Remove Sequelize models + dependencies                   │
├─────────────────────────────────────────────────────────────┤
│ 9. Final verification + cleanup                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Field Mapping Reference

| Sequelize Field | Prisma Field | Notes |
|-----------------|--------------|-------|
| `userId` | `patientId` | For patient-related tables |
| `findOne()` | `findUnique()` or `findFirst()` | Use `findUnique` for unique fields |
| `findAll()` | `findMany()` | |
| `findByPk(id)` | `findUnique({ where: { id } })` | |
| `findAndCountAll()` | Separate `findMany()` + `count()` | |
| `create()` | `create({ data: {...} })` | |
| `update()` | `update({ where: {...}, data: {...} })` | |
| `destroy()` | `delete({ where: {...} })` | |
| `bulkCreate()` | `createMany({ data: [...] })` | |
| `Op.iLike` | `contains` + `mode: 'insensitive'` | |
| `Op.or` | `OR: [...]` | |
| `Op.gt` / `Op.lt` | `gt` / `lt` | |

---

**Document Version**: 1.0  
**Last Updated**: December 2024

