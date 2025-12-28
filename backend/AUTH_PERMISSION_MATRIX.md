# Authorization & Permission Matrix

## Role Definitions

- **Patient**: Can only access their own data
- **Doctor**: Can access all patient data, create/update cases
- **Admin**: Full system access, user management

---

## Permission Matrix

| Resource | Action | Patient | Doctor | Admin | Notes |
|----------|--------|---------|--------|-------|-------|
| **Authentication** |
| OTP Request | POST | ✅ | ✅ | ✅ | All roles |
| OTP Verify | POST | ✅ | ✅ | ✅ | All roles |
| Register | POST | ✅ | ✅ | ✅ | All roles |
| **User Profile** |
| Own Profile | GET | ✅ | ✅ | ✅ | All roles |
| Own Profile | PUT | ✅ | ✅ | ✅ | All roles |
| Other User Profile | GET | ❌ | ✅ | ✅ | Doctor/Admin |
| Other User Profile | PUT | ❌ | ❌ | ✅ | Admin only |
| **Patient Cases** |
| Own Cases | GET | ✅ | ✅ | ✅ | Patient sees own only |
| Own Case Detail | GET | ✅ | ✅ | ✅ | Patient sees own only |
| All Cases | GET | ❌ | ✅ | ✅ | Doctor/Admin |
| Any Case Detail | GET | ❌ | ✅ | ✅ | Doctor/Admin |
| Create Case | POST | ❌ | ✅ | ✅ | Doctor/Admin |
| Update Case | PUT | ❌ | ✅ | ✅ | Doctor/Admin |
| Delete Case | DELETE | ❌ | ✅ | ✅ | Doctor/Admin |
| **Case Images** |
| Own Case Images | GET | ✅ | ✅ | ✅ | Patient sees own only |
| All Case Images | GET | ❌ | ✅ | ✅ | Doctor/Admin |
| Upload Image | POST | ❌ | ✅ | ✅ | Doctor/Admin |
| **Medications** |
| Own Medications | GET | ✅ | ❌ | ❌ | Patient only |
| Own Medications | POST | ✅ | ❌ | ❌ | Patient only |
| Own Medications | PUT | ✅ | ❌ | ❌ | Patient only |
| Own Medications | DELETE | ✅ | ❌ | ❌ | Patient only |
| All Medications | GET | ❌ | ✅ | ✅ | Doctor/Admin (read-only) |
| **Medication Logs** |
| Own Logs | GET | ✅ | ❌ | ❌ | Patient only |
| Own Logs | POST | ✅ | ❌ | ❌ | Patient only |
| All Logs | GET | ❌ | ✅ | ✅ | Doctor/Admin (read-only) |
| **Vision Tests** |
| Own Tests | GET | ✅ | ✅ | ✅ | Patient sees own only |
| Own Tests | POST | ✅ | ✅ | ✅ | Patient can create |
| All Tests | GET | ❌ | ✅ | ✅ | Doctor/Admin |
| **Articles** |
| Published Articles | GET | ✅ | ✅ | ✅ | All roles |
| Article Detail | GET | ✅ | ✅ | ✅ | All roles |
| Create Article | POST | ❌ | ❌ | ✅ | Admin only |
| Update Article | PUT | ❌ | ❌ | ✅ | Admin only |
| Delete Article | DELETE | ❌ | ❌ | ✅ | Admin only |
| **Consent & PDPA** |
| Current Terms | GET | ✅ | ✅ | ✅ | Public |
| Own Consents | GET | ✅ | ✅ | ✅ | All roles |
| Create Consent | POST | ✅ | ✅ | ✅ | All roles |
| All Consents | GET | ❌ | ❌ | ✅ | Admin only |
| **Audit Logs** |
| Own Logs | GET | ❌ | ❌ | ❌ | Not accessible |
| All Logs | GET | ❌ | ❌ | ✅ | Admin only |
| **User Management** |
| List Users | GET | ❌ | ❌ | ✅ | Admin only |
| Get User | GET | ❌ | ✅ | ✅ | Doctor/Admin |
| Create User | POST | ❌ | ❌ | ✅ | Admin only |
| Update User | PUT | ❌ | ❌ | ✅ | Admin only |
| Delete User | DELETE | ❌ | ❌ | ✅ | Admin only |

---

## Row-Level Security Rules

### Application Layer (Primary)

All queries are filtered at the application layer using Prisma queries:

#### Patient Data Isolation
```typescript
// Patients can only see their own data
if (user.role === 'patient') {
  where.patientId = user.id;
}
```

#### Doctor Access
```typescript
// Doctors can see all patient data
if (user.role === 'doctor' || user.role === 'admin') {
  // No filter - can see all
}
```

### Database Layer (Optional - PostgreSQL RLS)

For additional security, PostgreSQL Row-Level Security policies can be enabled:

```sql
-- Enable RLS on patient_cases
ALTER TABLE patient_cases ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can only see their own cases
CREATE POLICY patient_cases_patient_policy ON patient_cases
  FOR SELECT
  USING (
    patient_id = current_setting('app.current_user_id')::uuid
  );

-- Policy: Doctors can see all cases
CREATE POLICY patient_cases_doctor_policy ON patient_cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = current_setting('app.current_user_id')::uuid
      AND users.role IN ('doctor', 'admin')
    )
  );
```

**Note**: RLS requires setting `app.current_user_id` in each database session, which adds complexity. Application-layer filtering is recommended for MVP.

---

## Authorization Middleware

### Middleware Chain

```
Request → authenticate → requireRole → checkOwnership → controller
```

### Implementation

```typescript
// 1. Authenticate - Verify JWT token
authenticate(req, res, next) {
  // Verify JWT
  // Attach user to req.user
}

// 2. Require Role - Check user role
requireRole(...allowedRoles) {
  if (!allowedRoles.includes(req.user.role)) {
    throw 403 Forbidden
  }
}

// 3. Check Ownership - Verify resource ownership
checkOwnership(resourceType, resourceId) {
  if (req.user.role === 'patient') {
    // Verify resource belongs to user
    if (resource.patientId !== req.user.id) {
      throw 403 Forbidden
    }
  }
}
```

---

## Special Cases

### 1. Patient Cases
- **Patient**: Can only read their own cases
- **Doctor**: Can read all cases, create/update any case
- **Admin**: Full access

### 2. Medications
- **Patient**: Full CRUD on own medications
- **Doctor/Admin**: Read-only access to all medications (for medical records)

### 3. Articles
- **All Roles**: Read published articles
- **Admin Only**: Create/update/delete articles

### 4. Audit Logs
- **Admin Only**: Full access
- **Others**: No access (privacy/security)

---

## Security Considerations

1. **Always verify ownership** at application layer
2. **Never trust client-provided IDs** - always verify from database
3. **Use parameterized queries** (Prisma handles this)
4. **Log all access attempts** (audit logs)
5. **Rate limiting** on sensitive endpoints
6. **Input validation** on all requests

---

## Example Authorization Checks

### Patient accessing own case
```typescript
// ✅ Allowed
GET /cases/{own-case-id}
// Query: WHERE patientId = currentUserId
```

### Patient accessing other's case
```typescript
// ❌ Forbidden (403)
GET /cases/{other-case-id}
// Query: WHERE patientId = currentUserId AND id = other-case-id
// Result: Empty - 403 returned
```

### Doctor accessing any case
```typescript
// ✅ Allowed
GET /cases/{any-case-id}
// Query: WHERE id = any-case-id (no patientId filter)
```

---

**Last Updated**: December 2024

