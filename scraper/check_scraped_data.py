#!/usr/bin/env python3
"""
Check what data was scraped for a student
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv
import json

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def check_student_data(student_name):
    """Check scraped data for a student"""
    client = MongoClient(MONGO_URI)
    db = client['go-tracker']
    students_collection = db.students
    
    # Find student by name (case-insensitive)
    student = students_collection.find_one({
        'name': {'$regex': f'^{student_name}$', '$options': 'i'}
    })
    
    if not student:
        print(f"Student '{student_name}' not found in database")
        return
    
    print("\n" + "="*70)
    print(f"SCRAPED DATA FOR: {student.get('name', 'N/A')}")
    print("="*70)
    
    leetcode_data = student.get('platforms', {}).get('leetcode', {})
    
    if not leetcode_data:
        print("No LeetCode data found")
        return
    
    print("\n[PROFILE INFORMATION]")
    print(f"  Username: {leetcode_data.get('username', 'N/A')}")
    print(f"  Real Name: {leetcode_data.get('realName', 'N/A')}")
    print(f"  User Avatar: {leetcode_data.get('userAvatar', 'N/A')}")
    
    print("\n[PROBLEM SOLVING STATS]")
    print(f"  Total Solved: {leetcode_data.get('totalSolved', 0)}")
    print(f"  Easy Solved: {leetcode_data.get('easySolved', 0)}")
    print(f"  Medium Solved: {leetcode_data.get('mediumSolved', 0)}")
    print(f"  Hard Solved: {leetcode_data.get('hardSolved', 0)}")
    print(f"  Total Submissions: {leetcode_data.get('totalSubmissions', 0)}")
    print(f"  Acceptance Rate: {leetcode_data.get('acceptanceRate', 0)}%")
    
    print("\n[CONTEST STATS]")
    print(f"  Current Rating: {leetcode_data.get('rating', 0)}")
    print(f"  Max Rating: {leetcode_data.get('maxRating', 0)}")
    print(f"  Last Week Rating: {leetcode_data.get('lastWeekRating', 0)}")
    print(f"  Global Ranking: {leetcode_data.get('globalRanking', 0)}")
    print(f"  Profile Ranking: {leetcode_data.get('ranking', 0)}")
    print(f"  Contests Attended: {leetcode_data.get('contestsAttended', 0)}")
    print(f"  Recent Contests (7 days): {leetcode_data.get('recentContests', 0)}")
    print(f"  Top Percentage: {leetcode_data.get('topPercentage', 0)}")
    print(f"  Total Participants: {leetcode_data.get('totalParticipants', 0)}")
    
    print("\n[COMMUNITY STATS]")
    print(f"  Reputation: {leetcode_data.get('reputation', 0)}")
    print(f"  Badge: {leetcode_data.get('badge', 'N/A')}")
    print(f"  Active Badge: {leetcode_data.get('activeBadge', 'N/A')}")
    badges = leetcode_data.get('badges', [])
    print(f"  Total Badges: {len(badges)}")
    if badges:
        print(f"  Badge List: {[b.get('displayName', '') for b in badges[:5]]}")
    
    print("\n[ACTIVITY DATA]")
    print(f"  Streak: {leetcode_data.get('streak', 0)} days")
    print(f"  Total Active Days: {leetcode_data.get('totalActiveDays', 0)}")
    recent_subs = leetcode_data.get('recentSubmissions', [])
    print(f"  Recent Submissions: {len(recent_subs)}")
    
    print("\n[CONTEST HISTORY]")
    contest_history = leetcode_data.get('contestHistory', [])
    print(f"  Total Contests in History: {len(contest_history)}")
    if contest_history:
        print(f"  Latest Contest: {contest_history[0].get('title', 'N/A')}")
        print(f"  Rating Trend: {contest_history[0].get('trendDirection', 'N/A')}")
    
    print("\n[METADATA]")
    print(f"  Last Updated: {leetcode_data.get('lastUpdated', 'N/A')}")
    print(f"  Data Source: {leetcode_data.get('dataSource', 'N/A')}")
    
    print("\n" + "="*70)
    print("ALL FIELDS (JSON):")
    print("="*70)
    print(json.dumps(leetcode_data, indent=2, default=str))
    
    client.close()

if __name__ == "__main__":
    import sys
    student_name = sys.argv[1] if len(sys.argv) > 1 else "AADHAM SHARIEF A"
    check_student_data(student_name)

