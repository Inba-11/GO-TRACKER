#!/usr/bin/env python3
"""
Check student status by roll number
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def check_student_by_roll(roll_number):
    """Check student data by roll number"""
    client = MongoClient(MONGO_URI)
    db = client['go-tracker']
    student = db.students.find_one({'rollNumber': roll_number})
    
    print('\n' + '='*70)
    print(f'STUDENT STATUS CHECK - {roll_number}')
    print('='*70)
    
    if not student:
        print(f'\n[NOT FOUND] Student with roll number {roll_number} NOT FOUND in database')
        client.close()
        return
    
    print(f'\n[FOUND] Student exists in Database: YES')
    
    print(f'\n[BASIC INFO]')
    print(f'  Name: {student.get("name", "N/A")}')
    print(f'  Roll Number: {student.get("rollNumber", "N/A")}')
    print(f'  Batch: {student.get("batch", "N/A")}')
    print(f'  Email: {student.get("email", "N/A")}')
    print(f'  Is Active: {student.get("isActive", False)}')
    print(f'  Last Scraped: {student.get("lastScrapedAt", "Never")}')
    
    print(f'\n[PLATFORM LINKS]')
    links = student.get('platformLinks', {})
    print(f'  LeetCode URL: {links.get("leetcode", "Not set")}')
    print(f'  CodeChef URL: {links.get("codechef", "Not set")}')
    print(f'  Codeforces URL: {links.get("codeforces", "Not set")}')
    print(f'  GitHub URL: {links.get("github", "Not set")}')
    
    print(f'\n[PLATFORM USERNAMES]')
    usernames = student.get('platformUsernames', {})
    print(f'  LeetCode: {usernames.get("leetcode", "Not set")}')
    print(f'  CodeChef: {usernames.get("codechef", "Not set")}')
    print(f'  Codeforces: {usernames.get("codeforces", "Not set")}')
    print(f'  GitHub: {usernames.get("github", "Not set")}')
    
    print(f'\n[LEETCODE DATA STATUS]')
    lc = student.get('platforms', {}).get('leetcode', {})
    has_data = bool(lc and (lc.get('totalSolved', 0) > 0 or lc.get('username')))
    print(f'  Data Scraped: {"YES" if has_data else "NO"}')
    
    if has_data:
        print(f'  Username: {lc.get("username", "N/A")}')
        print(f'  Problems Solved: {lc.get("totalSolved", 0)}')
        print(f'  Easy Solved: {lc.get("easySolved", 0)}')
        print(f'  Medium Solved: {lc.get("mediumSolved", 0)}')
        print(f'  Hard Solved: {lc.get("hardSolved", 0)}')
        print(f'  Rating: {lc.get("rating", 0)}')
        print(f'  Max Rating: {lc.get("maxRating", 0)}')
        print(f'  Contests Attended: {lc.get("contestsAttended", 0)}')
        print(f'  Global Ranking: {lc.get("globalRanking", 0)}')
        print(f'  Last Updated: {lc.get("lastUpdated", "N/A")}')
    else:
        print('  No LeetCode data found in database')
    
    print('\n' + '='*70)
    client.close()

if __name__ == "__main__":
    import sys
    roll_number = sys.argv[1] if len(sys.argv) > 1 else "711523BCB004"
    check_student_by_roll(roll_number)

