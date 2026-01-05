# Go Tracker - Production System Architecture Guide

## 🏗️ System Overview

Go Tracker is a comprehensive student competitive programming dashboard with a production-ready architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 8084)                │
│              (Student Dashboard + Staff Portal)              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Node.js Express API (Port 5000)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Routes:                                              │   │
│  │ • /api/students - Get all students                   │   │
│  │ • /api/students/:id - Get individual student         │   │
│  │ • /api/stats - Get leaderboard & statistics          │   │
│  │ • /api/admin/dashboard - Admin dashboard data        │   │
│  │ • /api/admin/logs - Scraper logs                     │   │
│  │ • /api/admin/stats - System statistics               │   │
│  │ • /api/scraping/trigger - Trigger Python scraper    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Database                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Collections:                                         │   │
│  │ • students - Student profiles & platform data        │   │
│  │ • scraper_logs - Scraping activity logs              │   │
│  │ • admin_logs - System administration logs            │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Python Scraper Scheduler (Background)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Scrapers:                                            │   │
│  │ • leetcode_scraper.py - GraphQL API                  │   │
│  │ • codechef_scraper.py - Web scraping                 │   │
│  │ • codeforces_scraper.py - Official API               │   │
│  │ • github_scraper.py - GitHub API v3 + GraphQL        │   │
│  │ • codolio_scraper.py - Selenium (JS rendering)       │   │
│  │                                                      │   │
│  │ Scheduler: production_scheduler.py                   │   │
│  │ • Runs on schedule (cron or schedule library)        │   │
│  │ • Updates MongoDB with fresh data                    │   │
│  │ • Logs all activity to scraper_logs collection       │   │
│  │ • Implements rate limiting & retries                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

1. **Python Scrapers** fetch real-time data from external platforms
2. **Scheduler** runs scrapers on a staggered schedule to avoid rate limits
3. **MongoDB** stores the latest snapshot of each student's data
4. **Node.js API** serves data to the frontend (no scraping here - just reads DB)
5. **React Frontend** displays live data with periodic polling

## 🕒 Update Schedule

| Platform | Frequency | Reason |
|----------|-----------|--------|
| LeetCode | Every 30-60 mins | Problem solves + rating changes slowly |
| CodeChef | Every 1-2 hours | Avoids rate limits + fewer contests |
| Codeforces | Every 30-60 mins | Safe + stable API |
| GitHub | Every 30 mins | Commits can happen anytime |
| Codolio | Every 3-6 hours | JS rendering = heavier operation |
| **Full Refresh** | **Daily at 2 AM** | Ensures all data is fresh |

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- MongoDB 4.4+
- Chrome/Chromium (for Codolio scraping)
- GitHub Personal Access Token (optional but recommended)

### Installation

1. **Backend Setup**
```bash
cd go-tracker/backend
npm install
```

2. **Python Scraper Setup**
```bash
cd go-tracker/scraper
pip install -r requirements.txt
```

3. **Environment Configuration**

Create `.env` in `go-tracker/backend/`:
```env
MONGO_URI=mongodb://localhost:27017/go-tracker
PORT=5000
NODE_ENV=production
GITHUB_TOKEN=your_github_token_here
FRONTEND_URL=http://localhost:8084
```

Create `.env` in `go-tracker/scraper/`:
```env
MONGO_URI=mongodb://localhost:27017/go-tracker
GITHUB_TOKEN=your_github_token_here
LOG_LEVEL=INFO
```

### Running the System

**Terminal 1 - MongoDB**
```bash
mongod
```

**Terminal 2 - Node.js Backend**
```bash
cd go-tracker/backend
npm run dev
```

**Terminal 3 - React Frontend**
```bash
cd go-tracker
npm run dev
```

**Terminal 4 - Python Scheduler** (Production only)
```bash
cd go-tracker/scraper
python production_scheduler.py
```

## 📡 API Endpoints

### Student Data
```
GET /api/students
  Returns: All students with latest platform data

GET /api/students/:id
  Returns: Individual student profile with all platform stats

GET /api/stats/leaderboard
  Returns: Ranked students by total rating
```

### Admin Dashboard
```
GET /api/admin/dashboard
  Returns: Dashboard data (coverage, top performers, needs update)

GET /api/admin/logs?limit=100&platform=leetcode
  Returns: Scraper logs with filtering

GET /api/admin/stats
  Returns: System statistics (success rate, platform stats, errors)

GET /api/admin/student-health/:id
  Returns: Individual student data health status
```

### Scraping Control
```
POST /api/scraping/trigger
  Triggers full scrape of all students (staff only)

POST /api/scraping/student/:id
  Triggers scrape for single student (staff only)

GET /api/scraping/status
  Returns: Current scraping status
```

## 🛡️ Anti-Blocking Strategy

The system implements multiple safeguards to avoid overloading external platforms:

1. **Rate Limiting**
   - 2-5 second random delay between requests
   - Exponential backoff on rate limit errors
   - Max 3 retries per request

2. **Staggered Scheduling**
   - Different platforms updated at different intervals
   - Batch processing with delays between students
   - Full refresh only once per day

3. **User-Agent Headers**
   - Realistic browser user agents
   - Prevents detection as bot

4. **Selenium Optimization**
   - Codolio only (heavy JS rendering)
   - Fresh driver per profile (avoids crashes)
   - Headless mode for efficiency

## 📝 Logging & Monitoring

All scraping activity is logged to MongoDB `scraper_logs` collection:

```javascript
{
  platform: "leetcode",
  username: "student_username",
  status: "success",  // or "error", "skipped"
  message: "Data updated",
  data_points: 8,
  timestamp: ISODate("2026-01-05T10:30:00Z")
}
```

### Viewing Logs
```bash
# Via API
curl http://localhost:5000/api/admin/logs?limit=50

# Via MongoDB
db.scraper_logs.find().sort({timestamp: -1}).limit(50)
```

## 🔧 Troubleshooting

### Scraper Not Running
1. Check Python environment: `python --version`
2. Check dependencies: `pip list | grep requests`
3. Check MongoDB connection: `mongosh`
4. Check logs: `tail -f scraper.log`

### Rate Limiting Errors
- Increase delays in scraper files
- Reduce update frequency in scheduler
- Check platform's rate limit documentation

### Missing Data
1. Check student has platform usernames in DB
2. Check platform username is correct
3. Run manual scrape: `python -c "from leetcode_scraper import scrape_leetcode_user; print(scrape_leetcode_user('username'))"`

### MongoDB Connection Issues
```bash
# Test connection
mongosh "mongodb://localhost:27017/go-tracker"

# Check collections
db.students.countDocuments()
db.scraper_logs.countDocuments()
```

## 🌐 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]
```

### Systemd Service (Linux)
Create `/etc/systemd/system/go-tracker-scraper.service`:
```ini
[Unit]
Description=Go Tracker Python Scraper
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/go-tracker/scraper
ExecStart=/usr/bin/python3 production_scheduler.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable go-tracker-scraper
sudo systemctl start go-tracker-scraper
```

## 📊 MongoDB Schema

### Student Document
```javascript
{
  _id: ObjectId,
  name: "Student Name",
  rollNumber: "CSBS23-021",
  email: "student@college.edu",
  batch: "A",
  department: "Computer Science & Business Systems",
  
  platformUsernames: {
    leetcode: "username",
    codechef: "username",
    codeforces: "username",
    github: "username",
    codolio: "username"
  },
  
  platforms: {
    leetcode: {
      username: "username",
      rating: 1760,
      maxRating: 1820,
      problemsSolved: 320,
      contestsAttended: 17,
      lastUpdated: ISODate("2026-01-05T10:30:00Z")
    },
    codechef: { ... },
    codeforces: { ... },
    github: {
      username: "username",
      repositories: 12,
      contributions: 312,
      followers: 45,
      currentStreak: 15,
      longestStreak: 45,
      lastUpdated: ISODate("2026-01-05T10:30:00Z")
    },
    codolio: {
      username: "username",
      totalActiveDays: 156,
      totalContests: 42,
      totalSubmissions: 523,
      badges: [...],
      lastUpdated: ISODate("2026-01-05T10:30:00Z")
    }
  },
  
  lastScrapedAt: ISODate("2026-01-05T10:30:00Z"),
  scrapingErrors: [
    {
      platform: "leetcode",
      error: "Rate limited",
      timestamp: ISODate("2026-01-05T09:30:00Z")
    }
  ]
}
```

## 🎯 Performance Metrics

Expected performance on i5-12th gen + RTX 3050:

- **Scraping Speed**: ~2-3 students per minute per platform
- **Full Refresh**: ~30-45 minutes for all 63 students
- **API Response Time**: <100ms for most endpoints
- **Database Query Time**: <50ms for indexed queries
- **Memory Usage**: ~200-300MB for scheduler + MongoDB

## 🔐 Security Notes

1. **GitHub Token**: Store securely in `.env`, never commit to git
2. **Database**: Use authentication in production
3. **API**: Implement rate limiting on public endpoints
4. **Logging**: Don't log sensitive data (passwords, tokens)
5. **CORS**: Restrict to known frontend URLs

## 📚 Additional Resources

- [LeetCode GraphQL API](https://leetcode.com/graphql)
- [Codeforces API Documentation](https://codeforces.com/apiHelp)
- [GitHub API v3](https://docs.github.com/en/rest)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)

## 🤝 Contributing

When adding new features:
1. Follow existing code style
2. Add logging for debugging
3. Implement error handling
4. Update this documentation
5. Test with sample data first

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs in MongoDB
3. Check platform API status
4. Verify environment configuration

---

**Last Updated**: January 5, 2026
**System Version**: 1.0.0 (Production Ready)
