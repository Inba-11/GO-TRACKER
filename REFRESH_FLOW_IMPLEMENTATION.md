# Refresh Flow Implementation - Complete Guide

## Overview
This document describes the complete refresh flow implementation for all platforms, with detailed console logging and UI updates.

## LeetCode Refresh Flow (Example)

### 1. User Action
- User clicks refresh button on LeetCode card or analytics section
- Frontend: `handleRefreshPlatform('leetcode')` is called

### 2. Frontend → Backend
- **API Call**: `POST /api/scraping/refresh/:studentId/leetcode`
- **Frontend Console**: Shows "Refreshing LeetCode" toast notification

### 3. Backend Processing
**Location**: `tracker/backend/routes/scrapingRoutes.js`

**Backend Console Output**:
```
============================================================
🔄 REFRESH REQUEST: LEETCODE for [Student Name]
============================================================
📋 Student: [Name] ([Roll Number])
🆔 Student ID: [ID]

📊 OLD DATA (Before Scraping):
   [Full JSON of existing LeetCode data]

🔗 Platform Link: [URL]
👤 Username: [username]

🚀 Starting Python Scraper:
   Script: [path]/refresh_leetcode.py
   Command: [full command]

⏳ Scraping in progress...
```

### 4. Python Scraper Execution
**Location**: `tracker/scraper/refresh_leetcode.py`

**Python Console Output**:
```
============================================================
📊 SCRAPING LeetCode for username: [username]
📝 Student: [Name] ([Roll Number])
============================================================

📋 OLD DATA (Before Scraping):
   Total Solved: [number]
   Easy: [number] | Medium: [number] | Hard: [number]
   Rating: [number] | Max Rating: [number]
   Contests: [number]
   Streak: [number]
   Acceptance Rate: [number]%
   Last Updated: [timestamp]

🚀 Starting LeetCode scraper...

============================================================
✅ SCRAPED DATA (From LeetCode):
============================================================
   Username: [username]
   Total Solved: [number]
   Easy: [number] | Medium: [number] | Hard: [number]
   Rating: [number] | Max Rating: [number]
   Last Week Rating: [number]
   Contests Attended: [number]
   Global Ranking: [number]
   Reputation: [number]
   Total Submissions: [number]
   Acceptance Rate: [number]%
   Streak: [number]
   Total Active Days: [number]
   Recent Contests: [number]
   Contest History: [number] contests
   Badges: [number] badges
============================================================

💾 Updating MongoDB...

============================================================
✅ SUCCESS: LeetCode data updated in MongoDB
============================================================

📊 NEW DATA (After MongoDB Update):
   Total Solved: [number]
   Easy: [number] | Medium: [number] | Hard: [number]
   Rating: [number] | Max Rating: [number]
   Contests: [number]
   Streak: [number]
   Acceptance Rate: [number]%
   Last Updated: [timestamp]

💾 MongoDB Status: Modified=[number], Matched=[number]
============================================================
```

**Backend Console Output (After Python completes)**:
```
[leetcode] [Python output lines...]

============================================================
✅ SUCCESS: LEETCODE data refreshed for [Student Name]
============================================================

📊 NEW DATA (After Scraping):
   [Full JSON of updated LeetCode data]

💾 MongoDB Updated: ✅
📅 Last Updated: [timestamp]
============================================================
```

### 5. Frontend Update
**Location**: `tracker/src/pages/StudentDashboard.tsx`

**Frontend Console Output**:
```
============================================================
✅ LeetCode Refresh Complete
============================================================
📊 Updated LeetCode Data: [Full platform data object]
============================================================

🔄 UI Updated with latest LeetCode data
```

**UI Updates**:
- ✅ Platform Card shows new stats (totalSolved, rating, contests, streak)
- ✅ LeetCode Analytics section updates all metrics
- ✅ Toast notification: "LeetCode Data Updated"
- ✅ Loading spinner stops

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER CLICKS REFRESH BUTTON                               │
│    Location: StudentDashboard.tsx (Line 1305 or 1612)      │
│    Action: handleRefreshPlatform('leetcode')                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND API CALL                                         │
│    studentsAPI.refreshPlatform(studentId, 'leetcode')       │
│    POST /api/scraping/refresh/:studentId/leetcode           │
│    Timeout: 90 seconds                                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND ROUTE                                            │
│    Location: scrapingRoutes.js (Line 337)                   │
│    - Logs OLD DATA (before scraping)                        │
│    - Extracts username from platformLinks/platformUsernames │
│    - Executes: python refresh_leetcode.py studentId username │
│    - Captures Python stdout/stderr                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. PYTHON SCRAPER                                            │
│    Location: refresh_leetcode.py                            │
│    - Connects to MongoDB                                     │
│    - Finds student by _id                                    │
│    - Prints OLD DATA                                         │
│    - Calls leetcode_scraper.py                               │
│    - Prints SCRAPED DATA                                     │
│    - Updates MongoDB: platforms.leetcode.*                  │
│    - Prints NEW DATA (after MongoDB update)                  │
│    - Exits with code 0 (success) or 1 (failure)             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. BACKEND COMPLETION                                       │
│    - Python process completes                                │
│    - Fetches updated student from MongoDB                    │
│    - Logs NEW DATA                                           │
│    - Returns updated student data to frontend               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. FRONTEND UPDATE                                           │
│    - Receives updated student data                          │
│    - Logs updated data to console                            │
│    - Refetches student data (getById/getMe)                 │
│    - setStudent(updatedData)                                  │
│    - UI automatically re-renders                             │
│    - Platform Card updates                                   │
│    - Analytics Grid updates                                  │
│    - Toast notification shown                                │
└─────────────────────────────────────────────────────────────┘
```

## Console Output Locations

### Backend Console (Node.js)
- **Location**: Terminal running `npm run dev` in `backend/`
- **Shows**: 
  - Old data before scraping
  - Python script execution
  - Python stdout/stderr output
  - New data after scraping
  - MongoDB update status

### Python Console (Scraper)
- **Location**: Captured by backend and shown in backend console
- **Shows**:
  - Old data from MongoDB
  - Scraped data from LeetCode
  - New data after MongoDB update
  - Success/failure status

### Frontend Console (Browser)
- **Location**: Browser DevTools Console (F12)
- **Shows**:
  - Refresh completion status
  - Updated platform data
  - UI update confirmation

## MongoDB Fields Updated (LeetCode)

```javascript
{
  'platforms.leetcode.username': string,
  'platforms.leetcode.problemsSolved': number,
  'platforms.leetcode.totalSolved': number,
  'platforms.leetcode.easySolved': number,
  'platforms.leetcode.mediumSolved': number,
  'platforms.leetcode.hardSolved': number,
  'platforms.leetcode.rating': number,
  'platforms.leetcode.maxRating': number,
  'platforms.leetcode.lastWeekRating': number,
  'platforms.leetcode.contestsAttended': number,
  'platforms.leetcode.contests': number,
  'platforms.leetcode.globalRank': number,
  'platforms.leetcode.globalRanking': number,
  'platforms.leetcode.ranking': number,
  'platforms.leetcode.reputation': number,
  'platforms.leetcode.totalSubmissions': number,
  'platforms.leetcode.acceptanceRate': number,
  'platforms.leetcode.streak': number,
  'platforms.leetcode.totalActiveDays': number,
  'platforms.leetcode.badges': array,
  'platforms.leetcode.activeBadge': string,
  'platforms.leetcode.contestHistory': array,
  'platforms.leetcode.submissionCalendar': string,
  'platforms.leetcode.recentSubmissions': array,
  'platforms.leetcode.recentContests': number,
  'platforms.leetcode.topPercentage': number,
  'platforms.leetcode.totalParticipants': number,
  'platforms.leetcode.lastUpdated': Date,
  'platforms.leetcode.dataSource': 'leetcode_refresh_script',
  'platformUsernames.leetcode': string,
  'lastScrapedAt': Date
}
```

## UI Components Updated

### Platform Performance Grid Card
- **Location**: Line 1294-1315
- **Fields Updated**:
  - Total Problems Solved
  - Easy/Medium/Hard breakdown
  - Rating
  - Contests
  - Streak

### LeetCode Analytics Section
- **Location**: Line 1600-1680
- **Tabs Updated**:
  - **Overview**: Platform stats card
  - **Activity**: Submission calendar, recent activity
  - **Statistics**: Detailed metrics, contest history

## Error Handling

### Python Script Errors
- **Exit Code 1**: Scraper failed
- **Backend Response**: 500 with error details
- **Frontend**: Shows error toast with details

### Timeout Errors
- **Backend Timeout**: 90 seconds
- **Frontend Timeout**: 90 seconds (matches backend)
- **Response**: 504 Gateway Timeout
- **Frontend**: Shows timeout toast

### Username Not Found
- **Backend Response**: 400 Bad Request
- **Frontend**: Shows error toast with helpful message

## Testing the Flow

1. **Open Browser DevTools Console** (F12)
2. **Open Backend Terminal** (where `npm run dev` is running)
3. **Click LeetCode Refresh Button**
4. **Observe**:
   - Backend console shows old data → Python execution → new data
   - Python output appears in backend console
   - Frontend console shows refresh completion
   - UI updates with new data
   - Toast notification appears

## All Platforms Follow Same Pattern

- ✅ **LeetCode**: `refresh_leetcode.py`
- ✅ **CodeChef**: `refresh_codechef.py`
- ✅ **Codeforces**: `refresh_codeforces.py`
- ✅ **GitHub**: `refresh_github.py`
- ✅ **Codolio**: `refresh_codolio.py`

Each platform has:
- Console logging (old → scraped → new data)
- MongoDB updates
- Frontend UI updates
- Error handling

## Summary

✅ **Console Logging**: Complete (Backend + Python + Frontend)
✅ **MongoDB Updates**: All fields updated correctly
✅ **UI Updates**: Platform cards and analytics sections
✅ **Error Handling**: Comprehensive with user-friendly messages
✅ **Data Flow**: Old → Scraped → New data visible at each step

The refresh flow is now fully implemented with comprehensive logging and UI updates!
