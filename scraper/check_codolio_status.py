#!/usr/bin/env python3
"""
Check Codolio data status for all students
"""
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def check_codolio_status():
    client = MongoClient(MONGO_URI)
    db = client['go-tracker']
    students = db.students.find({})

    print('Students with missing or incomplete Codolio data:')
    print('='*60)

    missing_count = 0
    incomplete_count = 0
    working_count = 0
    failed_usernames = []

    for student in students:
        name = student.get('name', 'Unknown')
        codolio_username = student.get('platformUsernames', {}).get('codolio', '')
        codolio_data = student.get('platforms', {}).get('codolio', {})
        
        total_days = codolio_data.get('totalActiveDays', 0)
        total_contests = codolio_data.get('totalContests', 0)
        total_submissions = codolio_data.get('totalSubmissions', 0)
        badges = codolio_data.get('badges', [])
        
        if not codolio_username:
            print(f'❌ {name}: No Codolio username')
            missing_count += 1
        elif total_days == 0 and total_contests == 0 and total_submissions == 0:
            print(f'⚠️  {name} ({codolio_username}): No data scraped')
            incomplete_count += 1
            failed_usernames.append(codolio_username)
        else:
            print(f'✅ {name} ({codolio_username}): Days={total_days}, Contests={total_contests}, Submissions={total_submissions}, Badges={len(badges)}')
            working_count += 1

    print(f'\nSummary:')
    print(f'✅ Working: {working_count}')
    print(f'⚠️  Incomplete: {incomplete_count}')
    print(f'❌ Missing username: {missing_count}')
    
    if failed_usernames:
        print(f'\nFailed usernames to retry:')
        print(failed_usernames)

    client.close()
    return failed_usernames

if __name__ == '__main__':
    check_codolio_status()