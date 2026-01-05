"""
Update CodeChef data specifically for INBATAMIZHAN P (711523BCB023)
Real data: kit27csbs23, 1264 rating, 96 contests, 500 problems solved
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient
from datetime import datetime
import json

def update_inbatamizhan_codechef():
    """Update CodeChef data for INBATAMIZHAN P with real data"""
    try:
        # Connect to MongoDB
        client = MongoClient('mongodb://localhost:27017/')
        db = client['go_tracker']
        students_collection = db['students']
        
        # Find INBATAMIZHAN P
        student = students_collection.find_one({'rollNumber': '711523BCB023'})
        
        if not student:
            print("❌ Student INBATAMIZHAN P (711523BCB023) not found!")
            return False
        
        print(f"✅ Found student: {student['name']} ({student['rollNumber']})")
        
        # Real CodeChef data for kit27csbs23
        codechef_data = {
            'username': 'kit27csbs23',
            'rating': 1264,
            'division': 'Div 4',
            'globalRank': 68253,
            'countryRank': 63981,
            'problemsSolved': 500,
            'contestsParticipated': 96,
            'stars': 1,
            'league': 'Bronze',
            'maxRating': 1264,
            'lastActive': '2 days ago',
            'recentSubmissions': 3,
            'profileUrl': 'https://www.codechef.com/users/kit27csbs23',
            'lastUpdated': datetime.now().isoformat()
        }
        
        # Update the student's CodeChef platform data
        update_result = students_collection.update_one(
            {'rollNumber': '711523BCB023'},
            {
                '$set': {
                    'platforms.codechef': codechef_data,
                    'platformLinks.codechef': 'https://www.codechef.com/users/kit27csbs23',
                    'lastUpdated': datetime.now().isoformat()
                }
            }
        )
        
        if update_result.modified_count > 0:
            print("✅ Successfully updated CodeChef data for INBATAMIZHAN P!")
            print(f"📊 Updated data:")
            print(f"   - Username: {codechef_data['username']}")
            print(f"   - Rating: {codechef_data['rating']} ({codechef_data['division']})")
            print(f"   - Global Rank: #{codechef_data['globalRank']:,}")
            print(f"   - Country Rank: #{codechef_data['countryRank']:,}")
            print(f"   - Problems Solved: {codechef_data['problemsSolved']}")
            print(f"   - Contests: {codechef_data['contestsParticipated']}")
            print(f"   - League: {codechef_data['league']} ({codechef_data['stars']} star)")
            return True
        else:
            print("❌ No changes made to the database")
            return False
            
    except Exception as e:
        print(f"❌ Error updating CodeChef data: {e}")
        return False
    finally:
        if 'client' in locals():
            client.close()

def verify_update():
    """Verify the update was successful"""
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['go_tracker']
        students_collection = db['students']
        
        student = students_collection.find_one({'rollNumber': '711523BCB023'})
        
        if student and 'platforms' in student and 'codechef' in student['platforms']:
            codechef_data = student['platforms']['codechef']
            print("\n🔍 Verification - Current CodeChef data:")
            print(json.dumps(codechef_data, indent=2, default=str))
            return True
        else:
            print("❌ Verification failed - CodeChef data not found")
            return False
            
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("🚀 Updating CodeChef data for INBATAMIZHAN P...")
    
    if update_inbatamizhan_codechef():
        print("\n🔍 Verifying update...")
        verify_update()
        print("\n✅ CodeChef data update completed successfully!")
    else:
        print("\n❌ CodeChef data update failed!")