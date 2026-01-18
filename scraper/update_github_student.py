#!/usr/bin/env python3
"""
Update GitHub data for a specific student in MongoDB
Usage: python update_github_student.py <roll_number> <github_username_or_url>
"""

import sys
import os
import io
import re
import time
from datetime import datetime, timedelta
from collections import defaultdict

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    # Note: Unbuffered output is handled via Python -u flag in Node.js commands

# Add the scraper directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# GitHub API configuration
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN', '')
GITHUB_API_BASE = 'https://api.github.com'
GITHUB_GRAPHQL = 'https://api.github.com/graphql'

def get_github_headers():
    """Get headers for GitHub API requests"""
    headers = {
        'User-Agent': 'GO-Tracker-Student-Dashboard/1.0',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    if GITHUB_TOKEN:
        headers['Authorization'] = f'token {GITHUB_TOKEN}'
    
    return headers

def safe_github_request(url, headers=None, timeout=30, retries=3):
    """Make a safe GitHub API request with rate limit handling"""
    if headers is None:
        headers = get_github_headers()
    
    for attempt in range(retries):
        try:
            if attempt > 0:
                wait_time = 2 ** attempt
                logger.info(f"Retrying GitHub API request (attempt {attempt + 1}/{retries}) after {wait_time}s...")
                time.sleep(wait_time)
            else:
                time.sleep(0.5)  # Small delay even on first attempt
            
            response = requests.get(url, headers=headers, timeout=timeout)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 403:  # Rate limited
                reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
                current_time = int(time.time())
                wait_time = max(reset_time - current_time, 60)
                
                logger.warning(f"GitHub rate limited, waiting {wait_time}s")
                if attempt < retries - 1:
                    time.sleep(min(wait_time, 300))
                continue
            elif response.status_code == 404:
                logger.warning(f"GitHub user not found: {url}")
                return None
            else:
                logger.warning(f"GitHub API HTTP {response.status_code}")
                return None
                
        except requests.exceptions.Timeout:
            logger.warning(f"GitHub API timeout on attempt {attempt + 1}")
        except requests.exceptions.RequestException as e:
            logger.warning(f"GitHub API error: {e}")
        
        if attempt < retries - 1:
            time.sleep(2 ** attempt)
    
    return None

def get_github_contributions_graphql(username):
    """Get GitHub contributions using GraphQL API"""
    if not GITHUB_TOKEN:
        logger.warning("No GitHub token provided, skipping GraphQL contributions")
        return None
    
    try:
        query = """
        query($username: String!) {
            user(login: $username) {
                contributionsCollection {
                    totalCommitContributions
                    totalIssueContributions
                    totalPullRequestContributions
                    totalPullRequestReviewContributions
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                            }
                        }
                    }
                }
            }
        }
        """
        
        headers = get_github_headers()
        headers['Content-Type'] = 'application/json'
        
        response = requests.post(
            GITHUB_GRAPHQL,
            json={'query': query, 'variables': {'username': username}},
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and data['data'] and data['data'].get('user'):
                return data['data']['user']['contributionsCollection']
        return None
    except Exception as e:
        logger.error(f"GraphQL error: {e}")
        return None

def get_github_pinned_repositories_graphql(username):
    """Get GitHub pinned repositories using GraphQL API"""
    if not GITHUB_TOKEN:
        logger.warning("No GitHub token provided, skipping pinned repositories")
        return []
    
    try:
        query = """
        query($username: String!) {
            user(login: $username) {
                pinnedItems(first: 6, types: REPOSITORY) {
                    nodes {
                        ... on Repository {
                            name
                            description
                            url
                            stargazerCount
                            forkCount
                            primaryLanguage {
                                name
                                color
                            }
                            updatedAt
                            isPrivate
                        }
                    }
                }
            }
        }
        """
        
        headers = get_github_headers()
        headers['Content-Type'] = 'application/json'
        
        response = requests.post(
            GITHUB_GRAPHQL,
            json={'query': query, 'variables': {'username': username}},
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and data['data'] and data['data'].get('user'):
                pinned_items = data['data']['user'].get('pinnedItems', {}).get('nodes', [])
                pinned_repos = []
                for repo in pinned_items:
                    pinned_repos.append({
                        'name': repo.get('name', ''),
                        'description': repo.get('description', ''),
                        'url': repo.get('url', ''),
                        'stars': repo.get('stargazerCount', 0),
                        'forks': repo.get('forkCount', 0),
                        'language': repo.get('primaryLanguage', {}).get('name', ''),
                        'languageColor': repo.get('primaryLanguage', {}).get('color', ''),
                        'updatedAt': repo.get('updatedAt', ''),
                        'isPrivate': repo.get('isPrivate', False)
                    })
                return pinned_repos
        return []
    except Exception as e:
        logger.error(f"GraphQL error fetching pinned repos: {e}")
        return []

def calculate_streaks_from_calendar(contribution_calendar):
    """Calculate current streak and max streak from contribution calendar"""
    if not contribution_calendar:
        return {'current_streak': 0, 'max_streak': 0}
    
    # Extract all contribution days
    contribution_days = set()
    for week in contribution_calendar.get('weeks', []):
        for day in week.get('contributionDays', []):
            if day.get('contributionCount', 0) > 0:
                contribution_days.add(day.get('date'))
    
    if not contribution_days:
        return {'current_streak': 0, 'max_streak': 0}
    
    # Sort dates
    dates = sorted([datetime.fromisoformat(d).date() for d in contribution_days])
    
    # Calculate current streak (from today backwards)
    current_streak = 0
    today = datetime.now().date()
    check_date = today
    
    while check_date >= dates[0]:
        if check_date.isoformat() in contribution_days:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    
    # Calculate max streak
    max_streak = 0
    temp_streak = 0
    
    start_date = dates[0]
    end_date = dates[-1]
    current_date = start_date
    
    while current_date <= end_date:
        if current_date.isoformat() in contribution_days:
            temp_streak += 1
            max_streak = max(max_streak, temp_streak)
        else:
            temp_streak = 0
        current_date += timedelta(days=1)
    
    return {
        'current_streak': current_streak,
        'max_streak': max_streak
    }

def scrape_github_user(username):
    """Scrape GitHub user data using API"""
    try:
        logger.info(f"Scraping GitHub for {username}")
        print(f"📊 Scraping GitHub for username: {username}")
        sys.stdout.flush()
        
        # Get user info
        user_url = f"{GITHUB_API_BASE}/users/{username}"
        user_data = safe_github_request(user_url)
        
        if not user_data:
            logger.error(f"Failed to get GitHub user data for {username}")
            print(f"❌ ERROR: Failed to get GitHub user data for {username}")
            sys.stdout.flush()
            return None
        
        # Get repositories (limit to first page for speed)
        repos_url = f"{GITHUB_API_BASE}/users/{username}/repos?per_page=100&sort=updated"
        repos_data = safe_github_request(repos_url)
        repos = repos_data if repos_data else []
        
        # Get contributions via GraphQL (requires token)
        contributions_data = get_github_contributions_graphql(username)
        
        # Get pinned repositories via GraphQL (requires token)
        pinned_repos = get_github_pinned_repositories_graphql(username)
        
        # Calculate streaks and contributions
        total_contributions = 0
        streaks = {'current_streak': 0, 'max_streak': 0}
        contribution_calendar_array = []
        
        if contributions_data:
            contribution_calendar = contributions_data.get('contributionCalendar', {})
            total_contributions = contribution_calendar.get('totalContributions', 0)
            streaks = calculate_streaks_from_calendar(contribution_calendar)
            
            # Convert contribution calendar to array format for heatmap
            # Format: [{ date: "YYYY-MM-DD", count: number }, ...]
            for week in contribution_calendar.get('weeks', []):
                for day in week.get('contributionDays', []):
                    contribution_calendar_array.append({
                        'date': day.get('date', ''),
                        'count': day.get('contributionCount', 0)
                    })
            
            # Sort by date to ensure chronological order
            contribution_calendar_array.sort(key=lambda x: x['date'])
        else:
            # Fallback: estimate from user data (less accurate)
            total_contributions = user_data.get('public_repos', 0) * 10  # Rough estimate
            logger.warning("No GraphQL data available, using estimates. Add GITHUB_TOKEN for accurate data.")
            print("⚠️  No GitHub token found - using estimates. Add GITHUB_TOKEN to .env for accurate data.")
            sys.stdout.flush()
        
        # Calculate repository stats
        total_repos = len(repos)
        public_repos = user_data.get('public_repos', 0)
        total_stars = sum(r.get('stargazers_count', 0) for r in repos)
        total_forks = sum(r.get('forks_count', 0) for r in repos)
        
        # Build result matching our MongoDB schema
        result = {
            'username': username,
            'repositories': public_repos,  # Use public_repos from API (more accurate)
            'contributions': total_contributions,
            'commits': total_contributions,  # Use contributions as commits estimate
            'followers': user_data.get('followers', 0),
            'following': user_data.get('following', 0),
            'streak': streaks['current_streak'],
            'longestStreak': streaks['max_streak'],
            'avatar': user_data.get('avatar_url', ''),
            'bio': user_data.get('bio', ''),
            'location': user_data.get('location', ''),
            'company': user_data.get('company', ''),
            'created_at': user_data.get('created_at', ''),
            'totalStars': total_stars,
            'totalForks': total_forks,
            'contributionCalendar': contribution_calendar_array,  # Array format for heatmap
            'pinnedRepositories': pinned_repos,  # Pinned repositories
            'lastUpdated': datetime.utcnow(),
            'dataSource': 'github_api_scraper'
        }
        
        logger.info(f"✅ GitHub data scraped: {total_contributions} contributions, {streaks['current_streak']} day streak")
        print(f"✅ Successfully scraped GitHub data for {username}")
        sys.stdout.flush()
        print(f"   📦 Repositories: {public_repos}")
        sys.stdout.flush()
        print(f"   📊 Contributions: {total_contributions}")
        sys.stdout.flush()
        print(f"   👥 Followers: {user_data.get('followers', 0)}")
        sys.stdout.flush()
        print(f"   🔥 Current Streak: {streaks['current_streak']} days")
        sys.stdout.flush()
        
        return result
        
    except Exception as e:
        logger.error(f"Error scraping GitHub for {username}: {e}")
        print(f"❌ ERROR: Failed to scrape GitHub data for {username}")
        print(f"   Error: {str(e)}")
        sys.stdout.flush()
        import traceback
        traceback.print_exc()
        return None

def extract_username_from_url(url_or_username):
    """Extract username from GitHub URL or return as-is if already username"""
    if not url_or_username:
        return None
    
    # If it's already a username (no http/https)
    if not url_or_username.startswith('http'):
        return url_or_username.strip()
    
    # Extract from URL patterns:
    # https://github.com/username
    # https://github.com/username/
    match = re.search(r'github\.com/([^/?]+)', url_or_username)
    if match:
        return match.group(1).strip()
    
    return None

def update_student_github(roll_number, github_username_or_url):
    """Update student's GitHub data in MongoDB"""
    try:
        # Extract username from URL if needed
        github_username = extract_username_from_url(github_username_or_url)
        
        if not github_username:
            print(f"❌ ERROR: Could not extract GitHub username from: {github_username_or_url}")
            sys.stdout.flush()
            return False
        
        print(f"📊 Scraping GitHub for username: {github_username}")
        sys.stdout.flush()
        print(f"📝 Roll Number: {roll_number}")
        sys.stdout.flush()
        
        # Scrape GitHub data
        github_data = scrape_github_user(github_username)
        
        if not github_data:
            print(f"❌ ERROR: Failed to scrape GitHub data for {github_username}")
            sys.stdout.flush()
            return False
        
        # Connect to MongoDB
        MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db['students']
        
        # Find student by roll number
        student = students_collection.find_one({'rollNumber': roll_number})
        
        if not student:
            print(f"❌ ERROR: Student with roll number {roll_number} not found")
            sys.stdout.flush()
            client.close()
            return False
        
        print(f"✅ Found student: {student.get('name', 'Unknown')}")
        sys.stdout.flush()
        
        # Prepare update data matching the MongoDB schema
        update_data = {
            'platforms.github': {
                'username': github_data.get('username', github_username),
                'repositories': github_data.get('repositories', 0),
                'contributions': github_data.get('contributions', 0),
                'commits': github_data.get('commits', 0),
                'followers': github_data.get('followers', 0),
                'following': github_data.get('following', 0),
                'streak': github_data.get('streak', 0),
                'longestStreak': github_data.get('longestStreak', 0),
                'avatar': github_data.get('avatar', ''),
                'bio': github_data.get('bio', ''),
                'location': github_data.get('location', ''),
                'company': github_data.get('company', ''),
                'created_at': github_data.get('created_at', ''),
                'totalStars': github_data.get('totalStars', 0),
                'totalForks': github_data.get('totalForks', 0),
                'contributionCalendar': github_data.get('contributionCalendar', []),  # Heatmap data
                'pinnedRepositories': github_data.get('pinnedRepositories', []),  # Pinned repos
                'lastUpdated': datetime.utcnow(),
                'dataSource': 'github_api_scraper'
            },
            'lastScrapedAt': datetime.utcnow()
        }
        
        # Update platform username and link if provided
        if github_username_or_url.startswith('http'):
            update_data['platformLinks.github'] = github_username_or_url
        update_data['platformUsernames.github'] = github_username
        
        # Update student in MongoDB
        result = students_collection.update_one(
            {'rollNumber': roll_number},
            {'$set': update_data}
        )
        
        if result.modified_count > 0:
            print(f"✅ Successfully updated GitHub data for {roll_number}")
            sys.stdout.flush()
            print(f"   📦 Repositories: {github_data.get('repositories', 0)}")
            sys.stdout.flush()
            print(f"   📊 Contributions: {github_data.get('contributions', 0)}")
            sys.stdout.flush()
            print(f"   👥 Followers: {github_data.get('followers', 0)}")
            sys.stdout.flush()
            print(f"   🔥 Current Streak: {github_data.get('streak', 0)} days")
            sys.stdout.flush()
            print(f"   🏆 Longest Streak: {github_data.get('longestStreak', 0)} days")
            sys.stdout.flush()
            client.close()
            return True
        else:
            print(f"⚠️  No changes made (data might be the same)")
            sys.stdout.flush()
            client.close()
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        sys.stdout.flush()
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python update_github_student.py <roll_number> <github_username_or_url>")
        sys.exit(1)
    
    roll_number = sys.argv[1]
    github_input = sys.argv[2]
    
    success = update_student_github(roll_number, github_input)
    sys.exit(0 if success else 1)
