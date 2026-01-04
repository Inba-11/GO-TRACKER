"""
Verify scraped data for a few students
"""
from pymongo import MongoClient

MONGO_URI = 'mongodb://localhost:27017/go-tracker'

try:
    client = MongoClient(MONGO_URI)
    db = client['go-tracker']
    
    # Get 5 random students
    students = list(db.students.find({'isActive': True}).limit(5))
    
    print(f"\n{'='*70}")
    print("🔍 DATA VERIFICATION - Sample Students")
    print(f"{'='*70}\n")
    
    for student in students:
        print(f"👤 {student['name']} ({student['rollNumber']})")
        print(f"   Last Scraped: {student.get('lastScrapedAt', 'Never')}")
        
        platforms = student.get('platforms', {})
        
        # LeetCode
        if platforms.get('leetcode'):
            lc = platforms['leetcode']
            print(f"   📊 LeetCode:")
            print(f"      - Username: {lc.get('username', 'N/A')}")
            print(f"      - Problems: {lc.get('problemsSolved', 0)}")
            print(f"      - Rating: {lc.get('rating', 0)}")
            print(f"      - Contests: {lc.get('contests', 0)}")
        
        # CodeChef
        if platforms.get('codechef'):
            cc = platforms['codechef']
            print(f"   📊 CodeChef:")
            print(f"      - Username: {cc.get('username', 'N/A')}")
            print(f"      - Problems: {cc.get('problemsSolved', 0)}")
            print(f"      - Rating: {cc.get('rating', 0)}")
        
        # Codeforces
        if platforms.get('codeforces'):
            cf = platforms['codeforces']
            print(f"   📊 Codeforces:")
            print(f"      - Username: {cf.get('username', 'N/A')}")
            print(f"      - Problems: {cf.get('problemsSolved', 0)}")
            print(f"      - Rating: {cf.get('rating', 0)}")
            print(f"      - Rank: {cf.get('rank', 'N/A')}")
        
        # GitHub
        if platforms.get('github'):
            gh = platforms['github']
            print(f"   📊 GitHub:")
            print(f"      - Username: {gh.get('username', 'N/A')}")
            print(f"      - Repositories: {gh.get('repositories', 0)}")
            print(f"      - Followers: {gh.get('followers', 0)}")
            print(f"      - Contributions: {gh.get('contributions', 0)}")
        
        print()
    
    print(f"{'='*70}\n")
    
    client.close()
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
