#!/usr/bin/env python3
"""
Check student data for AADHAM SHARIEF A (711523BCB001)
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient
from dotenv import load_dotenv
import json

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def check_student():
    """Check student data"""
    try:
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db['students']
        
        # Find student by roll number
        student = students_collection.find_one({
            'rollNumber': '711523BCB001'
        })
        
        if not student:
            print("❌ Student not found with roll number: 711523BCB001")
            # Try by name
            student = students_collection.find_one({
                'name': {'$regex': 'AADHAM', '$options': 'i'}
            })
            if student:
                print(f"✅ Found by name: {student.get('name')} - Roll: {student.get('rollNumber')}")
            else:
                print("❌ Student not found")
                return
        else:
            print("✅ Student found!")
        
        print("\n" + "="*70)
        print(f"STUDENT PROFILE: {student.get('name', 'N/A')}")
        print("="*70)
        print(f"Roll Number: {student.get('rollNumber', 'N/A')}")
        print(f"Email: {student.get('email', 'N/A')}")
        print(f"Batch: {student.get('batch', 'N/A')}")
        print(f"Is Active: {student.get('isActive', False)}")
        
        platforms = student.get('platforms', {})
        
        # CodeChef Data
        print("\n" + "="*70)
        print("CODECHEF DATA")
        print("="*70)
        codechef = platforms.get('codechef', {})
        if codechef:
            print(f"Username: {codechef.get('username', 'N/A')}")
            print(f"Rating: {codechef.get('rating', 0)}")
            print(f"Max Rating: {codechef.get('maxRating', 0)}")
            print(f"Total Solved: {codechef.get('totalSolved', 0)}")
            print(f"Contests Attended: {codechef.get('contestsAttended', 0)}")
            print(f"Total Submissions: {codechef.get('totalSubmissions', 0)}")
            print(f"Stars: {codechef.get('stars', 0)}★")
            print(f"Global Rank: {codechef.get('globalRank', 'N/A')}")
            print(f"Country Rank: {codechef.get('countryRank', 'N/A')}")
            
            # Heatmap data
            heatmap = codechef.get('submissionHeatmap', [])
            if heatmap:
                print(f"\nSubmission Heatmap: {len(heatmap)} days of data")
                stats = codechef.get('submissionStats', {})
                if stats:
                    print(f"  Active Days: {stats.get('daysWithSubmissions', 0)}")
                    print(f"  Max Daily: {stats.get('maxDailySubmissions', 0)}")
                    print(f"  Avg Daily: {stats.get('avgDailySubmissions', 0):.2f}")
            
            # Recent contests
            contests = codechef.get('recentContests', [])
            if contests:
                print(f"\nRecent Contests: {len(contests)} contests")
                for i, contest in enumerate(contests[:5], 1):
                    print(f"  {i}. {contest.get('name', contest.get('contestCode', 'N/A'))} - {contest.get('date', 'N/A')}")
            
            last_updated = codechef.get('updatedAt')
            if last_updated:
                print(f"\nLast Updated: {last_updated}")
        else:
            print("❌ No CodeChef data found")
        
        # LeetCode Data
        print("\n" + "="*70)
        print("LEETCODE DATA")
        print("="*70)
        leetcode = platforms.get('leetcode', {})
        if leetcode:
            print(f"Username: {leetcode.get('username', 'N/A')}")
            print(f"Total Solved: {leetcode.get('totalSolved', 0)}")
            print(f"Rating: {leetcode.get('rating', 0)}")
        else:
            print("❌ No LeetCode data found")
        
        # Other platforms
        print("\n" + "="*70)
        print("OTHER PLATFORMS")
        print("="*70)
        codeforces = platforms.get('codeforces', {})
        github = platforms.get('github', {})
        codolio = platforms.get('codolio', {})
        
        print(f"Codeforces: {'✅' if codeforces else '❌'}")
        print(f"GitHub: {'✅' if github else '❌'}")
        print(f"Codolio: {'✅' if codolio else '❌'}")
        
        print("\n" + "="*70)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    check_student()

