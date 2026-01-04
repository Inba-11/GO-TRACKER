# 🚀 Quick Commands Reference

## Start Servers

### Backend
```bash
cd go-tracker/backend
npm run dev
```
**URL**: http://localhost:5000

### Frontend
```bash
cd go-tracker
npm run dev
```
**URL**: http://localhost:8080

---

## Scraping Commands

### Update All Students (Full Scrape)
```bash
cd go-tracker/scraper
python scrape_all_students.py
```
⏱️ Takes ~15-20 minutes

### Test Scraping (5 Students)
```bash
cd go-tracker/scraper
python scrape_sample.py
```
⏱️ Takes ~2-3 minutes

### Check Status
```bash
cd go-tracker/scraper
python check_status.py
```

### Verify Data
```bash
cd go-tracker/scraper
python verify_data.py
```

---

## MongoDB Commands

### Check Connection
```bash
python -c "from pymongo import MongoClient; print(MongoClient('mongodb://localhost:27017/go-tracker').server_info())"
```

### Count Students
```bash
python -c "from pymongo import MongoClient; db = MongoClient('mongodb://localhost:27017/go-tracker')['go-tracker']; print(f'Students: {db.students.count_documents({})}')"
```

---

## Login Credentials

**Format**:
- Username: Full name (e.g., "AADHAM SHARIEF A")
- Password: Roll number (e.g., "711523BCB001")

**Test Account**:
- Username: `AADHAM SHARIEF A`
- Password: `711523BCB001`

---

## Troubleshooting

### Backend Not Starting
```bash
cd go-tracker/backend
npm install
npm run dev
```

### Frontend Not Starting
```bash
cd go-tracker
npm install
npm run dev
```

### Scraping Errors
```bash
cd go-tracker/scraper
pip install -r requirements.txt
python scrape_all_students.py
```

### Clear Browser Cache
- Press `Ctrl + Shift + Delete`
- Clear cache and cookies
- Refresh page

---

## File Locations

- **Backend**: `go-tracker/backend/`
- **Frontend**: `go-tracker/src/`
- **Scraper**: `go-tracker/scraper/`
- **MongoDB**: `mongodb://localhost:27017/go-tracker`

---

## Important URLs

- Frontend: http://localhost:8080
- Backend API: http://localhost:5000/api
- MongoDB: mongodb://localhost:27017/go-tracker

---

**Quick Start**: Run backend → Run frontend → Login → View real data! ✅
