# ⚡ Quick GitHub Fix (5 Minutes)

## The Problem
GitHub contributions showing **0** for all students.

## The Solution
Add a GitHub token to enable GraphQL API access.

## Quick Steps

### 1️⃣ Get Token (2 min)
```
https://github.com/settings/tokens
→ Generate new token (classic)
→ Check: read:user + public_repo
→ Copy token (ghp_xxx...)
```

### 2️⃣ Add to .env (1 min)
Open: `go-tracker/scraper/.env`
```env
GITHUB_TOKEN=ghp_your_token_here
```

### 3️⃣ Test (1 min)
```bash
cd go-tracker/scraper
python test_github_token.py
```

### 4️⃣ Scrape All (10-15 min)
```bash
python scrape_all_students.py
```

## Done! ✅

GitHub contributions will now show real data like:
```
✅ GitHub: 14 repos, 312 contributions, 25 followers
```

---

**Detailed guide**: See `NEXT_STEPS_GITHUB.md`
