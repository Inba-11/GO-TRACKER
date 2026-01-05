"""
Final update for INBATAMIZHAN P CodeChef data
"""
from pymongo import MongoClient
from datetime import datetime

def update_inbatamizhan_codechef():
    """Update CodeChef data for INBATAMIZHAN P"""
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['go-tracker']  # Correct database name
        students_collection = db['students']
        
        # Find INBATAMIZHAN P
        student = students_collection.find_one({'rollNumber': '711523BCB023'})
        
        if not student:
            print("❌ INBATAMIZHAN P not found")
            return False
        
        print(f"✅ Found: {student['name']} ({student['rollNumber']})")
        
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
            'division': 'Div 4',
            'globalRank': 68253,
            'countryRank': 63981,
            'stars': 1,
            'league': 'Bronze',
            'lastActive': '2 days ago',
            'recentSubmissions': 3,
            'profileUrl': 'https://www.codechef.com/users/kit27csbs23',
            'lastUpdated': datetime.now()
        }
        
        # Update the student's CodeChef data
        result = students_collection.update_one(
            {'rollNumber': '711523BCB023'},
            {
                '$set': {
                    'platforms.codechef': codechef_data,
                    'platformLinks.codechef': 'https://www.codechef.com/users/kit27csbs23',
                    'updatedAt': datetime.now()
                }
            }
        )
        
        if result.modified_count > 0:
            print("✅ Successfully updated CodeChef data!")
            print(f"📊 Updated data:")
            print(f"   - Username: {codechef_data['username']}")
            print(f"   - Rating: {codechef_data['rating']} ({codechef_data.get('division', 'N/A')})")
            print(f"   - Problems Solved: {codechef_data['problemsSolved']}")
            print(f"   - Contests: {codechef_data['contests']}")
            print(f"   - Global Rank: #{codechef_data['globalRank']:,}")
            print(f"   - Country Rank: #{codechef_data['countryRank']:,}")
            print(f"   - League: {codechef_data['league']} ({codechef_data['stars']} star)")
            
            # Verify the update
            updated_student = students_collection.find_one({'rollNumber': '711523BCB023'})
            if updated_student and 'platforms' in updated_student:
                print("\n🔍 Verification successful - Data is now in database!")
                return True
            else:
                print("\n❌ Verification failed")
                return False
        else:
            print("ℹ️ No changes made (data might be the same)")
            return True
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("🚀 Updating CodeChef data for INBATAMIZHAN P (711523BCB023)...")
    
    if update_inbatamizhan_codechef():
        print("\n✅ CodeChef data update completed successfully!")
        print("🎯 The student dashboard will now show the updated CodeChef card with real data!")
    else:
        print("\n❌ CodeChef data update failed!")