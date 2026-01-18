#!/usr/bin/env python3
"""
Test script to update CodeChef data for a specific student
"""

import sys
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime, timezone

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from codechef_scraper import scrape_codechef_user

load_dotenv()

def update_student_codechef(roll_number, username):
    """Update CodeChef data for a specific student"""
    try:
        mongodb_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')
        client = MongoClient(mongodb_uri)
        db = client['go-tracker']
        students_collection = db['students']
        
        print(f"\n[INFO] Scraping CodeChef data for {username}...")
        codechef_data = scrape_codechef_user(username, include_contest_history=True)
        
        if not codechef_data:
            print(f"[ERROR] Failed to scrape data for {username}")
            return False
        
        print(f"\n[SUCCESS] Scraped data:")
        print(f"  - Rating: {codechef_data.get('rating', 0)}")
        print(f"  - Problems Solved: {codechef_data.get('problemsSolved', 0)}")
        print(f"  - Contests Attended: {codechef_data.get('contestsAttended', 0)}")
        print(f"  - Total Submissions: {codechef_data.get('totalSubmissions', 0)}")
        
        # Convert datetime to ISO string for MongoDB
        if 'lastUpdated' in codechef_data and isinstance(codechef_data['lastUpdated'], datetime):
            codechef_data['lastUpdated'] = codechef_data['lastUpdated'].isoformat()
        
        # Update MongoDB
        print(f"\n[INFO] Updating MongoDB for {roll_number}...")
        result = students_collection.update_one(
            {'rollNumber': roll_number},
            {
                '$set': {
                    'platforms.codechef': codechef_data,
                    'lastScrapedAt': datetime.now(timezone.utc)
                }
            }
        )
        
        if result.modified_count > 0:
            print(f"[SUCCESS] Successfully updated {roll_number} in MongoDB!")
            return True
        else:
            print(f"[WARNING] Student {roll_number} not found or no changes made")
            return False
            
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python test_update_codechef.py <roll_number> <codechef_username>")
        print("Example: python test_update_codechef.py 711523BCB001 kit27csbs01")
        sys.exit(1)
    
    roll_number = sys.argv[1]
    username = sys.argv[2]
    
    success = update_student_codechef(roll_number, username)
    sys.exit(0 if success else 1)

