# 🔄 GitHub Scraping Flow

## Current Flow (Without Token)

```
┌─────────────────────────────────────────────────────────────┐
│ scrape_all_students.py                                      │
│ ↓                                                           │
│ platform_scrapers.py → scrape_github(username)              │
│ ↓                                                           │
│ Check: GITHUB_TOKEN exists?                                 │
│ ↓                                                           │
│ ❌ NO TOKEN FOUND                                           │
│ ↓                                                           │
│ Try web scraping (HTML parsing)                             │
│ ↓                                                           │
│ ❌ Contribution calendar is JavaScript-rendered             │
│ ↓                                                           │
│ Return: contributions = 0                                   │
│ ↓                                                           │
│ Save to MongoDB: {repos: 14, contributions: 0}              │
└─────────────────────────────────────────────────────────────┘
```

## New Flow (With Token) ✅

```
┌─────────────────────────────────────────────────────────────┐
│ scrape_all_students.py                                      │
│ ↓                                                           │
│ platform_scrapers.py → scrape_github(username)              │
│ ↓                                                           │
│ Check: GITHUB_TOKEN exists?                                 │
│ ↓                                                           │
│ ✅ TOKEN FOUND: ghp_xxx...                                  │
│ ↓                                                           │
│ Call GitHub GraphQL API                                     │
│ ↓                                                           │
│ Query: contributionsCollection.contributionCalendar         │
│ ↓                                                           │
│ ✅ Response: totalContributions = 312                       │
│ ↓                                                           │
│ Save to MongoDB: {repos: 14, contributions: 312}            │
│ ↓                                                           │
│ Display in Dashboard: "312 contributions this year"         │
└─────────────────────────────────────────────────────────────┘
```

## Setup Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User visits GitHub Settings                              │
│    https://github.com/settings/tokens                       │
│    ↓                                                        │
│ 2. Generate new token (classic)                             │
│    - Name: Go Tracker Scraper                               │
│    - Scopes: read:user + public_repo                        │
│    ↓                                                        │
│ 3. Copy token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx     │
│    ↓                                                        │
│ 4. Open: go-tracker/scraper/.env                            │
│    Add: GITHUB_TOKEN=ghp_xxx...                             │
│    ↓                                                        │
│ 5. Test: python test_github_token.py                        │
│    ↓                                                        │
│ 6. ✅ Token verified!                                       │
│    ↓                                                        │
│ 7. Run: python scrape_all_students.py                       │
│    ↓                                                        │
│ 8. ✅ All 63 students scraped with real contributions!      │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
GitHub Profile (Public)
    ↓
GitHub GraphQL API (with token)
    ↓
platform_scrapers.py
    ↓
MongoDB (go-tracker database)
    ↓
Backend API (Express.js)
    ↓
Frontend Dashboard (React)
    ↓
User sees: "312 contributions this year"
```

## Token Permissions

```
GITHUB_TOKEN (read-only)
    ├── read:user
    │   └── Read public profile data
    │       ├── Username
    │       ├── Followers/Following
    │       └── Contribution calendar
    │
    └── public_repo
        └── Read public repository data
            ├── Repository count
            ├── Repository names
            └── Public commits
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Token Generation                                            │
│ ↓                                                           │
│ Stored in: go-tracker/scraper/.env                          │
│ ↓                                                           │
│ .gitignore prevents commit                                  │
│ ↓                                                           │
│ Only used locally                                           │
│ ↓                                                           │
│ READ-ONLY access to PUBLIC data                             │
│ ↓                                                           │
│ Can be revoked anytime                                      │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Try: GitHub GraphQL API (with token)                        │
│ ↓                                                           │
│ Success? → Return contributions                             │
│ ↓                                                           │
│ Fail? → Try web scraping (fallback)                         │
│ ↓                                                           │
│ Success? → Return contributions                             │
│ ↓                                                           │
│ Fail? → Return 0 (default)                                  │
└─────────────────────────────────────────────────────────────┘
```

## Alternative: HTML Parsing (Not Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│ Scrape: github.com/username                                 │
│ ↓                                                           │
│ Find: <td data-level="3">                                   │
│ ↓                                                           │
│ Count all data-level attributes                             │
│ ↓                                                           │
│ Estimate: level 0 = 0, level 1 = ~3, level 2 = ~7,         │
│           level 3 = ~12, level 4 = ~20                      │
│ ↓                                                           │
│ ❌ PROBLEMS:                                                │
│    - Only estimates, not exact counts                       │
│    - Breaks if GitHub changes HTML                          │
│    - Less accurate than API                                 │
│    - More code to maintain                                  │
└─────────────────────────────────────────────────────────────┘
```

## Comparison

| Aspect | Token (GraphQL) | HTML Parsing |
|--------|----------------|--------------|
| Accuracy | ✅ Exact counts | ❌ Estimates only |
| Reliability | ✅ Official API | ❌ Breaks with HTML changes |
| Setup Time | ⚡ 5 minutes | ⚡ 5 minutes |
| Maintenance | ✅ None | ❌ High |
| Data Quality | ✅ 100% | ❌ ~70% |
| Implementation | ✅ Already done | ❌ Need to code |

**Winner**: Token approach (GraphQL API) 🏆

---

**Recommendation**: Use the token approach - it's already implemented and just needs a 5-minute setup!
