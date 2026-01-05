# 🚀 GO TRACKER - QUICK START GUIDE

## Step-by-Step Instructions to Run Everything

### Prerequisites Check
- ✅ Node.js installed
- ✅ Python 3.8+ installed
- ✅ MongoDB running
- ✅ All dependencies installed

---

## 🎯 Option 1: Run Everything (Recommended)

### Step 1: Open 4 Terminal Windows

You'll need 4 separate terminal windows/tabs:
1. **Terminal 1**: MongoDB
2. **Terminal 2**: Backend API
3. **Terminal 3**: Frontend
4. **Terminal 4**: Python Scheduler

---

### Step 2: Terminal 1 - Start MongoDB

```bash
mongod
```

**Expected Output:**
```
[initandlisten] waiting for connections on port 27017
```

✅ Leave this running

---

### Step 3: Terminal 2 - Start Backend API

```bash
cd go-tracker/backend
npm run dev
```

**Expected Output:**
```
🚀 Go Tracker API Server is running!
📍 Port: 5000
🌍 Environment: development
🔗 Health Check: http://localhost:5000/health
```

✅ Leave this running

---

### Step 4: Terminal 3 - Start Frontend

```bash
cd go-tracker
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8084/
```

✅ Leave this running

---

### Step 5: Terminal 4 - Start Python Scheduler

```bash
cd go-tracker/scraper
python production_scheduler.py
```

**Expected Output:**
```
✅ LeetCode scraper imported
✅ CodeChef scraper imported
✅ Codeforces scraper imported
✅ GitHub scraper imported
✅ Codolio scraper imported
🚀 Starting Production Scraper Scheduler
📋 Schedule:
  - LeetCode: every 45 minutes
  - CodeChef: every 90 minutes
  - Codeforces: every 45 minutes
  - GitHub: every 30 minutes
  - Codolio: every 4 hours
  - Full refresh: daily at 2:00 AM
  - Log cleanup: weekly
🔄 Running initial scrape...
```

✅ Leave this running

---

## ✅ Verify Everything is Running

### Check 1: Frontend
Open browser: **http://localhost:8084**
- Should see login page
- Try login with any student credentials

### Check 2: Backend API
Open browser: **http://localhost:5000/health**
- Should see: `{ "success": true, "message": "Go Tracker API is running" }`

### Check 3: Admin Dashboard
Open browser: **http://localhost:8084/admin**
- Email: `admin@college.edu`
- Password: `admin123`

### Check 4: MongoDB
```bash
mongosh
> use go-tracker
> db.students.countDocuments()
> db.scraper_logs.countDocuments()
```

---

## 🎯 Option 2: Run with Docker Compose (Easier)

If you have Docker installed:

```bash
cd go-tracker
docker-compose up -d
```

Then access:
- Frontend: http://localhost:8084
- Backend: http://localhost:5000
- MongoDB: localhost:27017

---

## 📊 What's Happening

### Scheduler is Automatically:
- ✅ Scraping LeetCode every 45 minutes
- ✅ Scraping CodeChef every 90 minutes
- ✅ Scraping Codeforces every 45 minutes
- ✅ Scraping GitHub every 30 minutes
- ✅ Scraping Codolio every 4 hours
- ✅ Full refresh daily at 2 AM
- ✅ Logging all activity to MongoDB

---

## 🔍 Monitor the System

### View Scheduler Logs
```bash
tail -f go-tracker/scraper/scraper.log
```

### View Database Activity
```bash
mongosh
> db.scraper_logs.find().sort({timestamp: -1}).limit(10)
```

### Check API Status
```bash
curl http://localhost:5000/api/admin/dashboard
curl http://localhost:5000/api/admin/stats
```

---

## 🛑 Stop Everything

### To Stop All Services:

**Terminal 1 (MongoDB)**: Press `Ctrl+C`
**Terminal 2 (Backend)**: Press `Ctrl+C`
**Terminal 3 (Frontend)**: Press `Ctrl+C`
**Terminal 4 (Scheduler)**: Press `Ctrl+C`

Or if using Docker:
```bash
docker-compose down
```

---

## 🐛 Troubleshooting

### Frontend Won't Load
```bash
# Kill existing process
Get-Process | findstr node | Stop-Process -Force

# Restart
cd go-tracker
npm run dev
```

### Backend API Error
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID {PID} /F

# Restart
cd go-tracker/backend
npm run dev
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# If not, start it
mongod
```

### Python Scheduler Error
```bash
# Check Python version
python --version

# Check dependencies
pip list | findstr -E "requests|pymongo|selenium|schedule"

# Reinstall if needed
pip install -r go-tracker/scraper/requirements.txt

# Restart
python go-tracker/scraper/production_scheduler.py
```

---

## 📱 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Student Dashboard | http://localhost:8084 | View student data |
| Admin Dashboard | http://localhost:8084/admin | Monitor system |
| Backend API | http://localhost:5000 | API endpoints |
| API Health | http://localhost:5000/health | Check API status |
| API Docs | http://localhost:5000/ | API documentation |

---

## 🎯 Login Credentials

### Student Login
- Email: Any student email from database
- Password: student123 (or check LOGIN_CREDENTIALS.md)

### Admin Login
- Email: `admin@college.edu`
- Password: `admin123`

### Staff Login
- Email: `staff@college.edu`
- Password: `staff123`

---

## 📊 Expected Data

After running for a few minutes:
- ✅ Students will appear in dashboard
- ✅ Platform data will start populating
- ✅ Leaderboards will show rankings
- ✅ Admin dashboard will show statistics

---

## 🎉 You're All Set!

The system is now running with:
- ✅ Frontend dashboard
- ✅ Backend API
- ✅ MongoDB database
- ✅ Python scheduler (auto-updating data)

**Enjoy using Go Tracker!** 🚀

---

## 📞 Need Help?

1. Check logs: `tail -f go-tracker/scraper/scraper.log`
2. Check database: `mongosh`
3. Check API: `curl http://localhost:5000/health`
4. Review documentation: See PRODUCTION_SYSTEM_GUIDE.md

---

**Last Updated**: January 5, 2026
**Status**: Ready to Run ✅
