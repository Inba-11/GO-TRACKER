#!/usr/bin/env python3
"""
Refresh Codeforces Data for Single Student
Usage: python refresh_codeforces.py <student_id> [username]
"""
import sys
import os
import io
import re
from datetime import datetime
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
from codeforces_scraper import scrape_codeforces_user

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def extract_username_from_url(url_or_username):
    """Extract username from Codeforces URL or return as-is if already username"""
    if not url_or_username:
        return None
    
    # If it's already a username (no http/https)
    if not url_or_username.startswith('http'):
        return url_or_username.strip()
    
    # Extract from URL patterns: https://codeforces.com/profile/username
    pattern = r'codeforces\.com/profile/([^/?]+)'
    match = re.search(pattern, url_or_username)
    if match:
        return match.group(1).strip()
    
    return None

def refresh_student_platform(student_id, username=None):
    """Refresh Codeforces data for a student by MongoDB _id"""
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db['students']
        
        # Find student by _id
        try:
            student = students_collection.find_one({'_id': ObjectId(student_id)})
        except Exception as e:
            print(f"❌ ERROR: Invalid student ID format: {student_id}")
            sys.stdout.flush()
            client.close()
            return False
        
        if not student:
            print(f"❌ ERROR: Student with ID {student_id} not found")
            sys.stdout.flush()
            client.close()
            return False
        
        # Extract username if not provided
        if not username:
            # Try platformUsernames first
            username = student.get('platformUsernames', {}).get('codeforces', '')
            
            # If not found, try extracting from platformLinks
            if not username:
                codeforces_link = student.get('platformLinks', {}).get('codeforces', '')
                if codeforces_link:
                    username = extract_username_from_url(codeforces_link)
        
        if not username:
            print(f"❌ ERROR: Codeforces username not found for student {student.get('name', 'Unknown')}")
            sys.stdout.flush()
            client.close()
            return False
        
        print(f"📊 Scraping Codeforces for username: {username}")
        sys.stdout.flush()
        print(f"📝 Student: {student.get('name', 'Unknown')} ({student.get('rollNumber', 'N/A')})")
        sys.stdout.flush()
        
        # Scrape Codeforces data with contest history
        codeforces_data = scrape_codeforces_user(username, include_contest_history=True)
        
        if not codeforces_data:
            print(f"❌ ERROR: Failed to scrape Codeforces data for {username}")
            sys.stdout.flush()
            client.close()
            return False
        
        # Prepare update data matching the MongoDB schema
        # Use field-level updates to preserve existing detailed data (contestHistory, heatmap, etc.)
        # Map scraper output fields (scraper returns 'totalSolved' and 'contestsAttended')
        total_solved = codeforces_data.get('totalSolved', 0)
        contests_attended = codeforces_data.get('contestsAttended', 0)
        
        # Use field-level updates to preserve existing detailed data
        # Update all fields that the scraper returns, including recentContests and contestHistory
        recent_contests = codeforces_data.get('recentContests', [])
        contest_history = codeforces_data.get('contestHistory', [])
        submission_heatmap = codeforces_data.get('submissionHeatmap', [])
        submission_stats = codeforces_data.get('submissionStats', {})
        
        update_data = {
            'platforms.codeforces.username': username,
            'platforms.codeforces.rating': codeforces_data.get('rating', 0),
            'platforms.codeforces.maxRating': codeforces_data.get('maxRating', 0),
            'platforms.codeforces.problemsSolved': total_solved,
            'platforms.codeforces.totalSolved': total_solved,
            'platforms.codeforces.rank': codeforces_data.get('rank', 'unrated'),
            'platforms.codeforces.maxRank': codeforces_data.get('maxRank', 'unrated'),
            'platforms.codeforces.contests': contests_attended,
            'platforms.codeforces.contestsAttended': contests_attended,
            'platforms.codeforces.recentContests': recent_contests,  # Array, not number
            'platforms.codeforces.contestHistory': contest_history,  # Add contest history
            'platforms.codeforces.ratingChangeLastContest': codeforces_data.get('ratingChangeLastContest', 0),
            'platforms.codeforces.totalSubmissions': codeforces_data.get('totalSubmissions', 0),
            'platforms.codeforces.acceptedSubmissions': codeforces_data.get('acceptedSubmissions', 0),
            'platforms.codeforces.avgProblemRating': codeforces_data.get('avgProblemRating', 0),
            'platforms.codeforces.recentSubmissions': codeforces_data.get('recentSubmissions', []),
            'platforms.codeforces.recentSolved': codeforces_data.get('recentSolved', 0),
            'platforms.codeforces.lastWeekRating': codeforces_data.get('lastWeekRating', 0),
            'platforms.codeforces.submissionHeatmap': submission_heatmap,  # Add submission heatmap
            'platforms.codeforces.submissionStats': submission_stats,  # Add submission stats
            'platforms.codeforces.country': codeforces_data.get('country', ''),
            'platforms.codeforces.city': codeforces_data.get('city', ''),
            'platforms.codeforces.organization': codeforces_data.get('organization', ''),
            'platforms.codeforces.contribution': codeforces_data.get('contribution', 0),
            'platforms.codeforces.friendOfCount': codeforces_data.get('friendOfCount', 0),
            'platforms.codeforces.lastOnlineTime': codeforces_data.get('lastOnlineTime'),
            'platforms.codeforces.registrationTime': codeforces_data.get('registrationTime'),
            'platforms.codeforces.lastUpdated': datetime.utcnow(),
            'platforms.codeforces.dataSource': 'codeforces_refresh_script',
            'platformUsernames.codeforces': username,
            'lastScrapedAt': datetime.utcnow()
        }
        
        # Update student in MongoDB with upsert to ensure document exists
        result = students_collection.update_one(
            {'_id': ObjectId(student_id)},
            {'$set': update_data},
            upsert=False
        )
        
        if result.modified_count > 0 or result.matched_count > 0:
            print(f"✅ Successfully updated Codeforces data")
            sys.stdout.flush()
            print(f"   📊 Rating: {codeforces_data.get('rating', 0)}")
            sys.stdout.flush()
            print(f"   🎯 Problems Solved: {total_solved}")
            sys.stdout.flush()
            print(f"   🏆 Contests: {contests_attended}")
            sys.stdout.flush()
            print(f"   📅 Recent Contests: {len(recent_contests)}")
            sys.stdout.flush()
            print(f"   📜 Contest History: {len(contest_history)}")
            sys.stdout.flush()
            client.close()
            return True
        else:
            print(f"⚠️  No changes made (data might be the same)")
            sys.stdout.flush()
            client.close()
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}", file=sys.stderr)
        sys.stderr.flush()
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python refresh_codeforces.py <student_id> [username]")
        sys.exit(1)
    
    student_id = sys.argv[1]
    username = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = refresh_student_platform(student_id, username)
    sys.exit(0 if success else 1)
