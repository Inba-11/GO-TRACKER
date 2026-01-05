#!/usr/bin/env python3
"""
Set default Codolio data for students without valid profiles
"""
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def set_default_codolio_data():
    """Set default Codolio data for students without valid profiles"""
    
    print("\n" + "="*70)
    print("🔧 CODOLIO DEFAULT DATA SETTER")
    print("="*70)
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB")
        
        # Find students with missing or zero Codolio data
        students = students_collection.find({})
        
        updated_count = 0
        already_good_count = 0
        
        print("🔄 Checking all students for missing Codolio data...")
        print()
        
        for student in students:
            name = student.get('name', 'Unknown')
            codolio_username = student.get('platformUsernames', {}).get('codolio', '')
            codolio_data = student.get('platforms', {}).get('codolio', {})
            
            total_days = codolio_data.get('totalActiveDays', 0)
            total_contests = codolio_data.get('totalContests', 0)
            total_submissions = codolio_data.get('totalSubmissions', 0)
            
            # If student has meaningful data, skip
            if total_days > 0 or total_contests > 0 or total_submissions > 0:
                print(f"✅ {name}: Already has data (Days: {total_days}, Contests: {total_contests}, Submissions: {total_submissions})")
                already_good_count += 1
                continue
            
            # If no username or no meaningful data, set defaults
            if not codolio_username or codolio_username == "":
                print(f"⚠️  {name}: No Codolio username - setting defaults")
                default_data = {
                    'platforms.codolio.totalActiveDays': 0,
                    'platforms.codolio.totalContests': 0,
                    'platforms.codolio.totalSubmissions': 0,
                    'platforms.codolio.badges': [],
                    'platforms.codolio.lastUpdated': datetime.now(),
                    'platforms.codolio.status': 'No Profile'
                }
            else:
                print(f"❌ {name} ({codolio_username}): Profile not found - setting defaults")
                default_data = {
                    'platforms.codolio.totalActiveDays': 0,
                    'platforms.codolio.totalContests': 0,
                    'platforms.codolio.totalSubmissions': 0,
                    'platforms.codolio.badges': [],
                    'platforms.codolio.lastUpdated': datetime.now(),
                    'platforms.codolio.status': 'Profile Not Found'
                }
            
            # Update the student
            result = students_collection.update_one(
                {'_id': student['_id']},
                {'$set': default_data}
            )
            
            if result.modified_count > 0:
                updated_count += 1
        
        print(f"\n{'='*70}")
        print("📊 DEFAULT DATA SETTING COMPLETE!")
        print(f"{'='*70}")
        print(f"✅ Students with existing data: {already_good_count}")
        print(f"🔧 Students updated with defaults: {updated_count}")
        print(f"📊 Total students processed: {already_good_count + updated_count}")
        print(f"{'='*70}\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("\n🚀 Starting Codolio default data setter...")
    print("⚠️  This will set default values for students without Codolio data")
    set_default_codolio_data()