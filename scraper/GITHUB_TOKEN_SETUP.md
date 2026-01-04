# GitHub Token Setup Guide

## Why You Need a GitHub Token

GitHub's contribution calendar data is not available through basic web scraping because it's JavaScript-rendered. To get accurate contribution counts, you need to use GitHub's GraphQL API, which requires authentication.

## How to Get Your GitHub Token

### Step 1: Go to GitHub Settings
Visit: https://github.com/settings/tokens

### Step 2: Generate New Token
1. Click "Generate new token" → "Generate new token (classic)"
2. Give it a name like "Go Tracker Scraper"
3. Set expiration (recommend: 90 days or No expiration)
4. Select scopes:
   - ✅ `read:user` (Read user profile data)
   - ✅ `public_repo` (Access public repositories)
   
   **Note**: You only need READ permissions, no write access needed!

### Step 3: Copy Your Token
- GitHub will show your token ONCE
- Copy it immediately (looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
- Store it safely

### Step 4: Add to .env File
Open `go-tracker/scraper/.env` and add:

```env
GITHUB_TOKEN=ghp_your_token_here
```

Replace `ghp_your_token_here` with your actual token.

## Verify It Works

Run the scraper again:
```bash
cd go-tracker/scraper
python scrape_all_students.py
```

You should now see real contribution counts like:
```
✅ GitHub: 14 repos, 312 contributions, 25 followers
```

## Security Notes

- ✅ Token is stored in `.env` (already in `.gitignore`)
- ✅ Token has READ-ONLY access
- ✅ Token only accesses PUBLIC data
- ⚠️ Never commit `.env` to git
- ⚠️ Regenerate token if accidentally exposed

## What Data Gets Scraped

With the token, the scraper fetches:
- Public repositories count
- Total contributions (current year)
- Followers/following count
- All from PUBLIC profiles only

## Troubleshooting

**"Bad credentials" error**: Token is invalid or expired
- Regenerate token on GitHub
- Make sure you copied the entire token
- Check for extra spaces in `.env`

**Still showing 0 contributions**: 
- Verify token is in `.env` file
- Restart the scraper
- Check if GitHub username is correct
