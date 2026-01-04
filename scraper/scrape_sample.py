"""
Scrape first 5 students as a demo
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from platform_scrapers import PlatformScraper
from datetime import datetime
import time

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def scrape_student(student, scraper):
    """Scrape all platforms for a single student"""
    print(f"\n{'='*60}")
    print(f"🎓 {student['name']} ({student['rollNumber']})")
    print(f"{'='*60}")
    
    updated = False
    
    # LeetCode
    if student['platformUsernames'].get('leetcode'):
        username = student['platformUsernames']['leetcode']
        data = scraper.scrape_leetcode(username)
        if data:
            student['platforms']['leetcode'] = data
            updated = True
        scraper.sleep()
    
    # CodeChef
    if student['platformUsernames'].get('codechef'):
        username = student['platformUsernames']['codechef']
        data = scraper.scrape_codechef(username)
        if data:
            student['platforms']['codechef'] = data
            updated = True
        scraper.sleep()
    
    # Codeforces
    if student['platformUsernames'].get('codeforces'):
        username = student['platformUsernames']['codeforces']
        data = scraper.scrape_codeforces(username)
        if data:
            student['platforms']['codeforces'] = data
            updated = True
        scraper.sleep()
    
    # GitHub
    if student['platformUsernames'].get('github'):
        username = student['platformUsernames']['github']
        data = scraper.scrape_github(username)
        if data:
            student['platforms']['github'] = data
            updated = True
        scraper.sleep()
    
    if updated:
        student['lastScrapedAt'] = datetime.now()
    
    return student, updated

def main():
    print("\n" + "="*60)
    print("🚀 SAMPLE SCRAPER - First 5 Students")
    print("="*60)
    
    try:
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB")
        
        # Get first 5 students
        students = list(students_collection.find({'isActive': True}).limit(5))
        print(f"📊 Scraping {len(students)} students\n")
        
        scraper = PlatformScraper(delay=2)
        
        updated_count = 0
        
        for index, student in enumerate(students, 1):
            try:
                print(f"[{index}/5] Processing...")
                updated_student, was_updated = scrape_student(student, scraper)
                
                if was_updated:
                    students_collection.update_one(
                        {'_id': student['_id']},
                        {'$set': {
                            'platforms': updated_student['platforms'],
                            'lastScrapedAt': updated_student['lastScrapedAt']
                        }}
                    )
                    updated_count += 1
                    print(f"✅ Updated in database")
                
            except Exception as e:
                print(f"❌ Error: {str(e)}")
        
        print(f"\n{'='*60}")
        print(f"✅ Complete! Updated {updated_count}/5 students")
        print(f"{'='*60}\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == '__main__':
    main()
