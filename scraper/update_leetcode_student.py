#!/usr/bin/env python3
"""
Update LeetCode data for a specific student in MongoDB
Usage: python update_leetcode_student.py <roll_number> <leetcode_username_or_url>
"""

import sys
import os
import io
import re
from pymongo import MongoClient
from datetime import datetime
import logging

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    # Note: Unbuffered output is handled via Python -u flag in Node.js commands

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Add parent directory to path to import leetcode_scraper
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from leetcode_scraper import scrape_leetcode_user

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def extract_username_from_url(url_or_username):
    """Extract username from LeetCode URL or return as-is if already username"""
    if not url_or_username:
        return None
    
    # If it's already a username (no http/https)
    if not url_or_username.startswith('http'):
        return url_or_username.strip()
    
    # Extract from URL patterns:
    # https://leetcode.com/u/username/
    # https://leetcode.com/profile/username/
    # https://leetcode.com/username/
    patterns = [
        r'leetcode\.com/u/([^/?]+)',
        r'leetcode\.com/profile/([^/?]+)',
        r'leetcode\.com/([^/?]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url_or_username)
        if match:
            return match.group(1).strip()
    
    return None

def update_student_leetcode(roll_number, leetcode_username_or_url):
    """Update student's LeetCode data in MongoDB"""
    try:
        # Extract username from URL if needed
        leetcode_username = extract_username_from_url(leetcode_username_or_url)
        
        if not leetcode_username:
            print(f"❌ ERROR: Could not extract LeetCode username from: {leetcode_username_or_url}")
            sys.stdout.flush()
            return False
        
        print(f"📊 Scraping LeetCode for username: {leetcode_username}")
        sys.stdout.flush()
        print(f"📝 Roll Number: {roll_number}")
        sys.stdout.flush()
        
        # Scrape LeetCode data
        leetcode_data = scrape_leetcode_user(leetcode_username)
        
        if not leetcode_data:
            print(f"❌ ERROR: Failed to scrape LeetCode data for {leetcode_username}")
            sys.stdout.flush()
            return False
        
        # Connect to MongoDB
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
            'platforms.leetcode': {
                'username': leetcode_data.get('username', leetcode_username),
                'problemsSolved': leetcode_data.get('totalSolved', 0),
                'totalSolved': leetcode_data.get('totalSolved', 0),  # Alias for frontend
                'easySolved': leetcode_data.get('easySolved', 0),
                'mediumSolved': leetcode_data.get('mediumSolved', 0),
                'hardSolved': leetcode_data.get('hardSolved', 0),
                'rating': round(leetcode_data.get('rating', 0)),
                'maxRating': round(leetcode_data.get('maxRating', 0)),
                'lastWeekRating': round(leetcode_data.get('lastWeekRating', 0)),
                'contestsAttended': leetcode_data.get('contestsAttended', 0),
                'contests': leetcode_data.get('contests', 0),
                'globalRank': leetcode_data.get('globalRanking', 0),
                'globalRanking': leetcode_data.get('globalRanking', 0),  # Alias
                'ranking': leetcode_data.get('ranking', 0),
                'reputation': leetcode_data.get('reputation', 0),
                'totalSubmissions': leetcode_data.get('totalSubmissions', 0),
                'acceptanceRate': leetcode_data.get('acceptanceRate', 0),
                'streak': leetcode_data.get('streak', 0),
                'totalActiveDays': leetcode_data.get('totalActiveDays', 0),
                'badges': leetcode_data.get('badges', []),
                'activeBadge': leetcode_data.get('activeBadge', ''),
                'contestHistory': leetcode_data.get('contestHistory', []),
                'submissionCalendar': leetcode_data.get('submissionCalendar', ''),
                'recentSubmissions': leetcode_data.get('recentSubmissions', []),
                'recentContests': leetcode_data.get('recentContests', 0),
                'topPercentage': leetcode_data.get('topPercentage', 0),
                'totalParticipants': leetcode_data.get('totalParticipants', 0),
                'lastUpdated': datetime.utcnow(),
                'dataSource': 'leetcode_python_scraper'
            },
            'lastScrapedAt': datetime.utcnow()
        }
        
        # Update platform username and link if provided
        if leetcode_username_or_url.startswith('http'):
            update_data['platformLinks.leetcode'] = leetcode_username_or_url
        update_data['platformUsernames.leetcode'] = leetcode_username
        
        # Update student in MongoDB
        result = students_collection.update_one(
            {'rollNumber': roll_number},
            {'$set': update_data}
        )
        
        if result.modified_count > 0:
            print(f"✅ Successfully updated LeetCode data for {roll_number}")
            sys.stdout.flush()
            print(f"   📊 Problems Solved: {leetcode_data.get('totalSolved', 0)}")
            sys.stdout.flush()
            print(f"   ⭐ Rating: {round(leetcode_data.get('rating', 0))}")
            sys.stdout.flush()
            print(f"   🏆 Max Rating: {round(leetcode_data.get('maxRating', 0))}")
            sys.stdout.flush()
            print(f"   🎯 Contests: {leetcode_data.get('contestsAttended', 0)}")
            sys.stdout.flush()
            print(f"   🔥 Streak: {leetcode_data.get('streak', 0)} days")
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
        print("Usage: python update_leetcode_student.py <roll_number> <leetcode_username_or_url>")
        sys.exit(1)
    
    roll_number = sys.argv[1]
    leetcode_input = sys.argv[2]
    
    success = update_student_leetcode(roll_number, leetcode_input)
    sys.exit(0 if success else 1)

