#!/usr/bin/env python3
"""
Refresh GitHub Data for Single Student
Usage: python refresh_github.py <student_id> [username]
"""
import sys
import os
import io
import re
from datetime import datetime, timezone
from pymongo import MongoClient
from bson import ObjectId
import logging

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add the scraper directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from github_scraper import scrape_github_user

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

# Debug log path
DEBUG_LOG_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.cursor', 'debug.log')

def debug_log(location, message, data, hypothesis_id):
    """Write debug log entry"""
    import json
    try:
        log_dir = os.path.dirname(DEBUG_LOG_PATH)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
        with open(DEBUG_LOG_PATH, 'a', encoding='utf-8') as f:
            log_entry = {
                'location': location,
                'message': message,
                'data': data,
                'timestamp': int(datetime.now().timestamp() * 1000),
                'sessionId': 'debug-session',
                'runId': 'run1',
                'hypothesisId': hypothesis_id
            }
            f.write(json.dumps(log_entry) + '\n')
    except Exception:
        pass  # Silently fail if logging fails

def extract_username_from_url(url_or_username):
    """Extract username from GitHub URL or return as-is if already username"""
    if not url_or_username:
        return None
    
    # If it's already a username (no http/https)
    if not url_or_username.startswith('http'):
        return url_or_username.strip()
    
    # Extract from URL patterns: https://github.com/username
    pattern = r'github\.com/([^/?]+)'
    match = re.search(pattern, url_or_username)
    if match:
        return match.group(1).strip()
    
    return None

def refresh_student_platform(student_id, username=None):
    """Refresh GitHub data for a student by MongoDB _id"""
    # #region agent log
    debug_log('refresh_github.py:51', 'Function called', {'student_id': student_id, 'username': username}, 'A')
    # #endregion
    client = None
    try:
        # Connect to MongoDB
        # #region agent log
        debug_log('refresh_github.py:56', 'MongoDB connection attempt', {'mongo_uri': MONGO_URI[:50] + '...' if len(MONGO_URI) > 50 else MONGO_URI}, 'A')
        # #endregion
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db['students']
        
        # Find student by _id
        try:
            student = students_collection.find_one({'_id': ObjectId(student_id)})
            # #region agent log
            debug_log('refresh_github.py:62', 'Student lookup result', {'student_id': student_id, 'student_found': bool(student)}, 'B')
            # #endregion
        except Exception as e:
            # #region agent log
            debug_log('refresh_github.py:63', 'Invalid student ID format', {'student_id': student_id, 'error': str(e)}, 'B')
            # #endregion
            print(f"❌ ERROR: Invalid student ID format: {student_id}")
            sys.stdout.flush()
            return False
        
        if not student:
            # #region agent log
            debug_log('refresh_github.py:69', 'Student not found', {'student_id': student_id}, 'C')
            # #endregion
            print(f"❌ ERROR: Student with ID {student_id} not found")
            sys.stdout.flush()
            return False
        
        # Extract username if not provided
        if not username:
            # Try platformUsernames first
            username = student.get('platformUsernames', {}).get('github', '')
            
            # If not found, try extracting from platformLinks
            if not username:
                github_link = student.get('platformLinks', {}).get('github', '')
                if github_link:
                    username = extract_username_from_url(github_link)
        
        if not username:
            # #region agent log
            debug_log('refresh_github.py:85', 'GitHub username not found', {'student_id': student_id, 'student_name': student.get('name', 'Unknown')}, 'D')
            # #endregion
            print(f"❌ ERROR: GitHub username not found for student {student.get('name', 'Unknown')}")
            sys.stdout.flush()
            return False
        
        # #region agent log
        debug_log('refresh_github.py:91', 'Username extracted', {'username': username, 'student_id': student_id}, 'D')
        # #endregion
        print(f"📊 Scraping GitHub for username: {username}")
        sys.stdout.flush()
        print(f"📝 Student: {student.get('name', 'Unknown')} ({student.get('rollNumber', 'N/A')})")
        sys.stdout.flush()
        
        # Scrape GitHub data
        # #region agent log
        debug_log('refresh_github.py:97', 'GitHub scraping starting', {'username': username}, 'E')
        # #endregion
        github_data = scrape_github_user(username)
        # #region agent log
        debug_log('refresh_github.py:98', 'GitHub scraping result', {'username': username, 'data_received': bool(github_data)}, 'E')
        # #endregion
        
        if not github_data:
            print(f"❌ ERROR: Failed to scrape GitHub data for {username}")
            sys.stdout.flush()
            return False
        
        # Prepare update data matching the MongoDB schema
        # Use field-level updates to preserve existing detailed data (pinnedRepositories, contributionCalendar, etc.)
        # Map scraper output fields (scraper returns 'totalContributions', 'publicRepos', 'currentStreak', 'recentCommits')
        total_contributions = github_data.get('totalContributions', 0)
        public_repos = github_data.get('publicRepos', 0)
        total_repos = github_data.get('totalRepos', 0)
        current_streak = github_data.get('currentStreak', 0)
        longest_streak = github_data.get('longestStreak', 0)
        recent_commits = github_data.get('recentCommits', 0)
        total_stars = github_data.get('totalStars', 0)
        total_forks = github_data.get('totalForks', 0)
        recent_contributions = github_data.get('recentContributions', 0)
        
        # Use field-level updates to preserve existing detailed data
        # Update ALL fields that the scraper returns
        # Preserve pinnedRepositories, contributionCalendar if they exist
        update_data = {
            'platforms.github.username': username,
            'platforms.github.name': github_data.get('name', ''),
            'platforms.github.bio': github_data.get('bio', ''),
            'platforms.github.location': github_data.get('location', ''),
            'platforms.github.company': github_data.get('company', ''),
            'platforms.github.blog': github_data.get('blog', ''),
            'platforms.github.avatar': github_data.get('avatar', ''),
            'platforms.github.repositories': public_repos,
            'platforms.github.totalRepos': total_repos,
            'platforms.github.publicRepos': public_repos,
            'platforms.github.contributions': total_contributions,
            'platforms.github.totalContributions': total_contributions,
            'platforms.github.recentContributions': recent_contributions,
            'platforms.github.lastWeekContributions': recent_contributions,
            'platforms.github.commits': recent_commits,
            'platforms.github.recentCommits': recent_commits,
            'platforms.github.recentPRs': github_data.get('recentPRs', 0),
            'platforms.github.followers': github_data.get('followers', 0),
            'platforms.github.following': github_data.get('following', 0),
            'platforms.github.streak': current_streak,
            'platforms.github.currentStreak': current_streak,
            'platforms.github.longestStreak': longest_streak,
            'platforms.github.maxStreak': longest_streak,
            'platforms.github.totalStars': total_stars,
            'platforms.github.stars': total_stars,
            'platforms.github.totalForks': total_forks,
            'platforms.github.topLanguages': github_data.get('topLanguages', {}),
            'platforms.github.profileCreated': github_data.get('profileCreated', ''),
            'platforms.github.dataSource': github_data.get('dataSource', 'github_refresh_script'),
            'platforms.github.lastUpdated': datetime.now(timezone.utc),
            'platformUsernames.github': username,
            'lastScrapedAt': datetime.now(timezone.utc)
        }
        
        # Update student in MongoDB
        # #region agent log
        debug_log('refresh_github.py:145', 'Database update starting', {'student_id': student_id}, 'G')
        # #endregion
        result = students_collection.update_one(
            {'_id': ObjectId(student_id)},
            {'$set': update_data}
        )
        # #region agent log
        debug_log('refresh_github.py:149', 'Database update result', {'student_id': student_id, 'modified_count': result.modified_count, 'matched_count': result.matched_count}, 'G')
        # #endregion
        
        if result.modified_count > 0 or result.matched_count > 0:
            print(f"✅ Successfully updated GitHub data")
            sys.stdout.flush()
            print(f"   👤 Name: {github_data.get('name', 'N/A')}")
            sys.stdout.flush()
            print(f"   📊 Repositories: {public_repos}")
            sys.stdout.flush()
            print(f"   🎯 Contributions: {total_contributions}")
            sys.stdout.flush()
            print(f"   💻 Commits: {recent_commits}")
            sys.stdout.flush()
            print(f"   🔥 Streak: {current_streak} days")
            sys.stdout.flush()
            print(f"   ⭐ Stars: {total_stars}")
            sys.stdout.flush()
            print(f"   📍 Location: {github_data.get('location', 'N/A')}")
            sys.stdout.flush()
            print(f"   🏢 Company: {github_data.get('company', 'N/A')}")
            sys.stdout.flush()
            if github_data.get('topLanguages'):
                langs = ', '.join(list(github_data.get('topLanguages', {}).keys())[:3])
                print(f"   💻 Top Languages: {langs}")
                sys.stdout.flush()
            return True
        else:
            print(f"⚠️  No changes made (data might be the same)")
            sys.stdout.flush()
            return False
            
    except Exception as e:
        # #region agent log
        import traceback
        debug_log('refresh_github.py:169', 'Exception caught', {'student_id': student_id, 'error': str(e), 'error_type': type(e).__name__}, 'A')
        # #endregion
        print(f"❌ ERROR: {str(e)}", file=sys.stderr)
        sys.stderr.flush()
        traceback.print_exc()
        return False
    finally:
        if client:
            client.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python refresh_github.py <student_id> [username]")
        sys.exit(1)
    
    student_id = sys.argv[1]
    username = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = refresh_student_platform(student_id, username)
    sys.exit(0 if success else 1)
