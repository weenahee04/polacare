# POLACARE API Routes

**Base URL**: `/api/v1`

**Authentication**: Bearer token in `Authorization` header

---

## Authentication Routes

### `POST /auth/otp/request`
Request OTP code via SMS.

**Request Body**:
```json
{
  "phoneNumber": "0812345678"
}
```

**Response**: `200 OK`
```json
{
  "message": "OTP sent successfully",
  "phoneNumber": "0812345678",
  "expiresIn": 300
}
```

**Authorization**: None  
**Rate Limit**: 3 requests/hour per phone number

---

### `POST /auth/otp/verify`
Verify OTP and login.

**Request Body**:
```json
{
  "phoneNumber": "0812345678",
  "code": "123456"
}
```

**Response**: `200 OK`
```json
{
  "token": "jwt-token-here",
  "user": { ... },
  "expiresIn": 604800
}
```

**Authorization**: None  
**Rate Limit**: 5 attempts per OTP

---

### `POST /auth/register`
Register new user (after OTP verification).

**Request Body**:
```json
{
  "phoneNumber": "0812345678",
  "password": "SecurePass123!",
  "name": "John Doe",
  "gender": "Male",
  "dateOfBirth": "1990-01-01",
  "weight": 70,
  "height": 175,
  "avatarUrl": "https://..."
}
```

**Response**: `201 Created`
```json
{
  "user": { ... },
  "token": "jwt-token-here"
}
```

**Authorization**: None (but OTP must be verified)

---

### `GET /auth/profile`
Get current user profile.

**Response**: `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "hn": "HN-20241201-0001",
    ...
  }
}
```

**Authorization**: Required (all roles)

---

### `PUT /auth/profile`
Update user profile.

**Request Body**:
```json
{
  "name": "John Doe Updated",
  "weight": 72,
  "height": 175
}
```

**Response**: `200 OK`
```json
{
  "data": { ... },
  "message": "Profile updated successfully"
}
```

**Authorization**: Required (all roles, own profile only)

---

## Patient Cases Routes

### `GET /cases`
Get all cases for current user.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (Draft/Finalized)
- `dateFrom` (optional): Filter from date (ISO)
- `dateTo` (optional): Filter to date (ISO)

**Response**: `200 OK`
```json
{
  "data": {
    "cases": [ ... ],
    "total": 10,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Authorization**: 
- Patient: Own cases only
- Doctor/Admin: All cases

---

### `GET /cases/:id`
Get case by ID.

**Response**: `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "patientId": "uuid",
    "hn": "HN-20241201-0001",
    "diagnosis": "Bacterial Keratitis",
    "images": [ ... ],
    "checklistItems": [ ... ],
    ...
  }
}
```

**Authorization**:
- Patient: Own case only
- Doctor/Admin: Any case

---

### `POST /cases`
Create new case (Doctor/Admin only).

**Request Body**:
```json
{
  "patientId": "uuid",
  "hn": "HN-20241201-0001",
  "patientName": "John Doe",
  "date": "2024-12-01",
  "diagnosis": "Bacterial Keratitis",
  "images": [ ... ],
  "checklistItems": [ ... ],
  ...
}
```

**Response**: `201 Created`
```json
{
  "data": { ... },
  "message": "Case created successfully"
}
```

**Authorization**: Doctor/Admin only

---

### `PUT /cases/:id`
Update case (Doctor/Admin only).

**Request Body**: Same as POST (all fields optional)

**Response**: `200 OK`
```json
{
  "data": { ... },
  "message": "Case updated successfully"
}
```

**Authorization**: Doctor/Admin only

---

### `DELETE /cases/:id`
Delete case (soft delete - set status to Draft).

**Response**: `200 OK`
```json
{
  "message": "Case deleted successfully"
}
```

**Authorization**: Doctor/Admin only

---

## Medication Routes

### `GET /medications`
Get all medications for current user.

**Query Parameters**:
- `isActive` (optional): Filter by active status (true/false)

**Response**: `200 OK`
```json
{
  "data": {
    "medications": [ ... ],
    "total": 5
  }
}
```

**Authorization**: Patient (own medications only)

---

### `POST /medications`
Create medication.

**Request Body**:
```json
{
  "medicineName": "Tobramycin Eye Drops",
  "type": "drop",
  "frequency": "4 times/day",
  "nextTime": "08:00",
  "dosage": "1 drop",
  "startDate": "2024-12-01"
}
```

**Response**: `201 Created`
```json
{
  "data": { ... },
  "message": "Medication created successfully"
}
```

**Authorization**: Patient (own medications only)

---

### `PUT /medications/:id`
Update medication.

**Request Body**: Same as POST (all fields optional)

**Response**: `200 OK`
```json
{
  "data": { ... },
  "message": "Medication updated successfully"
}
```

**Authorization**: Patient (own medications only)

---

### `DELETE /medications/:id`
Delete medication (soft delete).

**Response**: `200 OK`
```json
{
  "message": "Medication deleted successfully"
}
```

**Authorization**: Patient (own medications only)

---

## Medication Logs Routes

### `GET /medications/:id/logs`
Get medication logs.

**Query Parameters**:
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date

**Response**: `200 OK`
```json
{
  "data": {
    "logs": [ ... ],
    "total": 20,
    "adherenceRate": 85.5
  }
}
```

**Authorization**: Patient (own medication logs only)

---

### `POST /medications/:id/logs`
Create medication log entry.

**Request Body**:
```json
{
  "scheduledTime": "2024-12-01T08:00:00Z",
  "taken": true,
  "notes": "Taken as prescribed"
}
```

**Response**: `201 Created`
```json
{
  "data": { ... },
  "message": "Log entry created successfully"
}
```

**Authorization**: Patient (own medications only)

---

## Vision Test Routes

### `GET /vision-tests`
Get all vision test results.

**Query Parameters**:
- `testType` (optional): Filter by test type
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date

**Response**: `200 OK`
```json
{
  "data": {
    "tests": [ ... ],
    "total": 5
  }
}
```

**Authorization**: Patient (own tests only)

---

### `POST /vision-tests`
Create vision test result.

**Request Body**:
```json
{
  "testName": "Amsler Grid Test",
  "testType": "AmslerGrid",
  "result": "Normal",
  "details": "No abnormalities detected"
}
```

**Response**: `201 Created`
```json
{
  "data": { ... },
  "message": "Test result saved successfully"
}
```

**Authorization**: Patient (own tests only)

---

## Article Routes

### `GET /articles`
Get all published articles.

**Query Parameters**:
- `category` (optional): Filter by category
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search in title/content

**Response**: `200 OK`
```json
{
  "data": {
    "articles": [ ... ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Authorization**: All authenticated users

---

### `GET /articles/:id`
Get article by ID.

**Response**: `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "title": "...",
    "content": "...",
    "viewCount": 100,
    ...
  }
}
```

**Authorization**: All authenticated users  
**Side Effect**: Increments view count

---

### `POST /articles`
Create article (Admin only).

**Request Body**:
```json
{
  "title": "Eye Care Tips",
  "category": "General",
  "imageUrl": "https://...",
  "content": "...",
  "excerpt": "...",
  "readTime": "5 min read",
  "isPublished": true
}
```

**Response**: `201 Created`
```json
{
  "data": { ... },
  "message": "Article created successfully"
}
```

**Authorization**: Admin only

---

### `PUT /articles/:id`
Update article (Admin only).

**Request Body**: Same as POST (all fields optional)

**Response**: `200 OK`
```json
{
  "data": { ... },
  "message": "Article updated successfully"
}
```

**Authorization**: Admin only

---

### `DELETE /articles/:id`
Delete article (Admin only).

**Response**: `200 OK`
```json
{
  "message": "Article deleted successfully"
}
```

**Authorization**: Admin only

---

## Consent & PDPA Routes

### `GET /terms/current`
Get current active terms version.

**Response**: `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "version": "1.0",
    "content": "...",
    "effectiveDate": "2024-12-01",
    "isActive": true
  }
}
```

**Authorization**: None

---

### `POST /consents`
Create consent record.

**Request Body**:
```json
{
  "termsVersion": "1.0",
  "consentType": "terms",
  "accepted": true
}
```

**Response**: `201 Created`
```json
{
  "data": { ... },
  "message": "Consent recorded successfully"
}
```

**Authorization**: Required (all roles)

---

### `GET /consents`
Get user's consent history.

**Response**: `200 OK`
```json
{
  "data": {
    "consents": [ ... ],
    "total": 3
  }
}
```

**Authorization**: Required (own consents only)

---

## Audit Log Routes

### `GET /audit-logs`
Get audit logs (Admin only).

**Query Parameters**:
- `userId` (optional): Filter by user
- `action` (optional): Filter by action
- `resourceType` (optional): Filter by resource type
- `dateFrom` (optional): Filter from date
- `dateTo` (optional): Filter to date
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response**: `200 OK`
```json
{
  "data": {
    "logs": [ ... ],
    "total": 1000,
    "page": 1,
    "limit": 50,
    "totalPages": 20
  }
}
```

**Authorization**: Admin only

---

## Health Check

### `GET /health`
Health check endpoint.

**Response**: `200 OK`
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 3600,
  "timestamp": "2024-12-01T10:00:00Z"
}
```

**Authorization**: None

---

## Error Responses

All endpoints may return:

**400 Bad Request**:
```json
{
  "error": "Validation error",
  "message": "Invalid input",
  "details": {
    "field": "error message"
  }
}
```

**401 Unauthorized**:
```json
{
  "error": "Authentication required",
  "message": "Please login to access this resource"
}
```

**403 Forbidden**:
```json
{
  "error": "Access denied",
  "message": "You don't have permission to access this resource"
}
```

**404 Not Found**:
```json
{
  "error": "Resource not found",
  "message": "The requested resource was not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "requestId": "uuid"
}
```

