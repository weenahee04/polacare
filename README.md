<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# POLACARE - Patient Portal for Eye Care

A comprehensive patient portal application for eye care management, featuring AI-powered analysis, medical records management, and health tracking.

## 🚀 Features

- **Patient Authentication**: OTP-based login system
- **Medical Records**: View and manage patient cases and examination results
- **Vision Testing**: Amsler Grid, Ishihara, and AI Retinal Age tests
- **Medication Tracking**: Manage and track eye medications
- **AI Integration**: Google Gemini AI for image analysis
- **Health Articles**: Educational content about eye care
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Tech Stack

### Frontend
- React 19.2.3
- TypeScript
- Vite
- Tailwind CSS
- Lucide React Icons

### Backend
- Node.js 20+
- Express.js
- TypeScript
- PostgreSQL 15+
- Sequelize ORM
- JWT Authentication
- Google Gemini AI

## 🛠️ Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or Docker)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd polacare
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run migrate
npm run dev
```

3. **Setup Frontend**
```bash
# From project root
npm install
cp .env.example .env.local
npm run dev
```

### Docker Setup (Recommended)

```bash
# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env

# Start all services
docker-compose up -d

# Initialize database
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1

## 📁 Project Structure

```
polacare/
├── backend/              # Backend API server
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── server.ts    # Entry point
│   └── package.json
├── components/           # React components
├── services/            # Frontend services
├── docker-compose.yml   # Docker configuration
└── package.json        # Frontend dependencies
```

## 🔐 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=polacare
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

## 📚 API Documentation

### Authentication
- `POST /api/v1/auth/otp/request` - Request OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP and login
- `POST /api/v1/auth/register` - Register new user
- `GET /api/v1/auth/profile` - Get profile
- `PUT /api/v1/auth/profile` - Update profile

### Patient Cases
- `GET /api/v1/cases` - Get all cases
- `GET /api/v1/cases/:id` - Get case by ID
- `POST /api/v1/cases` - Create case

### Medications
- `GET /api/v1/medications` - Get medications
- `POST /api/v1/medications` - Create medication
- `PUT /api/v1/medications/:id` - Update medication
- `DELETE /api/v1/medications/:id` - Delete medication

### Vision Tests
- `GET /api/v1/vision-tests` - Get tests
- `POST /api/v1/vision-tests` - Create test

### Articles
- `GET /api/v1/articles` - Get articles
- `GET /api/v1/articles/:id` - Get article

### AI Services
- `POST /api/v1/ai/analyze-image` - Analyze medical image
- `POST /api/v1/ai/retinal-age` - Analyze retinal age

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Production Checklist
See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for production deployment checklist.

## 📖 Documentation

- [Product Specification](./PRODUCT_SPEC.md) - Complete product documentation
- [Backend README](./backend/README.md) - Backend API documentation
- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment guide

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Security headers (Helmet)

## 🧪 Development

### Backend
```bash
cd backend
npm run dev      # Development with hot reload
npm run build    # Build for production
npm run migrate  # Run migrations
npm run seed     # Seed sample data
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## 📝 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for better eye care**
