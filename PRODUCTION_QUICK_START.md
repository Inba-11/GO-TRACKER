# Production System - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies

```bash
# Backend
cd go-tracker/backend
npm install

# Python Scrapers
cd ../scraper
pip install -r requirements.txt
```

### Step 2: Configure Environment

**Backend `.env` (go-tracker/backend/.env)**
```env
MONGO_URI=mongodb://localhost:27017/go-tracker
PORT=5000
NODE_ENV=production
GITHUB_TOKEN=ghp_your_token_here
FRONTEND_URL=http://localhost:8084
```

**Scraper `.env` (go-tracker/scraper/.env)**
```env
MONGO_URI=mongodb://localhost:27017/go-tracker
GITHUB_TOKEN=ghp_your_token_here
LOG_LEVEL=INFO
```

### Step 3: Start Services

**Terminal 1 - MongoDB**
```bash
mongod
```

**Terminal 2 - Backend API**
```bash
cd go-tracker/backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 3 - Frontend**
```bash
cd go-tracker
npm run dev
# Runs on http://localhost:8084
```

**Terminal 4 - Python Scheduler** (Optional - for auto-updates)
```bash
cd go-tracker/scraper
python production_scheduler.py
```

## ✅ Verify Everything Works

1. **Check Backend**: http://localhost:5000/health
   - Should return: `{ success: true, message: "Go Tracker API is running" }`

2. **Check Frontend**: http://localhost:8084
   - Should load the login page

3. **Check Database**: 
   ```bash
   mongosh
   > use go-tracker
   > db.students.countDocuments()
   ```

4. **Check Scraper** (if running):
   ```bash
   # Should see logs like:
   # ✅ LeetCode scraper imported
   # ✅ GitHub scraper imported
   # etc.
   ```

## 📊 Admin Dashboard

Access admin features at: http://localhost:8084/admin

**Admin Credentials** (from LOGIN_CREDENTIALS.md):
- Email: `admin@college.edu`
- Password: `admin123`

### Available Admin Endpoints

```bash
# Dashboard overview
curl http://localhost:5000/api/admin/dashboard

# Scraper logs
curl http://localhost:5000/api/admin/logs?limit=50

# System statistics
curl http://localhost:5000/api/admin/stats

# Individual student health
curl http://localhost:5000/api/admin/student-health/{studentId}
```

## 🔄 Manual Scraping

### Trigger Full Scrape
```bash
curl -X POST http://localhost:5000/api/scraping/trigger \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### Scrape Single Student
```bash
curl -X POST http://localhost:5000/api/scraping/student/{studentId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

### Check Scraping Status
```bash
curl http://localhost:5000/api/scraping/status
```

## 📈 Data Updates

### Automatic Updates (if scheduler running)
- LeetCode: Every 45 minutes
- CodeChef: Every 90 minutes
- Codeforces: Every 45 minutes
- GitHub: Every 30 minutes
- Codolio: Every 4 hours
- Full Refresh: Daily at 2 AM

### Manual Update
```bash
# Run scraper directly
cd go-tracker/scraper
python production_scheduler.py

# Or trigger via API (see above)
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# If not, start it
mongod
```

### Python Scraper Import Error
```bash
# Reinstall dependencies
cd go-tracker/scraper
pip install --upgrade -r requirements.txt

# Check Python version
python --version  # Should be 3.8+
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>
```

### No Data in Dashboard
1. Check if students exist: `db.students.countDocuments()`
2. Check if students have platform usernames
3. Run manual scrape to populate data
4. Check scraper logs for errors

## 📊 Monitoring

### View Scraper Logs
```bash
# Last 50 logs
mongosh
> db.scraper_logs.find().sort({timestamp: -1}).limit(50)

# Logs for specific platform
> db.scraper_logs.find({platform: "leetcode"}).sort({timestamp: -1}).limit(20)

# Error logs only
> db.scraper_logs.find({status: "error"}).sort({timestamp: -1}).limit(10)
```

### Check System Health
```bash
# Via API
curl http://localhost:5000/api/admin/stats

# Via MongoDB
> db.students.aggregate([
    {$group: {_id: null, count: {$sum: 1}, avgRating: {$avg: "$platforms.leetcode.rating"}}}
  ])
```

## 🎯 Next Steps

1. **Populate Student Data**
   - Ensure all 63 students have platform usernames in MongoDB
   - Run initial scrape to populate data

2. **Set Up Scheduler**
   - Run `production_scheduler.py` in background
   - Or set up systemd service for auto-start

3. **Configure GitHub Token**
   - Get token from https://github.com/settings/tokens
   - Add to `.env` files for better rate limits

4. **Monitor Performance**
   - Check admin dashboard regularly
   - Review scraper logs for errors
   - Monitor database size

5. **Deploy to Production**
   - Use Docker for containerization
   - Set up systemd services
   - Configure reverse proxy (nginx)
   - Enable HTTPS

## 📚 Full Documentation

See `PRODUCTION_SYSTEM_GUIDE.md` for:
- Complete architecture overview
- Detailed API documentation
- Deployment instructions
- Security best practices
- Performance optimization

---

**Ready to go!** 🚀

If you encounter any issues, check the troubleshooting section or review the full guide.
