#!/usr/bin/env python3
"""
Update CodeChef data for a specific student
Usage: python update_codechef_student.py <roll_number> <username>
"""

import sys
import os
import io
from datetime import datetime

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    # Note: Unbuffered output is handled via Python -u flag in Node.js commands

# Add the scraper directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient
from codechef_scraper import scrape_codechef_user
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def update_codechef_student(roll_number, username):
    """Update ALL CodeChef data for a specific student"""
    try:
        # Connect to MongoDB (standardized to MONGO_URI)
        mongodb_uri = os.getenv('MONGO_URI', os.getenv('MONGODB_URI', 'mongodb://localhost:27017/go-tracker'))
        client = MongoClient(mongodb_uri)
        db = client['go-tracker']
        students_collection = db['students']
        
        logger.info(f"================================================================================")
        logger.info(f"CODECHEF DATA UPDATER")
        logger.info(f"================================================================================")
        logger.info(f"Updating CodeChef data for Roll Number: {roll_number}")
        logger.info(f"Username: {username}")
        logger.info(f"================================================================================")
        
        logger.info(f"Fetching complete CodeChef data for {username}...")
        
        # Scrape CodeChef profile data with ALL fields including contest history
        codechef_data = scrape_codechef_user(username, include_contest_history=True)
        
        if not codechef_data:
            logger.error(f"Failed to scrape CodeChef data for {username}")
            return False
        
        logger.info(f"\n📊 Scraped Data Summary:")
        logger.info(f"  Rating: {codechef_data.get('rating', 0)}")
        logger.info(f"  Max Rating: {codechef_data.get('maxRating', 0)}")
        logger.info(f"  Problems Solved: {codechef_data.get('totalSolved', 0)}")
        logger.info(f"  Fully Solved: {codechef_data.get('fullySolved', 0)}")
        logger.info(f"  Partially Solved: {codechef_data.get('partiallySolved', 0)}")
        logger.info(f"  Contests Attended: {codechef_data.get('contestsAttended', 0)}")
        logger.info(f"  Total Submissions: {codechef_data.get('totalSubmissions', 0)}")
        logger.info(f"  Submission Days: {codechef_data.get('submissionStats', {}).get('daysWithSubmissions', 0)}")
        logger.info(f"  Global Rank: {codechef_data.get('globalRank', 0)}")
        logger.info(f"  Country Rank: {codechef_data.get('countryRank', 0)}")
        logger.info(f"  Stars: {codechef_data.get('stars', 0)}")
        logger.info(f"  Division: {codechef_data.get('division', 'N/A')}")
        logger.info(f"  League: {codechef_data.get('league', 'N/A')}")
        logger.info(f"  Institution: {codechef_data.get('institution', 'N/A')}")
        logger.info(f"  Country: {codechef_data.get('country', 'N/A')}")
        logger.info(f"  Contest History Entries: {len(codechef_data.get('contestHistory', []))}")
        logger.info(f"  Submission Heatmap Entries: {len(codechef_data.get('submissionHeatmap', []))}")
        
        # Find student
        student = students_collection.find_one({'rollNumber': roll_number})
        
        if not student:
            logger.error(f"Student with roll number {roll_number} not found!")
            return False
        
        logger.info(f"\n✅ Found student: {student['name']} ({roll_number})")
        
        # Build comprehensive update data
        update_data = {
            # Basic stats
            'platforms.codechef.rating': codechef_data.get('rating', 0),
            'platforms.codechef.maxRating': codechef_data.get('maxRating', 0),
            'platforms.codechef.problemsSolved': codechef_data.get('totalSolved', 0),
            'platforms.codechef.totalSolved': codechef_data.get('totalSolved', 0),
            
            # Rankings
            'platforms.codechef.globalRank': codechef_data.get('globalRank', 0),
            'platforms.codechef.countryRank': codechef_data.get('countryRank', 0),
            
            # Profile info
            'platforms.codechef.stars': codechef_data.get('stars', 0),
            'platforms.codechef.league': codechef_data.get('league', ''),
            'platforms.codechef.division': codechef_data.get('division', ''),
            'platforms.codechef.institution': codechef_data.get('institution', ''),
            'platforms.codechef.country': codechef_data.get('country', ''),
            
            # Contest data
            'platforms.codechef.contestsAttended': codechef_data.get('contestsAttended', 0),
            'platforms.codechef.totalContests': codechef_data.get('contestsAttended', 0),
            'platforms.codechef.contestHistory': codechef_data.get('contestHistory', []),
            'platforms.codechef.recentContests': codechef_data.get('recentContests', []),
            
            # Submission data
            'platforms.codechef.totalSubmissions': codechef_data.get('totalSubmissions', 0),
            'platforms.codechef.submissionHeatmap': codechef_data.get('submissionHeatmap', []),
            'platforms.codechef.submissionByDate': codechef_data.get('submissionByDate', {}),
            'platforms.codechef.submissionStats': codechef_data.get('submissionStats', {
                'daysWithSubmissions': 0,
                'maxDailySubmissions': 0,
                'avgDailySubmissions': 0.0
            }),
            
            # Problem breakdown
            'platforms.codechef.fullySolved': codechef_data.get('fullySolved', 0),
            'platforms.codechef.partiallySolved': codechef_data.get('partiallySolved', 0),
            
            # Metadata
            'platforms.codechef.username': username,
            'platforms.codechef.dataSource': codechef_data.get('dataSource', 'codechef_scraper'),
            'platforms.codechef.lastUpdated': datetime.now()
        }
        
        # Update MongoDB
        update_result = students_collection.update_one(
            {'rollNumber': roll_number},
            {'$set': update_data}
        )
        
        if update_result.modified_count > 0:
            logger.info(f"\n✅ Successfully updated ALL CodeChef data in MongoDB!")
            # Add print statements for Node.js to detect success
            print("✅ Successfully updated ALL CodeChef data in MongoDB!")
            sys.stdout.flush()
            print(f"   📊 Problems Solved: {codechef_data.get('totalSolved', 0)}")
            sys.stdout.flush()
            print(f"   ⭐ Rating: {codechef_data.get('rating', 0)} (Max: {codechef_data.get('maxRating', 0)})")
            sys.stdout.flush()
            print(f"   🏆 Contests: {codechef_data.get('contestsAttended', 0)}")
            sys.stdout.flush()
            logger.info(f"\n📋 Update Summary:")
            logger.info(f"  ✅ Ratings: {codechef_data.get('rating', 0)} (Max: {codechef_data.get('maxRating', 0)})")
            logger.info(f"  ✅ Problems: {codechef_data.get('totalSolved', 0)} total ({codechef_data.get('fullySolved', 0)} fully, {codechef_data.get('partiallySolved', 0)} partially)")
            logger.info(f"  ✅ Contests: {codechef_data.get('contestsAttended', 0)} attended, {len(codechef_data.get('contestHistory', []))} history entries")
            logger.info(f"  ✅ Submissions: {codechef_data.get('totalSubmissions', 0)} total, {codechef_data.get('submissionStats', {}).get('daysWithSubmissions', 0)} active days")
            logger.info(f"  ✅ Heatmap: {len(codechef_data.get('submissionHeatmap', []))} entries")
            logger.info(f"  ✅ Profile: {codechef_data.get('institution', 'N/A')}, {codechef_data.get('country', 'N/A')}")
            return True
        else:
            logger.warning(f"⚠️ No changes made to MongoDB (data may be identical)")
            print("⚠️ No changes made to MongoDB (data may be identical)")
            sys.stdout.flush()
            return False
            
    except Exception as e:
        logger.error(f"❌ Error updating CodeChef data: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("\n" + "="*80)
        print("CODECHEF STUDENT DATA UPDATER")
        print("="*80)
        print("Usage: python update_codechef_student.py <roll_number> <username_or_url>")
        print("Example: python update_codechef_student.py 711523BCB001 kit27csbs01")
        print("Example: python update_codechef_student.py 711523BCB001 https://www.codechef.com/users/kit27csbs01")
        print("="*80 + "\n")
        sys.exit(1)
    
    roll_number = sys.argv[1]
    username_or_url = sys.argv[2]
    
    # Extract username from URL if URL is provided
    import re
    if username_or_url.startswith('http'):
        # Extract username from URL: https://www.codechef.com/users/username
        match = re.search(r'/users/([^/?]+)', username_or_url)
        if match:
            username = match.group(1)
        else:
            logger.error(f"Could not extract username from URL: {username_or_url}")
            print(f"\n❌ Error: Could not extract username from URL: {username_or_url}\n")
            sys.exit(1)
    else:
        username = username_or_url
    
    print("\n" + "="*80)
    print("CODECHEF STUDENT DATA UPDATER")
    print("="*80)
    print(f"Updating CodeChef data for Roll Number: {roll_number}")
    print(f"Username: {username}")
    print("="*80 + "\n")
    
    success = update_codechef_student(roll_number, username)
    
    if success:
        print("\n" + "="*80)
        print("✅ Update Complete!")
        print("="*80 + "\n")
    else:
        print("\n" + "="*80)
        print("❌ Update Failed!")
        print("="*80 + "\n")
        sys.exit(1)

