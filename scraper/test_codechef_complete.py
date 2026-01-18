#!/usr/bin/env python3
"""
Complete CodeChef scraper test - extracts ALL data including submissions and contests
"""
import sys
import os
import io
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from codechef_scraper import scrape_codechef_user
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import logging

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def update_mongodb(roll_number, username):
    """Update MongoDB with scraped data"""
    try:
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students = db.students
        
        print(f"\n{'='*70}")
        print(f"COMPLETE CODECHEF SCRAPER TEST")
        print(f"{'='*70}")
        print(f"Roll Number: {roll_number}")
        print(f"Username: {username}")
        print(f"{'='*70}\n")
        
        # Scrape all data
        print("🔍 Scraping CodeChef profile...")
        data = scrape_codechef_user(username, include_contest_history=True)
        
        if not data:
            print("❌ Failed to scrape data")
            return False
        
        print(f"\n{'='*70}")
        print("📊 SCRAPED DATA SUMMARY")
        print(f"{'='*70}")
        print(f"✅ Rating: {data.get('rating', 0)}")
        print(f"✅ Max Rating: {data.get('maxRating', 0)}")
        print(f"✅ Problems Solved: {data.get('totalSolved', 0)}")
        print(f"✅ Contests Attended: {data.get('contestsAttended', 0)}")
        print(f"✅ Total Submissions: {data.get('totalSubmissions', 0)}")
        print(f"✅ Submission Days: {data.get('submissionStats', {}).get('daysWithSubmissions', 0)}")
        print(f"✅ Recent Contests: {len(data.get('recentContests', []))}")
        print(f"✅ Data Source: {data.get('dataSource', 'unknown')}")
        print(f"{'='*70}\n")
        
        # Show recent contests if available
        recent_contests = data.get('recentContests', [])
        if recent_contests:
            print(f"🏆 Recent Contests ({len(recent_contests)}):")
            for i, contest in enumerate(recent_contests[:5], 1):
                print(f"  {i}. {contest.get('name', 'Unknown')} - {contest.get('date', 'N/A')[:10]}")
            print()
        
        # Show submission stats if available
        if data.get('totalSubmissions', 0) > 0:
            stats = data.get('submissionStats', {})
            print(f"📈 Submission Statistics:")
            print(f"  Total Submissions: {data['totalSubmissions']}")
            print(f"  Days with Submissions: {stats.get('daysWithSubmissions', 0)}")
            print(f"  Max Daily: {stats.get('maxDailySubmissions', 0)}")
            print(f"  Avg Daily: {stats.get('avgDailySubmissions', 0)}")
            print()
        
        # Update MongoDB
        print("💾 Updating MongoDB...")
        update_data = {
            f'platforms.codechef': {
                **data,
                'updatedAt': datetime.utcnow()
            }
        }
        
        result = students.update_one(
            {'rollNumber': roll_number},
            {'$set': update_data},
            upsert=False
        )
        
        if result.modified_count > 0:
            print(f"✅ Successfully updated MongoDB for roll number: {roll_number}")
            print(f"✅ Updated fields: {len(data)} data points")
            client.close()
            return True
        elif result.matched_count > 0:
            print(f"⚠️ Student {roll_number} found but no changes detected")
            client.close()
            return False
        else:
            print(f"⚠️ Student {roll_number} not found in database")
            client.close()
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python test_codechef_complete.py <roll_number> <username>")
        print("Example: python test_codechef_complete.py 711523BCB023 kit27csbs01")
        sys.exit(1)
    
    roll_number = sys.argv[1]
    username = sys.argv[2]
    
    success = update_mongodb(roll_number, username)
    sys.exit(0 if success else 1)

