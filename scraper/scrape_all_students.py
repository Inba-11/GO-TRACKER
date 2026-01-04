"""
Main scraper script - Fetches real data for all students
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from platform_scrapers import PlatformScraper
from datetime import datetime
import time

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')
SCRAPING_DELAY = int(os.getenv('SCRAPING_DELAY', 3))

def extract_username_from_url(url, platform):
    """Extract username from platform URL"""
    if not url or url.upper() in ['NULL', 'CODOLIO', ''] or 'share.google' in url:
        return ''
    
    try:
        url = url.strip()
        
        if platform == 'leetcode':
            if 'leetcode.com/u/' in url:
                username = url.split('leetcode.com/u/')[-1].rstrip('/')
                return username.split('/')[0]
            elif ' - LeetCode Profile' in url:
                return url.split(' - LeetCode Profile')[0].strip()
            else:
                parts = url.rstrip('/').split('/')
                return parts[-1] if parts else ''
                
        elif platform == 'codechef':
            if 'codechef.com/users/' in url:
                return url.split('/users/')[-1].rstrip('/')
            return ''
            
        elif platform == 'codeforces':
            if 'codeforces.com/profile/' in url:
                return url.split('/profile/')[-1].rstrip('/')
            elif ' - Codeforces' in url:
                return url.split(' - Codeforces')[0].strip()
            return ''
            
        elif platform == 'github':
            if 'github.com/' in url:
                username = url.split('github.com/')[-1].rstrip('/')
                return username.split('/')[0]
            return ''
            
        elif platform == 'codolio':
            if 'codolio.com/profile/' in url:
                username = url.split('/profile/')[-1]
                username = username.replace('%20', ' ')
                return username.split('/')[0]
            elif 'Codolio' in url or '|' in url:
                return ''
            return ''
    except Exception as e:
        print(f"    ⚠️ Error extracting username from {url}: {e}")
        return ''
    return ''

def scrape_student(student, scraper):
    """Scrape all platforms for a single student"""
    print(f"\n{'='*60}")
    print(f"🎓 Student: {student['name']} ({student['rollNumber']})")
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
    
    # Codolio
    if student['platformUsernames'].get('codolio'):
        username = student['platformUsernames']['codolio']
        data = scraper.scrape_codolio(username)
        if data:
            student['platforms']['codolio'] = data
            updated = True
        scraper.sleep()
    
    if updated:
        student['lastScrapedAt'] = datetime.now()
    
    return student, updated

def main():
    """Main scraping function"""
    print("\n" + "="*60)
    print("🚀 GO TRACKER - REAL DATA SCRAPER")
    print("="*60)
    print(f"📡 Connecting to MongoDB: {MONGO_URI}")
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB")
        
        # Get all active students
        students = list(students_collection.find({'isActive': True}))
        print(f"📊 Found {len(students)} active students")
        
        # Initialize scraper
        scraper = PlatformScraper(delay=SCRAPING_DELAY)
        
        # Statistics
        total_students = len(students)
        updated_count = 0
        failed_count = 0
        
        print(f"\n🔄 Starting scraping process...")
        print(f"⏱️  Delay between requests: {SCRAPING_DELAY} seconds")
        print(f"{'='*60}\n")
        
        # Scrape each student
        for index, student in enumerate(students, 1):
            try:
                print(f"[{index}/{total_students}] Processing...")
                updated_student, was_updated = scrape_student(student, scraper)
                
                if was_updated:
                    # Update in database
                    students_collection.update_one(
                        {'_id': student['_id']},
                        {'$set': {
                            'platforms': updated_student['platforms'],
                            'lastScrapedAt': updated_student['lastScrapedAt']
                        }}
                    )
                    updated_count += 1
                    print(f"✅ Updated in database")
                else:
                    print(f"⚠️  No data to update")
                
            except Exception as e:
                print(f"❌ Error processing {student['name']}: {str(e)}")
                failed_count += 1
            
            # Progress indicator
            if index < total_students:
                print(f"\n⏳ Progress: {index}/{total_students} ({(index/total_students)*100:.1f}%)")
                time.sleep(1)  # Small delay between students
        
        # Final statistics
        print(f"\n{'='*60}")
        print("📊 SCRAPING COMPLETE!")
        print(f"{'='*60}")
        print(f"✅ Successfully updated: {updated_count}/{total_students}")
        print(f"❌ Failed: {failed_count}/{total_students}")
        print(f"⏱️  Total time: ~{(total_students * SCRAPING_DELAY * 5) / 60:.1f} minutes")
        print(f"{'='*60}\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
