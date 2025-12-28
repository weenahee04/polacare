# POLACARE Technical Specification

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Production Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Specification](#api-specification)
6. [Authentication & Authorization](#authentication--authorization)
7. [Security](#security)
8. [Deployment](#deployment)
9. [Development Guide](#development-guide)
10. [Testing](#testing)

---

## 1. System Overview

### 1.1 Purpose
POLACARE is a comprehensive patient portal application for eye care management, featuring AI-powered analysis, medical records management, and health tracking capabilities.

### 1.2 Key Features
- **Patient Portal**: Access to medical records, test results, and health information
- **Doctor Dashboard**: Case management, patient records, and medical documentation
- **Admin Panel**: User management, system administration, and analytics
- **AI Integration**: Google Gemini AI for medical image analysis
- **Vision Testing**: Amsler Grid, Ishihara, and AI Retinal Age tests
- **Medication Tracking**: Medication schedule and adherence tracking
- **Health Articles**: Educational content about eye care

### 1.3 User Roles
- **Patient**: View own records, manage medications, take vision tests
- **Doctor**: Manage cases, view all patients, create medical records
- **Admin**: Full system access, user management, system configuration

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
│   Port: 3000    │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend API   │
│   (Express)     │
│   Port: 5000    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│PostgreSQL│ │Gemini AI│
│Database  │ │Service  │
└──────────┘ └─────────┘
```

### 2.2 Component Structure

**Frontend:**
- React 19.2.3 with TypeScript
- Vite for build tooling
- Component-based architecture
- State management via React hooks

**Backend:**
- Express.js REST API
- TypeScript for type safety
- Sequelize ORM for database
- Modular architecture (controllers, services, middleware)

### 2.3 Data Flow

1. **User Request** → Frontend
2. **API Call** → Backend (with JWT token)
3. **Authentication** → Verify JWT, check role
4. **Business Logic** → Controllers → Services
5. **Data Access** → Sequelize → PostgreSQL
6. **Response** → JSON → Frontend

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.3 | UI Framework |
| TypeScript | 5.8.2 | Type Safety |
| Vite | 6.2.0 | Build Tool |
| Tailwind CSS | - | Styling |
| Lucide React | 0.562.0 | Icons |

### 3.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | Runtime |
| Express.js | 4.18.2 | Web Framework |
| TypeScript | 5.3.3 | Type Safety |
| PostgreSQL | 15+ | Database |
| Sequelize | 6.35.2 | ORM |
| JWT | 9.0.2 | Authentication |
| Winston | 3.11.0 | Logging |
| Helmet | 7.1.0 | Security |

### 3.3 External Services

- **Google Gemini AI**: Medical image analysis
- **Twilio**: SMS OTP delivery
- **Nodemailer**: Email notifications (optional)

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```
Users (1) ────< (N) PatientCases
Users (1) ────< (N) Medications
Users (1) ────< (N) VisionTests
PatientCases (1) ────< (N) ChecklistItems
```

### 4.2 Tables

#### 4.2.1 Users
```sql
- id: UUID (PK)
- phone_number: VARCHAR(20) UNIQUE
- password: VARCHAR(255) [hashed]
- name: VARCHAR(255)
- name: VARCHAR(255)
- hn: VARCHAR(50) UNIQUE
- avatar_url: VARCHAR(500)
- gender: ENUM('Male', 'Female', 'Other')
- date_of_birth: DATE
- weight: DECIMAL(5,2)
- height: DECIMAL(5,2)
- bmi: DECIMAL(4,2)
- role: ENUM('patient', 'doctor', 'admin')
- is_verified: BOOLEAN
- is_active: BOOLEAN
- license_number: VARCHAR(100) [doctor only]
- specialization: VARCHAR(255) [doctor only]
- department: VARCHAR(255) [doctor only]
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 4.2.2 OTPs
```sql
- id: UUID (PK)
- phone_number: VARCHAR(20)
- code: VARCHAR(10)
- expires_at: TIMESTAMP
- is_used: BOOLEAN
- created_at: TIMESTAMP
```

#### 4.2.3 Patient Cases
```sql
- id: UUID (PK)
- user_id: UUID (FK → Users)
- hn: VARCHAR(50)
- patient_name: VARCHAR(255)
- date: DATE
- image_url: VARCHAR(500)
- ai_analysis_text: TEXT
- doctor_notes: TEXT
- diagnosis: VARCHAR(255)
- left_eye_visual_acuity: VARCHAR(50)
- left_eye_intraocular_pressure: VARCHAR(50)
- left_eye_diagnosis: VARCHAR(255)
- left_eye_note: TEXT
- right_eye_visual_acuity: VARCHAR(50)
- right_eye_intraocular_pressure: VARCHAR(50)
- right_eye_diagnosis: VARCHAR(255)
- right_eye_note: TEXT
- status: ENUM('Draft', 'Finalized')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 4.2.4 Checklist Items
```sql
- id: UUID (PK)
- case_id: UUID (FK → PatientCases)
- category: VARCHAR(100)
- label: VARCHAR(255)
- is_observed: BOOLEAN
- is_verified: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 4.2.5 Medications
```sql
- id: UUID (PK)
- user_id: UUID (FK → Users)
- medicine_name: VARCHAR(255)
- frequency: VARCHAR(100)
- next_time: VARCHAR(10)
- taken: BOOLEAN
- type: ENUM('drop', 'pill', 'other')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 4.2.6 Vision Tests
```sql
- id: UUID (PK)
- user_id: UUID (FK → Users)
- test_name: VARCHAR(100)
- result: VARCHAR(50)
- details: TEXT
- test_date: DATE
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 4.2.7 Articles
```sql
- id: UUID (PK)
- title: VARCHAR(500)
- category: VARCHAR(100)
- image_url: VARCHAR(500)
- content: TEXT
- read_time: VARCHAR(20)
- published_at: TIMESTAMP
- is_published: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 4.3 Indexes

- `users(phone_number)` - Unique
- `users(hn)` - Unique
- `users(role)` - For role-based queries
- `patient_cases(user_id)` - For patient queries
- `patient_cases(date)` - For date range queries
- `otps(phone_number, code, expires_at)` - For OTP validation

---

## 5. API Specification

### 5.1 Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.polacare.com/api/v1
```

### 5.2 Authentication Endpoints

#### POST `/auth/otp/request`
Request OTP code via SMS.

**Request:**
```json
{
  "phoneNumber": "0812345678"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "phoneNumber": "0812345678"
}
```

#### POST `/auth/otp/verify`
Verify OTP and login.

**Request:**
```json
{
  "phoneNumber": "0812345678",
  "code": "123456"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "hn": "HN-123456",
    "role": "patient",
    ...
  }
}
```

#### POST `/auth/register`
Register new user.

**Request:**
```json
{
  "phoneNumber": "0812345678",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "gender": "Male",
  "dateOfBirth": "1990-01-01",
  "weight": 70,
  "height": 175
}
```

#### GET `/auth/profile`
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT `/auth/profile`
Update user profile.

### 5.3 Patient Endpoints

#### GET `/cases`
Get all cases for current patient.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "cases": [
    {
      "id": "uuid",
      "diagnosis": "Bacterial Keratitis",
      "date": "2023-10-25",
      "status": "Finalized",
      ...
    }
  ]
}
```

#### GET `/cases/:id`
Get case details.

#### GET `/medications`
Get all medications.

#### POST `/medications`
Create medication.

#### PUT `/medications/:id`
Update medication.

#### DELETE `/medications/:id`
Delete medication.

#### GET `/vision-tests`
Get all vision tests.

#### POST `/vision-tests`
Create vision test result.

### 5.4 Doctor Endpoints

#### GET `/doctor/dashboard`
Get doctor dashboard statistics.

**Headers:**
```
Authorization: Bearer <doctor-token>
```

**Response:**
```json
{
  "stats": {
    "totalCases": 150,
    "todayCases": 5,
    "pendingCases": 3
  },
  "recentCases": [...]
}
```

#### GET `/doctor/cases`
Get all cases (with pagination).

**Query Parameters:**
- `patientId` (optional)
- `status` (optional)
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional)

#### GET `/doctor/cases/:id`
Get case by ID.

#### POST `/doctor/cases`
Create new case.

**Request:**
```json
{
  "patientId": "uuid",
  "diagnosis": "Bacterial Keratitis",
  "imageUrl": "https://...",
  "doctorNotes": "Patient requires follow-up",
  "leftEye": {
    "visualAcuity": "20/20",
    "intraocularPressure": "15",
    "diagnosis": "Normal"
  },
  "rightEye": {...},
  "checklist": {
    "items": [...]
  },
  "status": "Finalized"
}
```

#### PUT `/doctor/cases/:id`
Update case.

#### GET `/doctor/patients`
Get all patients.

**Query Parameters:**
- `search` (optional)
- `page` (default: 1)
- `limit` (default: 20)

### 5.5 Admin Endpoints

#### GET `/admin/dashboard/stats`
Get admin dashboard statistics.

**Response:**
```json
{
  "stats": {
    "users": {
      "total": 1000,
      "patients": 950,
      "doctors": 45,
      "admins": 5
    },
    "cases": {
      "total": 5000,
      "recent": 150
    }
  }
}
```

#### GET `/admin/users`
Get all users.

**Query Parameters:**
- `role` (optional: patient, doctor, admin)
- `search` (optional)
- `page` (default: 1)
- `limit` (default: 20)

#### GET `/admin/users/:id`
Get user by ID.

#### POST `/admin/users`
Create new user (admin/doctor).

**Request:**
```json
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

#### PUT `/admin/users/:id`
Update user.

#### DELETE `/admin/users/:id`
Deactivate user (soft delete).

### 5.6 Article Endpoints

#### GET `/articles`
Get all published articles.

**Query Parameters:**
- `category` (optional)

#### GET `/articles/:id`
Get article by ID.

### 5.7 AI Endpoints

#### POST `/ai/analyze-image`
Analyze medical image using AI.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
- `image`: File (JPEG, PNG, WebP)
- Max size: 10MB

**Response:**
```json
{
  "text": "Analysis result...",
  "checklistData": {
    "title": "Slit Lamp Exam",
    "items": [...]
  }
}
```

#### POST `/ai/retinal-age`
Analyze retinal age from fundus image.

**Request:**
- `image`: File
- `actualAge`: Number

**Response:**
```json
{
  "predictedAge": 45,
  "actualAge": 43,
  "gap": 2,
  "confidence": 0.92,
  "riskFactors": ["None specific"],
  "analysisText": "Your retinal vasculature appears healthy..."
}
```

### 5.8 Response Format

**Success Response:**
```json
{
  "data": {...},
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "requestId": "uuid",
  "details": {...}
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow

1. **Request OTP**: User requests OTP via phone number
2. **OTP Delivery**: System sends OTP via SMS (Twilio)
3. **OTP Verification**: User submits OTP code
4. **Token Generation**: System generates JWT token
5. **Token Usage**: Client includes token in `Authorization: Bearer <token>` header

### 6.2 JWT Token Structure

**Payload:**
```json
{
  "userId": "uuid",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Token Expiration:**
- Default: 7 days
- Configurable via `JWT_EXPIRES_IN` environment variable

### 6.3 Role-Based Access Control (RBAC)

**Roles:**
- `patient`: Can access own data only
- `doctor`: Can access all cases and patients
- `admin`: Full system access

**Permission Matrix:**

| Feature | Patient | Doctor | Admin |
|---------|---------|--------|-------|
| View own profile | ✅ | ✅ | ✅ |
| View own cases | ✅ | ✅ | ✅ |
| View all cases | ❌ | ✅ | ✅ |
| Create case | ❌ | ✅ | ✅ |
| Update case | ❌ | ✅ | ✅ |
| View patients | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| System stats | ❌ | ✅ | ✅ |

### 6.4 Middleware

**Authentication Middleware:**
- Verifies JWT token
- Extracts user information
- Attaches user to request object

**Role Middleware:**
- `requireRole(...roles)`: Check if user has required role
- `requireAdmin`: Admin only
- `requireDoctor`: Doctor or Admin
- `requirePatient`: All roles

---

## 7. Security

### 7.1 Security Measures

1. **Password Security**
   - Bcrypt hashing (10 rounds)
   - Minimum 8 characters
   - Requires: uppercase, lowercase, number, special character

2. **JWT Security**
   - Strong secret key (environment variable)
   - Token expiration
   - Secure token storage (client-side)

3. **API Security**
   - Helmet.js for security headers
   - CORS configuration
   - Rate limiting
   - Input validation (express-validator)
   - SQL injection prevention (Sequelize ORM)

4. **File Upload Security**
   - File type validation (JPEG, PNG, WebP only)
   - File size limits (10MB)
   - Image processing and optimization
   - Secure file storage

5. **OTP Security**
   - 6-digit code
   - 5-minute expiration
   - One-time use
   - Rate limiting (3 requests/hour)

### 7.2 Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 7.3 Rate Limiting

- **General API**: 100 requests / 15 minutes
- **Auth Endpoints**: 5 requests / 15 minutes
- **OTP Requests**: 3 requests / hour
- **AI Endpoints**: 20 requests / hour

---

## 8. Deployment

### 8.1 Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=polacare
DB_USER=postgres
DB_PASSWORD=secure-password
JWT_SECRET=very-secure-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://polacare.com
GEMINI_API_KEY=your-key
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
LOG_LEVEL=info
```

**Frontend (.env.local):**
```env
VITE_API_URL=https://api.polacare.com/api/v1
```

### 8.2 Docker Deployment

**docker-compose.yml:**
- PostgreSQL container
- Backend container
- Frontend container (Nginx)

**Commands:**
```bash
docker-compose up -d
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### 8.3 Production Checklist

- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] SSL/HTTPS enabled
- [ ] Domain configured
- [ ] CORS origins set correctly
- [ ] JWT secret changed
- [ ] Database password changed
- [ ] Logs directory has write permissions
- [ ] Backup script configured
- [ ] PM2 or process manager running
- [ ] Firewall configured
- [ ] Monitoring setup

---

## 9. Development Guide

### 9.1 Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run migrate
npm run dev

# Frontend
npm install
npm run dev
```

### 9.2 Project Structure

```
polacare/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/           # Utilities
│   │   ├── db/              # Migrations & seeds
│   │   └── server.ts        # Entry point
│   ├── dist/                # Compiled JS
│   └── package.json
├── components/              # React components
├── services/               # Frontend services
└── package.json
```

### 9.3 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for code quality
- **Naming**: camelCase for variables, PascalCase for classes
- **File Naming**: kebab-case for files

### 9.4 Git Workflow

```
main (production)
├── develop (development)
    ├── feature/* (feature branches)
    └── fix/* (bug fixes)
```

---

## 10. Testing

### 10.1 Test Coverage

**Backend:**
- Unit tests for controllers
- Integration tests for API endpoints
- Database migration tests

**Frontend:**
- Component tests
- Integration tests
- E2E tests (planned)

### 10.2 Test Commands

```bash
# Backend
cd backend
npm test

# Frontend
npm test
```

### 10.3 Manual Testing

**Health Check:**
```bash
curl http://localhost:5000/health
```

**API Test:**
```bash
# Request OTP
curl -X POST http://localhost:5000/api/v1/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "0812345678"}'
```

---

## 11. Performance

### 11.1 Optimization

- **Database**: Connection pooling, indexes
- **API**: Response compression, caching (planned)
- **Frontend**: Code splitting, lazy loading
- **Images**: Compression, CDN (planned)

### 11.2 Monitoring

- **Logging**: Winston logger with file rotation
- **Health Checks**: `/health` endpoint
- **Error Tracking**: (Sentry - planned)
- **APM**: (New Relic/Datadog - planned)

---

## 12. API Versioning

Current version: `v1`

API version is included in URL path: `/api/v1/...`

Future versions will be: `/api/v2/...`, `/api/v3/...`

---

## 13. Error Handling

### 13.1 Error Types

- **ValidationError**: Input validation failed (400)
- **AuthenticationError**: Invalid credentials (401)
- **AuthorizationError**: Insufficient permissions (403)
- **NotFoundError**: Resource not found (404)
- **ServerError**: Internal server error (500)

### 13.2 Error Response Format

```json
{
  "error": "Error message",
  "requestId": "uuid",
  "details": {
    "field": "error message"
  }
}
```

---

## 14. Logging

### 14.1 Log Levels

- **error**: Errors that need attention
- **warn**: Warnings
- **info**: General information
- **debug**: Debug information (development only)

### 14.2 Log Files

- `logs/error.log` - Error logs
- `logs/combined.log` - All logs
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled promise rejections

### 14.3 Log Rotation

- Max file size: 5MB
- Max files: 5
- Automatic rotation

---

## 15. Backup & Recovery

### 15.1 Database Backup

**Automated Backup:**
```bash
npm run backup
```

**Manual Backup:**
```bash
pg_dump -U postgres polacare > backup.sql
```

**Restore:**
```bash
psql -U postgres polacare < backup.sql
```

### 15.2 Backup Schedule

- Daily backups (recommended)
- Retention: 7 days
- Automated via cron job

---

## 16. Future Enhancements

### 16.1 Planned Features

- [ ] Real-time notifications (WebSocket)
- [ ] Video consultation (Telemedicine)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline mode
- [ ] Export medical records (PDF)

### 16.2 Technical Improvements

- [ ] Redis caching layer
- [ ] CDN for static assets
- [ ] Cloud storage (S3) for images
- [ ] Read replicas for database
- [ ] Load balancing
- [ ] API rate limiting per user
- [ ] GraphQL API (optional)

---

## 17. Support & Maintenance

### 17.1 Documentation

- `PRODUCT_SPEC.md` - Product specification
- `DEPLOYMENT.md` - Deployment guide
- `ADMIN_DOCTOR_API.md` - Admin/Doctor API docs
- `ROLES_SETUP.md` - Role setup guide

### 17.2 Contact

For technical support or questions, please refer to the project repository.

---

## Appendix

### A. Environment Variables Reference

See `backend/.env.example` for complete list.

### B. Database Migrations

Migrations are located in `backend/src/db/migrations/`

### C. API Examples

See `TEST_BACKEND.md` for API testing examples.

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: POLACARE Development Team

