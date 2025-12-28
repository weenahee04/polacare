# POLACARE Backend - Regression Test Plan

**Purpose**: Verify all API endpoints work correctly after Prisma migration  
**Last Updated**: December 2024

---

## Quick Test (Automated)

```bash
# Start the server first
npm run dev

# In another terminal, run tests
npm run test:api
```

---

## Manual Test Checklist

### Prerequisites

1. PostgreSQL running on localhost:5432
2. Database created: `CREATE DATABASE polacare;`
3. Migrations run: `npx prisma migrate dev`
4. Data seeded: `npm run seed`
5. Server running: `npm run dev`

---

## 1. Health Check

```bash
curl http://localhost:5000/health
```

**Expected:**
```json
{
  "status": "ok",
  "services": {
    "database": "connected"
  }
}
```

| Test | Expected | Status |
|------|----------|--------|
| Returns 200 | ✅ | ⬜ |
| Database connected | ✅ | ⬜ |

---

## 2. Authentication Endpoints

### 2.1 Request OTP

```bash
curl -X POST http://localhost:5000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0812345678"}'
```

**Expected:** 200 OK, OTP code logged to console

| Test | Expected | Status |
|------|----------|--------|
| Returns 200 | ✅ | ⬜ |
| OTP logged to console | ✅ | ⬜ |
| Invalid phone rejected | ✅ | ⬜ |

### 2.2 Verify OTP

```bash
curl -X POST http://localhost:5000/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0812345678", "code": "<code_from_console>"}'
```

**Expected:** 200 OK with JWT token

| Test | Expected | Status |
|------|----------|--------|
| Valid OTP returns token | ✅ | ⬜ |
| Invalid OTP returns 401 | ✅ | ⬜ |
| Expired OTP returns 401 | ✅ | ⬜ |

### 2.3 Get Profile (Authenticated)

```bash
curl http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer <token>"
```

**Expected:** 200 OK with user data

| Test | Expected | Status |
|------|----------|--------|
| Returns user data | ✅ | ⬜ |
| No token returns 401 | ✅ | ⬜ |
| Invalid token returns 401 | ✅ | ⬜ |

---

## 3. Patient Endpoints

### 3.1 Get Cases

```bash
curl http://localhost:5000/api/v1/cases \
  -H "Authorization: Bearer <patient_token>"
```

**Expected:** Array of patient's own cases only

| Test | Expected | Status |
|------|----------|--------|
| Returns only own cases | ✅ | ⬜ |
| Includes checklist items | ✅ | ⬜ |
| Includes images | ✅ | ⬜ |

### 3.2 Get Medications

```bash
curl http://localhost:5000/api/v1/medications \
  -H "Authorization: Bearer <patient_token>"
```

**Expected:** Array of patient's medications

| Test | Expected | Status |
|------|----------|--------|
| Returns medications | ✅ | ⬜ |
| Includes logs | ✅ | ⬜ |

### 3.3 Log Medication

```bash
curl -X POST http://localhost:5000/api/v1/medications/<id>/log \
  -H "Authorization: Bearer <patient_token>" \
  -H "Content-Type: application/json" \
  -d '{"scheduledTime": "2024-01-01T08:00:00Z"}'
```

**Expected:** Creates medication log entry

| Test | Expected | Status |
|------|----------|--------|
| Creates log entry | ✅ | ⬜ |
| Sets taken=true | ✅ | ⬜ |
| Records takenAt timestamp | ✅ | ⬜ |

### 3.4 Get Vision Tests

```bash
curl http://localhost:5000/api/v1/vision-tests \
  -H "Authorization: Bearer <patient_token>"
```

**Expected:** Array of vision test results

| Test | Expected | Status |
|------|----------|--------|
| Returns test results | ✅ | ⬜ |
| Ordered by date DESC | ✅ | ⬜ |

---

## 4. Doctor Endpoints

### 4.1 Get All Cases

```bash
curl http://localhost:5000/api/v1/doctor/cases \
  -H "Authorization: Bearer <doctor_token>"
```

**Expected:** All cases (paginated)

| Test | Expected | Status |
|------|----------|--------|
| Returns all cases | ✅ | ⬜ |
| Includes patient info | ✅ | ⬜ |
| Pagination works | ✅ | ⬜ |

### 4.2 Search Patients

```bash
curl "http://localhost:5000/api/v1/doctor/patients?search=HN-660012" \
  -H "Authorization: Bearer <doctor_token>"
```

**Expected:** Matching patients

| Test | Expected | Status |
|------|----------|--------|
| Search by HN works | ✅ | ⬜ |
| Search by name works | ✅ | ⬜ |
| Search by phone works | ✅ | ⬜ |

### 4.3 Dashboard Stats

```bash
curl http://localhost:5000/api/v1/doctor/dashboard \
  -H "Authorization: Bearer <doctor_token>"
```

**Expected:** Dashboard statistics

| Test | Expected | Status |
|------|----------|--------|
| Returns totalCases | ✅ | ⬜ |
| Returns todayCases | ✅ | ⬜ |
| Returns recentCases | ✅ | ⬜ |

---

## 5. Admin Endpoints

### 5.1 Search Patients

```bash
curl "http://localhost:5000/api/v1/admin/patients/search?q=HN" \
  -H "Authorization: Bearer <admin_token>"
```

**Expected:** Matching patients

| Test | Expected | Status |
|------|----------|--------|
| Returns patients | ✅ | ⬜ |
| Filters by role=patient | ✅ | ⬜ |

### 5.2 Create Case

```bash
curl -X POST http://localhost:5000/api/v1/admin/cases \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "<patient_uuid>",
    "diagnosis": "Test Diagnosis",
    "status": "Draft"
  }'
```

**Expected:** Creates case with audit log

| Test | Expected | Status |
|------|----------|--------|
| Case created | ✅ | ⬜ |
| Audit log created | ✅ | ⬜ |
| Status is Draft | ✅ | ⬜ |

### 5.3 Get Case Audit Trail

```bash
curl http://localhost:5000/api/v1/admin/cases/<id>/audit \
  -H "Authorization: Bearer <admin_token>"
```

**Expected:** Audit logs for case

| Test | Expected | Status |
|------|----------|--------|
| Returns audit logs | ✅ | ⬜ |
| Shows create/update actions | ✅ | ⬜ |

### 5.4 Dashboard Stats

```bash
curl http://localhost:5000/api/v1/admin/dashboard \
  -H "Authorization: Bearer <admin_token>"
```

**Expected:** System statistics

| Test | Expected | Status |
|------|----------|--------|
| Returns user counts | ✅ | ⬜ |
| Returns case counts | ✅ | ⬜ |

---

## 6. Public Endpoints

### 6.1 Get Articles

```bash
curl http://localhost:5000/api/v1/articles
```

**Expected:** Published articles

| Test | Expected | Status |
|------|----------|--------|
| Returns articles | ✅ | ⬜ |
| Only published=true | ✅ | ⬜ |
| Pagination works | ✅ | ⬜ |

### 6.2 Get Article by ID

```bash
curl http://localhost:5000/api/v1/articles/<id>
```

**Expected:** Article with content

| Test | Expected | Status |
|------|----------|--------|
| Returns full article | ✅ | ⬜ |
| Increments view count | ✅ | ⬜ |

### 6.3 Get Categories

```bash
curl http://localhost:5000/api/v1/articles/categories
```

**Expected:** List of categories

| Test | Expected | Status |
|------|----------|--------|
| Returns categories | ✅ | ⬜ |

---

## 7. Authorization Tests

| Test | Expected | Status |
|------|----------|--------|
| Patient cannot access doctor endpoints | ✅ | ⬜ |
| Patient cannot access admin endpoints | ✅ | ⬜ |
| Doctor cannot access admin endpoints | ✅ | ⬜ |
| Patient only sees own data | ✅ | ⬜ |

---

## 8. Database Tests

```bash
# Open Prisma Studio to verify data
npx prisma studio
```

| Test | Expected | Status |
|------|----------|--------|
| Users table has data | ✅ | ⬜ |
| PatientCases linked to users | ✅ | ⬜ |
| ChecklistItems linked to cases | ✅ | ⬜ |
| Medications linked to users | ✅ | ⬜ |
| Articles exist | ✅ | ⬜ |
| AuditLogs recording actions | ✅ | ⬜ |

---

## Quick Verification Script

```bash
# 1. Check server is running
curl -s http://localhost:5000/health | jq

# 2. Check articles (public)
curl -s http://localhost:5000/api/v1/articles | jq '.articles | length'

# 3. Request OTP
curl -s -X POST http://localhost:5000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+66812345678"}' | jq

# 4. Run automated tests
npm run test:api
```

---

## Sample Test Data

After running `npm run seed`, you have:

| Account | Phone | Password | Role |
|---------|-------|----------|------|
| Admin | +66800000001 | admin123 | admin |
| Doctor | +66800000002 | doctor123 | doctor |
| Patient | +66812345678 | password123 | patient |

---

## Troubleshooting

### Database Connection Failed

```bash
# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection
npx prisma db pull
```

### Migrations Not Applied

```bash
# Reset and reapply migrations
npx prisma migrate reset --force
npm run seed
```

### Prisma Client Not Generated

```bash
npx prisma generate
```

---

**Document Version**: 1.0  
**Migration**: Sequelize → Prisma (Completed)

