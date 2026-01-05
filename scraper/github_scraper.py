#!/usr/bin/env python3
"""
GitHub Scraper - Production Ready
Uses GitHub API + GraphQL for comprehensive data
Safe + Rate Limited + Real-time commits/contributions
"""

import requests
import time
import random
import logging
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
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

def safe_github_request(url, headers=None, timeout=10, retries=3):
    """Make a safe GitHub API request with rate limit handling"""
    if headers is None:
        headers = get_github_headers()
    
    for attempt in range(retries):
        try:
            # Random delay to avoid rate limiting
            time.sleep(random.uniform(1, 2))
            
            response = requests.get(url, headers=headers, timeout=timeout)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 403:  # Rate limited
                reset_time = int(response.headers.get('X-RateLimit-Reset', 0))
                current_time = int(time.time())
                wait_time = max(reset_time - current_time, 60)  # Wait at least 1 minute
                
                logger.warning(f"GitHub rate limited, waiting {wait_time}s")
                time.sleep(min(wait_time, 300))  # Max 5 minutes wait
                continue
            elif response.status_code == 404:
                logger.warning(f"GitHub user not found: {url}")
                return None
            else:
                logger.warning(f"GitHub API HTTP {response.status_code} for {url}")
                return None
                
        except requests.exceptions.Timeout:
            logger.warning(f"GitHub API timeout on attempt {attempt + 1}")
        except requests.exceptions.RequestException as e:
            logger.warning(f"GitHub API error on attempt {attempt + 1}: {e}")
        
        if attempt < retries - 1:
            time.sleep(2 ** attempt)  # Exponential backoff
    
    return None

def get_github_contributions_graphql(username):
    """Get GitHub contributions using GraphQL API"""
    if not GITHUB_TOKEN:
        logger.warning("No GitHub token provided, skipping GraphQL contributions")
        return 0, 0
    
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
        
        payload = {
            'query': query,
            'variables': {'username': username}
        }
        
        headers = get_github_headers()
        headers['Content-Type'] = 'application/json'
        
        response = requests.post(GITHUB_GRAPHQL, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            user_data = data.get('data', {}).get('user', {})
            
            if user_data:
                contributions = user_data.get('contributionsCollection', {})
                calendar = contributions.get('contributionCalendar', {})
                
                total_contributions = calendar.get('totalContributions', 0)
                total_commits = contributions.get('totalCommitContributions', 0)
                
                # Calculate recent contributions (last 7 days)
                recent_contributions = 0
                weeks = calendar.get('weeks', [])
                
                if weeks:
                    # Get last week's data
                    last_week = weeks[-1] if weeks else {}
                    recent_days = last_week.get('contributionDays', [])
                    
                    cutoff_date = datetime.now() - timedelta(days=7)
                    
                    for day in recent_days:
                        day_date = datetime.fromisoformat(day.get('date', ''))
                        if day_date >= cutoff_date:
                            recent_contributions += day.get('contributionCount', 0)
                
                return total_contributions, recent_contributions
        
        logger.warning(f"GraphQL query failed for {username}")
        return 0, 0
        
    except Exception as e:
        logger.error(f"Error getting GitHub contributions for {username}: {e}")
        return 0, 0

def scrape_github_user(username):
    """
    Scrape GitHub user data
    Returns: dict with repos, contributions, followers, etc.
    """
    try:
        logger.info(f"Scraping GitHub for {username}")
        
        # Get user profile
        user_url = f"{GITHUB_API_BASE}/users/{username}"
        user_data = safe_github_request(user_url)
        
        if not user_data:
            logger.warning(f"No GitHub user data found for {username}")
            return None
        
        # Get repositories
        repos_url = f"{GITHUB_API_BASE}/users/{username}/repos?per_page=100&sort=updated"
        repos_data = safe_github_request(repos_url)
        
        if repos_data is None:
            repos_data = []
        
        # Calculate repository stats
        total_repos = len(repos_data)
        public_repos = user_data.get('public_repos', 0)
        total_stars = sum(repo.get('stargazers_count', 0) for repo in repos_data)
        total_forks = sum(repo.get('forks_count', 0) for repo in repos_data)
        
        # Get languages used
        languages = {}
        for repo in repos_data[:20]:  # Limit to first 20 repos to avoid rate limits
            if repo.get('language'):
                lang = repo['language']
                languages[lang] = languages.get(lang, 0) + 1
            time.sleep(0.1)  # Small delay
        
        # Get contributions data
        total_contributions, recent_contributions = get_github_contributions_graphql(username)
        
        # Calculate streak (simplified - would need more complex logic for accurate streak)
        current_streak = 0
        longest_streak = 0
        
        # Get recent activity
        events_url = f"{GITHUB_API_BASE}/users/{username}/events/public?per_page=30"
        events_data = safe_github_request(events_url)
        
        recent_commits = 0
        recent_prs = 0
        
        if events_data:
            cutoff_date = datetime.now() - timedelta(days=7)
            
            for event in events_data:
                event_date = datetime.fromisoformat(event.get('created_at', '').replace('Z', '+00:00'))
                
                if event_date >= cutoff_date:
                    event_type = event.get('type', '')
                    if event_type == 'PushEvent':
                        recent_commits += len(event.get('payload', {}).get('commits', []))
                    elif event_type == 'PullRequestEvent':
                        recent_prs += 1
        
        # Build result
        result = {
            'username': username,
            'name': user_data.get('name', ''),
            'bio': user_data.get('bio', ''),
            'location': user_data.get('location', ''),
            'company': user_data.get('company', ''),
            'blog': user_data.get('blog', ''),
            'publicRepos': public_repos,
            'totalRepos': total_repos,
            'followers': user_data.get('followers', 0),
            'following': user_data.get('following', 0),
            'totalContributions': total_contributions,
            'recentContributions': recent_contributions,
            'totalStars': total_stars,
            'totalForks': total_forks,
            'recentCommits': recent_commits,
            'recentPRs': recent_prs,
            'currentStreak': current_streak,
            'longestStreak': longest_streak,
            'topLanguages': dict(sorted(languages.items(), key=lambda x: x[1], reverse=True)[:5]),
            'profileCreated': user_data.get('created_at', ''),
            'lastUpdated': datetime.utcnow(),
            'dataSource': 'github_api_v3'
        }
        
        logger.info(f"✅ GitHub data for {username}: {public_repos} repos, {total_contributions} contributions")
        return result
        
    except Exception as e:
        logger.error(f"Error scraping GitHub for {username}: {e}")
        return None

def get_github_streak_data(username):
    """Get GitHub streak data from github-readme-streak-stats API"""
    try:
        streak_url = f"https://github-readme-streak-stats.herokuapp.com/?user={username}&format=json"
        
        headers = {
            'User-Agent': 'GO-Tracker-Student-Dashboard/1.0'
        }
        
        response = requests.get(streak_url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                'currentStreak': int(data.get('currentStreak', {}).get('length', 0)),
                'longestStreak': int(data.get('longestStreak', {}).get('length', 0)),
                'totalContributions': int(data.get('totalContributions', 0))
            }
    except Exception as e:
        logger.error(f"Error getting streak data for {username}: {e}")
    
    return {
        'currentStreak': 0,
        'longestStreak': 0,
        'totalContributions': 0
    }

if __name__ == "__main__":
    # Test the scraper
    test_username = "octocat"  # GitHub's mascot account
    result = scrape_github_user(test_username)
    if result:
        print(f"✅ Test successful: {result}")
    else:
        print("❌ Test failed")