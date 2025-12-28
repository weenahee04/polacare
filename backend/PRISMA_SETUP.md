# Prisma Setup Guide

## Installation

### 1. Install Prisma
```bash
cd backend
npm install prisma @prisma/client
```

### 2. Initialize Prisma (if not already done)
```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` (already created)
- `.env` with `DATABASE_URL`

### 3. Update .env
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/polacare?schema=public"
```

## Setup Steps

### Step 1: Generate Prisma Client
```bash
npm run prisma:generate
# or
npx prisma generate
```

This generates TypeScript types from the schema.

### Step 2: Create Migration
```bash
npm run prisma:migrate
# or
npx prisma migrate dev --name init
```

This will:
1. Create migration files in `prisma/migrations/`
2. Apply migration to database
3. Generate Prisma Client

### Step 3: Verify Database
```bash
npx prisma studio
```

Opens Prisma Studio to view database in browser.

## Migration from Sequelize

### Phase 1: Parallel Setup (Current)
- Prisma installed alongside Sequelize
- Schema created
- Ready for migration

### Phase 2: Update Database Connection
Replace `src/config/database.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected via Prisma');
  } catch (error) {
    logger.error('Database connection failed', { error });
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await prisma.$disconnect();
};

export default prisma;
```

### Phase 3: Update Controllers
Replace Sequelize queries with Prisma:

**Before (Sequelize)**:
```typescript
const cases = await PatientCase.findAll({
  where: { userId: req.user.id }
});
```

**After (Prisma)**:
```typescript
const cases = await prisma.patientCase.findMany({
  where: { patientId: req.user.id }
});
```

### Phase 4: Remove Sequelize
Once all controllers are migrated:
1. Remove Sequelize from `package.json`
2. Remove Sequelize models
3. Remove Sequelize migrations

## Common Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Reset database (dev only)
npx prisma migrate reset

# Format schema
npx prisma format

# Validate schema
npx prisma validate
```

## TypeScript Usage

```typescript
import prisma from './config/database';
import { UserRole } from '@prisma/client';

// Query with types
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    cases: true,
    medications: true
  }
});

// Type is automatically inferred
// user: User & { cases: PatientCase[], medications: Medication[] }
```

## Row-Level Security with Prisma

```typescript
import { buildPatientWhere } from '../middleware/rowLevelSecurity';

// In controller
const where = buildPatientWhere(req, {
  status: 'Finalized'
});

const cases = await prisma.patientCase.findMany({
  where,
  include: {
    images: true,
    checklistItems: true
  }
});
```

## Troubleshooting

### Issue: "Prisma Client not generated"
**Solution**: Run `npx prisma generate`

### Issue: "Migration failed"
**Solution**: Check database connection in `.env`

### Issue: "Type errors"
**Solution**: Regenerate Prisma Client after schema changes

---

**Status**: Ready for setup ✅

