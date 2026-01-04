# 🔄 GO TRACKER - Data Flow Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CODING PLATFORMS                             │
│  LeetCode | CodeChef | Codeforces | GitHub | Codolio            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ APIs / Web Scraping
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PYTHON SCRAPER                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  platform_scrapers.py                                     │  │
│  │  - scrape_leetcode()    → GraphQL API                    │  │
│  │  - scrape_codechef()    → Web Scraping                   │  │
│  │  - scrape_codeforces()  → Official API                   │  │
│  │  - scrape_github()      → GitHub API                     │  │
│  │  - scrape_codolio()     → Web Scraping                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  scrape_all_students.py                                   │  │
│  │  - Loops through 63 students                             │  │
│  │  - Extracts usernames from URLs                          │  │
│  │  - Calls scraper for each platform                       │  │
│  │  - Updates MongoDB with results                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ PyMongo
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                            │
│  Database: go-tracker                                            │
│  Collection: students                                            │
│                                                                   │
│  Document Structure:                                             │
│  {                                                               │
│    name: "AADHAM SHARIEF A",                                    │
│    rollNumber: "711523BCB001",                                  │
│    platforms: {                                                  │
│      leetcode: {                                                 │
│        username: "Aadhamsharief",                               │
│        problemsSolved: 48,                                       │
│        rating: 1320,                                             │
│        contests: 8                                               │
│      },                                                          │
│      codechef: { ... },                                          │
│      codeforces: { ... },                                        │
│      github: { ... }                                             │
│    },                                                            │
│    lastScrapedAt: ISODate("2026-01-04T09:51:58.561Z")          │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Mongoose ODM
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NODE.JS BACKEND (Express)                      │
│  Port: 5000                                                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Routes                                               │  │
│  │  - POST /api/auth/login                                   │  │
│  │  - GET  /api/students/me                                  │  │
│  │  - GET  /api/students                                     │  │
│  │  - POST /api/scraping/trigger                             │  │
│  │  - GET  /api/stats/top-performers                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Controllers                                              │  │
│  │  - authController.js    → Login, JWT tokens              │  │
│  │  - studentController.js → CRUD operations                │  │
│  │  - statsController.js   → Analytics                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Models                                                   │  │
│  │  - Student.js → Schema definition                        │  │
│  │  - User.js    → Auth schema                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   REACT FRONTEND (Vite)                          │
│  Port: 8080                                                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pages                                                    │  │
│  │  - StudentDashboard.tsx  → Student view                  │  │
│  │  - StaffDashboard.tsx    → Staff view                    │  │
│  │  - OwnerDashboard.tsx    → Owner view                    │  │
│  │  - StudentProfile.tsx    → Detailed profile              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Components                                               │  │
│  │  - PlatformStatsCard     → Display platform data         │  │
│  │  - PerformanceChart      → Line charts                   │  │
│  │  - ComparisonPieChart    → Pie charts                    │  │
│  │  - HeatmapCalendar       → Submission heatmap            │  │
│  │  - BadgeDisplay          → Achievement badges            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services                                                 │  │
│  │  - api.ts → Axios HTTP client                            │  │
│  │  - studentsAPI.getMe() → Fetch current student           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Browser
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
│  - Login with name + roll number                                │
│  - View real-time platform stats                                │
│  - See performance charts                                       │
│  - Track progress over time                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Steps

### 1. Data Collection (Python Scraper)
```
Platform APIs → Python Scraper → MongoDB
```

**Process**:
1. `scrape_all_students.py` runs
2. For each of 63 students:
   - Extract username from platform URLs
   - Call `platform_scrapers.py` for each platform
   - Fetch real data via APIs/web scraping
   - Store in MongoDB with timestamp

**Example**:
```python
# Input: Student with LeetCode URL
student = {
  "name": "AADHAM SHARIEF A",
  "platformUsernames": {
    "leetcode": "Aadhamsharief"
  }
}

# Scraping
data = scraper.scrape_leetcode("Aadhamsharief")

# Output: Real data
{
  "username": "Aadhamsharief",
  "problemsSolved": 48,
  "rating": 1320,
  "contests": 8
}

# Stored in MongoDB
db.students.updateOne(
  { rollNumber: "711523BCB001" },
  { $set: { "platforms.leetcode": data } }
)
```

---

### 2. Data Storage (MongoDB)
```
MongoDB stores all student data with platform stats
```

**Collections**:
- `students` - Student profiles and platform data
- `users` - Authentication credentials

**Indexes**:
- `rollNumber` (unique)
- `email` (unique)
- `batch`, `section` (for filtering)

---

### 3. Data Serving (Node.js Backend)
```
MongoDB → Express API → JSON Response
```

**API Endpoints**:
```javascript
// Get current student data
GET /api/students/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "name": "AADHAM SHARIEF A",
    "rollNumber": "711523BCB001",
    "platforms": {
      "leetcode": {
        "problemsSolved": 48,
        "rating": 1320,
        "contests": 8
      },
      // ... other platforms
    }
  }
}
```

---

### 4. Data Display (React Frontend)
```
API Response → React Components → User Interface
```

**Component Flow**:
```typescript
// 1. Fetch data
const response = await studentsAPI.getMe();
setStudent(response.data);

// 2. Pass to components
<PlatformStatsCard
  platform="leetcode"
  stats={student.platforms.leetcode}
  color="bg-orange-500"
/>

// 3. Display in UI
<div>
  <p>Problems: {stats.problemsSolved}</p>
  <p>Rating: {stats.rating}</p>
</div>
```

---

## 🔐 Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Login (name + roll number)
     ▼
┌──────────────────┐
│  POST /api/auth  │
│  /login          │
└────┬─────────────┘
     │ 2. Verify credentials
     ▼
┌──────────────────┐
│  MongoDB         │
│  Check password  │
└────┬─────────────┘
     │ 3. Generate JWT token
     ▼
┌──────────────────┐
│  Return token    │
│  + user data     │
└────┬─────────────┘
     │ 4. Store in localStorage
     ▼
┌──────────────────┐
│  Frontend        │
│  Set auth state  │
└────┬─────────────┘
     │ 5. All requests include token
     ▼
┌──────────────────┐
│  Protected       │
│  Routes          │
└──────────────────┘
```

---

## 📊 Real-Time Data Example

### Complete Flow for One Student

**1. Scraping (Python)**
```bash
$ python scrape_all_students.py

Processing AADHAM SHARIEF A...
  📊 Scraping LeetCode: Aadhamsharief
    ✅ LeetCode: 48 problems, Rating: 1320
  📊 Scraping CodeChef: kit27csbs01
    ✅ CodeChef: 0 problems, Rating: 958
  📊 Scraping Codeforces: kit27.csbs01
    ✅ Codeforces: 3 problems, Rating: 752
  📊 Scraping GitHub: Aadhamsharief05
    ✅ GitHub: 3 repos, 0 contributions
✅ Updated in database
```

**2. Storage (MongoDB)**
```javascript
{
  "_id": ObjectId("..."),
  "name": "AADHAM SHARIEF A",
  "rollNumber": "711523BCB001",
  "platforms": {
    "leetcode": {
      "username": "Aadhamsharief",
      "problemsSolved": 48,
      "rating": 1320,
      "maxRating": 1320,
      "contests": 8,
      "lastUpdated": ISODate("2026-01-04T09:51:58.561Z")
    },
    "codechef": { ... },
    "codeforces": { ... },
    "github": { ... }
  },
  "lastScrapedAt": ISODate("2026-01-04T09:51:58.561Z")
}
```

**3. API Response (Node.js)**
```json
{
  "success": true,
  "data": {
    "name": "AADHAM SHARIEF A",
    "rollNumber": "711523BCB001",
    "platforms": {
      "leetcode": {
        "problemsSolved": 48,
        "rating": 1320,
        "contests": 8
      }
    }
  }
}
```

**4. UI Display (React)**
```
┌─────────────────────────────────────┐
│  LeetCode                           │
│  ─────────────────────────────────  │
│  🎯 Problems: 48                    │
│  📈 Rating: 1320                    │
│  🏆 Max Rating: 1320                │
│  🏅 Contests: 8                     │
└─────────────────────────────────────┘
```

---

## 🔄 Update Cycle

### Manual Update
```bash
# Run scraper
cd go-tracker/scraper
python scrape_all_students.py

# Data flows automatically:
# Python → MongoDB → Node.js → React

# Refresh browser to see updated data
```

### Automated Update (Future)
```bash
# Schedule with cron (Linux/Mac)
0 2 * * * cd /path/to/scraper && python scrape_all_students.py

# Or Task Scheduler (Windows)
# Runs daily at 2 AM
```

---

## 📈 Performance Optimization

### Caching Strategy
- MongoDB stores scraped data
- Backend caches frequently accessed data
- Frontend uses React state management
- No need to scrape on every page load

### Rate Limiting
- 3-second delay between API calls
- Prevents IP blocking
- Respects platform rate limits

### Error Handling
- Failed scrapes return default values
- System continues even if one platform fails
- Logs errors for debugging

---

## ✅ System Health Check

```bash
# 1. Check MongoDB
mongosh mongodb://localhost:27017/go-tracker

# 2. Check Backend
curl http://localhost:5000/api/health

# 3. Check Frontend
curl http://localhost:8080

# 4. Check Scraper
cd go-tracker/scraper
python check_status.py

# 5. Verify Data
python verify_data.py
```

---

**Data Flow Status**: ✅ **FULLY OPERATIONAL**  
**All 63 students**: Real data flowing from platforms → MongoDB → API → UI
