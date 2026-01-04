"""
Update CodeChef Contest Count for All Students
Re-scrapes CodeChef to get contest count
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from platform_scrapers import PlatformScraper
from datetime import datetime
import time

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def update_codechef_contests():
    """Update CodeChef contest count for all students"""
    
    print("\n" + "="*70)
    print("🏆 CODECHEF CONTEST COUNT UPDATER")
    print("="*70)
    print(f"📡 Connecting to MongoDB: {MONGO_URI}")
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB")
        
        # Get all active students with CodeChef usernames
        students = list(students_collection.find({'isActive': True}))
        print(f"📊 Found {len(students)} active students")
        
        # Initialize scraper
        scraper = PlatformScraper(delay=3)
        
        updated_count = 0
        failed_count = 0
        
        print(f"\n🔄 Starting CodeChef contest count update...")
        print(f"{'='*70}\n")
        
        for index, student in enumerate(students, 1):
            codechef_username = student.get('platformUsernames', {}).get('codechef', '')
            
            if not codechef_username:
                print(f"[{index}/{len(students)}] {student['name']}: ⚠️ No CodeChef username")
                continue
            
            print(f"[{index}/{len(students)}] {student['name']}")
            print(f"  🔍 CodeChef: {codechef_username}")
            
            try:
                # Scrape CodeChef data
                data = scraper.scrape_codechef(codechef_username)
                
                if data and data.get('contests', 0) > 0:
                    # Update MongoDB
                    students_collection.update_one(
                        {'_id': student['_id']},
                        {'$set': {
                            'platforms.codechef.contests': data['contests'],
                            'platforms.codechef.contestsAttended': data['contests'],
                            'platforms.codechef.lastUpdated': datetime.now()
                        }}
                    )
                    
                    updated_count += 1
                    print(f"    ✅ Contests: {data['contests']}")
                else:
                    print(f"    ⚠️ No contest data found")
                    failed_count += 1
                    
            except Exception as e:
                print(f"    ❌ Error: {str(e)[:50]}")
                failed_count += 1
            
            # Delay between requests
            time.sleep(3)
        
        # Final statistics
        print(f"\n{'='*70}")
        print("📊 UPDATE COMPLETE!")
        print(f"{'='*70}")
        print(f"✅ Successfully updated: {updated_count}/{len(students)}")
        print(f"❌ Failed: {failed_count}/{len(students)}")
        print(f"{'='*70}\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    update_codechef_contests()
