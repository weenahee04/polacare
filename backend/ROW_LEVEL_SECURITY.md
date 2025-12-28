# Row-Level Security Implementation

## Approach: Application-Layer RLS (Primary)

We use **application-layer row-level security** as the primary security mechanism. This is implemented in middleware and Prisma queries.

### Why Application-Layer?

1. **Simplicity**: Easier to implement and maintain
2. **Flexibility**: Can handle complex business logic
3. **Performance**: No overhead from database policies
4. **Debugging**: Easier to trace and debug
5. **Type Safety**: Prisma provides type-safe queries

### Implementation

#### 1. Middleware: `addPatientFilter`

Automatically filters queries for patients:

```typescript
// In controller
const where = buildPatientWhere(req, {
  status: 'Finalized'
});

// For patients: { patientId: req.user.id, status: 'Finalized' }
// For doctors: { status: 'Finalized' }
const cases = await prisma.patientCase.findMany({ where });
```

#### 2. Middleware: `verifyOwnership`

Verifies resource ownership before access:

```typescript
// In route
router.get('/cases/:id', 
  authenticate,
  requirePatientOwnership('cases'),
  getCase
);
```

#### 3. Helper: `buildPatientWhere`

Builds Prisma where clause with patient filter:

```typescript
const where = buildPatientWhere(req, {
  status: 'Finalized',
  date: { gte: new Date('2024-01-01') }
});
```

---

## Database-Layer RLS (Optional - Future)

For additional security, PostgreSQL Row-Level Security can be enabled. This provides defense-in-depth.

### Setup

```sql
-- Enable RLS
ALTER TABLE patient_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_test_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY patient_cases_patient_policy ON patient_cases
  FOR SELECT
  USING (
    patient_id = current_setting('app.current_user_id', true)::uuid
  );

CREATE POLICY patient_cases_doctor_policy ON patient_cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = current_setting('app.current_user_id', true)::uuid
      AND users.role IN ('doctor', 'admin')
    )
  );
```

### Setting User Context

```typescript
// In middleware
await prisma.$executeRaw`
  SET LOCAL app.current_user_id = ${req.user.id}::text
`;
```

**Note**: This adds complexity and requires careful session management. Recommended for production hardening, but not required for MVP.

---

## Security Layers

### Layer 1: Authentication
- JWT token verification
- User identification

### Layer 2: Authorization (Role-Based)
- Role checking (patient/doctor/admin)
- Permission matrix enforcement

### Layer 3: Row-Level Security
- Patient data isolation
- Resource ownership verification

### Layer 4: Input Validation
- Request validation
- SQL injection prevention (Prisma handles this)

---

## Example: Patient Cases

### Patient Query
```typescript
// Patient requests: GET /cases
const where = buildPatientWhere(req, {});
// where = { patientId: 'patient-uuid' }

const cases = await prisma.patientCase.findMany({ where });
// Returns only patient's cases
```

### Doctor Query
```typescript
// Doctor requests: GET /cases
const where = buildPatientWhere(req, {});
// where = {} (no filter)

const cases = await prisma.patientCase.findMany({ where });
// Returns all cases
```

### Patient Accessing Other's Case
```typescript
// Patient requests: GET /cases/other-patient-case-id
router.get('/cases/:id', 
  authenticate,
  requirePatientOwnership('cases'),
  getCase
);

// Middleware checks:
// 1. Is user a patient? Yes
// 2. Does case belong to user? No
// 3. Throw 403 Forbidden
```

---

## Testing RLS

### Test Cases

1. **Patient accessing own data**: ✅ Should succeed
2. **Patient accessing other's data**: ❌ Should return 403
3. **Doctor accessing any data**: ✅ Should succeed
4. **Admin accessing any data**: ✅ Should succeed
5. **Unauthenticated access**: ❌ Should return 401

### Test Implementation

```typescript
describe('Row-Level Security', () => {
  it('should allow patient to access own cases', async () => {
    const patient = await createTestUser({ role: 'patient' });
    const case = await createTestCase({ patientId: patient.id });
    
    const response = await request(app)
      .get(`/api/v1/cases/${case.id}`)
      .set('Authorization', `Bearer ${patientToken}`);
    
    expect(response.status).toBe(200);
  });
  
  it('should deny patient access to other patient\'s case', async () => {
    const patient1 = await createTestUser({ role: 'patient' });
    const patient2 = await createTestUser({ role: 'patient' });
    const case = await createTestCase({ patientId: patient2.id });
    
    const response = await request(app)
      .get(`/api/v1/cases/${case.id}`)
      .set('Authorization', `Bearer ${patient1Token}`);
    
    expect(response.status).toBe(403);
  });
});
```

---

## Best Practices

1. **Always use middleware**: Don't skip ownership checks
2. **Verify in controllers**: Double-check ownership in complex operations
3. **Log access attempts**: Audit all access for security monitoring
4. **Test thoroughly**: Test all permission scenarios
5. **Document exceptions**: If any resource bypasses RLS, document why

---

**Status**: Application-layer RLS implemented and active

