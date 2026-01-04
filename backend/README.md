# Go Tracker Backend API

## Overview
Node.js backend with Express, MongoDB, and web scraping capabilities for the Go Tracker application. This API scrapes coding platform profiles and provides RESTful endpoints for user management.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation
```bash
cd go-tracker/backend
npm install
```

### Environment Setup
Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/go-tracker
FRONTEND_URL=http://localhost:5173
SCRAPING_DELAY=2000
MAX_RETRIES=3
```

### Initialize Database
```bash
# Start MongoDB (if local)
mongod

# Initialize the specific user
node scripts/initUser.js
```

### Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📊 User Profile Data

### Target User: INBATAMIZHAN P
- **Roll Number:** 711523BCB023
- **LeetCode:** https://leetcode.com/u/inbatamizh/
- **CodeChef:** https://www.codechef.com/users/kit27csbs23
- **Codeforces:** https://codeforces.com/profile/Inba_tamizh
- **GitHub:** https://github.com/Inba-11
- **Codolio:** https://codolio.com/profile/Inba

## 🔌 API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/roll/:rollNumber` | Get user by roll number |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user (soft delete) |

### Scraping
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/:id/scrape` | Scrape data for specific user |
| POST | `/api/users/scrape-all` | Scrape data for all users |

### Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/stats` | Get platform statistics |
| GET | `/health` | Health check |

## 🕷️ Web Scraping

### Supported Platforms
- **LeetCode** - GraphQL API + HTML scraping
- **CodeChef** - HTML scraping
- **Codeforces** - Official API + HTML scraping
- **GitHub** - HTML scraping
- **Codolio** - Puppeteer (JavaScript rendering)

### Scraping Features
- Rate limiting (2-second delays)
- Retry mechanism (3 attempts)
- Error handling and logging
- Data freshness checks (1-hour cache)
- Scheduled auto-scraping (production)

## 📝 API Usage Examples

### 1. Get User by Roll Number
```bash
curl http://localhost:5000/api/users/roll/711523BCB023
```

### 2. Scrape User Data
```bash
curl -X POST http://localhost:5000/api/users/{userId}/scrape
```

### 3. Force Refresh Data
```bash
curl -X POST "http://localhost:5000/api/users/{userId}/scrape?force=true"
```

### 4. Get All Users with Filtering
```bash
# Get users by batch
curl "http://localhost:5000/api/users?batch=B"

# Sort by total problems
curl "http://localhost:5000/api/users?sortBy=totalProblems&order=desc"
```

### 5. Create New User
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "rollNumber": "123456",
    "email": "john@example.com",
    "batch": "A",
    "platformUsernames": {
      "leetcode": "johndoe",
      "codechef": "john_chef"
    }
  }'
```

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  rollNumber: String (unique),
  email: String (unique),
  batch: String (A|B|C|D|NON-CRT),
  platformUsernames: {
    leetcode: String,
    codechef: String,
    codeforces: String,
    github: String,
    codolio: String
  },
  platforms: {
    leetcode: {
      username: String,
      rating: Number,
      problemsSolved: Number,
      // ... more fields
    },
    // ... other platforms
  },
  lastScrapedAt: Date,
  scrapingErrors: Array
}
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `SCRAPING_DELAY` - Delay between requests (ms)
- `MAX_RETRIES` - Max retry attempts
- `RATE_LIMIT_WINDOW` - Rate limit window (minutes)
- `FRONTEND_URL` - CORS origin URL

### Scraping Settings
- **Rate Limiting:** 2-second delays between requests
- **Retry Logic:** 3 attempts with exponential backoff
- **Cache Duration:** 1 hour for fresh data
- **User Agent:** Rotated browser user agents

## 🚨 Error Handling

### Common Errors
- **404:** User not found
- **400:** Validation errors
- **429:** Rate limit exceeded
- **500:** Scraping failures

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": ["Additional details"]
}
```

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs
- Request logging with Morgan
- Error logging to console
- Scraping progress logs

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevent abuse
- **CORS** - Cross-origin protection
- **Input Validation** - Mongoose validation
- **Error Sanitization** - No sensitive data exposure

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Configure proper CORS origins
4. Set up process manager (PM2)
5. Enable HTTPS
6. Configure monitoring

### Docker Support (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

### Manual Testing
```bash
# Test user creation
node scripts/initUser.js

# Test scraping
curl -X POST http://localhost:5000/api/users/{userId}/scrape

# Check results
curl http://localhost:5000/api/users/roll/711523BCB023
```

### Expected Scraping Results
- LeetCode: Problems solved, rating, contests
- CodeChef: Rating, problems, rank
- Codeforces: Rating, max rating, problems
- GitHub: Contributions, repositories, followers
- Codolio: Submissions, streaks

## 📞 Support

### Common Issues
1. **MongoDB Connection:** Check MONGODB_URI
2. **Scraping Failures:** Check platform availability
3. **Rate Limiting:** Increase delays
4. **CORS Errors:** Check FRONTEND_URL

### Debug Mode
```bash
DEBUG=* npm run dev
```

---

**Note:** This backend is designed for educational purposes. Respect platform terms of service and implement proper rate limiting in production.