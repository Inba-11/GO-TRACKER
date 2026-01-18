#!/usr/bin/env python3
"""
Update CodeChef contest history for INBATAMIZHAN P (711523BCB023)
Fetches last 8 contests with problems solved and dates, stores in MongoDB
"""

import sys
import os
from datetime import datetime

# Add the scraper directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient
from codechef_scraper import get_codechef_contest_history
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def update_codechef_contest_history():
    """Update CodeChef contest history for INBATAMIZHAN P"""
    try:
        # Connect to MongoDB
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        client = MongoClient(mongodb_uri)
        db = client['go-tracker']
        students_collection = db['students']
        
        roll_number = '711523BCB023'
        username = 'kit27csbs23'
        
        logger.info(f"🔍 Fetching contest history for {username}...")
        
        # Fetch contest history using the enhanced function
        contest_history = get_codechef_contest_history(username, limit=8, use_selenium=False)
        
        if not contest_history:
            logger.warning(f"⚠️ No contest history found for {username}")
            return False
        
        logger.info(f"✅ Retrieved {len(contest_history)} contests")
        
        # Find student
        student = students_collection.find_one({'rollNumber': roll_number})
        
        if not student:
            logger.error(f"❌ Student with roll number {roll_number} not found!")
            return False
        
        logger.info(f"✅ Found student: {student['name']} ({roll_number})")
        
        # Prepare contest history data for MongoDB
        contest_history_data = []
        for contest in contest_history:
            contest_history_data.append({
                'contestCode': contest.get('contestCode', ''),
                'name': contest.get('name', ''),
                'date': contest.get('date', ''),
                'rating': contest.get('rating', 0),
                'rank': contest.get('rank', 0),
                'ratingChange': contest.get('ratingChange', 0),
                'problemsSolved': contest.get('problemsSolved', []),
                'problemsCount': contest.get('problemsCount', 0),
                'attended': contest.get('attended', True)
            })
        
        # Update MongoDB
        update_result = students_collection.update_one(
            {'rollNumber': roll_number},
            {
                '$set': {
                    'platforms.codechef.contestHistory': contest_history_data,
                    'platforms.codechef.recentContests': contest_history_data,  # Also update recentContests for compatibility
                    'platforms.codechef.lastUpdated': datetime.now()
                }
            }
        )
        
        if update_result.modified_count > 0:
            logger.info(f"✅ Successfully updated contest history in MongoDB!")
            logger.info(f"📊 Updated {len(contest_history_data)} contests")
            
            # Print summary
            logger.info("\n📋 Contest History Summary:")
            for i, contest in enumerate(contest_history_data, 1):
                date_str = contest['date'][:10] if contest['date'] else 'Unknown'
                logger.info(f"  {i}. {contest['name']} - Date: {date_str} - {contest['problemsCount']} problems solved")
            
            return True
        else:
            logger.warning(f"⚠️ No changes made to MongoDB (data may be identical)")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error updating contest history: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("\n" + "="*80)
    print("CODECHEF CONTEST HISTORY UPDATER")
    print("="*80)
    print(f"Updating contest history for INBATAMIZHAN P (711523BCB023)")
    print(f"Username: kit27csbs23")
    print("="*80 + "\n")
    
    success = update_codechef_contest_history()
    
    if success:
        print("\n" + "="*80)
        print("Update Complete!")
        print("="*80 + "\n")
    else:
        print("\n" + "="*80)
        print("Update Failed!")
        print("="*80 + "\n")
        sys.exit(1)

