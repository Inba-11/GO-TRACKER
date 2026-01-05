"""
Verify all CodeChef data in MongoDB
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('../.env')

def verify_data():
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/go-tracker')
    client = MongoClient(mongodb_uri)
    db = client['go-tracker']
    students = db['students']
    
    # Get all students with CodeChef data
    all_students = list(students.find({}, {
        'rollNumber': 1,
        'name': 1,
        'platforms.codechef.username': 1,
        'platforms.codechef.totalContests': 1,
        'platforms.codechef.rating': 1,
        'platforms.codechef.problemsSolved': 1
    }))
    
    print(f"📊 Total students in database: {len(all_students)}")
    
    # Count students with CodeChef data
    with_codechef = [s for s in all_students if s.get('platforms', {}).get('codechef', {}).get('totalContests', 0) > 0]
    print(f"✅ Students with CodeChef contest data: {len(with_codechef)}")
    
    # Calculate statistics
    total_contests = sum(s.get('platforms', {}).get('codechef', {}).get('totalContests', 0) for s in all_students)
    avg_contests = total_contests / len(with_codechef) if with_codechef else 0
    
    print(f"\n📈 Statistics:")
    print(f"   Total contests across all students: {total_contests}")
    print(f"   Average contests per student: {avg_contests:.1f}")
    
    # Top 10 performers
    sorted_students = sorted(with_codechef, 
                            key=lambda x: x.get('platforms', {}).get('codechef', {}).get('totalContests', 0), 
                            reverse=True)
    
    print(f"\n🏆 Top 10 Contest Participants:")
    for i, s in enumerate(sorted_students[:10], 1):
        roll = s.get('rollNumber', 'N/A')
        name = s.get('name', 'N/A')
        username = s.get('platforms', {}).get('codechef', {}).get('username', 'N/A')
        contests = s.get('platforms', {}).get('codechef', {}).get('totalContests', 0)
        print(f"   {i}. {name} ({roll}) - @{username}: {contests} contests")
    
    # Students without CodeChef data
    without_codechef = [s for s in all_students if s.get('platforms', {}).get('codechef', {}).get('totalContests', 0) == 0]
    if without_codechef:
        print(f"\n⚠️ Students without CodeChef contest data ({len(without_codechef)}):")
        for s in without_codechef:
            roll = s.get('rollNumber', 'N/A')
            name = s.get('name', 'N/A')
            print(f"   - {name} ({roll})")
    
    client.close()
    return len(with_codechef), total_contests

if __name__ == "__main__":
    verify_data()
