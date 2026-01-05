# GO Tracker - Production Scraping System

## 🎯 Overview

This is a production-ready scraping system for the GO Tracker student dashboard. It automatically collects data from multiple competitive programming platforms and serves it through a REST API.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Python        │    │   Node.js       │    │   React         │
│   Scrapers      │───▶│   API Server    │───▶│   Frontend      │
│                 │    │                 │    │                 │
│ • LeetCode      │    │ • REST API      │    │ • Dashboard     │
│ • CodeChef      │    │ • Rate Limiting │    │ • Leaderboard   │
│ • Codeforces    │    │ • CORS          │    │ • Real-time     │
│ • GitHub        │    │ • Health Check  │    │   Updates       │
│ • Codolio       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │   MongoDB       │
                    │                 │
                    │ • Student Data  │
                    │ • Platform Data │
                    │ • Scraper Logs  │
                    │ • System Stats  │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

1. **MongoDB** - Running on localhost:27017
2. **Python 3.8+** - With pip
3. **Node.js 16+** - With npm
4. **Chrome Browser** - For Selenium (Codolio scraping)

### Installation

```bash
# 1. Navigate to scraper directory
cd go-tracker/scraper

# 2. Install Node.js dependencies
npm install

# 3. Install Python dependencies
pip install pymongo requests beautifulsoup4 selenium schedule python-dotenv

# 4. Set up environment variables (copy from backend/.env)
cp ../backend/.env .env

# 5. Start the production system
python start_production.py
```

### Manual Start (Alternative)

```bash
# Terminal 1: Start API Server
node api_server.js

# Terminal 2: Start Scraper
python production_scheduler.py
```

## 📊 Update Strategy

| Platform   | Update Frequency | Reason                           |
|------------|------------------|----------------------------------|
| LeetCode   | 30-60 minutes    | Problem solves + rating changes  |
| CodeChef   | 1-2 hours        | Avoids rate limits + fewer contests |
| Codeforces | 30-60 minutes    | Safe + stable API               |
| GitHub     | 30 minutes       | Commits can happen anytime      |
| Codolio    | 3-6 hours        | JS rendering = heavier          |

**Full Refresh**: Once per day (minimum)

## 🛡️ Anti-Blocking Features

- **Rate Limiting**: 2-5 second delays between requests
- **Random Delays**: Prevents pattern detection
- **User-Agent Headers**: Mimics real browsers
- **Retry Logic**: 3 attempts with exponential backoff
- **Selenium Only for Codolio**: Minimal browser usage
- **Fresh Driver Instances**: Prevents memory leaks

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Students Data
```
GET /api/students              # All students
GET /api/students/:id          # Single student
```

### Leaderboard
```
GET /api/leaderboard?platform=all&limit=50
GET /api/leaderboard?platform=leetcode&limit=20
```

### Platform-Specific Data
```
GET /api/platforms/leetcode
GET /api/platforms/codechef
GET /api/platforms/codeforces
GET /api/platforms/github
GET /api/platforms/codolio
```

### System Statistics
```
GET /api/stats                 # System overview
GET /api/logs?platform=leetcode&status=success
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
# MongoDB
MONGO_URI=mongodb://localhost:27017/go-tracker

# API Server
API_PORT=5001
FRONTEND_URL=http://localhost:8084

# GitHub (Optional - for better rate limits)
GITHUB_TOKEN=your_github_token_here

# Logging
LOG_LEVEL=INFO
```

### MongoDB Collections

#### students
```javascript
{
  "_id": ObjectId,
  "name": "Student Name",
  "rollNumber": "CSBS23-021",
  "platforms": {
    "leetcode": {
      "rating": 1760,
      "totalSolved": 320,
      "lastUpdated": ISODate
    },
    "codechef": { ... },
    "codeforces": { ... },
    "github": { ... },
    "codolio": { ... }
  },
  "platformUsernames": {
    "leetcode": "username123",
    ...
  }
}
```

#### scraper_logs
```javascript
{
  "_id": ObjectId,
  "platform": "leetcode",
  "username": "student123",
  "status": "success",
  "message": "Data updated",
  "data_points": 5,
  "timestamp": ISODate
}
```

## 📈 Monitoring & Logging

### Log Files
- `production.log` - Combined system logs
- `scraper.log` - Scraper-specific logs

### Health Monitoring
- Automatic process restart on crashes
- Health checks every 30 seconds
- MongoDB connection monitoring
- API endpoint health checks

### Admin Dashboard
Access scraper logs and system stats:
```bash
# View recent logs
curl http://localhost:5001/api/logs?limit=50

# System statistics
curl http://localhost:5001/api/stats

# Platform coverage
curl http://localhost:5001/api/stats | jq '.data.platforms'
```

## 🎛️ Management Commands

```bash
# Start production system
python start_production.py

# Install dependencies
npm run install-python
npm install

# Test API
npm run test-api

# View logs
npm run logs
tail -f production.log

# Manual scraper run
python production_scheduler.py

# Test individual scrapers
python leetcode_scraper.py
python github_scraper.py
```

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Start MongoDB
   sudo systemctl start mongod
   # Or on Windows
   net start MongoDB
   ```

2. **Chrome Driver Issues (Codolio)**
   ```bash
   # Update Chrome and ChromeDriver
   pip install --upgrade selenium
   ```

3. **Rate Limited**
   - Check logs for rate limit messages
   - Increase delays in scraper configuration
   - Add GitHub token for better API limits

4. **Missing Dependencies**
   ```bash
   # Python packages
   pip install -r requirements.txt
   
   # Node.js packages
   npm install
   ```

### Performance Optimization

1. **Hardware Requirements**
   - Minimum: 4GB RAM, 2 CPU cores
   - Recommended: 8GB RAM, 4 CPU cores (i5-12th gen + RTX 3050)

2. **MongoDB Optimization**
   ```javascript
   // Create indexes for better performance
   db.students.createIndex({"platforms.leetcode.rating": -1})
   db.students.createIndex({"platforms.codechef.rating": -1})
   db.scraper_logs.createIndex({"timestamp": -1})
   ```

3. **Memory Management**
   - Selenium creates fresh drivers for each Codolio profile
   - Automatic cleanup of old logs (30 days)
   - Process monitoring and restart

## 📊 Data Flow

```
1. Python Scrapers collect data from platforms
2. Data stored in MongoDB with timestamps
3. Node.js API serves data to React frontend
4. Frontend polls API every 20-30 seconds
5. Real-time updates without stressing original platforms
```

## 🎓 Educational Use Statement

This project collects only public profile data from students who have given permission, for educational use only. No credentials or private data are accessed.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test with sample data
4. Submit pull request

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for competitive programming students**