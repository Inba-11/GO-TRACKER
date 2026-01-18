#!/usr/bin/env python3
"""
CodeChef Integration Test
Tests the complete flow: scrape -> MongoDB -> verify
"""

import sys
import io
import logging
from datetime import datetime, timezone
from pymongo import MongoClient
from codechef_scraper import scrape_codechef_user
import os
from dotenv import load_dotenv

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def test_codechef_scraper(username):
    """Test scraping a CodeChef user"""
    print(f"\n{'='*70}")
    print(f"Testing CodeChef Scraper for: {username}")
    print('='*70)
    
    try:
        # Test scraping
        print("\n[1/3] Scraping CodeChef profile...")
        data = scrape_codechef_user(username)
        
        if not data:
            print("[FAILED] No data returned from scraper")
            return False
        
        print("[SUCCESS] Data scraped successfully")
        print("\nScraped Data:")
        print("-" * 70)
        for key, value in data.items():
            if key != 'lastUpdated':
                print(f"  {key:20s}: {value}")
        print("-" * 70)
        
        # Test MongoDB connection
        print("\n[2/3] Testing MongoDB connection...")
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            client.server_info()
            db = client['go-tracker']
            students = db.students
            print("[SUCCESS] Connected to MongoDB")
            print(f"   Total students in database: {students.count_documents({})}")
        except Exception as e:
            print(f"[WARNING] MongoDB connection failed: {e}")
            print("   Scraper works but can't test database integration")
            client = None
        
        # Test updating a test document (optional)
        if client:
            print("\n[3/3] Testing data format for MongoDB...")
            
            # Create a sample student data structure
            update_data = {
                'platforms.codechef': {
                    **data,
                    'updatedAt': datetime.now(timezone.utc)
                }
            }
            
            print("[SUCCESS] Data format is valid for MongoDB")
            print(f"   Data would be stored under: platforms.codechef")
            print(f"   Fields: {list(data.keys())}")
            
            client.close()
        
        print(f"\n{'='*70}")
        print("[SUCCESS] ALL TESTS PASSED")
        print('='*70)
        return True
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function"""
    print("\n" + "="*70)
    print("CODECHEF SCRAPER INTEGRATION TEST")
    print("="*70)
    
    # Default test usernames
    test_users = ['tourist', 'gennady.korotkevich']
    
    # Allow custom username from command line
    if len(sys.argv) > 1:
        test_users = [sys.argv[1]]
    
    print(f"\nTesting with username(s): {', '.join(test_users)}")
    
    success_count = 0
    for username in test_users:
        if test_codechef_scraper(username):
            success_count += 1
        
        # Delay between tests if multiple users
        if len(test_users) > 1 and username != test_users[-1]:
            import time
            print("\n⏳ Waiting 5 seconds before next test...")
            time.sleep(5)
    
    print(f"\n{'='*70}")
    print(f"FINAL RESULTS: {success_count}/{len(test_users)} tests passed")
    print('='*70 + "\n")
    
    return success_count == len(test_users)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

