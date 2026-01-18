#!/usr/bin/env python3
"""
Scrape LeetCode data with verification and failure tracking
Scrapes, verifies, and logs failures separately
"""
import os
import sys
import re
import json
import time
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

# Import scraper
from leetcode_scraper import scrape_leetcode_user

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

# Student list with URLs
STUDENTS_TO_SCRAPE = [
    ("JEGAN S", "https://leetcode.com/u/jegan08356/"),
    ("JENCY IRIN J", "https://leetcode.com/u/user6421FH/"),
    ("JOEL G", "https://leetcode.com/u/kit27csbs26/"),
    ("KASTHURI S", "https://leetcode.com/u/user8879Yd/"),
    ("KAVIYA K", "https://leetcode.com/u/kit27csbs29/"),
    ("KOWSALYA S", "https://leetcode.com/u/Kowsalya_30/"),
    ("LAKSHANA S", "https://leetcode.com/u/lakshanasampath/"),
    ("LOURDU SATHISH J", "https://leetcode.com/u/sathishi107/"),
    ("MAHA LAKSHMI M", "https://leetcode.com/u/kit27csbs33/"),
    ("MAHESHWARI D", "https://leetcode.com/u/Mahesh--/"),
    ("MANO NIKILA R", "https://leetcode.com/u/Manonikila_2/"),
    ("MOHAMMED SYFUDEEN S", "https://leetcode.com/u/Syfudeen_17/"),
    ("MONISHA G", "https://leetcode.com/u/monishaganesh20/"),
    ("NISHANTH S", "https://leetcode.com/u/user7544G/"),
    ("NIVED V PUTHEN PURAKKAL", "https://leetcode.com/u/user0990Ac/"),
    ("PRADEEPA P", "https://leetcode.com/u/kit27csbs40/"),
    ("PRAKASH B", "https://leetcode.com/u/prakas_hme/"),
    ("PRAVIN M", "https://leetcode.com/u/pravin4211/"),
    ("RAGAVI A", "https://leetcode.com/u/kit27csbs43/"),
    ("RAJA S", "https://leetcode.com/u/Raja_37/"),
    ("RAJADURAI R", "https://leetcode.com/u/Rajadurai31/"),
    ("RISHI ADHINARAYAN V", "https://leetcode.com/u/rishi_adhinarayan_v"),
    ("ROBERT MITHRAN", "https://leetcode.com/u/robertmithran/"),
    ("RUDRESH M", "https://leetcode.com/u/rudreshrudhu/"),
    ("SABARI YUHENDHRAN M", "https://leetcode.com/u/sabariy_uhendhran/"),
    ("SADHANA M", "https://leetcode.com/u/kit27csbssadhana/"),
    ("SANJAY N", "https://leetcode.com/u/user8425jb/"),
    ("SARAN G", "https://leetcode.com/u/SaranGunasegaran/"),
    ("SHANMUGAPRIYA P", "https://leetcode.com/u/shamugapriya/"),
    ("SHARVESH L", "https://leetcode.com/u/sharveshl/"),
    ("SOBHIKA P M", "https://leetcode.com/u/kit27csbs55/"),
    ("SOWMIYA S R", "https://leetcode.com/u/sowmiyasr/"),
    ("SWATHI K", "https://leetcode.com/u/thecode_1215/"),
    ("THIRUMAL T", "https://leetcode.com/u/Thiru_17/"),
    ("VIGNESHKUMAR N", "https://leetcode.com/u/vignesh_59/"),
    ("VIKRAM S", "https://leetcode.com/u/vikram-s/"),
    ("VISHWA J", "https://leetcode.com/u/kit27csbs61/"),
    ("YOGANAYAHI M", "https://leetcode.com/u/kit27csbs63/"),
    ("CHANDRAN M", "https://leetcode.com/u/chandran_tech/"),
    ("NISHANTH M", "https://leetcode.com/u/Nishanth_tech/"),
]

def verify_scraped_data(student_name, leetcode_data):
    """Verify the quality of scraped data"""
    issues = []
    warnings = []
    
    if not leetcode_data:
        return ['No data returned from scraper'], []
    
    # Check essential fields
    username = leetcode_data.get('username', '')
    total_solved = leetcode_data.get('totalSolved', 0)
    rating = leetcode_data.get('rating', 0)
    contests_attended = leetcode_data.get('contestsAttended', 0)
    contest_history = leetcode_data.get('contestHistory', [])
    submission_calendar = leetcode_data.get('submissionCalendar', '{}')
    
    # Critical issues
    if not username:
        issues.append('Missing username')
    
    # Warnings
    if total_solved == 0:
        warnings.append('No problems solved (might be new account)')
    
    if rating == 0 and contests_attended > 0:
        warnings.append('Rating is 0 but contests attended > 0')
    
    # Check contest history consistency
    if contest_history:
        attended_in_history = len([c for c in contest_history if c.get('attended', False)])
        if contests_attended != attended_in_history:
            warnings.append(
                f'Contest count mismatch: {contests_attended} vs {attended_in_history} in history'
            )
    
    # Check heatmap
    if not submission_calendar or submission_calendar == '{}':
        warnings.append('Empty submission calendar')
    
    return issues, warnings

def verify_database_storage(student_name, roll_number):
    """Verify data was stored correctly in database"""
    client = MongoClient(MONGO_URI)
    db = client['go-tracker']
    
    student = db.students.find_one({
        'name': {'$regex': f'^{student_name}$', '$options': 'i'}
    })
    
    if not student:
        client.close()
        return False, ['Student not found in database after scraping']
    
    leetcode_data = student.get('platforms', {}).get('leetcode', {})
    
    if not leetcode_data:
        client.close()
        return False, ['No LeetCode data in database after scraping']
    
    has_data = bool(
        leetcode_data.get('totalSolved', 0) > 0 or 
        leetcode_data.get('username')
    )
    
    client.close()
    return has_data, []

def scrape_and_verify(student_name, leetcode_url, delay=3):
    """Scrape and verify a single student"""
    print("\n" + "="*80)
    print(f"Processing: {student_name}")
    print(f"URL: {leetcode_url}")
    print("="*80)
    
    # Extract username from URL
    match = re.search(r'leetcode\.com/u/([^/\?]+)', leetcode_url)
    if not match:
        return {
            'name': student_name,
            'status': 'FAILED',
            'error': 'Could not extract username from URL',
            'url': leetcode_url
        }
    
    username = match.group(1)
    print(f"Extracted username: {username}")
    
    # Connect to database
    client = MongoClient(MONGO_URI)
    db = client['go-tracker']
    students_collection = db.students
    
    # Find student
    student = students_collection.find_one({
        'name': {'$regex': f'^{student_name}$', '$options': 'i'}
    })
    
    if not student:
        client.close()
        return {
            'name': student_name,
            'status': 'FAILED',
            'error': 'Student not found in database',
            'url': leetcode_url
        }
    
    roll_number = student.get('rollNumber', 'N/A')
    print(f"Found student: {student_name} ({roll_number})")
    
    # Update URL and username in database
    update_data = {
        'platformLinks.leetcode': leetcode_url,
        'platformUsernames.leetcode': username
    }
    students_collection.update_one(
        {'_id': student['_id']},
        {'$set': update_data}
    )
    print(f"Updated URL and username in database")
    
    # Scrape
    print(f"\nScraping LeetCode data...")
    try:
        scraped_data = scrape_leetcode_user(username)
        
        if not scraped_data:
            client.close()
            return {
                'name': student_name,
                'roll': roll_number,
                'status': 'FAILED',
                'error': 'Scraper returned no data',
                'url': leetcode_url,
                'username': username
            }
        
        # Verify scraped data quality
        issues, warnings = verify_scraped_data(student_name, scraped_data)
        
        # Store in database
        update_data = {
            'platforms.leetcode': scraped_data,
            'lastScrapedAt': datetime.utcnow()
        }
        students_collection.update_one(
            {'_id': student['_id']},
            {'$set': update_data}
        )
        
        # Verify storage
        time.sleep(1)  # Small delay for database write
        stored_ok, storage_issues = verify_database_storage(student_name, roll_number)
        
        if not stored_ok:
            issues.extend(storage_issues)
        
        # Get summary
        problems = scraped_data.get('totalSolved', 0)
        rating = scraped_data.get('rating', 0)
        contests = scraped_data.get('contestsAttended', 0)
        
        print(f"\nSUCCESS: Scraping completed!")
        print(f"   Problems Solved: {problems}")
        print(f"   Rating: {rating}")
        print(f"   Contests Attended: {contests}")
        
        if issues:
            print(f"   ISSUES: {', '.join(issues)}")
        if warnings:
            print(f"   WARNINGS: {', '.join(warnings)}")
        
        client.close()
        
        status = 'SUCCESS' if not issues else 'PARTIAL'
        
        return {
            'name': student_name,
            'roll': roll_number,
            'status': status,
            'url': leetcode_url,
            'username': username,
            'problems': problems,
            'rating': rating,
            'contests': contests,
            'issues': issues,
            'warnings': warnings
        }
        
    except Exception as e:
        client.close()
        error_msg = str(e)
        print(f"\nERROR: Error during scraping: {error_msg}")
        return {
            'name': student_name,
            'roll': roll_number,
            'status': 'FAILED',
            'error': error_msg,
            'url': leetcode_url,
            'username': username
        }

def main():
    """Main batch scraping function"""
    print("\n" + "="*80)
    print("BATCH LEETCODE SCRAPING WITH VERIFICATION")
    print("="*80)
    print(f"Total students: {len(STUDENTS_TO_SCRAPE)}")
    print(f"Delay between requests: 3 seconds")
    print("="*80)
    
    results = []
    failed_students = []
    
    for i, (student_name, leetcode_url) in enumerate(STUDENTS_TO_SCRAPE, 1):
        print(f"\n[{i}/{len(STUDENTS_TO_SCRAPE)}]")
        
        result = scrape_and_verify(student_name, leetcode_url, delay=3)
        results.append(result)
        
        if result['status'] == 'FAILED':
            failed_students.append(result)
        
        # Delay between students (except last one)
        if i < len(STUDENTS_TO_SCRAPE):
            print(f"\nWaiting 3 seconds before next student...")
            time.sleep(3)
    
    # Summary
    print("\n" + "="*80)
    print("FINAL SUMMARY")
    print("="*80)
    
    successful = [r for r in results if r['status'] == 'SUCCESS']
    partial = [r for r in results if r['status'] == 'PARTIAL']
    failed = [r for r in results if r['status'] == 'FAILED']
    
    print(f"SUCCESS: {len(successful)}")
    print(f"PARTIAL (with warnings): {len(partial)}")
    print(f"FAILED: {len(failed)}")
    print(f"Success Rate: {((len(successful) + len(partial))/len(results)*100):.1f}%")
    
    # Save failed students to file
    if failed_students:
        print(f"\nFAILED STUDENTS ({len(failed_students)}):")
        print("="*80)
        for student in failed_students:
            print(f"  - {student['name']} ({student.get('roll', 'N/A')})")
            print(f"    URL: {student.get('url', 'N/A')}")
            print(f"    Error: {student.get('error', 'N/A')}")
            print()
        
        # Save to JSON file
        with open('failed_students.json', 'w') as f:
            json.dump(failed_students, f, indent=2, default=str)
        print(f"Failed students saved to: failed_students.json")
    
    # Save all results
    with open('scraping_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    print(f"All results saved to: scraping_results.json")
    
    print("="*80 + "\n")

if __name__ == "__main__":
    main()

