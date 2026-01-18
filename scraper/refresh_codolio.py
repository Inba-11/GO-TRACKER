#!/usr/bin/env python3
"""
Refresh Codolio Data for Single Student
Usage: python refresh_codolio.py <student_id> [username]
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
from codolio_scraper import scrape_codolio_user

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def extract_username_from_url(url_or_username):
    """Extract username from Codolio URL or return as-is if already username"""
    if not url_or_username:
        return None
    
    # If it's already a username (no http/https)
    if not url_or_username.startswith('http'):
        return url_or_username.strip()
    
    # Extract from URL patterns: https://codolio.com/profile/username
    pattern = r'codolio\.com/profile/([^/?]+)'
    match = re.search(pattern, url_or_username)
    if match:
        return match.group(1).strip()
    
    return None

def refresh_student_platform(student_id, username=None):
    """Refresh Codolio data for a student by MongoDB _id"""
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
            username = student.get('platformUsernames', {}).get('codolio', '')
            
            # If not found, try extracting from platformLinks
            if not username:
                codolio_link = student.get('platformLinks', {}).get('codolio', '')
                if codolio_link:
                    username = extract_username_from_url(codolio_link)
        
        if not username:
            print(f"❌ ERROR: Codolio username not found for student {student.get('name', 'Unknown')}")
            sys.stdout.flush()
            client.close()
            return False
        
        print(f"📊 Scraping Codolio for username: {username}")
        sys.stdout.flush()
        print(f"📝 Student: {student.get('name', 'Unknown')} ({student.get('rollNumber', 'N/A')})")
        sys.stdout.flush()
        
        # Scrape Codolio data
        codolio_data = scrape_codolio_user(username)
        
        if not codolio_data:
            print(f"❌ ERROR: Failed to scrape Codolio data for {username}")
            sys.stdout.flush()
            client.close()
            return False
        
        # Prepare update data matching the MongoDB schema
        update_data = {
            'platforms.codolio': {
                'username': username,
                'totalSubmissions': codolio_data.get('totalSubmissions', 0),
                'totalActiveDays': codolio_data.get('totalActiveDays', 0),
                'totalContests': codolio_data.get('totalContests', 0),
                'currentStreak': codolio_data.get('currentStreak', 0),
                'maxStreak': codolio_data.get('maxStreak', 0),
                'dailySubmissions': codolio_data.get('dailySubmissions', []),
                'badges': codolio_data.get('badges', []),
                'lastUpdated': datetime.utcnow(),
                'dataSource': 'codolio_refresh_script'
            },
            'lastScrapedAt': datetime.utcnow()
        }
        
        # Update platform username
        update_data['platformUsernames.codolio'] = username
        
        # Update student in MongoDB
        result = students_collection.update_one(
            {'_id': ObjectId(student_id)},
            {'$set': update_data}
        )
        
        if result.modified_count > 0 or result.matched_count > 0:
            print(f"✅ Successfully updated Codolio data")
            sys.stdout.flush()
            print(f"   📊 Total Submissions: {codolio_data.get('totalSubmissions', 0)}")
            sys.stdout.flush()
            print(f"   🎯 Active Days: {codolio_data.get('totalActiveDays', 0)}")
            sys.stdout.flush()
            print(f"   🔥 Current Streak: {codolio_data.get('currentStreak', 0)} days")
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
        print("Usage: python refresh_codolio.py <student_id> [username]")
        sys.exit(1)
    
    student_id = sys.argv[1]
    username = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = refresh_student_platform(student_id, username)
    sys.exit(0 if success else 1)
