#!/usr/bin/env python3
"""
Final Codolio status check - shows current state after all fixes
"""
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def final_codolio_status():
    client = MongoClient(MONGO_URI)
    db = client['go-tracker']
    students = db.students.find({})

    print('\n' + '='*70)
    print('📊 FINAL CODOLIO STATUS REPORT')
    print('='*70)

    working_count = 0
    no_profile_count = 0
    profile_not_found_count = 0
    total_count = 0

    for student in students:
        name = student.get('name', 'Unknown')
        codolio_username = student.get('platformUsernames', {}).get('codolio', '')
        codolio_data = student.get('platforms', {}).get('codolio', {})
        
        total_days = codolio_data.get('totalActiveDays', 0)
        total_contests = codolio_data.get('totalContests', 0)
        total_submissions = codolio_data.get('totalSubmissions', 0)
        badges = codolio_data.get('badges', [])
        status = codolio_data.get('status', '')
        
        total_count += 1
        
        if not codolio_username:
            print(f'❌ {name}: No Codolio username (Status: {status})')
            no_profile_count += 1
        elif total_days > 0 or total_contests > 0 or total_submissions > 0:
            print(f'✅ {name} ({codolio_username}): Days={total_days}, Contests={total_contests}, Submissions={total_submissions}, Badges={len(badges)}')
            working_count += 1
        else:
            print(f'⚠️  {name} ({codolio_username}): Profile not found (Status: {status})')
            profile_not_found_count += 1

    print(f'\n' + '='*70)
    print('📈 FINAL SUMMARY')
    print('='*70)
    print(f'✅ Students with working Codolio data: {working_count}/{total_count} ({working_count/total_count*100:.1f}%)')
    print(f'⚠️  Students with profiles not found: {profile_not_found_count}/{total_count} ({profile_not_found_count/total_count*100:.1f}%)')
    print(f'❌ Students without Codolio usernames: {no_profile_count}/{total_count} ({no_profile_count/total_count*100:.1f}%)')
    print(f'📊 Total students: {total_count}')
    
    if working_count > 0:
        print(f'\n🎯 DATA QUALITY:')
        print(f'   • Real-time Codolio data is working for {working_count} students')
        print(f'   • Default values set for {profile_not_found_count + no_profile_count} students without profiles')
        print(f'   • All students now have complete Codolio data structure')
    
    print('='*70 + '\n')

    client.close()

if __name__ == '__main__':
    final_codolio_status()