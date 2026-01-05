#!/usr/bin/env python3
"""
Check actual Codolio links for students with profile not found
"""
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def check_codolio_links():
    client = MongoClient(MONGO_URI)
    db = client['go-tracker']
    students = db.students.find({})

    print('\n' + '='*70)
    print('🔗 CODOLIO LINKS CHECK FOR FAILED STUDENTS')
    print('='*70)

    failed_students = []

    for student in students:
        name = student.get('name', 'Unknown')
        codolio_username = student.get('platformUsernames', {}).get('codolio', '')
        codolio_link = student.get('platformLinks', {}).get('codolio', '')
        codolio_data = student.get('platforms', {}).get('codolio', {})
        
        total_days = codolio_data.get('totalActiveDays', 0)
        total_contests = codolio_data.get('totalContests', 0)
        total_submissions = codolio_data.get('totalSubmissions', 0)
        status = codolio_data.get('status', '')
        
        # Check if this is a failed student (has username but no data)
        if codolio_username and (total_days == 0 and total_contests == 0 and total_submissions == 0) and status == 'Profile Not Found':
            print(f'\n📋 {name}')
            print(f'   Username: {codolio_username}')
            print(f'   Link: {codolio_link}')
            
            # Extract username from link if available
            if codolio_link and 'codolio.com/profile/' in codolio_link:
                link_username = codolio_link.split('codolio.com/profile/')[-1].strip('/')
                print(f'   Link Username: {link_username}')
                if link_username != codolio_username:
                    print(f'   ⚠️ USERNAME MISMATCH! DB: {codolio_username} vs Link: {link_username}')
            
            failed_students.append({
                'name': name,
                'db_username': codolio_username,
                'link': codolio_link,
                'link_username': codolio_link.split('codolio.com/profile/')[-1].strip('/') if codolio_link and 'codolio.com/profile/' in codolio_link else ''
            })

    print(f'\n' + '='*70)
    print(f'📊 SUMMARY: Found {len(failed_students)} students with profile not found')
    print('='*70)
    
    # Group by link availability
    with_links = [s for s in failed_students if s['link']]
    without_links = [s for s in failed_students if not s['link']]
    
    print(f'✅ Students with Codolio links: {len(with_links)}')
    print(f'❌ Students without Codolio links: {len(without_links)}')
    
    if with_links:
        print(f'\n🔗 STUDENTS WITH LINKS TO RETRY:')
        for student in with_links:
            print(f'   • {student["name"]}: {student["link"]}')
    
    if without_links:
        print(f'\n❌ STUDENTS WITHOUT LINKS:')
        for student in without_links:
            print(f'   • {student["name"]} (Username: {student["db_username"]})')

    client.close()
    return failed_students

if __name__ == '__main__':
    check_codolio_links()