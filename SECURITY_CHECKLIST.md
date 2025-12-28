# POLACARE Security Checklist

**Last Audit**: December 2024  
**Status**: ✅ Core security implemented | ⚠️ Some improvements recommended

---

## Executive Summary

| Category | Status | Priority |
|----------|--------|----------|
| IDOR/Ownership Checks | ✅ Implemented | P1 |
| RBAC Enforcement | ✅ Implemented | P1 |
| Rate Limiting | ✅ Implemented | P1 |
| JWT Security | ⚠️ Needs Improvement | P2 |
| Image Access Control | ✅ Implemented | P1 |
| Input Validation | ✅ Implemented | P1 |
| Security Headers | ✅ Implemented | P2 |

---

## 1. IDOR (Insecure Direct Object Reference) Audit

### Patient Endpoints - Ownership Checks

| Endpoint | Controller | Check | Status |
|----------|------------|-------|--------|
| `GET /cases` | caseController | `patientId: req.user.id` | ✅ |
| `GET /cases/:id` | caseController | `patientId: req.user.id` | ✅ |
| `POST /cases` | caseController | Creates with `req.user.id` | ✅ |
| `GET /medications` | medicationController | `patientId: req.user.id` | ✅ |
| `POST /medications` | medicationController | Creates with `req.user.id` | ✅ |
| `PUT /medications/:id` | medicationController | Verifies ownership | ✅ |
| `DELETE /medications/:id` | medicationController | Verifies ownership | ✅ |
| `POST /medications/:id/log` | medicationController | Verifies ownership | ✅ |
| `GET /medications/:id/logs` | medicationController | Verifies ownership | ✅ |
| `GET /vision-tests` | visionTestController | `patientId: req.user.id` | ✅ |
| `GET /vision-tests/:id` | visionTestController | Verifies ownership | ✅ |
| `POST /vision-tests` | visionTestController | Creates with `req.user.id` | ✅ |
| `DELETE /vision-tests/:id` | visionTestController | Verifies ownership | ✅ |
| `GET /images/:id/proxy` | imageController | Verifies case ownership | ✅ |
| `GET /images/:id/download-url` | imageController | Verifies case ownership | ✅ |
| `GET /consents` | consentController | `userId: req.user.id` | ✅ |
| `POST /consents` | consentController | Creates with `req.user.id` | ✅ |
| `GET /consents/check` | consentController | `userId: req.user.id` | ✅ |

### Code Pattern Used

```typescript
// Correct pattern (used consistently)
const medication = await prisma.medication.findFirst({
  where: {
    id,
    patientId: req.user!.id  // Ownership check
  }
});

if (!medication) {
  throw new AppError('Medication not found', 404); // Returns 404, not 403
}
```

**Security Note**: Returning 404 instead of 403 prevents information leakage about resource existence.

---

## 2. RBAC (Role-Based Access Control) Audit

### Role Hierarchy

```
admin → doctor → patient
  ↓       ↓        ↓
  All   Medical  Own data
 access   data    only
```

### Route Protection

| Route Prefix | Required Role | Middleware | Status |
|--------------|---------------|------------|--------|
| `/api/v1/admin/*` | admin | `requireAdmin` | ✅ |
| `/api/v1/admin/cases/*` | doctor, admin | `requireDoctor` | ✅ |
| `/api/v1/admin/patients/search` | doctor, admin | `requireDoctor` | ✅ |
| `/api/v1/doctor/*` | doctor, admin | `requireDoctor` | ✅ |
| `/api/v1/cases` | patient (own data) | `authenticate` | ✅ |
| `/api/v1/medications` | patient (own data) | `authenticate` | ✅ |
| `/api/v1/articles` | public | none | ✅ |

### Middleware Chain

```typescript
// Admin routes
router.use(authenticate);        // Verify JWT
router.use(requireAdmin);        // Check role = 'admin'

// Doctor routes  
router.use(authenticate);
router.use(requireDoctor);       // Check role in ['doctor', 'admin']

// Patient routes
router.use(authenticate);
// + ownership check in controller
```

---

## 3. Rate Limiting

### Current Configuration

| Endpoint | Limiter | Window | Max Requests | Status |
|----------|---------|--------|--------------|--------|
| `POST /auth/otp/request` | `otpRateLimiter` | 1 hour | 3 | ✅ |
| `POST /auth/otp/verify` | `authRateLimiter` | 15 min | 5 | ✅ |
| `POST /auth/register` | `authRateLimiter` | 15 min | 5 | ✅ |
| `/api/*` | `limiter` | 15 min | 100 | ✅ |
| `/api/v1/ai/*` | `aiRateLimiter` | 1 hour | 20 | ✅ |

### Implementation

```typescript
// backend/src/middleware/security.ts
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 3,                     // 3 requests
  skipSuccessfulRequests: false
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,
  skipSuccessfulRequests: true  // Only count failures
});
```

---

## 4. JWT Security

### Current Implementation

| Aspect | Implementation | Status |
|--------|----------------|--------|
| Algorithm | HS256 (default) | ⚠️ Consider RS256 |
| Expiry | 7 days | ⚠️ Consider shorter |
| Storage | localStorage | ⚠️ XSS vulnerable |
| Refresh | Not implemented | ⚠️ Recommended |

### Token Payload

```typescript
// Current (minimal - good)
{ userId: string }

// Avoid including sensitive data ✅
```

### Recommendations

1. **Short-lived tokens** (15-30 min) with refresh tokens
2. **httpOnly cookies** for token storage (prevents XSS)
3. **Token rotation** on sensitive operations
4. **Logout invalidation** via blacklist

### Improved Auth Flow (Recommended)

```
Client                              Server
  |                                    |
  |-- POST /auth/login --------------->|
  |<-- Set-Cookie: token (httpOnly) ---|
  |                                    |
  |-- GET /api/data (Cookie auto) ---->|
  |<-- Data ----------------------------|
  |                                    |
  |-- POST /auth/refresh ------------->|
  |<-- Set-Cookie: new token ----------|
```

---

## 5. Image Access Control

### Access Matrix

| User Role | Upload | View Own | View Others | Delete |
|-----------|--------|----------|-------------|--------|
| Patient | ❌ | ✅ | ❌ | ❌ |
| Doctor | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ |

### Implementation

```typescript
// imageController.ts
if (req.user?.role === 'patient' && image.case.patientId !== req.user.id) {
  throw new AppError('Access denied', 403);
}
```

### Signed URLs

- Upload URLs: ✅ Generated with expiry
- Download URLs: ✅ Generated with expiry (3600s default)
- Proxy endpoint: ✅ Access control enforced

---

## 6. Input Validation

### Validation Layers

| Layer | Tool | Status |
|-------|------|--------|
| Request body | `express-validator` | ✅ |
| Phone number | Custom `validatePhoneNumber()` | ✅ |
| Password | Custom `validatePassword()` | ✅ |
| File upload | Multer + Sharp | ✅ |
| SQL Injection | Prisma ORM (parameterized) | ✅ |

### Example

```typescript
router.post('/register', [
  body('phoneNumber').notEmpty(),
  body('password').isLength({ min: 8 }),
  body('email').optional().isEmail(),
  body('gender').isIn(['Male', 'Female', 'Other'])
], register);
```

---

## 7. Security Headers

### Headers Applied

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer |
| `Content-Security-Policy` | Configured | XSS prevention |
| `Strict-Transport-Security` | Via Helmet | Force HTTPS |

---

## 8. Data Protection (PDPA Compliance)

### Sensitive Data Handling

| Data Type | Protection | Status |
|-----------|------------|--------|
| Passwords | bcrypt (cost 10) | ✅ |
| Phone numbers | Not exposed in logs | ✅ |
| Medical records | Access controlled | ✅ |
| Audit logs | All changes tracked | ✅ |

---

## 9. Identified Vulnerabilities & Fixes

### Fixed in This Audit

| Issue | Severity | Fix |
|-------|----------|-----|
| Missing rate limit on sensitive endpoints | Medium | Added `sensitiveRateLimiter` |
| JWT in localStorage | Medium | Documented; cookie option added |
| No input sanitization | Low | Added `sanitizeInput` middleware |

### Remaining Recommendations

| Issue | Priority | Recommendation |
|-------|----------|----------------|
| Implement refresh tokens | P2 | Add `/auth/refresh` endpoint |
| Add CSRF protection | P2 | Use `csurf` for form submissions |
| Implement audit log rotation | P3 | Archive old logs |
| Add 2FA option | P3 | TOTP for admin accounts |

---

## 10. Testing Checklist

### Manual Security Tests

- [ ] Try accessing another user's case by ID → Should get 404
- [ ] Try admin endpoints with patient token → Should get 403
- [ ] Spam OTP endpoint → Should get rate limited after 3
- [ ] Submit XSS payload in name → Should be sanitized
- [ ] Try SQL injection in search → Prisma should block

### Automated Tests

```bash
# Run security tests
npm run test:security

# OWASP ZAP scan (if configured)
npm run test:owasp
```

---

## 11. Incident Response

### If Breach Detected

1. **Immediate**: Revoke all JWTs (change JWT_SECRET)
2. **Investigate**: Check audit logs for unauthorized access
3. **Notify**: Alert affected users (PDPA requirement)
4. **Fix**: Patch vulnerability
5. **Review**: Update security policies

### Audit Log Query

```sql
-- Find suspicious activity
SELECT * FROM audit_logs 
WHERE action IN ('VIEW', 'UPDATE', 'DELETE')
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

---

## 12. Environment Security

### Required Environment Variables

```bash
# NEVER commit these to git
JWT_SECRET=<strong-random-string-64-chars>
DATABASE_URL=<postgres-connection-string>
TWILIO_AUTH_TOKEN=<if-using-twilio>
AWS_SECRET_ACCESS_KEY=<if-using-s3>
```

### Production Checklist

- [ ] `NODE_ENV=production`
- [ ] Strong `JWT_SECRET` (min 64 chars)
- [ ] HTTPS enforced
- [ ] Database behind firewall
- [ ] Logs don't contain PII
- [ ] Rate limits tuned for production load

---

**Document Version**: 1.0  
**Next Review**: January 2025

