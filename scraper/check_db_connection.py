"""
Check database connection and find the correct database
"""
from pymongo import MongoClient

def check_databases():
    """Check all databases and collections"""
    try:
        client = MongoClient('mongodb://localhost:27017/')
        
        # List all databases
        db_names = client.list_database_names()
        print(f"📊 Available databases: {db_names}")
        
        # Check each database for students
        for db_name in db_names:
            if 'go' in db_name.lower() or 'tracker' in db_name.lower():
                db = client[db_name]
                collections = db.list_collection_names()
                print(f"\n🔍 Database '{db_name}' collections: {collections}")
                
                if 'students' in collections:
                    students_count = db['students'].count_documents({})
                    print(f"   👥 Students count: {students_count}")
                    
                    if students_count > 0:
                        # Show first few students
                        students = list(db['students'].find({}, {'name': 1, 'rollNumber': 1}).limit(5))
                        print(f"   📋 Sample students:")
                        for student in students:
                            print(f"      - {student.get('name', 'No name')} ({student.get('rollNumber', 'No roll')})")
                        
                        # Look for INBATAMIZHAN
                        inbatamizhan = db['students'].find_one({'name': {'$regex': 'INBATAMIZHAN', '$options': 'i'}})
                        if inbatamizhan:
                            print(f"   ✅ Found INBATAMIZHAN: {inbatamizhan['name']} ({inbatamizhan.get('rollNumber', 'No roll')})")
                            return db_name, db
        
        return None, None
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None, None

def update_codechef_data(db):
    """Update CodeChef data in the correct database"""
    try:
        students_collection = db['students']
        
        # Find INBATAMIZHAN P
        student = students_collection.find_one({'name': {'$regex': 'INBATAMIZHAN', '$options': 'i'}})
        
        if not student:
            print("❌ INBATAMIZHAN P not found")
            return False
        
        print(f"✅ Found: {student['name']} ({student.get('rollNumber', 'No roll')})")
        
        # Real CodeChef data
        codechef_data = {
            'username': 'kit27csbs23',
            'rating': 1264,
            'maxRating': 1264,
            'problemsSolved': 500,
            'rank': 68253,
            'lastWeekRating': 1250,
            'contests': 96,
            'contestsAttended': 96,
            'lastUpdated': '2026-01-05T12:00:00Z'
        }
        
        # Update
        result = students_collection.update_one(
            {'_id': student['_id']},
            {
                '$set': {
                    'platforms.codechef': codechef_data,
                    'platformLinks.codechef': 'https://www.codechef.com/users/kit27csbs23'
                }
            }
        )
        
        if result.modified_count > 0:
            print("✅ CodeChef data updated successfully!")
            print(f"📊 Data: Rating {codechef_data['rating']}, Problems {codechef_data['problemsSolved']}, Contests {codechef_data['contests']}")
            return True
        else:
            print("ℹ️ No changes made")
            return False
            
    except Exception as e:
        print(f"❌ Error updating: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Checking database connections...")
    
    db_name, db = check_databases()
    
    if db:
        print(f"\n🚀 Updating CodeChef data in database '{db_name}'...")
        update_codechef_data(db)
    else:
        print("\n❌ No suitable database found with students data")