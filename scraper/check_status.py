"""
Check scraping status
"""
from pymongo import MongoClient
from datetime import datetime, timedelta

MONGO_URI = 'mongodb://localhost:27017/go-tracker'

try:
    client = MongoClient(MONGO_URI)
    db = client['go-tracker']
    students = list(db.students.find({'isActive': True}))
    
    print(f"\n{'='*60}")
    print("📊 SCRAPING STATUS CHECK")
    print(f"{'='*60}")
    print(f"Total active students: {len(students)}")
    
    # Check who has been scraped
    scraped = [s for s in students if s.get('lastScrapedAt')]
    not_scraped = [s for s in students if not s.get('lastScrapedAt')]
    
    print(f"✅ Students with scraped data: {len(scraped)}")
    print(f"❌ Students without scraped data: {len(not_scraped)}")
    
    if not_scraped:
        print(f"\n⚠️  Students missing data:")
        for s in not_scraped[:10]:
            print(f"  - {s['name']} ({s['rollNumber']})")
    
    # Check recent scraping
    if scraped:
        one_hour_ago = datetime.now() - timedelta(hours=1)
        recent = [s for s in scraped if s.get('lastScrapedAt') > one_hour_ago]
        print(f"\n🕐 Recently scraped (last hour): {len(recent)}")
        
        # Show sample data
        sample = scraped[0]
        print(f"\n📋 Sample student data: {sample['name']}")
        if sample.get('platforms'):
            if sample['platforms'].get('leetcode'):
                lc = sample['platforms']['leetcode']
                print(f"  LeetCode: {lc.get('problemsSolved', 0)} problems, Rating: {lc.get('rating', 0)}")
            if sample['platforms'].get('codeforces'):
                cf = sample['platforms']['codeforces']
                print(f"  Codeforces: {cf.get('problemsSolved', 0)} problems, Rating: {cf.get('rating', 0)}")
            if sample['platforms'].get('github'):
                gh = sample['platforms']['github']
                print(f"  GitHub: {gh.get('repositories', 0)} repos, {gh.get('contributions', 0)} contributions")
    
    print(f"\n{'='*60}\n")
    
    client.close()
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
