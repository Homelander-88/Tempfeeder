# Spoon Edu Platform

A comprehensive educational platform with React frontend and Node.js backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone and Install Dependencies
```bash
# Install all dependencies (frontend, backend, and root)
npm run install:all

# Or install manually:
npm install                    # Root dependencies
cd frontend && npm install     # Frontend dependencies
cd ../backend && npm install   # Backend dependencies
```

### 2. Setup Database
```bash
# Make setup script executable (Linux/Mac)
chmod +x setup-backend.sh

# Run setup script (includes sample data)
./setup-backend.sh

# Or setup manually:
# 1. Create PostgreSQL database: spoon_edu
# 2. Run: psql -U postgres -d spoon_edu -f backend/src/db/schema.sql
# 3. Run: psql -U postgres -d spoon_edu -f backend/src/db/seed.sql
```

### 3. Configure Environment Variables

Edit `backend/.env` with your actual values:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spoon_edu
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Secret (generate a secure key)
JWT_SECRET=your-secure-jwt-secret-here

# Supabase (optional - for file storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (optional - for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Initialize Database Schema
```bash
# Connect to PostgreSQL and run:
psql -U postgres -d spoon_edu -f backend/src/db/schema.sql
```

### 5. Start the Application

#### Option A: Start Both Frontend & Backend Together
```bash
npm run dev
```

#### Option B: Start Separately
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

### 6. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

### 7. Test Accounts
After running the setup script, you can login with:
- **Email**: admin@spoon.edu
- **Password**: password123

The database is pre-seeded with sample colleges, departments, courses, topics, and content.

## 📁 Project Structure

```
spoon-edu-platform/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # API client configurations
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utility libraries
│   ├── package.json
│   └── vite.config.ts
├── backend/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── db/           # Database connection & schema
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   └── server.ts      # Server entry point
│   ├── package.json
│   └── .env               # Environment variables
├── package.json           # Root package.json
└── setup-backend.sh       # Setup script
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Educational Content (Protected Routes)
- `GET /api/colleges` - Get all colleges
- `GET /api/departments` - Get departments for user's college
- `GET /api/semesters` - Get semesters for user's department
- `GET /api/courses` - Get courses for user's semester
- `GET /api/topics` - Get topics for user's course
- `GET /api/subtopics/:topicId` - Get subtopics for a topic
- `GET /api/subtopics/:subtopicId/content` - Get content for a subtopic

## 🔒 Authentication

The application uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are automatically included in requests via the API interceptor.

## 📊 Data Hierarchy

The educational content follows this hierarchy:
```
Colleges → Departments → Semesters → Courses → Topics → Subtopics → Content
```

### Sample Data Structure:
- **5 Colleges**: Engineering, Science, Arts, Commerce, Medicine
- **12 Departments**: Computer Science, Electrical Engineering, etc.
- **24 Courses**: Programming, Data Structures, Algorithms, etc.
- **16 Topics**: Programming Fundamentals, Variables, etc.
- **16 Subtopics**: Hello World Program, Basic Syntax, etc.
- **Sample Content**: Videos, notes, questions, and resources

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts
- `colleges` - Educational institutions
- `departments` - Academic departments
- `semesters` - Academic semesters
- `courses` - Course subjects
- `topics` - Learning topics
- `subtopics` - Subtopics within topics
- `subtopic_content` - Content for subtopics (videos, notes, etc.)

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
npm run build  # If using TypeScript compilation
# Deploy to your server (Heroku, Railway, Vercel, etc.)
```

## 🛠️ Development Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build frontend for production

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start with nodemon (auto-restart)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License