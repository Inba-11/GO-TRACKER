# 🚀 GO TRACKER - HOW TO RUN

## Quick Start (Choose One Method)

---

## Method 1: Automatic Startup (Windows) ⭐ EASIEST

### Step 1: Open Command Prompt or PowerShell
Navigate to the go-tracker folder:
```bash
cd go-tracker
```

### Step 2: Run the Startup Script

**Option A: Using Batch File (CMD)**
```bash
START_ALL.bat
```

**Option B: Using PowerShell**
```powershell
powershell -ExecutionPolicy Bypass -File START_ALL.ps1
```

### Step 3: Wait for All Windows to Open
The script will automatically:
- ✅ Check MongoDB
- ✅ Start Backend API
- ✅ Start Frontend
- ✅ Start Python Scheduler

### Step 4: Access the System
- **Frontend**: http://localhost:8084
- **Admin**: http://localhost:8084/admin
- **API**: http://localhost:5000/health

---

## Method 2: Manual Startup (4 Terminal Windows)

### Prerequisites
1. MongoDB must be running
2. All dependencies installed

### Terminal 1: Start MongoDB
```bash
mongod
```
**Expected**: `waiting for connections on port 27017`

### Terminal 2: Start Backend API
```bash
cd go-tracker/backend
npm run dev
```
**Expected**: `🚀 Go Tracker API Server is running! Port: 5000`

### Terminal 3: Start Frontend
```bash
cd go-tracker
npm run dev
```
**Expected**: `Local: http://localhost:8084/`

### Terminal 4: Start Python Scheduler
```bash
cd go-tracker/scraper
python production_scheduler.py
```
**Expected**: `✅ All platform scrapers imported successfully`

---

## Method 3: Docker Compose (Easiest for Production)

### Prerequisites
- Docker installed
- Docker Compose installed

### Step 1: Navigate to Project
```bash
cd go-tracker
```

### Step 2: Start All Services
```bash
docker-compose up -d
```

### Step 3: Access the System
- **Frontend**: http://localhost:8084
- **Backend**: http://localhost:5000
- **MongoDB**: localhost:27017

### Step 4: Stop Services
```bash
docker-compose down
```

---

## ✅ Verify Everything is Running

### Check 1: Frontend Dashboard
```
Open: http://localhost:8084
Expected: Login page appears
```

### Check 2: Admin Dashboard
```
Open: http://localhost:8084/admin
Email: admin@college.edu
Password: admin123
Expected: Dashboard with statistics
```

### Check 3: Backend API
```
Open: http://localhost:5000/health
Expected: { "success": true, "message": "Go Tracker API is running" }
```

### Check 4: Database
```bash
mongosh
> use go-tracker
> db.students.countDocuments()
Expected: 63 (or number of students)
```

---

## 📊 What's Running

### Service Status
| Service | Port | Status |
|---------|------|--------|
| Frontend | 8084 | ✅ Running |
| Backend | 5000 | ✅ Running |
| MongoDB | 27017 | ✅ Running |
| Scheduler | - | ✅ Running |

### Automatic Updates
- LeetCode: Every 45 minutes
- CodeChef: Every 90 minutes
- Codeforces: Every 45 minutes
- GitHub: Every 30 minutes
- Codolio: Every 4 hours
- Full Refresh: Daily at 2 AM

---

## 🔍 Monitor the System

### View Scheduler Logs
```bash
tail -f go-tracker/scraper/scraper.log
```

### View Recent Database Activity
```bash
mongosh
> db.scraper_logs.find().sort({timestamp: -1}).limit(10)
```

### Check API Status
```bash
curl http://localhost:5000/api/admin/dashboard
curl http://localhost:5000/api/admin/stats
```

### View System Statistics
```bash
curl http://localhost:5000/api/admin/stats
```

---

## 🛑 Stop Everything

### Method 1: Close Terminal Windows
Simply close all 4 terminal windows (or the batch window)

### Method 2: Kill Processes
```bash
# Windows CMD
taskkill /F /IM node.exe
taskkill /F /IM python.exe
taskkill /F /IM mongod.exe

# PowerShell
Get-Process | findstr node | Stop-Process -Force
Get-Process | findstr python | Stop-Process -Force
Get-Process | findstr mongod | Stop-Process -Force
```

### Method 3: Docker
```bash
docker-compose down
```

---

## 🐛 Troubleshooting

### Issue: "MongoDB is not running"
**Solution**:
```bash
mongod
```
Then run the startup script again.

### Issue: "Port 5000 already in use"
**Solution**:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill it
taskkill /PID {PID} /F

# Restart backend
cd go-tracker/backend
npm run dev
```

### Issue: "Port 8084 already in use"
**Solution**:
```bash
# Find process using port 8084
netstat -ano | findstr :8084

# Kill it
taskkill /PID {PID} /F

# Restart frontend
cd go-tracker
npm run dev
```

### Issue: "Python dependencies missing"
**Solution**:
```bash
cd go-tracker/scraper
pip install -r requirements.txt
python production_scheduler.py
```

### Issue: "No data in dashboard"
**Solution**:
1. Wait 2-3 minutes for initial scrape
2. Check scheduler logs: `tail -f go-tracker/scraper/scraper.log`
3. Verify students have platform usernames
4. Trigger manual scrape via admin dashboard

---

## 📱 Login Credentials

### Admin Account
- **Email**: admin@college.edu
- **Password**: admin123

### Staff Account
- **Email**: staff@college.edu
- **Password**: staff123

### Student Accounts
- Check `LOGIN_CREDENTIALS.md` for all student credentials
- Default password: `student123`

---

## 🎯 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Student Dashboard | http://localhost:8084 | View student data & leaderboards |
| Admin Dashboard | http://localhost:8084/admin | Monitor system & trigger scrapes |
| Backend API | http://localhost:5000 | API endpoints |
| API Health | http://localhost:5000/health | Check API status |
| API Docs | http://localhost:5000/ | API documentation |
| MongoDB | localhost:27017 | Database |

---

## 📊 Expected Behavior

### First Run
1. Frontend loads login page
2. Backend API responds to requests
3. Scheduler starts scraping
4. Data appears in dashboard after 2-3 minutes

### Ongoing
1. Data updates every 30-90 minutes
2. Admin dashboard shows real-time stats
3. Logs accumulate in MongoDB
4. System runs continuously

---

## 🎁 Features Available

### Student Dashboard
- ✅ View all students
- ✅ See platform statistics
- ✅ View leaderboards
- ✅ Check individual profiles
- ✅ See GitHub streaks
- ✅ View badges

### Admin Dashboard
- ✅ System overview
- ✅ Platform coverage
- ✅ Top performers
- ✅ Students needing updates
- ✅ Scraper logs
- ✅ System statistics
- ✅ Trigger manual scrapes

### API Endpoints
- ✅ Get all students
- ✅ Get individual student
- ✅ Get leaderboard
- ✅ Get admin dashboard
- ✅ Get system logs
- ✅ Get system stats
- ✅ Trigger scraping

---

## 📈 Performance

### Expected Metrics
- **API Response**: <100ms
- **Database Query**: <50ms
- **Scraping Speed**: 2-3 students/minute per platform
- **Full Refresh**: 30-45 minutes
- **Data Coverage**: ~90%+

### System Requirements
- **RAM**: 500MB minimum
- **CPU**: 1 core minimum
- **Disk**: 1GB minimum
- **Network**: Stable internet connection

---

## 🎉 You're Ready!

Choose your preferred method above and start the system. The scheduler will automatically update all student data from 5 competitive programming platforms.

**Enjoy using Go Tracker!** 🚀

---

## 📞 Need Help?

1. **Check Logs**: `tail -f go-tracker/scraper/scraper.log`
2. **Check Database**: `mongosh`
3. **Check API**: `curl http://localhost:5000/health`
4. **Read Docs**: See `PRODUCTION_SYSTEM_GUIDE.md`

---

**Last Updated**: January 5, 2026
**Status**: Ready to Run ✅
