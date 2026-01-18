#!/usr/bin/env python3
"""
Scrape a single platform for a single student
Usage: python scrape_one_student.py <student_name_or_roll> <platform>
Example: python scrape_one_student.py "AADHAM SHARIEF A" leetcode
         python scrape_one_student.py 711523BCB001 leetcode
"""

import os
import sys
import re
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import time

# Import scrapers
from leetcode_scraper import scrape_leetcode_user
from platform_scrapers import PlatformScraper

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def scrape_one_student_one_platform(student_name_or_roll, platform):
    """Scrape one platform for one student"""
    client = MongoClient(MONGO_URI)
    db = client['go-tracker']
    students_collection = db.students
    
    # Find student by name or roll number
    query = {}
    if student_name_or_roll.isdigit() or any(c.isdigit() for c in student_name_or_roll):
        # Looks like a roll number
        query = {'rollNumber': student_name_or_roll.upper()}
    else:
        # Looks like a name
        query = {'name': {'$regex': f'^{student_name_or_roll}$', '$options': 'i'}}
    
    student = students_collection.find_one(query)
    
    if not student:
        print(f"ERROR: Student not found: {student_name_or_roll}")
        client.close()
        return
    
    print("\n" + "="*70)
    print(f"Student: {student['name']} ({student['rollNumber']})")
    print(f"Platform: {platform}")
    print("="*70)
    
    # Get username for the platform
    username = student.get('platformUsernames', {}).get(platform, '')
    
    if not username:
        # Try to extract from URL
        url = student.get('platformLinks', {}).get(platform, '')
        if url:
            if platform == 'leetcode':
                match = re.search(r'leetcode\.com/u/([^/\?]+)', url)
                username = match.group(1) if match else ''
            elif platform == 'codechef':
                match = re.search(r'codechef\.com/users/([^/\?]+)', url)
                username = match.group(1) if match else ''
            elif platform == 'codeforces':
                match = re.search(r'codeforces\.com/profile/([^/\?]+)', url)
                username = match.group(1) if match else ''
            elif platform == 'github':
                match = re.search(r'github\.com/([^/\?]+)', url)
                username = match.group(1) if match else ''
            elif platform == 'codolio':
                match = re.search(r'codolio\.com/profile/([^/\?]+)', url)
                username = match.group(1) if match else ''
            
            if username:
                print(f"Extracted username from URL: {username}")
                # Update username in database
                if 'platformUsernames' not in student:
                    student['platformUsernames'] = {}
                student['platformUsernames'][platform] = username
                students_collection.update_one(
                    {'_id': student['_id']},
                    {'$set': {'platformUsernames': student['platformUsernames']}}
                )
    
    if not username:
        print(f"ERROR: No username found for {platform}")
        print(f"TIP: Add platform link through UI or update platformUsernames.{platform}")
        print(f"Current platformLinks.{platform}: {student.get('platformLinks', {}).get(platform, 'Not set')}")
        client.close()
        return
    
    print(f"Scraping {platform} for username: {username}...\n")
    
    # Scrape the specific platform
    result = None
    if platform == 'leetcode':
        result = scrape_leetcode_user(username)
    elif platform in ['codechef', 'codeforces', 'github', 'codolio']:
        scraper = PlatformScraper(delay=2)
        if platform == 'codechef':
            result = scraper.scrape_codechef(username)
        elif platform == 'codeforces':
            result = scraper.scrape_codeforces(username)
        elif platform == 'github':
            result = scraper.scrape_github(username)
        elif platform == 'codolio':
            result = scraper.scrape_codolio(username)
    else:
        print(f"ERROR: Unknown platform: {platform}")
        print(f"Supported platforms: leetcode, codechef, codeforces, github, codolio")
        client.close()
        return
    
    if not result:
        print(f"ERROR: Failed to scrape {platform} data")
        client.close()
        return
    
    # Update student with scraped data
    update_data = {
        f'platforms.{platform}': result,
        'lastScrapedAt': datetime.now()
    }
    
    students_collection.update_one(
        {'_id': student['_id']},
        {'$set': update_data}
    )
    
    print(f"\nSUCCESS: Successfully scraped {platform} data!")
    print(f"Results:")
    if platform == 'leetcode':
        print(f"   Problems Solved: {result.get('totalSolved', 0)}")
        print(f"   Rating: {result.get('rating', 0)}")
        print(f"   Contests Attended: {result.get('contestsAttended', 0)}")
    else:
        print(f"   Data: {result}")
    
    print("\n" + "="*70)
    client.close()

if __name__ == "__main__":
    student_name_or_roll = sys.argv[1] if len(sys.argv) > 1 else "AADHAM SHARIEF A"
    platform = sys.argv[2] if len(sys.argv) > 2 else "leetcode"
    username_or_url = sys.argv[3] if len(sys.argv) > 3 else None
    
    # Extract username from URL if URL is provided
    username_override = None
    url_to_save = None
    if username_or_url:
        if username_or_url.startswith('http'):
            # It's a URL, extract username
            url_to_save = username_or_url
            if platform == 'leetcode':
                match = re.search(r'leetcode\.com/u/([^/\?]+)', username_or_url)
                username_override = match.group(1) if match else None
            elif platform == 'codechef':
                match = re.search(r'codechef\.com/users/([^/\?]+)', username_or_url)
                username_override = match.group(1) if match else None
            elif platform == 'codeforces':
                match = re.search(r'codeforces\.com/profile/([^/\?]+)', username_or_url)
                username_override = match.group(1) if match else None
            elif platform == 'github':
                match = re.search(r'github\.com/([^/\?]+)', username_or_url)
                username_override = match.group(1) if match else None
            elif platform == 'codolio':
                match = re.search(r'codolio\.com/profile/([^/\?]+)', username_or_url)
                username_override = match.group(1) if match else None
        else:
            # It's a username
            username_override = username_or_url
    
    print(f"Scraping {platform} for {student_name_or_roll}\n")
    
    if username_override or url_to_save:
        # Connect and update database first
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        query = {}
        if student_name_or_roll.isdigit() or any(c.isdigit() for c in student_name_or_roll):
            query = {'rollNumber': student_name_or_roll.upper()}
        else:
            query = {'name': {'$regex': f'^{student_name_or_roll}$', '$options': 'i'}}
        
        student = students_collection.find_one(query)
        if student:
            update_data = {}
            if username_override:
                update_data[f'platformUsernames.{platform}'] = username_override
            if url_to_save:
                update_data[f'platformLinks.{platform}'] = url_to_save
            
            if update_data:
                students_collection.update_one({'_id': student['_id']}, {'$set': update_data})
                if username_override:
                    print(f"Updated {platform} username to: {username_override}")
                if url_to_save:
                    print(f"Updated {platform} URL to: {url_to_save}")
                print()
        client.close()
    
    scrape_one_student_one_platform(student_name_or_roll, platform)

