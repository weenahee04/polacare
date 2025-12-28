# POLACARE - Production Implementation Plan

**Version**: 1.0  
**Date**: December 2024  
**Status**: MVP Development Plan

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [MVP Scope & Milestones](#mvp-scope--milestones)
3. [Architecture Overview](#architecture-overview)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [File Storage Strategy](#file-storage-strategy)
7. [Notifications System](#notifications-system)
8. [Deployment Architecture](#deployment-architecture)
9. [Acceptance Criteria](#acceptance-criteria)
10. [PDPA Compliance](#pdpa-compliance)
11. [Development Timeline](#development-timeline)

---

## 1. Executive Summary

### 1.1 Project Goal
Convert POLACARE from mock UI to a production-ready web application with full backend integration, strict data access controls, and PDPA compliance.

### 1.2 MVP Features
1. **OTP Authentication & Registration** with profile + HN management
2. **Medical Records** - List view and case detail with slit lamp images
3. **Medication Tracker** with adherence logs
4. **Health Articles** with reader interface

### 1.3 Key Requirements
- ✅ Responsive web app (Thai language)
- ✅ Strict authorization (patients see only their data)
- ✅ PDPA compliance (consent, terms versioning, privacy)
- ✅ Production-ready security and performance

---

## 2. MVP Scope & Milestones

### Milestone 1: Foundation (Week 1-2)
**Goal**: Core infrastructure and authentication

- [ ] Database schema finalization
- [ ] Authentication system (OTP + JWT)
- [ ] User registration with profile + HN
- [ ] Authorization middleware (strict patient data isolation)
- [ ] PDPA consent management
- [ ] File upload infrastructure

**Deliverables**:
- Working OTP login/register flow
- User profile with HN
- Terms & conditions acceptance tracking
- Basic file upload capability

---

### Milestone 2: Medical Records (Week 3-4)
**Goal**: Patient records viewing system

- [ ] Records list API (patient-scoped)
- [ ] Case detail API with images
- [ ] Slit lamp image display
- [ ] Checklist items rendering
- [ ] AI analysis text display
- [ ] Doctor notes display

**Deliverables**:
- Records list page (patient's own records only)
- Case detail page with full medical information
- Image viewing with zoom capability
- Responsive design for mobile/desktop

---

### Milestone 3: Medication Tracker (Week 5)
**Goal**: Medication management and logging

- [ ] Medication CRUD APIs (patient-scoped)
- [ ] Medication schedule calculation
- [ ] Adherence logging
- [ ] Medication history
- [ ] Next dose reminders

**Deliverables**:
- Medication list with schedule
- Add/edit medication interface
- Medication log (taken/not taken)
- Next dose notifications

---

### Milestone 4: Articles & Reader (Week 6)
**Goal**: Health content system

- [ ] Articles list API
- [ ] Article detail API
- [ ] Article reader UI
- [ ] Category filtering
- [ ] Read time calculation

**Deliverables**:
- Articles listing page
- Article reader with full content
- Category navigation
- Responsive reading experience

---

### Milestone 5: Polish & Production (Week 7-8)
**Goal**: Production readiness

- [ ] Error handling & validation
- [ ] Loading states & UX polish
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Testing & bug fixes
- [ ] Deployment setup

**Deliverables**:
- Production-ready application
- Deployment documentation
- Monitoring & logging
- Backup & recovery procedures

---

## 3. Architecture Overview

### 3.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Auth UI    │  │  Records UI  │  │  Care UI     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  Port: 3001 (dev) / 80 (prod)                           │
└───────────────────────┬───────────────────────────────┘
                          │ HTTPS/REST API
                          │ JWT Authentication
┌─────────────────────────▼───────────────────────────────┐
│              Backend API (Express.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Auth       │  │  Controllers │  │  Middleware  │  │
│  │   Service    │  │              │  │  (RBAC)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  Port: 5000                                              │
└──────┬──────────────┬──────────────┬───────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────────┐
│ PostgreSQL  │ │ File Store │ │  External APIs │
│  Database   │ │ (Local/S3) │ │  (Twilio/AI)   │
└─────────────┘ └────────────┘ └────────────────┘
```

### 3.2 Frontend Architecture

**Technology Stack**:
- **Framework**: React 19.2.3
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks + Context API
- **HTTP Client**: Fetch API (via apiService)

**Project Structure**:
```
frontend/
├── components/          # React components
│   ├── auth/           # Login, Register, Terms
│   ├── records/        # Records list, Case detail
│   ├── care/           # Medication, Articles
│   └── common/         # Shared components
├── services/           # API services
│   ├── apiService.ts   # HTTP client
│   └── geminiService.ts # AI integration
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   └── useApi.ts       # API call hook
├── context/            # React Context
│   └── AuthContext.tsx # Auth state management
├── utils/              # Utilities
│   ├── validation.ts   # Form validation
│   └── formatting.ts   # Data formatting
└── types.ts            # TypeScript types
```

**Key Patterns**:
- **Component-based**: Reusable, composable components
- **Hook-based state**: Custom hooks for data fetching
- **Context for auth**: Global auth state via Context API
- **Error boundaries**: Graceful error handling
- **Loading states**: Skeleton screens and spinners

---

### 3.3 Backend Architecture

**Technology Stack**:
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.18.2
- **Language**: TypeScript 5.3.3
- **ORM**: Sequelize 6.35.2
- **Database**: PostgreSQL 15+
- **Auth**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **File Upload**: Multer + Sharp

**Project Structure**:
```
backend/
├── src/
│   ├── config/         # Configuration
│   │   ├── database.ts # DB connection
│   │   └── logger.ts   # Winston logger
│   ├── models/         # Sequelize models
│   │   ├── User.ts
│   │   ├── PatientCase.ts
│   │   ├── Medication.ts
│   │   └── Article.ts
│   ├── controllers/   # Request handlers
│   │   ├── authController.ts
│   │   ├── caseController.ts
│   │   ├── medicationController.ts
│   │   └── articleController.ts
│   ├── services/       # Business logic
│   │   ├── otpService.ts
│   │   ├── aiService.ts
│   │   └── fileService.ts
│   ├── middleware/     # Express middleware
│   │   ├── auth.ts     # JWT authentication
│   │   ├── roleAuth.ts # RBAC
│   │   ├── fileUpload.ts
│   │   └── errorHandler.ts
│   ├── routes/         # API routes
│   │   ├── authRoutes.ts
│   │   ├── caseRoutes.ts
│   │   ├── medicationRoutes.ts
│   │   └── articleRoutes.ts
│   ├── db/             # Database
│   │   ├── migrations/ # SQL migrations
│   │   └── seeds/      # Seed data
│   └── server.ts       # Entry point
└── uploads/            # File storage (local)
```

**Key Patterns**:
- **MVC-like**: Controllers → Services → Models
- **Middleware chain**: Auth → RBAC → Validation → Controller
- **Error handling**: Centralized error handler
- **Request logging**: Winston with request IDs
- **Data validation**: express-validator

---

## 4. Database Schema

### 4.1 Enhanced Schema for Production

#### 4.1.1 Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- bcrypt hashed
    name VARCHAR(255) NOT NULL,
    hn VARCHAR(50) UNIQUE NOT NULL,
    avatar_url VARCHAR(500),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth DATE NOT NULL,
    weight DECIMAL(5,2) NOT NULL CHECK (weight >= 0),
    height DECIMAL(5,2) NOT NULL CHECK (height >= 0),
    bmi DECIMAL(4,2) NOT NULL CHECK (bmi >= 0),
    role VARCHAR(10) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    license_number VARCHAR(100), -- doctor only
    specialization VARCHAR(255), -- doctor only
    department VARCHAR(255), -- doctor only
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_hn ON users(hn);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
```

#### 4.1.2 PDPA Consent Table (NEW)
```sql
CREATE TABLE pdpa_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    terms_version VARCHAR(20) NOT NULL, -- e.g., "1.0", "1.1"
    consent_type VARCHAR(50) NOT NULL, -- 'terms', 'privacy', 'data_usage'
    accepted BOOLEAN NOT NULL DEFAULT FALSE,
    accepted_at TIMESTAMP,
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consents_user ON pdpa_consents(user_id);
CREATE INDEX idx_consents_version ON pdpa_consents(terms_version);
```

#### 4.1.3 Terms Versions Table (NEW)
```sql
CREATE TABLE terms_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) UNIQUE NOT NULL, -- "1.0", "1.1"
    content TEXT NOT NULL, -- Full terms content
    effective_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_terms_active ON terms_versions(is_active);
```

#### 4.1.4 Patient Cases Table
```sql
CREATE TABLE patient_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hn VARCHAR(50) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    image_url VARCHAR(500) NOT NULL, -- S3 URL or local path
    image_storage_type VARCHAR(20) DEFAULT 'local', -- 'local', 's3'
    ai_analysis_text TEXT,
    doctor_notes TEXT,
    diagnosis VARCHAR(255) NOT NULL,
    left_eye_visual_acuity VARCHAR(50),
    left_eye_intraocular_pressure VARCHAR(50),
    left_eye_diagnosis VARCHAR(255),
    left_eye_note TEXT,
    right_eye_visual_acuity VARCHAR(50),
    right_eye_intraocular_pressure VARCHAR(50),
    right_eye_diagnosis VARCHAR(255),
    right_eye_note TEXT,
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Finalized')),
    created_by UUID REFERENCES users(id), -- Doctor who created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cases_user ON patient_cases(user_id);
CREATE INDEX idx_cases_hn ON patient_cases(hn);
CREATE INDEX idx_cases_date ON patient_cases(date);
CREATE INDEX idx_cases_status ON patient_cases(status);
```

#### 4.1.5 Checklist Items Table
```sql
CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES patient_cases(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'Lids/Lashes', 'Cornea', etc.
    label VARCHAR(255) NOT NULL,
    is_observed BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_checklist_case ON checklist_items(case_id);
CREATE INDEX idx_checklist_category ON checklist_items(category);
```

#### 4.1.6 Medications Table
```sql
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    frequency VARCHAR(100) NOT NULL, -- '4 times/day', 'Every 6 hours'
    next_time VARCHAR(10) NOT NULL, -- '08:00', '14:00'
    taken BOOLEAN DEFAULT FALSE,
    type VARCHAR(10) DEFAULT 'drop' CHECK (type IN ('drop', 'pill', 'other')),
    dosage VARCHAR(100), -- '1 drop', '1 tablet'
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE, -- Optional
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medications_user ON medications(user_id);
CREATE INDEX idx_medications_active ON medications(is_active);
CREATE INDEX idx_medications_taken ON medications(taken);
```

#### 4.1.7 Medication Logs Table (NEW)
```sql
CREATE TABLE medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP NOT NULL,
    taken_at TIMESTAMP, -- NULL if not taken
    taken BOOLEAN DEFAULT FALSE,
    notes TEXT, -- Optional notes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_medication ON medication_logs(medication_id);
CREATE INDEX idx_logs_user ON medication_logs(user_id);
CREATE INDEX idx_logs_scheduled ON medication_logs(scheduled_time);
CREATE INDEX idx_logs_taken ON medication_logs(taken);
```

#### 4.1.8 Articles Table
```sql
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'General', 'Disease', 'Prevention'
    image_url VARCHAR(500) NOT NULL,
    content TEXT NOT NULL, -- Full article content
    excerpt TEXT, -- Short summary
    read_time VARCHAR(20) NOT NULL, -- '5 min read'
    published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id), -- Admin/Doctor who created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_published ON articles(is_published, published_at);
CREATE INDEX idx_articles_views ON articles(view_count);
```

#### 4.1.9 OTPs Table
```sql
CREATE TABLE otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0, -- Verification attempts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otps_phone ON otps(phone_number);
CREATE INDEX idx_otps_code ON otps(code);
CREATE INDEX idx_otps_expires ON otps(expires_at);
CREATE INDEX idx_otps_used ON otps(is_used);
```

---

## 5. Authentication & Authorization

### 5.1 Authentication Flow

#### 5.1.1 OTP Login Flow
```
1. User enters phone number
2. Frontend → POST /api/v1/auth/otp/request
3. Backend:
   - Validates phone number
   - Generates 6-digit OTP
   - Stores OTP (expires in 5 minutes)
   - Sends SMS via Twilio (or logs in dev)
4. User enters OTP
5. Frontend → POST /api/v1/auth/otp/verify
6. Backend:
   - Validates OTP
   - Finds or creates user
   - Generates JWT token (7 days)
   - Returns token + user data
7. Frontend stores token (localStorage/sessionStorage)
8. All subsequent requests include: Authorization: Bearer <token>
```

#### 5.1.2 Registration Flow
```
1. User completes OTP verification
2. If new user → redirect to registration
3. User fills profile form:
   - Name
   - Gender
   - Date of birth
   - Weight, Height (BMI auto-calculated)
   - Avatar (optional)
4. Frontend → POST /api/v1/auth/register
5. Backend:
   - Validates all fields
   - Generates unique HN (format: HN-YYYYMMDD-XXXX)
   - Hashes password
   - Creates user record
   - Creates PDPA consent record
   - Returns updated user + token
```

#### 5.1.3 Terms Acceptance Flow
```
1. User must accept terms before registration
2. Frontend displays current terms version
3. User clicks "Accept"
4. Frontend → POST /api/v1/auth/consent
5. Backend:
   - Records consent with version
   - Stores IP address and user agent
   - Links to user account
6. User can proceed to registration
```

### 5.2 Authorization (Strict Patient Data Isolation)

#### 5.2.1 Authorization Middleware Chain
```typescript
// Every patient data endpoint:
authenticate → requirePatient → checkOwnership → controller
```

#### 5.2.2 Ownership Check Middleware
```typescript
// Example: Patient can only access their own cases
export const checkCaseOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const caseRecord = await PatientCase.findByPk(id);
  
  if (!caseRecord) {
    return res.status(404).json({ error: 'Case not found' });
  }
  
  // Patient can only see their own cases
  if (req.user.role === 'patient' && caseRecord.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Doctor/Admin can see all cases
  req.caseRecord = caseRecord;
  next();
};
```

#### 5.2.3 Query Scoping
```typescript
// All patient queries are automatically scoped
export const getPatientCases = async (req: AuthRequest) => {
  const whereClause: any = {};
  
  // Patients can only see their own cases
  if (req.user.role === 'patient') {
    whereClause.userId = req.user.id;
  }
  
  // Doctors/Admins can see all cases
  return PatientCase.findAll({ where: whereClause });
};
```

#### 5.2.4 Permission Matrix

| Resource | Patient | Doctor | Admin |
|----------|---------|--------|-------|
| Own profile | ✅ Read/Update | ✅ Read/Update | ✅ Read/Update |
| Own cases | ✅ Read only | ✅ Read/Update | ✅ Read/Update |
| Own medications | ✅ Full CRUD | ✅ Read only | ✅ Read only |
| Own vision tests | ✅ Full CRUD | ✅ Read only | ✅ Read only |
| All patients | ❌ | ✅ Read | ✅ Full CRUD |
| All cases | ❌ | ✅ Read/Update | ✅ Full CRUD |
| Articles | ✅ Read | ✅ Read | ✅ Full CRUD |
| Users | ❌ | ❌ | ✅ Full CRUD |

---

## 6. File Storage Strategy

### 6.1 Storage Options

#### Option 1: Local Storage (MVP)
- **Path**: `backend/uploads/`
- **Structure**:
  ```
  uploads/
  ├── avatars/
  │   └── {userId}-{timestamp}.jpg
  ├── cases/
  │   └── {caseId}-{timestamp}.jpg
  └── articles/
      └── {articleId}-{timestamp}.jpg
  ```
- **Pros**: Simple, no external dependency
- **Cons**: Not scalable, backup required

#### Option 2: AWS S3 (Production)
- **Bucket**: `polacare-uploads`
- **Structure**:
  ```
  s3://polacare-uploads/
  ├── avatars/{userId}/{timestamp}.jpg
  ├── cases/{caseId}/{timestamp}.jpg
  └── articles/{articleId}/{timestamp}.jpg
  ```
- **Pros**: Scalable, CDN-ready, backup included
- **Cons**: Cost, AWS dependency

### 6.2 File Upload Implementation

#### 6.2.1 Upload Middleware
```typescript
// backend/src/middleware/fileUpload.ts
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads', file.fieldname);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

// Image processing middleware
export const processImage = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const processedPath = req.file.path.replace(path.extname(req.file.path), '.webp');
    await sharp(req.file.path)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(processedPath);
    
    // Delete original
    fs.unlinkSync(req.file.path);
    req.file.path = processedPath;
    req.file.filename = path.basename(processedPath);
    
    next();
  } catch (error) {
    next(error);
  }
};
```

#### 6.2.2 Upload Routes
```typescript
// Avatar upload
router.post('/profile/avatar', 
  authenticate,
  upload.single('avatar'),
  processImage,
  async (req, res) => {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await User.update({ avatarUrl }, { where: { id: req.user.id } });
    res.json({ avatarUrl });
  }
);

// Case image upload
router.post('/cases/:id/image',
  authenticate,
  requireRole('doctor', 'admin'),
  upload.single('image'),
  processImage,
  async (req, res) => {
    const imageUrl = `/uploads/cases/${req.file.filename}`;
    await PatientCase.update({ imageUrl }, { where: { id: req.params.id } });
    res.json({ imageUrl });
  }
);
```

### 6.3 File Serving

#### 6.3.1 Static File Serving
```typescript
// backend/src/server.ts
import express from 'express';
import path from 'path';

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

#### 6.3.2 Security Considerations
- ✅ File type validation (images only)
- ✅ File size limits (10MB)
- ✅ Filename sanitization
- ✅ Path traversal prevention
- ✅ Virus scanning (future)

---

## 7. Notifications System

### 7.1 Notification Types

#### 7.1.1 In-App Notifications
- Medication reminders
- Appointment reminders
- New case available
- System announcements

#### 7.1.2 Push Notifications (Future)
- Browser push notifications
- Mobile app push (future)

### 7.2 Notification Implementation

#### 7.2.1 Notification Model
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'medication' | 'appointment' | 'case' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}
```

#### 7.2.2 Notification Service
```typescript
// backend/src/services/notificationService.ts
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  actionUrl?: string
) => {
  return Notification.create({
    userId,
    type,
    title,
    message,
    actionUrl,
    read: false
  });
};

// Medication reminder
export const scheduleMedicationReminder = async (medicationId: string) => {
  const medication = await Medication.findByPk(medicationId);
  // Calculate next dose time
  // Create notification
};
```

#### 7.2.3 Frontend Notification Component
```typescript
// components/Notification.tsx
export const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    // Fetch notifications
    // Poll for new notifications
  }, []);
  
  return (
    <div>
      <Bell icon with badge={unreadCount} />
      <NotificationList notifications={notifications} />
    </div>
  );
};
```

---

## 8. Deployment Architecture

### 8.1 Production Architecture

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  (Port 80)  │
                    └──────┬──────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
    ┌───────▼────────┐          ┌─────────▼────────┐
    │   Frontend     │          │   Backend API    │
    │   (Static)     │          │   (Node.js)      │
    │   Port: 80     │          │   Port: 5000     │
    └────────────────┘          └────────┬──────────┘
                                          │
                          ┌───────────────┴───────────────┐
                          │                               │
                  ┌───────▼────────┐            ┌─────────▼────────┐
                  │   PostgreSQL   │            │   File Storage   │
                  │   (Port 5432)   │            │   (Local/S3)     │
                  └─────────────────┘            └──────────────────┘
```

### 8.2 Docker Deployment

#### 8.2.1 docker-compose.prod.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: polacare
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    volumes:
      - ./backend/uploads:/app/uploads
    restart: always

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    depends_on:
      - backend
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: always

volumes:
  postgres_data:
```

### 8.3 Environment Variables

#### 8.3.1 Backend (.env)
```env
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=polacare
DB_USER=postgres
DB_PASSWORD=<secure-password>
JWT_SECRET=<very-secure-secret>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://polacare.com
GEMINI_API_KEY=<your-key>
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
LOG_LEVEL=info
FILE_STORAGE_TYPE=local  # or 's3'
AWS_S3_BUCKET=<bucket-name>
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
```

#### 8.3.2 Frontend (.env.production)
```env
VITE_API_URL=https://api.polacare.com/api/v1
```

---

## 9. Acceptance Criteria

### 9.1 Feature 1: OTP Login/Register + Profile + HN

#### 9.1.1 OTP Login
**Given**: User is on login page  
**When**: User enters valid phone number and requests OTP  
**Then**:
- ✅ OTP is sent via SMS (or logged in dev mode)
- ✅ OTP expires in 5 minutes
- ✅ User can request new OTP after 60 seconds
- ✅ Maximum 3 OTP requests per hour per phone number

**When**: User enters correct OTP  
**Then**:
- ✅ User is authenticated
- ✅ JWT token is generated (7 days expiry)
- ✅ User is redirected to dashboard
- ✅ Token is stored securely

**When**: User enters incorrect OTP  
**Then**:
- ✅ Error message displayed
- ✅ User can retry (max 5 attempts)
- ✅ OTP is invalidated after 5 failed attempts

#### 9.1.2 Registration
**Given**: User has verified OTP (new user)  
**When**: User fills registration form  
**Then**:
- ✅ All fields validated (name, gender, DOB, weight, height)
- ✅ BMI is auto-calculated
- ✅ Unique HN is generated (format: HN-YYYYMMDD-XXXX)
- ✅ Password meets requirements (8+ chars, uppercase, lowercase, number, special)
- ✅ Avatar upload is optional (max 5MB, images only)

**When**: User submits form  
**Then**:
- ✅ User profile is created
- ✅ PDPA consent is recorded
- ✅ User is logged in automatically
- ✅ Welcome guide modal is shown (first time only)

#### 9.1.3 Profile Management
**Given**: User is logged in  
**When**: User views profile  
**Then**:
- ✅ All profile data is displayed
- ✅ HN is shown prominently
- ✅ Avatar is displayed (or default)
- ✅ BMI is calculated and displayed

**When**: User updates profile  
**Then**:
- ✅ Changes are validated
- ✅ BMI is recalculated if weight/height changes
- ✅ Changes are saved to database
- ✅ Success message is shown

**Acceptance Criteria Checklist**:
- [ ] OTP sent successfully via SMS/dev log
- [ ] OTP verification works
- [ ] New user auto-created on first OTP verify
- [ ] Registration form validates all fields
- [ ] HN generated automatically and uniquely
- [ ] Password validation enforced
- [ ] Avatar upload works (optional)
- [ ] Profile view displays all data
- [ ] Profile update works
- [ ] BMI auto-calculated
- [ ] PDPA consent recorded

---

### 9.2 Feature 2: Records List + Case Detail with Slit Lamp Images

#### 9.2.1 Records List
**Given**: Patient is logged in  
**When**: Patient navigates to Records tab  
**Then**:
- ✅ Only patient's own cases are displayed
- ✅ Cases are sorted by date (newest first)
- ✅ Each case shows:
  - Thumbnail image (slit lamp)
  - Date
  - Diagnosis
  - Status (Draft/Finalized)
  - AI analysis preview (first 100 chars)
- ✅ Loading state while fetching
- ✅ Empty state if no cases
- ✅ Error handling if API fails

**When**: Patient clicks on a case  
**Then**:
- ✅ Navigate to case detail page
- ✅ Case data is loaded

**Authorization Tests**:
- ✅ Patient cannot see other patients' cases
- ✅ Patient cannot access case detail of another patient (403 error)
- ✅ Doctor can see all cases
- ✅ Admin can see all cases

#### 9.2.2 Case Detail
**Given**: Patient is viewing case detail  
**When**: Page loads  
**Then**:
- ✅ Full case information is displayed:
  - Header: HN, Date, Share button
  - Slit lamp image (full size, zoomable)
  - Diagnosis summary
  - Doctor's notes
  - AI analysis text (full)
  - Structural findings checklist:
    - Lids/Lashes
    - Conjunctiva
    - Cornea
    - Anterior Chamber
    - Iris
    - Lens
  - Left eye data (if available)
  - Right eye data (if available)
- ✅ Image loads with loading state
- ✅ Image can be zoomed/panned
- ✅ Back button returns to list

**When**: Patient clicks Share  
**Then**:
- ✅ Share options displayed (copy link, etc.)
- ✅ Link includes case ID (with auth check)

**Image Display**:
- ✅ Image loads from correct URL
- ✅ Image displays in responsive container
- ✅ Image zoom works on mobile and desktop
- ✅ Image fallback if not found

**Acceptance Criteria Checklist**:
- [ ] Records list shows only patient's cases
- [ ] Cases sorted by date (newest first)
- [ ] Case thumbnails display correctly
- [ ] Clicking case navigates to detail
- [ ] Case detail shows all information
- [ ] Slit lamp image displays and zooms
- [ ] Checklist items render correctly
- [ ] Doctor notes display
- [ ] AI analysis displays
- [ ] Authorization enforced (patient sees own only)
- [ ] Loading states work
- [ ] Error handling works
- [ ] Empty states work

---

### 9.3 Feature 3: Medication Tracker + Logs

#### 9.3.1 Medication List
**Given**: Patient is logged in  
**When**: Patient navigates to Care tab → Medication section  
**Then**:
- ✅ All patient's active medications are displayed
- ✅ Each medication shows:
  - Medicine name
  - Type (drop/pill/other) with icon
  - Frequency (e.g., "4 times/day")
  - Next dose time
  - Taken status (checkbox)
- ✅ Medications sorted by next dose time
- ✅ Upcoming medications highlighted
- ✅ Past due medications shown with warning

**When**: Patient clicks "Add Medication"  
**Then**:
- ✅ Modal/form opens
- ✅ Form fields:
  - Medicine name (required)
  - Type: drop/pill/other (required)
  - Frequency: dropdown or custom (required)
  - Next time: time picker (required)
  - Dosage: optional text
  - Start date: date picker (default: today)
  - End date: optional date picker
- ✅ Form validates all required fields
- ✅ Frequency options: "Once daily", "Twice daily", "3 times/day", "4 times/day", "Every 6 hours", "Custom"

**When**: Patient submits form  
**Then**:
- ✅ Medication is created
- ✅ Success message shown
- ✅ List refreshes
- ✅ Modal closes

#### 9.3.2 Medication Logging
**Given**: Patient has medications  
**When**: Patient clicks "Taken" checkbox  
**Then**:
- ✅ Medication log entry is created:
  - Medication ID
  - Scheduled time (calculated from frequency)
  - Taken at: current timestamp
  - Taken: true
- ✅ Next dose time is recalculated
- ✅ Success feedback shown
- ✅ List updates

**When**: Patient unchecks "Taken"  
**Then**:
- ✅ Latest log entry is updated (taken: false, taken_at: null)
- ✅ Or new log entry created (taken: false)

**When**: Next dose time arrives  
**Then**:
- ✅ Notification/reminder shown (if implemented)
- ✅ Medication appears in "Upcoming" section

#### 9.3.3 Medication History
**Given**: Patient has taken medications  
**When**: Patient views medication history  
**Then**:
- ✅ Log entries are displayed:
  - Date/time scheduled
  - Date/time taken (or "Missed")
  - Medication name
  - Status: Taken/Missed
- ✅ Logs sorted by date (newest first)
- ✅ Adherence rate calculated and displayed
- ✅ Filter by medication (optional)
- ✅ Filter by date range (optional)

**Adherence Calculation**:
- ✅ Adherence = (Taken doses / Total scheduled doses) × 100%
- ✅ Calculated per medication
- ✅ Calculated overall
- ✅ Displayed as percentage and chart (optional)

**Acceptance Criteria Checklist**:
- [ ] Medication list displays all active medications
- [ ] Medications sorted by next dose time
- [ ] Add medication form works
- [ ] Form validation works
- [ ] Medication created successfully
- [ ] "Taken" checkbox creates log entry
- [ ] Next dose time recalculated
- [ ] Medication history displays logs
- [ ] Adherence rate calculated correctly
- [ ] Only patient's own medications shown
- [ ] Edit medication works
- [ ] Delete medication works (soft delete)
- [ ] Loading states work
- [ ] Error handling works

---

### 9.4 Feature 4: Articles + Reader

#### 9.4.1 Articles List
**Given**: User is logged in  
**When**: User navigates to Care tab → Articles section  
**Then**:
- ✅ All published articles are displayed
- ✅ Articles shown as cards with:
  - Thumbnail image
  - Title
  - Category
  - Read time
  - Published date
  - Excerpt (first 150 chars)
- ✅ Articles sorted by published date (newest first)
- ✅ Category filter available (optional)
- ✅ Search by title (optional)
- ✅ Pagination (20 per page)

**When**: User clicks on article  
**Then**:
- ✅ Navigate to article reader page
- ✅ Article view count incremented

#### 9.4.2 Article Reader
**Given**: User is viewing article  
**When**: Page loads  
**Then**:
- ✅ Full article content is displayed:
  - Header image
  - Title
  - Category badge
  - Published date
  - Read time
  - Full content (formatted text)
- ✅ Content is readable (proper typography)
- ✅ Images in content display correctly
- ✅ Responsive layout (mobile/desktop)
- ✅ Back button returns to list
- ✅ Share button (optional)

**Content Formatting**:
- ✅ HTML content rendered safely
- ✅ Markdown converted to HTML (if used)
- ✅ Images responsive
- ✅ Text readable (font size, line height)

**Acceptance Criteria Checklist**:
- [ ] Articles list displays all published articles
- [ ] Articles sorted by date (newest first)
- [ ] Article cards display correctly
- [ ] Clicking article navigates to reader
- [ ] Article reader displays full content
- [ ] Content formatting works
- [ ] Images display correctly
- [ ] View count increments
- [ ] Responsive design works
- [ ] Loading states work
- [ ] Error handling works
- [ ] Category filter works (if implemented)
- [ ] Search works (if implemented)

---

## 10. PDPA Compliance

### 10.1 Consent Management

#### 10.1.1 Terms & Conditions Versioning
- ✅ Terms stored in `terms_versions` table
- ✅ Each version has:
  - Version number (e.g., "1.0", "1.1")
  - Full content
  - Effective date
  - Active status
- ✅ Only one active version at a time
- ✅ Users must accept current version before registration

#### 10.1.2 Consent Recording
- ✅ All consents recorded in `pdpa_consents` table
- ✅ Records include:
  - User ID
  - Terms version accepted
  - Consent type (terms, privacy, data_usage)
  - Acceptance timestamp
  - IP address
  - User agent
- ✅ Consent history maintained (users can see what they accepted)

#### 10.1.3 Privacy Policy
- ✅ Privacy policy displayed separately
- ✅ Users must accept privacy policy
- ✅ Privacy policy versioned (same as terms)

### 10.2 Data Protection

#### 10.2.1 Data Access Controls
- ✅ Patients can only access their own data
- ✅ All queries filtered by user ID for patients
- ✅ Authorization middleware enforces access
- ✅ Audit logs for sensitive operations (future)

#### 10.2.2 Data Retention
- ✅ User data retained while account active
- ✅ Deactivated accounts: data retained for 7 years (medical records)
- ✅ Deletion request: soft delete, data anonymized after retention period

#### 10.2.3 Data Export
- ✅ Users can request data export (future)
- ✅ Export includes all user data in JSON format

### 10.3 Implementation

#### 10.3.1 Consent API
```typescript
// POST /api/v1/auth/consent
{
  "termsVersion": "1.0",
  "consentType": "terms",
  "accepted": true
}

// Response
{
  "consentId": "uuid",
  "version": "1.0",
  "acceptedAt": "2024-12-01T10:00:00Z"
}
```

#### 10.3.2 Terms API
```typescript
// GET /api/v1/terms/current
// Returns current active terms version

// GET /api/v1/terms/:version
// Returns specific terms version
```

#### 10.3.3 Frontend Integration
```typescript
// Before registration, check if user accepted terms
const checkConsent = async () => {
  const currentTerms = await api.get('/terms/current');
  const userConsent = await api.get('/auth/consent/current');
  
  if (!userConsent || userConsent.version !== currentTerms.version) {
    // Show terms screen
    // User must accept before proceeding
  }
};
```

---

## 11. Development Timeline

### Week 1-2: Foundation
- **Days 1-3**: Database schema finalization + migrations
- **Days 4-6**: Authentication system (OTP + JWT)
- **Days 7-9**: User registration + profile
- **Days 10-12**: Authorization middleware + PDPA consent
- **Days 13-14**: File upload infrastructure

### Week 3-4: Medical Records
- **Days 15-17**: Records list API + frontend
- **Days 18-20**: Case detail API + frontend
- **Days 21-23**: Image display + zoom
- **Days 24-26**: Checklist rendering
- **Days 27-28**: Testing + bug fixes

### Week 5: Medication Tracker
- **Days 29-31**: Medication CRUD APIs
- **Days 32-33**: Medication logging system
- **Days 34-35**: Frontend medication UI
- **Days 36-37**: Adherence calculation
- **Days 38-39**: Testing + bug fixes

### Week 6: Articles
- **Days 40-42**: Articles API
- **Days 43-44**: Articles list frontend
- **Days 45-46**: Article reader frontend
- **Days 47-48**: Content formatting
- **Days 49-50**: Testing + bug fixes

### Week 7-8: Polish & Production
- **Days 51-53**: Error handling + validation
- **Days 54-55**: UX polish + loading states
- **Days 56-57**: Performance optimization
- **Days 58-59**: Security audit
- **Days 60-61**: Testing + bug fixes
- **Days 62-63**: Deployment setup
- **Days 64-65**: Documentation + handoff

---

## 12. Success Metrics

### 12.1 Technical Metrics
- ✅ API response time < 200ms (p95)
- ✅ Page load time < 2s
- ✅ Uptime > 99.5%
- ✅ Error rate < 0.1%
- ✅ Zero security vulnerabilities (critical)

### 12.2 User Metrics
- ✅ Registration completion rate > 80%
- ✅ Daily active users
- ✅ Medication adherence rate
- ✅ Article read rate
- ✅ User satisfaction score

---

## 13. Risk Mitigation

### 13.1 Technical Risks
- **Database performance**: Indexes, query optimization
- **File storage**: Backup strategy, CDN for production
- **API rate limiting**: Prevent abuse
- **Security**: Regular audits, penetration testing

### 13.2 Compliance Risks
- **PDPA violations**: Legal review, compliance checklist
- **Data breaches**: Encryption, access controls, monitoring

---

## 14. Next Steps

1. **Review & Approval**: Stakeholder review of this plan
2. **Sprint Planning**: Break down into 2-week sprints
3. **Team Setup**: Assign developers, designers, QA
4. **Development Start**: Begin Milestone 1
5. **Daily Standups**: Track progress, address blockers
6. **Weekly Reviews**: Demo completed features
7. **Testing**: Continuous testing throughout
8. **Deployment**: Staged rollout (dev → staging → production)

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: POLACARE Development Team

