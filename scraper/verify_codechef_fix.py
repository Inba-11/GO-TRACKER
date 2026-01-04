"""
Verify CodeChef problems count in MongoDB
"""
from pymongo import MongoClient

MONGO_URI = 'mongodb://localhost:27017/go-tracker'

client = MongoClient(MONGO_URI)
db = client['go-tracker']

# Get sample students
students = list(db.students.find({'isActive': True}).limit(10))

print("\n" + "="*70)
print("🔍 VERIFYING CODECHEF PROBLEMS COUNT IN DATABASE")
print("="*70 + "\n")

working_count = 0
total_count = 0

for student in students:
    name = student['name']
    platforms = student.get('platforms', {})
    
    if platforms.get('codechef'):
        cc = platforms['codechef']
        problems = cc.get('problemsSolved', 0)
        rating = cc.get('rating', 0)
        max_rating = cc.get('maxRating', 0)
        
        total_count += 1
        if problems > 0:
            working_count += 1
            status = "✅"
        else:
            status = "⚠️"
        
        print(f"{status} {name}")
        print(f"   CodeChef: {problems} problems, Rating: {rating}, Max: {max_rating}")

print(f"\n{'='*70}")
print(f"📊 RESULTS")
print(f"{'='*70}")
print(f"✅ Working: {working_count}/{total_count} students ({(working_count/total_count*100):.0f}%)")
print(f"⚠️  Not working: {total_count - working_count}/{total_count}")
print()

client.close()
