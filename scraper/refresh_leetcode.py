#!/usr/bin/env python3
"""
Refresh LeetCode Data for Single Student
Usage: python refresh_leetcode.py <student_id> [username]
"""
import sys
import os
import io
import re
from pymongo import MongoClient
from datetime import datetime
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
    
    # Extract from URL patterns
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

def refresh_student_platform(student_id, username=None):
    """Refresh LeetCode data for a student by MongoDB _id"""
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
            username = student.get('platformUsernames', {}).get('leetcode', '')
            
            # If not found, try extracting from platformLinks
            if not username:
                leetcode_link = student.get('platformLinks', {}).get('leetcode', '')
                if leetcode_link:
                    username = extract_username_from_url(leetcode_link)
        
        if not username:
            print(f"❌ ERROR: LeetCode username not found for student {student.get('name', 'Unknown')}")
            sys.stdout.flush()
            client.close()
            return False
        
        # Get OLD data before scraping
        old_leetcode_data = student.get('platforms', {}).get('leetcode', {})
        
        print(f"\n{'=' * 60}")
        print(f"📊 SCRAPING LeetCode for username: {username}")
        print(f"📝 Student: {student.get('name', 'Unknown')} ({student.get('rollNumber', 'N/A')})")
        print(f"{'=' * 60}")
        
        if old_leetcode_data:
            print(f"\n📋 OLD DATA (Before Scraping):")
            print(f"   Total Solved: {old_leetcode_data.get('totalSolved', 0)}")
            print(f"   Easy: {old_leetcode_data.get('easySolved', 0)} | Medium: {old_leetcode_data.get('mediumSolved', 0)} | Hard: {old_leetcode_data.get('hardSolved', 0)}")
            print(f"   Rating: {old_leetcode_data.get('rating', 0)} | Max Rating: {old_leetcode_data.get('maxRating', 0)}")
            print(f"   Contests: {old_leetcode_data.get('contestsAttended', 0)}")
            print(f"   Streak: {old_leetcode_data.get('streak', 0)}")
            print(f"   Acceptance Rate: {old_leetcode_data.get('acceptanceRate', 0)}%")
            print(f"   Last Updated: {old_leetcode_data.get('lastUpdated', 'N/A')}")
        else:
            print(f"\n📋 OLD DATA: No existing LeetCode data found")
        
        print(f"\n🚀 Starting LeetCode scraper...\n")
        sys.stdout.flush()
        
        # Scrape LeetCode data
        leetcode_data = scrape_leetcode_user(username)
        
        if not leetcode_data:
            print(f"❌ ERROR: Failed to scrape LeetCode data for {username}")
            sys.stdout.flush()
            client.close()
            return False
        
        # Print SCRAPED data
        print(f"\n{'=' * 60}")
        print(f"✅ SCRAPED DATA (From LeetCode):")
        print(f"{'=' * 60}")
        print(f"   Username: {leetcode_data.get('username', username)}")
        print(f"   Total Solved: {leetcode_data.get('totalSolved', 0)}")
        print(f"   Easy: {leetcode_data.get('easySolved', 0)} | Medium: {leetcode_data.get('mediumSolved', 0)} | Hard: {leetcode_data.get('hardSolved', 0)}")
        print(f"   Rating: {round(leetcode_data.get('rating', 0))} | Max Rating: {round(leetcode_data.get('maxRating', 0))}")
        print(f"   Last Week Rating: {round(leetcode_data.get('lastWeekRating', 0))}")
        print(f"   Contests Attended: {leetcode_data.get('contestsAttended', 0)}")
        print(f"   Global Ranking: {leetcode_data.get('globalRanking', 0)}")
        print(f"   Reputation: {leetcode_data.get('reputation', 0)}")
        print(f"   Total Submissions: {leetcode_data.get('totalSubmissions', 0)}")
        print(f"   Acceptance Rate: {leetcode_data.get('acceptanceRate', 0):.2f}%")
        print(f"   Streak: {leetcode_data.get('streak', 0)}")
        print(f"   Total Active Days: {leetcode_data.get('totalActiveDays', 0)}")
        print(f"   Recent Contests: {leetcode_data.get('recentContests', 0)}")
        if leetcode_data.get('contestHistory'):
            print(f"   Contest History: {len(leetcode_data.get('contestHistory', []))} contests")
        if leetcode_data.get('badges'):
            print(f"   Badges: {len(leetcode_data.get('badges', []))} badges")
        print(f"{'=' * 60}\n")
        sys.stdout.flush()
        
        # Prepare update data matching the MongoDB schema
        # Use field-level updates to preserve existing detailed data
        # LeetCode scraper DOES return contestHistory, so we can safely update it
        update_data = {
            'platforms.leetcode.username': leetcode_data.get('username', username),
            'platforms.leetcode.problemsSolved': leetcode_data.get('totalSolved', 0),
            'platforms.leetcode.totalSolved': leetcode_data.get('totalSolved', 0),
            'platforms.leetcode.easySolved': leetcode_data.get('easySolved', 0),
            'platforms.leetcode.mediumSolved': leetcode_data.get('mediumSolved', 0),
            'platforms.leetcode.hardSolved': leetcode_data.get('hardSolved', 0),
            'platforms.leetcode.rating': round(leetcode_data.get('rating', 0)),
            'platforms.leetcode.maxRating': round(leetcode_data.get('maxRating', 0)),
            'platforms.leetcode.lastWeekRating': round(leetcode_data.get('lastWeekRating', 0)),
            'platforms.leetcode.contestsAttended': leetcode_data.get('contestsAttended', 0),
            'platforms.leetcode.contests': leetcode_data.get('contests', 0),
            'platforms.leetcode.globalRank': leetcode_data.get('globalRanking', 0),
            'platforms.leetcode.globalRanking': leetcode_data.get('globalRanking', 0),
            'platforms.leetcode.ranking': leetcode_data.get('ranking', 0),
            'platforms.leetcode.reputation': leetcode_data.get('reputation', 0),
            'platforms.leetcode.totalSubmissions': leetcode_data.get('totalSubmissions', 0),
            'platforms.leetcode.acceptanceRate': leetcode_data.get('acceptanceRate', 0),
            'platforms.leetcode.streak': leetcode_data.get('streak', 0),
            'platforms.leetcode.totalActiveDays': leetcode_data.get('totalActiveDays', 0),
            'platforms.leetcode.badges': leetcode_data.get('badges', []),
            'platforms.leetcode.activeBadge': leetcode_data.get('activeBadge', ''),
            'platforms.leetcode.contestHistory': leetcode_data.get('contestHistory', []),
            'platforms.leetcode.submissionCalendar': leetcode_data.get('submissionCalendar', ''),
            'platforms.leetcode.recentSubmissions': leetcode_data.get('recentSubmissions', []),
            'platforms.leetcode.recentContests': leetcode_data.get('recentContests', 0),
            'platforms.leetcode.topPercentage': leetcode_data.get('topPercentage', 0),
            'platforms.leetcode.totalParticipants': leetcode_data.get('totalParticipants', 0),
            'platforms.leetcode.lastUpdated': datetime.utcnow(),
            'platforms.leetcode.dataSource': 'leetcode_refresh_script',
            'platformUsernames.leetcode': username,
            'lastScrapedAt': datetime.utcnow()
        }
        
        # Update student in MongoDB
        print(f"💾 Updating MongoDB...")
        sys.stdout.flush()
        
        result = students_collection.update_one(
            {'_id': ObjectId(student_id)},
            {'$set': update_data}
        )
        
        if result.modified_count > 0 or result.matched_count > 0:
            # Fetch updated data from MongoDB to show what was saved
            updated_student = students_collection.find_one({'_id': ObjectId(student_id)})
            new_leetcode_data = updated_student.get('platforms', {}).get('leetcode', {}) if updated_student else {}
            
            print(f"\n{'=' * 60}")
            print(f"✅ SUCCESS: LeetCode data updated in MongoDB")
            print(f"{'=' * 60}")
            print(f"\n📊 NEW DATA (After MongoDB Update):")
            print(f"   Total Solved: {new_leetcode_data.get('totalSolved', 0)}")
            print(f"   Easy: {new_leetcode_data.get('easySolved', 0)} | Medium: {new_leetcode_data.get('mediumSolved', 0)} | Hard: {new_leetcode_data.get('hardSolved', 0)}")
            print(f"   Rating: {new_leetcode_data.get('rating', 0)} | Max Rating: {new_leetcode_data.get('maxRating', 0)}")
            print(f"   Contests: {new_leetcode_data.get('contestsAttended', 0)}")
            print(f"   Streak: {new_leetcode_data.get('streak', 0)}")
            print(f"   Acceptance Rate: {new_leetcode_data.get('acceptanceRate', 0)}%")
            print(f"   Last Updated: {new_leetcode_data.get('lastUpdated', 'N/A')}")
            print(f"\n💾 MongoDB Status: Modified={result.modified_count}, Matched={result.matched_count}")
            print(f"{'=' * 60}\n")
            sys.stdout.flush()
            client.close()
            return True
        else:
            print(f"\n⚠️  No changes made (data might be the same)")
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
        print("Usage: python refresh_leetcode.py <student_id> [username]")
        sys.exit(1)
    
    student_id = sys.argv[1]
    username = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = refresh_student_platform(student_id, username)
    sys.exit(0 if success else 1)
