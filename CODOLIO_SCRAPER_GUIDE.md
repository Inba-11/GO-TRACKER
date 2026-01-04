# 🎯 Codolio Scraper Guide

## Overview

The Codolio scraper fetches **Total Active Days** and **Total Contests** data for all 63 students using Selenium (because Codolio is JavaScript-rendered).

## 📊 Data Being Scraped

For each student:
- **Total Active Days**: Number of days the student was active on Codolio
- **Total Contests**: Number of contests participated in
- **Total Submissions**: Total problems submitted

## 🔧 Prerequisites

### 1. Install Chrome Browser
Make sure Google Chrome is installed on your system.

### 2. Install ChromeDriver
ChromeDriver must match your Chrome version.

**Option A: Automatic (Recommended)**
```bash
pip install webdriver-manager
```

**Option B: Manual**
1. Check Chrome version: `chrome://version`
2. Download matching ChromeDriver from: https://chromedriver.chromium.org/
3. Add to PATH

### 3. Install Selenium
```bash
pip install selenium
```

## 🚀 Running the Scraper

### Basic Run
```bash
cd go-tracker/scraper
python scrape_codolio.py
```

### What It Does
1. Connects to MongoDB
2. Sets up headless Chrome browser
3. Visits each student's Codolio profile
4. Extracts Total Active Days and Total Contests
5. Updates MongoDB with the data
6. Saves results to `codolio_results.json`

## 📈 Expected Output

```
======================================================================
🎯 CODOLIO SCRAPER
======================================================================
📊 Total users: 62
📡 Connecting to MongoDB...
✅ Connected to MongoDB
🌐 Setting up Chrome driver...
✅ Chrome driver ready

🔄 Starting Codolio scraping...
======================================================================

[1/62] Aadhamsharief_@05
    ✅ Active Days: 221 | Contests: 110 | Submissions: 682

[2/62] Aaruuu
    ✅ Active Days: 180 | Contests: 85 | Submissions: 450

...

======================================================================
📊 SCRAPING COMPLETE!
======================================================================
✅ Successfully updated: 55/62
❌ Failed: 7/62
💾 Results saved to: codolio_results.json

======================================================================
📈 STATISTICS
======================================================================
Average active days: 195.3
Average contests: 92.5

🔥 Top 5 Active Days:
  1. username1: 350 days
  2. username2: 320 days
  3. username3: 290 days
  4. username4: 275 days
  5. username5: 260 days

🏆 Top 5 Contests:
  1. username1: 150 contests
  2. username2: 140 contests
  3. username3: 130 contests
  4. username4: 125 contests
  5. username5: 120 contests
```

## 🎨 UI Display

After scraping, the Codolio section in the student dashboard will show:

```
┌─────────────────────────────────────────────────────────┐
│ Codolio Performance                                     │
├─────────────────────────────────────────────────────────┤
│ ┌──────────┬──────────┬──────────┬──────────┐          │
│ │ Total    │ Total    │ Total    │ Badges   │          │
│ │ Submiss. │ Active   │ Contests │          │          │
│ │          │ Days     │          │          │          │
│ │ 682      │ 221      │ 110      │ 5        │          │
│ └──────────┴──────────┴──────────┴──────────┘          │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Troubleshooting

### Error: Chrome driver not found
```bash
pip install webdriver-manager
```

Then update the script to use:
```python
from webdriver_manager.chrome import ChromeDriverManager
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
```

### Error: Element not found
- Codolio's HTML structure may have changed
- Check the actual HTML structure on Codolio profiles
- Update XPath selectors in the script

### Error: Timeout
- Increase `time.sleep(3)` to `time.sleep(5)`
- Check internet connection
- Verify Codolio website is accessible

### Error: MongoDB connection failed
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in `.env` file
- Verify database name is correct

## 📝 MongoDB Structure

Data is stored in MongoDB as:
```javascript
{
  platforms: {
    codolio: {
      username: "student_username",
      totalSubmissions: 682,
      totalActiveDays: 221,      // ← NEW
      totalContests: 110,         // ← NEW
      currentStreak: 0,
      maxStreak: 0,
      dailySubmissions: [],
      badges: [],
      lastUpdated: "2026-01-04T..."
    }
  }
}
```

## ⚙️ Configuration

### Usernames
All 62 Codolio usernames are hardcoded in the script:
```python
CODOLIO_USERNAMES = [
    "Aadhamsharief_@05", "Aaruuu", "abinaya rajkumar", ...
]
```

### Scraping Settings
```python
BATCH_SIZE = 62  # All at once
DELAY = 2        # Seconds between requests
TIMEOUT = 3      # Page load timeout
```

## 🎯 Next Steps

1. ✅ Install prerequisites (Chrome, ChromeDriver, Selenium)
2. ✅ Run the scraper: `python scrape_codolio.py`
3. ✅ Wait for completion (~5-10 minutes)
4. ✅ Check MongoDB for updated data
5. ✅ Verify in student dashboard UI

## 📊 Success Metrics

- **Target**: 62 students
- **Expected Success Rate**: 80-90%
- **Time**: ~5-10 minutes
- **Data Points**: 3 per student (Active Days, Contests, Submissions)

## 🔒 Notes

- Scraper runs in headless mode (no browser window)
- Uses polite delays between requests
- Handles errors gracefully
- Saves progress to JSON file
- Updates MongoDB in real-time

---

**Ready to scrape Codolio data for all 63 students!** 🚀
