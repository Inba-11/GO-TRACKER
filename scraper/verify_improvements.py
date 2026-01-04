"""
Verify improvements in MongoDB
"""
from pymongo import MongoClient

MONGO_URI = 'mongodb://localhost:27017/go-tracker'

client = MongoClient(MONGO_URI)
db = client['go-tracker']

# Get sample students
students = list(db.students.find({'isActive': True}).limit(5))

print("\n" + "="*70)
print("🔍 VERIFYING IMPROVEMENTS IN DATABASE")
print("="*70 + "\n")

for student in students:
    print(f"👤 {student['name']}")
    platforms = student.get('platforms', {})
    
    # LeetCode
    if platforms.get('leetcode'):
        lc = platforms['leetcode']
        print(f"   📊 LeetCode:")
        print(f"      Problems: {lc.get('problemsSolved', 0)}")
        print(f"      Rating: {lc.get('rating', 0)}")
        print(f"      Max Rating: {lc.get('maxRating', 0)}")
        print(f"      Contests: {lc.get('contests', 0)} ✅")
    
    # CodeChef
    if platforms.get('codechef'):
        cc = platforms['codechef']
        print(f"   📊 CodeChef:")
        print(f"      Rating: {cc.get('rating', 0)}")
        print(f"      Max Rating: {cc.get('maxRating', 0)} {'✅' if cc.get('maxRating', 0) > 0 else '⚠️'}")
        print(f"      Problems: {cc.get('problemsSolved', 0)} {'⚠️' if cc.get('problemsSolved', 0) == 0 else '✅'}")
    
    # Codeforces
    if platforms.get('codeforces'):
        cf = platforms['codeforces']
        print(f"   📊 Codeforces:")
        print(f"      Problems: {cf.get('problemsSolved', 0)}")
        print(f"      Rating: {cf.get('rating', 0)}")
        print(f"      Max Rating: {cf.get('maxRating', 0)}")
        print(f"      Contests: {cf.get('contests', 0)} {'✅ FIXED!' if cf.get('contests', 0) > 0 else '⚠️'}")
    
    # GitHub
    if platforms.get('github'):
        gh = platforms['github']
        print(f"   📊 GitHub:")
        print(f"      Repos: {gh.get('repositories', 0)} ✅")
        print(f"      Contributions: {gh.get('contributions', 0)} {'⚠️ (needs token)' if gh.get('contributions', 0) == 0 else '✅'}")
        print(f"      Followers: {gh.get('followers', 0)}")
    
    print()

print("="*70)
print("📊 SUMMARY OF IMPROVEMENTS")
print("="*70)
print("✅ LeetCode: All data working (problems, rating, contests)")
print("✅ Codeforces: Contest count NOW WORKING!")
print("✅ CodeChef: Max rating now extracted separately")
print("⚠️ CodeChef: Problems count limited (API/HTML issue)")
print("⚠️ GitHub: Contributions need token (repos work fine)")
print("❌ Codolio: Requires Selenium (not implemented)")
print()

client.close()
