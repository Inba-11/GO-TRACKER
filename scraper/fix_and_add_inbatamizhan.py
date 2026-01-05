"""
Fix database issues and add INBATAMIZHAN P with proper CodeChef data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient
from datetime import datetime
import bcrypt

def fix_and_add_inbatamizhan():
    """Fix database and add INBATAMIZHAN P with proper data"""
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['go_tracker']
        students_collection = db['students']
        
        # First, fix any existing students with string rank values
        print("🔧 Fixing existing students with string rank values...")
        
        # Update any string ranks to numbers
        students_collection.update_many(
            {'platforms.codeforces.rank': {'$type': 'string'}},
            {'$set': {'platforms.codeforces.rank': 0}}
        )
        
        # Check if INBATAMIZHAN P already exists
        existing = students_collection.find_one({'rollNumber': '711523BCB023'})
        if existing:
            print(f"✅ Found existing student: {existing['name']}")
            student_id = existing['_id']
        else:
            # Create INBATAMIZHAN P
            print("➕ Creating INBATAMIZHAN P...")
            
            # Hash password
            password_hash = bcrypt.hashpw('711523BCB023'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            student_data = {
                'name': 'INBATAMIZHAN P',
                'rollNumber': '711523BCB023',
                'email': 'inbatamizhan@example.com',
                'password': password_hash,
                'batch': 'C',
                'department': 'Computer Science & Business Systems',
                'isActive': True,
                'role': 'student',
                'avatar': 'https://www.superherodb.com/pictures2/portraits/10/100/133.jpg',
                'platforms': {
                    'codechef': {
                        'username': '',
                        'rating': 0,
                        'maxRating': 0,
                        'problemsSolved': 0,
                        'rank': 0,
                        'lastWeekRating': 0,
                        'contests': 0,
                        'contestsAttended': 0,
                        'lastUpdated': datetime.now()
                    },
                    'leetcode': {
                        'username': '',
                        'rating': 0,
                        'maxRating': 0,
                        'problemsSolved': 0,
                        'rank': 0,
                        'lastWeekRating': 0,
                        'contests': 0,
                        'contestsAttended': 0,
                        'lastUpdated': datetime.now()
                    },
                    'codeforces': {
                        'username': '',
                        'rating': 0,
                        'maxRating': 0,
                        'problemsSolved': 0,
                        'rank': 0,
                        'lastWeekRating': 0,
                        'contests': 0,
                        'contestsAttended': 0,
                        'lastUpdated': datetime.now()
                    },
                    'github': {
                        'username': '',
                        'repositories': 0,
                        'contributions': 0,
                        'commits': 0,
                        'followers': 0,
                        'lastWeekContributions': 0,
                        'streak': 0,
                        'longestStreak': 0,
                        'lastUpdated': datetime.now()
                    },
                    'codolio': {
                        'username': '',
                        'totalSubmissions': 0,
                        'totalActiveDays': 0,
                        'totalContests': 0,
                        'currentStreak': 0,
                        'maxStreak': 0,
                        'dailySubmissions': [],
                        'badges': [],
                        'lastUpdated': datetime.now()
                    }
                },
                'platformLinks': {
                    'codechef': '',
                    'leetcode': '',
                    'codeforces': '',
                    'github': '',
                    'codolio': ''
                },
                'weeklyProgress': [],
                'createdAt': datetime.now(),
                'updatedAt': datetime.now()
            }
            
            result = students_collection.insert_one(student_data)
            student_id = result.inserted_id
            print(f"✅ Created student with ID: {student_id}")
        
        # Now update with real CodeChef data
        print("📊 Updating with real CodeChef data...")
        
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
        
        # Update the student
        update_result = students_collection.update_one(
            {'_id': student_id},
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
        else:
            print("ℹ️ No changes needed")
        
        # Verify the update
        updated_student = students_collection.find_one({'_id': student_id})
        if updated_student:
            codechef_info = updated_student['platforms']['codechef']
            print(f"\n🔍 Verification:")
            print(f"   - Name: {updated_student['name']}")
            print(f"   - Roll: {updated_student['rollNumber']}")
            print(f"   - CodeChef Username: {codechef_info['username']}")
            print(f"   - Rating: {codechef_info['rating']}")
            print(f"   - Problems Solved: {codechef_info['problemsSolved']}")
            print(f"   - Contests: {codechef_info['contests']}")
            print(f"   - Global Rank: #{codechef_info['globalRank']:,}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("🚀 Fixing database and adding INBATAMIZHAN P with CodeChef data...")
    
    if fix_and_add_inbatamizhan():
        print("\n✅ Operation completed successfully!")
    else:
        print("\n❌ Operation failed!")