# POLACARE Backend API

RESTful API server for POLACARE patient portal.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Sequelize
- **Authentication**: JWT
- **AI**: Google Gemini API

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── db/              # Database migrations & seeds
│   └── server.ts        # Application entry point
├── dist/                # Compiled JavaScript
├── package.json
└── tsconfig.json
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

### 3. Database Setup

```bash
# Create database
createdb polacare

# Run migrations
npm run migrate

# Seed sample data (optional)
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server will run on http://localhost:5000

## API Endpoints

### Authentication

- `POST /api/v1/auth/otp/request` - Request OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP and login
- `POST /api/v1/auth/register` - Register new user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update profile

### Patient Cases

- `GET /api/v1/cases` - Get all cases
- `GET /api/v1/cases/:id` - Get case by ID
- `POST /api/v1/cases` - Create new case

### Medications

- `GET /api/v1/medications` - Get all medications
- `POST /api/v1/medications` - Create medication
- `PUT /api/v1/medications/:id` - Update medication
- `DELETE /api/v1/medications/:id` - Delete medication

### Vision Tests

- `GET /api/v1/vision-tests` - Get all tests
- `POST /api/v1/vision-tests` - Create test result

### Articles

- `GET /api/v1/articles` - Get all articles
- `GET /api/v1/articles/:id` - Get article by ID

### AI Services

- `POST /api/v1/ai/analyze-image` - Analyze medical image
- `POST /api/v1/ai/retinal-age` - Analyze retinal age

## Development

### Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm start        # Start production server
npm run migrate  # Run database migrations
npm run seed     # Seed sample data
npm run lint     # Run linter
npm test         # Run tests
```

### Database Migrations

Migrations are SQL files in `src/db/migrations/`. Run them manually or use a migration tool.

### Environment Variables

See `.env.example` for all available environment variables.

## Production

### Build

```bash
npm run build
```

### Start

```bash
NODE_ENV=production npm start
```

### Docker

```bash
docker build -t polacare-backend .
docker run -p 5000:5000 --env-file .env polacare-backend
```

## Security

- JWT authentication required for protected routes
- Rate limiting enabled
- Input validation with express-validator
- Helmet.js for security headers
- CORS configured
- Password hashing with bcrypt

## License

MIT

