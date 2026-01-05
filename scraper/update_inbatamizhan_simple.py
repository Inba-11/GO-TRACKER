"""
Simple update for INBATAMIZHAN P CodeChef data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient
from datetime import datetime

def update_inbatamizhan_codechef():
    """Update CodeChef data for INBATAMIZHAN P"""
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['go_tracker']
        students_collection = db['students']
        
        # Check all students first
        all_students = list(students_collection.find({}, {'name': 1, 'rollNumber': 1}))
        print(f"📊 Total students in database: {len(all_students)}")
        
        # Look for INBATAMIZHAN P
        inbatamizhan_variations = [
            {'rollNumber': '711523BCB023'},
            {'name': {'$regex': 'INBATAMIZHAN', '$options': 'i'}},
            {'name': {'$regex': 'INBATAMIZHAN P', '$options': 'i'}}
        ]
        
        student = None
        for variation in inbatamizhan_variations:
            student = students_collection.find_one(variation)
            if student:
                print(f"✅ Found student: {student['name']} ({student.get('rollNumber', 'No roll')})")
                break
        
        if not student:
            print("❌ INBATAMIZHAN P not found in database")
            print("📋 Available students:")
            for s in all_students[:10]:  # Show first 10
                print(f"   - {s.get('name', 'No name')} ({s.get('rollNumber', 'No roll')})")
            return False
        
        # Real CodeChef data for kit27csbs23
        codechef_data = {
            'username': 'kit27csbs23',
            'rating': 1264,
            'maxRating': 1264,
            'problemsSolved': 500,
            'rank': 68253,
            'lastWeekRating': 1250,
            'contests': 96,
            'contestsAttended': 96,
            'lastUpdated': datetime.now()
        }
        
        # Update the student's CodeChef data
        update_result = students_collection.update_one(
            {'_id': student['_id']},
            {
                '$set': {
                    'platforms.codechef': codechef_data,
                    'platformLinks.codechef': 'https://www.codechef.com/users/kit27csbs23',
                    'updatedAt': datetime.now()
                }
            }
        )
        
        if update_result.modified_count > 0:
            print("✅ Successfully updated CodeChef data!")
            print(f"📊 Updated data:")
            print(f"   - Username: {codechef_data['username']}")
            print(f"   - Rating: {codechef_data['rating']}")
            print(f"   - Problems Solved: {codechef_data['problemsSolved']}")
            print(f"   - Contests: {codechef_data['contests']}")
            print(f"   - Global Rank: #{codechef_data['rank']:,}")
            return True
        else:
            print("ℹ️ No changes made")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("🚀 Updating CodeChef data for INBATAMIZHAN P...")
    update_inbatamizhan_codechef()