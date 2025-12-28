# POLACARE Testing Guide

This document describes how to run tests locally and in CI/CD pipelines.

---

## Test Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Test Pyramid                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     ┌─────────────────────────────────────────────┐        │
│     │           E2E Tests (Playwright)            │        │
│     │         5 Critical User Flows               │        │
│     └─────────────────────────────────────────────┘        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           Integration Tests (Jest)                     │ │
│  │    Auth Flow, Medication Flow, Records Flow           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │              Smoke Tests (Jest)                          ││
│ │   Health, Auth, Records, Medications, Articles, Admin   ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ..
npm install

# E2E tests
cd e2e
npm install
npx playwright install
```

### 2. Setup Test Database

```bash
# Start PostgreSQL (if not running)
docker run -d \
  --name polacare-test-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=polacare_test \
  -p 5432:5432 \
  postgres:15

# Apply migrations
cd backend
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/polacare_test"
npx prisma migrate deploy
npx prisma generate
```

### 3. Seed Test Data

```bash
cd backend
npx tsx tests/seed-test-data.ts
```

This creates:
- Test patient: `0811111111` / `TestPatient123!`
- Test doctor: `0822222222` / `TestDoctor123!`
- Test admin: `0833333333` / `TestAdmin123!`

---

## Running Tests

### API Smoke Tests

Tests API endpoints are responding correctly:

```bash
cd backend

# Run all smoke tests
npm test -- --selectProjects=smoke

# Run specific test file
npm test -- tests/smoke/auth.test.ts
```

### Integration Tests

Tests complete user flows with real database:

```bash
cd backend

# Start backend first
npm run dev &

# Run integration tests
npm test -- --selectProjects=integration

# Or all tests
npm test
```

### E2E Tests

Tests the full application through the browser:

```bash
cd e2e

# Run all E2E tests
npm test

# Run with UI
npm run test:ui

# Run specific test
npm test -- 01-login.spec.ts

# Run headed (see browser)
npm run test:headed

# Run on mobile viewport
npm run test:mobile
```

---

## Test Files Structure

```
backend/
├── tests/
│   ├── setup.ts              # Jest setup
│   ├── seed-test-data.ts     # CI test data seeding
│   ├── utils/
│   │   ├── testClient.ts     # HTTP client for tests
│   │   └── testData.ts       # Test data factories
│   ├── smoke/                # API smoke tests
│   │   ├── health.test.ts
│   │   ├── auth.test.ts
│   │   ├── records.test.ts
│   │   ├── medications.test.ts
│   │   ├── articles.test.ts
│   │   └── admin.test.ts
│   └── integration/          # Full flow tests
│       ├── auth-flow.test.ts
│       └── medication-flow.test.ts
│
e2e/
├── playwright.config.ts      # Playwright config
├── package.json
└── tests/
    ├── fixtures.ts           # Test helpers
    ├── 01-login.spec.ts      # Login flow
    ├── 02-dashboard.spec.ts  # Dashboard
    ├── 03-records.spec.ts    # Medical records
    ├── 04-medications.spec.ts # Medication tracker
    └── 05-vision-tests.spec.ts # Vision screening
```

---

## CI/CD Pipeline

### GitHub Actions

The pipeline runs automatically on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

### Pipeline Stages

1. **Backend Tests** - Smoke and integration tests
2. **Frontend Tests** - TypeScript check and build
3. **E2E Tests** - Playwright tests (after backend + frontend pass)
4. **Security Scan** - npm audit

### Environment Variables for CI

```yaml
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/polacare_test
JWT_SECRET: test-jwt-secret-for-ci-pipeline-only-32chars
JWT_EXPIRES_IN: 1h
PORT: 5000
VITE_API_URL: http://localhost:5000/api/v1
E2E_BASE_URL: http://localhost:3001
```

---

## Test Data Seeding Strategy

### For Local Development

```bash
# Full seed with sample data
cd backend
npm run seed

# Staff accounts only
npm run seed:staff

# Test-specific data (predictable for E2E)
npx tsx tests/seed-test-data.ts
```

### For CI

The CI pipeline uses `tests/seed-test-data.ts` which creates:

| User Type | Phone | Password | Purpose |
|-----------|-------|----------|---------|
| Patient | +66811111111 | TestPatient123! | Patient flow testing |
| Doctor | +66822222222 | TestDoctor123! | Staff portal testing |
| Admin | +66833333333 | TestAdmin123! | Admin portal testing |

Plus:
- 2 sample medications for the patient
- 2 sample cases (medical records)
- 2 sample articles

### Data Cleanup

The seed script automatically cleans up previous test data before seeding.

---

## Writing New Tests

### API Smoke Test

```typescript
// backend/tests/smoke/example.test.ts
import { testClient } from '../utils/testClient';

describe('Example API Smoke Tests', () => {
  it('should require authentication', async () => {
    const response = await testClient.get('/example');
    expect(response.status).toBe(401);
  });
});
```

### Integration Test

```typescript
// backend/tests/integration/example-flow.test.ts
import { testClient } from '../utils/testClient';
import { generateTestUser } from '../utils/testData';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Example Flow', () => {
  let testToken: string;

  beforeAll(async () => {
    // Setup: create user, get token
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  it('should complete flow', async () => {
    // Test with authenticated requests
  });
});
```

### E2E Test

```typescript
// e2e/tests/example.spec.ts
import { test, expect } from './fixtures';

test.describe('Example Flow', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

---

## Debugging Tests

### API Tests

```bash
# Run with verbose output
npm test -- --verbose

# Run single test with debug
npm test -- tests/smoke/auth.test.ts --detectOpenHandles
```

### E2E Tests

```bash
cd e2e

# Debug mode (pauses on failure)
npm run test:debug

# Generate trace for failed tests
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

---

## Coverage Reports

### Backend Coverage

```bash
cd backend
npm test -- --coverage
```

Coverage report: `backend/coverage/lcov-report/index.html`

### E2E Report

```bash
cd e2e
npm test
npm run report
```

---

## Troubleshooting

### "Connection refused" errors

Ensure services are running:
```bash
# Check PostgreSQL
docker ps | grep postgres

# Check backend
curl http://localhost:5000/health
```

### "Rate limit exceeded" during tests

Tests include rate-limited endpoints. Use test-specific tokens or wait between retries.

### Playwright can't find elements

- Run with `--headed` to see what's happening
- Use `await page.pause()` to debug
- Check selectors with Playwright Inspector: `npm run test:debug`

### Database schema mismatch

```bash
cd backend
npx prisma migrate reset --force
npx tsx tests/seed-test-data.ts
```

---

## Best Practices

1. **Isolate tests** - Each test should be independent
2. **Clean up after tests** - Delete created data in `afterAll`
3. **Use factories** - Use `testData.ts` helpers for consistent data
4. **Handle rate limits** - Skip or retry when rate limited
5. **Check both happy and error paths** - Test 200s and 4xx responses
6. **Keep E2E tests focused** - Test critical flows, not every edge case

---

## Scripts Reference

| Command | Directory | Description |
|---------|-----------|-------------|
| `npm test` | backend | Run all Jest tests |
| `npm test -- --selectProjects=smoke` | backend | Run smoke tests only |
| `npm test -- --coverage` | backend | Run with coverage |
| `npm test` | e2e | Run Playwright tests |
| `npm run test:ui` | e2e | Interactive test runner |
| `npm run test:headed` | e2e | Run with visible browser |
| `npm run report` | e2e | Show HTML report |

