# 🥄 Spoonfeeder

A web-based **structured learning system** that removes confusion, distraction, and randomness from studying by enforcing a strict academic hierarchy and learning flow.

---

## 🎯 Project Philosophy

Spoonfeeder follows a **discipline over freedom** approach to learning:

- 📚 **Strict academic hierarchy** — no skipping levels  
- 🧭 **Fixed learning order** — structured progression  
- 🎓 **Syllabus-aligned** — step-by-step learning  
- 🚫 **No content overload** — focused, curated material  

---

## 🧠 Core Principles

### 1️⃣ Academic Hierarchy (Strict Order)

College → Department → Semester → Course → Topic → Subtopic

---

### 2️⃣ Learning Order (Per Subtopic)

1. Required Video  
2. Curated PPT / Notes  
3. Concept-Testing Questions  
4. Answers  
5. Move to Next Subtopic  

---

### 3️⃣ Study Modes

- **Study Mode**
  - Videos, PPTs, questions, answers
  - Tests
  - AI support

- **Normal Mode**
  - Videos, PPTs, questions

- **Rush / Revision Mode**
  - Only PPTs and questions
  - No videos

---

### 4️⃣ Embedded AI Support

- ChatGPT panel for **doubt clarification**
- AI acts as a **support tool**, not the primary teacher

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js  
- **Framework**: Express.js  
- **Language**: TypeScript  
- **Database**: PostgreSQL  
- **Authentication**: JWT (JSON Web Tokens)  
- **Password Hashing**: bcryptjs  

### Frontend
- **Framework**: React  
- **Language**: TypeScript  
- **Build Tool**: Create React App  

### Development Tools
- **Hot Reload**: nodemon + ts-node  
- **Environment Variables**: dotenv  

---

## 📁 Project Structure

spoon/
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ │ ├── auth.ts
│ │ │ ├── colleges.ts
│ │ │ ├── departments.ts
│ │ │ ├── semesters.ts
│ │ │ ├── courses.ts
│ │ │ ├── topics.ts
│ │ │ └── subtopics.ts
│ │ ├── db/
│ │ │ ├── connection.ts
│ │ │ └── schema.sql
│ │ ├── middleware/
│ │ │ └── auth.ts
│ │ ├── routes/
│ │ │ └── index.ts
│ │ └── server.ts
│ ├── package.json
│ └── tsconfig.json
│
└── frontend/
├── src/
│ ├── App.tsx
│ └── ...
├── package.json
└── tsconfig.json

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

---

## ⚙️ Backend Setup

```bash
cd backend
npm install
Database Setup
psql -U postgres -c "CREATE DATABASE spoonfeeder;"
psql -U postgres -d spoonfeeder -f src/db/schema.sql

Environment Variables (backend/.env)
PORT=5000
JWT_SECRET=your_super_secret_key_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spoonfeeder
DB_USER=postgres
DB_PASSWORD=your_postgres_password

Start Backend Server
npm run dev


Server runs at: http://localhost:5000

🎨 Frontend Setup
cd frontend
npm install
npm start


App runs at: http://localhost:3000

📡 API Endpoints
Authentication (Public)
Register
POST /api/auth/register

{
  "email": "user@example.com",
  "password": "password123"
}

Login
POST /api/auth/login


Response:

{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "token": "JWT_TOKEN"
}

Academic Hierarchy (Protected)

All endpoints require:

Authorization: Bearer <JWT_TOKEN>

Level	GET	POST
Colleges	/api/colleges	/api/colleges
Departments	/api/departments?collegeId=1	/api/departments
Semesters	/api/semesters?departmentId=1	/api/semesters
Courses	/api/courses?semesterId=1	/api/courses
Topics	/api/topics?courseId=1	/api/topics
Subtopics	/api/subtopics?topicId=1	/api/subtopics
🗄️ Database Schema

Tables:

users

colleges

departments

semesters

courses

topics

subtopics

All relationships use foreign keys with ON DELETE CASCADE.

✅ Current Status
Backend (Complete)

✅ Full academic hierarchy (6 levels)

✅ Authentication & JWT

✅ Protected routes

✅ PostgreSQL integration

✅ Data persistence

✅ Secure password hashing

Frontend (In Progress)

🚧 Login page

❌ Register page

❌ Hierarchy navigation

❌ Content viewing

❌ Study modes

❌ AI panel

🔜 Planned Features
Backend

Learning content system

User progress tracking

File uploads (PDF/PPT)

Study mode logic

Admin / teacher roles

Frontend

Full authentication flow

Academic navigation UI

Video player

PDF/PPT viewer

Q&A interface

AI support panel

🔐 Security Features

Password hashing (bcryptjs)

JWT authentication

Protected routes

Environment-based secrets

SQL injection prevention

CORS configuration

🧪 Testing
# Register
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"test@example.com","password":"test123"}'

🤝 Contributing

This is a learning-focused project.
Suggestions and contributions are welcome.

📄 License

ISC

👤 Author

Suganth
