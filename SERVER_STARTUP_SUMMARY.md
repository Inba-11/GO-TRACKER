# 🚀 GO TRACKER - Server Startup Summary & Expected Outputs

## ⚠️ Current Status

**MongoDB is NOT running** - This must be started first before other services can run.

---

## 📋 Complete Server Architecture

### 1. **MongoDB Database** (Port 27017)
**Status:** ❌ NOT RUNNING

**Start Command:**
```bash
mongod
```

**Expected Output:**
```
[initandlisten] MongoDB starting : pid=12345 port=27017 dbpath=/data/db
[initandlisten] waiting for connections on port 27017
```

**Verification:**
```bash
mongosh
> use go-tracker
> db.students.countDocuments()
```

---

### 2. **Backend API Server** (Port 5000)
**Status:** ⏸️ Waiting for MongoDB

**Start Command:**
```bash
cd tracker/backend
npm run dev
```

**Expected Output:**
```
MongoDB connected successfully
🚀 Go Tracker API Server is running!
📍 Port: 5000
🌍 Environment: development
🔗 Health Check: http://localhost:5000/health
📚 API Docs: http://localhost:5000/
```

**Request Logs (When API is called):**
```
GET /health 200 2.456 ms
POST /api/auth/login/student 200 45.123 ms
GET /api/students/me 200 12.345 ms
```

---

### 3. **Frontend React App** (Port 8080)
**Status:** ⏸️ Ready to start

**Start Command:**
```bash
cd tracker
npm run dev
```

**Expected Output:**
```
  VITE v5.4.19  ready in 1234 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Browser Console (when page loads):**
```
React app loaded
Auth context initialized
```

---

### 4. **Python Scraper Scheduler** (Background Process)
**Status:** ⏸️ Optional - for auto-updates

**Start Command:**
```bash
cd tracker/scraper
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
  - LeetCode: every 90 minutes
  - CodeChef: every 90 minutes
  - Codeforces: every 90 minutes
  - GitHub: every 90 minutes
  - Codolio: every 4 hours
  - Full refresh: daily at 2:00 AM
  - Log cleanup: weekly
🔄 Running initial scrape...
🔄 Starting leetcode batch scrape
Found 63 active students
Scraping leetcode for AADHAM SHARIEF A (username123)
✅ Updated leetcode data for username123
🏁 leetcode batch complete: 60 success, 2 errors, 1 skipped
```

---

## 🎯 Quick Start Instructions

### **Option 1: Automatic (Windows Batch File)**
```bash
cd tracker
START_ALL.bat
```

**What it does:**
1. Checks if MongoDB is running
2. Starts Backend API in new terminal (port 5000)
3. Starts Frontend in new terminal (port 8080)
4. Starts Python Scheduler in new terminal
5. Opens 4 separate terminal windows

---

### **Option 2: Manual (4 Separate Terminals)**

**Terminal 1 - MongoDB:**
```bash
mongod
```
*Expected: "waiting for connections on port 27017"*

**Terminal 2 - Backend:**
```bash
cd tracker/backend
npm run dev
```
*Expected: "Go Tracker API Server is running! Port: 5000"*

**Terminal 3 - Frontend:**
```bash
cd tracker
npm run dev
```
*Expected: "Local: http://localhost:8080/"*

**Terminal 4 - Scraper (Optional):**
```bash
cd tracker/scraper
python production_scheduler.py
```
*Expected: All scrapers imported + scheduling started*

---

## ✅ System Status Verification

### **1. Check Backend API:**
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Go Tracker API is running",
  "timestamp": "2024-01-05T10:30:00.000Z",
  "environment": "development"
}
```

### **2. Check Frontend:**
Open browser: http://localhost:8080

**Expected:** Login page with 3 cards:
- 👨‍🎓 Student
- 👨‍🏫 Staff  
- 👑 Owner

### **3. Check Database:**
```bash
mongosh
> use go-tracker
> db.students.countDocuments()
```

**Expected:** Number of students (e.g., 63)

### **4. Check Scraper Logs:**
```bash
tail -f tracker/scraper/scraper.log
```

**Expected:** Recent scraping activity logs

---

## 📊 Complete Startup Sequence

1. ✅ **Start MongoDB** → "waiting for connections on port 27017"
2. ✅ **Start Backend** → "API Server is running" on port 5000
3. ✅ **Start Frontend** → Vite server on port 8080
4. ✅ **Start Scraper** (Optional) → All scrapers imported + scheduling

**Total Time:** ~30 seconds for all services to start

---

## 🔍 Detailed Expected Outputs

### **Backend Console Output:**
```
MongoDB connected successfully
🚀 Go Tracker API Server is running!
📍 Port: 5000
🌍 Environment: development
🔗 Health Check: http://localhost:5000/health
📚 API Docs: http://localhost:5000/

[When requests arrive:]
GET /health 200 2.456 ms - 145
POST /api/auth/login/student 200 45.123 ms - 1024
GET /api/students/me 200 12.345 ms - 5120
```

### **Frontend Console Output:**
```
  VITE v5.4.19  ready in 1234 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

[When page loads in browser console:]
React app loaded
Auth context initialized
```

### **Python Scheduler Console Output:**
```
✅ LeetCode scraper imported
✅ CodeChef scraper imported
✅ Codeforces scraper imported
✅ GitHub scraper imported
✅ Codolio scraper imported
🚀 Starting Production Scraper Scheduler
📋 Schedule:
  - LeetCode: every 90 minutes
  - CodeChef: every 90 minutes
  - Codeforces: every 90 minutes
  - GitHub: every 90 minutes
  - Codolio: every 4 hours
  - Full refresh: daily at 2:00 AM
  - Log cleanup: weekly
🔄 Running initial scrape...
2024-01-05 10:30:00 - INFO - 🔄 Starting leetcode batch scrape
2024-01-05 10:30:01 - INFO - Found 63 active students
2024-01-05 10:30:05 - INFO - Scraping leetcode for AADHAM SHARIEF A (username123)
2024-01-05 10:30:08 - INFO - ✅ Updated leetcode data for username123
2024-01-05 10:35:00 - INFO - 🏁 leetcode batch complete: 60 success, 2 errors, 1 skipped
```

---

## 🐛 Troubleshooting

### **MongoDB Not Running:**
```bash
# Windows - Start as service
net start MongoDB

# Or start manually
mongod
```

### **Port Already in Use:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### **Backend Can't Connect to MongoDB:**
- Ensure MongoDB is running: `mongosh` should connect
- Check `MONGO_URI` in `backend/.env`: `mongodb://localhost:27017/go-tracker`

### **Frontend Can't Connect to Backend:**
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify `VITE_API_URL` in frontend `.env`

---

## 📝 Environment Variables Required

### **Backend (`tracker/backend/.env`):**
```env
MONGO_URI=mongodb://localhost:27017/go-tracker
PORT=5000
NODE_ENV=development
JWT_SECRET=go-tracker-super-secret-jwt-key-2024
FRONTEND_URL=http://localhost:8080
```

### **Scraper (`tracker/scraper/.env`):**
```env
MONGO_URI=mongodb://localhost:27017/go-tracker
GITHUB_TOKEN=your_github_token_here
LOG_LEVEL=INFO
```

---

## 🎯 Summary Table

| Service | Port | Status | Start Command | Expected Output |
|---------|------|--------|---------------|-----------------|
| **MongoDB** | 27017 | ❌ Not Running | `mongod` | "waiting for connections" |
| **Backend API** | 5000 | ⏸️ Waiting | `cd backend && npm run dev` | "API Server is running!" |
| **Frontend** | 8080 | ⏸️ Ready | `npm run dev` | "Local: http://localhost:8080/" |
| **Scraper** | - | ⏸️ Optional | `cd scraper && python production_scheduler.py` | "All scrapers imported" |

---

## 🚀 Next Steps

1. **Start MongoDB first:**
   ```bash
   mongod
   ```

2. **Then run the batch file:**
   ```bash
   cd tracker
   START_ALL.bat
   ```

3. **Or start manually in 4 terminals** (see Option 2 above)

4. **Verify all services:**
   - Backend: http://localhost:5000/health
   - Frontend: http://localhost:8080
   - Database: `mongosh` → `use go-tracker`

---

**All systems are ready - just need MongoDB started first!** 🎉

