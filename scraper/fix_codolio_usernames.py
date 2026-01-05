#!/usr/bin/env python3
"""
Fix incorrect Codolio usernames in the database
"""
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

# Corrected username mappings based on common patterns
USERNAME_CORRECTIONS = {
    'Manonikila': 'Manonikila_2',  # From the original list
    'Syf': 'Syfudeen',  # From the original list
    'monisha.ganesh20': 'Monisha',  # From the original list
    'Nishanth_Sasikumar': 'Nishanth',  # From the original list
    'nived': 'Nived',
    'Pradhu': 'Pradeepa',  # From the original list
    'prakashb': 'Prakash',  # From the original list
    'pravin-42': 'Pravin',  # From the original list
    'RagaviAsokan': 'Ragavi',  # From the original list
    'Raja_37': 'Raja',  # From the original list
    'Rajadurai31': 'Rajadurai',  # From the original list
    '_myth_x_46': 'Robert',  # From the original list
    'rudhu18': 'Rudresh',  # From the original list
    'sabariyuhendhran': 'Sabari',  # From the original list
    'sadhana@02': 'Sadhana',  # From the original list
    'SANJAY_N': 'Sanjay',  # From the original list
    'sobhika': 'Sobhika',  # From the original list
    'Swathi Karuppaiya': 'Swathi',  # From the original list
    'THIRU6': 'Thirumal',  # From the original list
    'vignesh_59': 'Vignesh',  # From the original list
    'Mr.Annonymous': 'Vikram',  # From the original list
    'Vishwa_J': 'Vishwa',  # From the original list
    'yoga': 'Yoganayahi',  # From the original list
    'nishanth@20': 'Nishanth'  # From the original list (different from above)
}

def fix_codolio_usernames():
    """Fix incorrect Codolio usernames in the database"""
    
    print("\n" + "="*70)
    print("🔧 CODOLIO USERNAME FIXER")
    print("="*70)
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB")
        print(f"📝 Username corrections to apply: {len(USERNAME_CORRECTIONS)}")
        print()
        
        updated_count = 0
        
        for old_username, new_username in USERNAME_CORRECTIONS.items():
            print(f"🔄 Fixing: {old_username} → {new_username}")
            
            # Find student with the old username
            student = students_collection.find_one({'platformUsernames.codolio': old_username})
            
            if student:
                # Update the username
                result = students_collection.update_one(
                    {'_id': student['_id']},
                    {'$set': {'platformUsernames.codolio': new_username}}
                )
                
                if result.modified_count > 0:
                    print(f"    ✅ Updated {student['name']}")
                    updated_count += 1
                else:
                    print(f"    ⚠️ No changes made for {student['name']}")
            else:
                print(f"    ❌ No student found with username: {old_username}")
        
        print(f"\n{'='*70}")
        print("📊 USERNAME FIXING COMPLETE!")
        print(f"{'='*70}")
        print(f"✅ Successfully updated: {updated_count}/{len(USERNAME_CORRECTIONS)}")
        print(f"{'='*70}\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("\n🚀 Starting Codolio username fixer...")
    fix_codolio_usernames()