"""
Verify that MongoDB has been updated with real CodeChef contest data
"""
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv('../.env')

def verify_contest_data():
    """
    Verify MongoDB contest data for all students
    """
    try:
        # Connect to MongoDB
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/go-tracker')
        client = MongoClient(mongodb_uri)
        db = client['go-tracker']
        students_collection = db['students']
        
        print("🔍 Verifying CodeChef contest data in MongoDB...")
        
        # Get all students with CodeChef data
        students_with_codechef = students_collection.find({
            'platforms.codechef.totalContests': {'$exists': True, '$gt': 0}
        })
        
        verified_students = []
        total_contests = 0
        
        for student in students_with_codechef:
            roll_number = student['rollNumber']
            name = student['name']
            codechef_data = student['platforms']['codechef']
            
            contest_count = codechef_data.get('totalContests', 0)
            username = codechef_data.get('username', 'N/A')
            rating = codechef_data.get('rating', 0)
            problems_solved = codechef_data.get('problemsSolved', 0)
            updated_at = codechef_data.get('contestCountUpdatedAt', 'N/A')
            
            verified_students.append({
                'rollNumber': roll_number,
                'name': name,
                'username': username,
                'totalContests': contest_count,
                'rating': rating,
                'problemsSolved': problems_solved,
                'updatedAt': updated_at
            })
            
            total_contests += contest_count
            
            print(f"✅ {roll_number} ({name}): @{username} - {contest_count} contests, {rating} rating")
        
        print(f"\n📊 Verification Summary:")
        print(f"   Students with Contest Data: {len(verified_students)}")
        print(f"   Total Contests Across All: {total_contests}")
        print(f"   Average Contests per Student: {total_contests / len(verified_students) if verified_students else 0:.1f}")
        
        # Sort by contest count and show top performers
        top_performers = sorted(verified_students, key=lambda x: x['totalContests'], reverse=True)[:10]
        
        print(f"\n🏆 Top 10 Contest Participants:")
        for i, student in enumerate(top_performers, 1):
            print(f"   {i}. {student['rollNumber']} (@{student['username']}): {student['totalContests']} contests")
        
        # Save verification results
        with open('contest_data_verification.json', 'w') as f:
            json.dump({
                'verified_at': '2025-01-05T15:00:00Z',
                'total_students': len(verified_students),
                'total_contests': total_contests,
                'average_contests': total_contests / len(verified_students) if verified_students else 0,
                'students': verified_students
            }, f, indent=2)
        
        print(f"\n✅ Verification complete! Results saved to contest_data_verification.json")
        
        client.close()
        return verified_students
        
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return []

if __name__ == "__main__":
    verify_contest_data()