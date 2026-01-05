# 🚀 GO TRACKER - RUN NOW!

## ⚡ Quick Start (30 Seconds)

### Windows Users - Easiest Way

**Step 1**: Open Command Prompt or PowerShell in the `go-tracker` folder

**Step 2**: Run this command:
```bash
START_ALL.bat
```

**Step 3**: Wait for 4 windows to open, then visit:
- **Frontend**: http://localhost:8084
- **Admin**: http://localhost:8084/admin (admin@college.edu / admin123)

**Done!** ✅ System is running!

---

## 📋 What You Need First

### Check 1: MongoDB Running?
```bash
mongosh
```
If it works, MongoDB is running. If not:
```bash
mongod
```

### Check 2: Node.js Installed?
```bash
node --version
npm --version
```

### Check 3: Python Installed?
```bash
python --version
```

---

## 🎯 Three Ways to Run

### Way 1: Automatic (Windows) ⭐ RECOMMENDED
```bash
cd go-tracker
START_ALL.bat
```
Opens 4 windows automatically. Just wait and access the URLs.

### Way 2: Manual (4 Terminal Windows)
```bash
# Terminal 1
mongod

# Terminal 2
cd go-tracker/backend
npm run dev

# Terminal 3
cd go-tracker
npm run dev

# Terminal 4
cd go-tracker/scraper
python production_scheduler.py
```

### Way 3: Docker (If Installed)
```bash
cd go-tracker
docker-compose up -d
```

---

## ✅ Verify It's Working

### Test 1: Frontend
```
http://localhost:8084
```
Should show login page

### Test 2: Admin Dashboard
```
http://localhost:8084/admin
Email: admin@college.edu
Password: admin123
```
Should show dashboard with statistics

### Test 3: Backend API
```
http://localhost:5000/health
```
Should show: `{ "success": true, "message": "Go Tracker API is running" }`

### Test 4: Database
```bash
mongosh
> db.students.countDocuments()
```
Should show: 63 (number of students)

---

## 📊 What's Happening

The system is automatically:
- ✅ Scraping LeetCode every 45 minutes
- ✅ Scraping CodeChef every 90 minutes
- ✅ Scraping Codeforces every 45 minutes
- ✅ Scraping GitHub every 30 minutes
- ✅ Scraping Codolio every 4 hours
- ✅ Full refresh daily at 2 AM
- ✅ Logging everything to MongoDB

---

## 🔍 Monitor Progress

### View Scheduler Logs
```bash
tail -f go-tracker/scraper/scraper.log
```

### View Database Activity
```bash
mongosh
> db.scraper_logs.find().sort({timestamp: -1}).limit(10)
```

### Check System Stats
```bash
curl http://localhost:5000/api/admin/stats
```

---

## 🛑 Stop Everything

Just close all terminal windows or press `Ctrl+C` in each.

If using Docker:
```bash
docker-compose down
```

---

## 🐛 Quick Fixes

### "MongoDB not running"
```bash
mongod
```

### "Port 5000 in use"
```bash
taskkill /F /IM node.exe
cd go-tracker/backend
npm run dev
```

### "Port 8084 in use"
```bash
taskkill /F /IM node.exe
cd go-tracker
npm run dev
```

### "Python error"
```bash
cd go-tracker/scraper
pip install -r requirements.txt
python production_scheduler.py
```

---

## 📱 Login Info

### Admin
- Email: `admin@college.edu`
- Password: `admin123`

### Staff
- Email: `staff@college.edu`
- Password: `staff123`

### Students
- Check `LOGIN_CREDENTIALS.md`
- Default: `student123`

---

## 🎯 Access Points

| What | URL |
|------|-----|
| Student Dashboard | http://localhost:8084 |
| Admin Dashboard | http://localhost:8084/admin |
| Backend API | http://localhost:5000 |
| API Health | http://localhost:5000/health |
| Database | localhost:27017 |

---

## 📈 Expected Results

After running:
1. **Immediately**: Frontend & Admin dashboards load
2. **After 1 min**: Backend API responds
3. **After 2-3 min**: Student data appears
4. **After 5 min**: Leaderboards populate
5. **Ongoing**: Data updates every 30-90 minutes

---

## 🎉 That's It!

Your Go Tracker production system is now running with:
- ✅ Real-time student dashboards
- ✅ Admin monitoring
- ✅ Automatic data updates
- ✅ Comprehensive logging
- ✅ Error handling

**Enjoy!** 🚀

---

## 📞 Need More Help?

- **Full Guide**: See `RUN_GUIDE.md`
- **System Guide**: See `PRODUCTION_SYSTEM_GUIDE.md`
- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: See `PRODUCTION_QUICK_START.md`

---

**Status**: ✅ Ready to Run
**Last Updated**: January 5, 2026
