"""
Check students in database to find INBATAMIZHAN P
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient

def check_students():
    """Check all students in database"""
    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['go_tracker']
        students_collection = db['students']
        
        # Find students with INBATAMIZHAN in name
        students = list(students_collection.find({'name': {'$regex': 'INBATAMIZHAN', '$options': 'i'}}))
        
        print(f"Found {len(students)} students with INBATAMIZHAN in name:")
        for student in students:
            print(f"  - Name: {student.get('name', 'N/A')}")
            print(f"  - Roll: {student.get('rollNumber', 'N/A')}")
            print(f"  - Batch: {student.get('batch', 'N/A')}")
            print(f"  - CodeChef: {student.get('platforms', {}).get('codechef', {}).get('username', 'Not set')}")
            print("  ---")
        
        # Also check for roll number pattern
        roll_students = list(students_collection.find({'rollNumber': {'$regex': '711523BCB023', '$options': 'i'}}))
        print(f"\nFound {len(roll_students)} students with roll 711523BCB023:")
        for student in roll_students:
            print(f"  - Name: {student.get('name', 'N/A')}")
            print(f"  - Roll: {student.get('rollNumber', 'N/A')}")
            print("  ---")
            
        # Check total students
        total = students_collection.count_documents({})
        print(f"\nTotal students in database: {total}")
        
        return students
        
    except Exception as e:
        print(f"❌ Error checking students: {e}")
        return []
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    check_students()