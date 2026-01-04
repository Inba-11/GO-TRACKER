# Backend Setup Guide

## Prerequisites
- ✅ MongoDB installed and running (mongodb://localhost:27017)
- ✅ Node.js installed
- ✅ Python 3.x installed (for data import)

## Step 1: Install Backend Dependencies

```bash
cd go-tracker/backend
npm install
```

## Step 2: Create .env File

Create `backend/.env` file with:

```env
MONGO_URI=mongodb://localhost:27017/go-tracker
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=go-tracker-super-secret-jwt-key-2024-change-in-production
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 3: Import Student Data (Python)

```bash
# Navigate to scraper folder
cd go-tracker/scraper

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install pymongo

# Run import script
python import_students.py
```

## Step 4: Initialize Staff and Owner Accounts

```bash
cd go-tracker/backend

# Initialize staff accounts
node scripts/initStaff.js

# Initialize owner account
node scripts/initOwner.js
```

## Step 5: Start Backend Server

```bash
cd go-tracker/backend
npm run dev
```

The server will start on `http://localhost:5000`

## Step 6: Verify Setup

1. Check health endpoint: `http://localhost:5000/health`
2. Test login: `POST http://localhost:5000/api/auth/login`
   ```json
   {
     "identifier": "AADHAM SHARIEF A",
     "password": "711523BCB001",
     "role": "student"
   }
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/me` - Get current student (requires auth)
- `PUT /api/students/me/avatar` - Update avatar (requires auth)
- `PUT /api/students/me/resume` - Update resume (requires auth)
- `POST /api/students/me/repositories` - Add repository (requires auth)

### Stats
- `GET /api/stats/overview` - Dashboard overview
- `GET /api/stats/top-performers` - Top performers by platform
- `GET /api/stats/admin` - Admin statistics

## Troubleshooting

1. **MongoDB Connection Error**: Make sure MongoDB is running
2. **Port Already in Use**: Change PORT in .env file
3. **Import Failed**: Check MongoDB connection and database name

