# CodeChef Scraper - Quick Start Guide 🚀

## Installation Complete ✅

All dependencies are installed and the scraper is ready to use!

---

## 🎯 Quick Test

Test the scraper with a single username:

```bash
cd tracker/scraper
python codechef_scraper.py tourist
```

**Expected Output:**
```
Testing: tourist
SUCCESS - Data scraped using: codechef_bs4
Rating: 3355
Problems Solved: 0
Contests: 2011
```

---

## 🧪 Integration Test

Run the full integration test:

```bash
python test_codechef_integration.py tourist
```

**This tests:**
- Scraper functionality
- MongoDB connectivity
- Data format validation

---

## 🏭 Production Use

### Start the Automatic Scheduler:

```bash
python production_scheduler.py
```

**This will:**
- Scrape all 63 students automatically
- Run CodeChef updates every 90 minutes
- Log all activity to `scraper.log`
- Store data in MongoDB

---

## 📊 Check Scraped Data

### In MongoDB:

```javascript
// Connect to MongoDB
mongosh

// Use the database
use go-tracker

// Find a student's CodeChef data
db.students.findOne(
  { "platformUsernames.codechef": "tourist" },
  { "platforms.codechef": 1, name: 1 }
)
```

### On the Frontend:

1. Start the frontend: `npm run dev` (in tracker/)
2. Login as a student
3. View CodeChef stats in the "Platform Performance" section

---

## 🔧 Customize Scraping

### Change Update Interval:

Edit `production_scheduler.py`:

```python
# Change from 90 minutes to 2 hours
schedule.every(2).hours.do(self.scrape_codechef)
```

### Scrape Specific Students:

```python
from codechef_scraper import scrape_codechef_user

usernames = ['tourist', 'gennady.korotkevich', 'your_username']

for username in usernames:
    data = scrape_codechef_user(username)
    if data:
        print(f"{username}: Rating {data['rating']}, Contests {data['contestsAttended']}")
```

---

## 📝 Verify Installation

Run this command to verify everything is installed:

```bash
python -c "from codechef_scraper import scrape_codechef_user; from pymongo import MongoClient; import selenium; print('✓ All dependencies installed!')"
```

---

## 🐛 Troubleshooting

### Scraper Returns None:

1. Check internet connection
2. Verify CodeChef website is accessible: https://www.codechef.com
3. Try a different username
4. Check logs: `tail -f scraper.log`

### MongoDB Connection Error:

```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
mongod
```

### Selenium Errors:

```bash
# Install Chrome (if not installed)
choco install googlechrome

# ChromeDriver is auto-managed, no manual installation needed!
```

---

## 📊 Data Fields Available

After scraping, each student's CodeChef data includes:

```javascript
{
  username: "tourist",
  rating: 3355,
  maxRating: 3355,
  problemsSolved: 0,
  contestsAttended: 2011,
  globalRank: 0,
  countryRank: 0,
  stars: 7,
  division: "Division 1",
  league: "7★",
  institution: "",
  country: "",
  lastUpdated: "2026-01-07T02:46:21.977Z",
  dataSource: "codechef_bs4"
}
```

---

## 🎯 Next Steps

1. **Test with Your Students:**
   ```bash
   python codechef_scraper.py your_codechef_username
   ```

2. **Run Integration Test:**
   ```bash
   python test_codechef_integration.py your_codechef_username
   ```

3. **Start Production Scheduler:**
   ```bash
   python production_scheduler.py
   ```

4. **Monitor Logs:**
   ```bash
   tail -f scraper.log
   ```

---

## 📚 Additional Resources

- **Full Documentation**: `CODECHEF_IMPLEMENTATION_COMPLETE.md`
- **Main Scraper**: `codechef_scraper.py`
- **Integration Test**: `test_codechef_integration.py`
- **Scheduler**: `production_scheduler.py`

---

## ✅ Checklist

- [x] Dependencies installed
- [x] Scraper tested with real users
- [x] MongoDB integration verified
- [x] Frontend display ready
- [x] Production scheduler configured
- [ ] Test with your student usernames
- [ ] Run production scheduler
- [ ] Monitor scraping logs

---

**Ready to use! Happy scraping! 🎉**

For questions or issues, check the logs or refer to the full documentation.

