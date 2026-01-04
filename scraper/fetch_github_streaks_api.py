"""
GitHub Streak Fetcher using github-readme-streak-stats API
Fetches streak data for all 63 students using the public API
"""
import requests
import json
import time
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN', '')

# GitHub Streak Stats API endpoint
STREAK_API_URL = "https://github-readme-streak-stats.herokuapp.com"

def fetch_streak_data(username, token=None):
    """
    Fetch streak data from github-readme-streak-stats API
    Returns JSON with streak information
    """
    try:
        # API endpoint for JSON data
        url = f"{STREAK_API_URL}/?user={username}&type=json"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Add token if available (for higher rate limits)
        if token:
            headers['Authorization'] = f'token {token}'
        
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            print(f"    ⚠️ API returned status {response.status_code}")
            return None
            
    except Exception as e:
        print(f"    ❌ Error: {e}")
        return None

def parse_streak_data(data):
    """Parse the streak data from API response"""
    if not data:
        return None
    
    try:
        return {
            'total_contributions': int(data.get('totalContributions', 0)),
            'current_streak': int(data.get('currentStreak', {}).get('length', 0)),
            'longest_streak': int(data.get('longestStreak', {}).get('length', 0)),
            'current_streak_start': data.get('currentStreak', {}).get('start', ''),
            'current_streak_end': data.get('currentStreak', {}).get('end', ''),
            'longest_streak_start': data.get('longestStreak', {}).get('start', ''),
            'longest_streak_end': data.get('longestStreak', {}).get('end', ''),
        }
    except Exception as e:
        print(f"    ⚠️ Error parsing data: {e}")
        return None

def fetch_streaks_for_all_students():
    """Fetch GitHub streaks for all 63 students"""
    
    print("\n" + "="*60)
    print("🔥 GITHUB STREAK FETCHER (Using Streak Stats API)")
    print("="*60)
    print(f"📡 API: {STREAK_API_URL}")
    print(f"📡 Connecting to MongoDB: {MONGO_URI}")
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB")
        
        # Get all active students
        students = list(students_collection.find({'isActive': True}))
        print(f"📊 Found {len(students)} active students")
        
        results = []
        updated_count = 0
        failed_count = 0
        
        print(f"\n🔄 Starting streak fetching...")
        print(f"⏱️  Delay between requests: 2 seconds")
        print(f"{'='*60}\n")
        
        for index, student in enumerate(students, 1):
            github_username = student.get('platformUsernames', {}).get('github', '')
            
            if not github_username:
                print(f"[{index}/{len(students)}] {student['name']}: ⚠️ No GitHub username")
                continue
            
            print(f"[{index}/{len(students)}] {student['name']}")
            print(f"  🔍 GitHub: {github_username}")
            
            try:
                # Fetch streak data from API
                data = fetch_streak_data(github_username, GITHUB_TOKEN)
                
                if data:
                    streak_info = parse_streak_data(data)
                    
                    if streak_info:
                        result = {
                            'username': github_username,
                            'name': student['name'],
                            'total_contributions': streak_info['total_contributions'],
                            'current_streak': streak_info['current_streak'],
                            'longest_streak': streak_info['longest_streak'],
                            'current_streak_start': streak_info['current_streak_start'],
                            'current_streak_end': streak_info['current_streak_end'],
                            'longest_streak_start': streak_info['longest_streak_start'],
                            'longest_streak_end': streak_info['longest_streak_end'],
                            'scraped_at': datetime.now()
                        }
                        
                        results.append(result)
                        
                        # Update MongoDB
                        update_data = {
                            'platforms.github.streak': streak_info['current_streak'],
                            'platforms.github.longestStreak': streak_info['longest_streak'],
                            'platforms.github.currentStreakStart': streak_info['current_streak_start'],
                            'platforms.github.currentStreakEnd': streak_info['current_streak_end'],
                            'platforms.github.longestStreakStart': streak_info['longest_streak_start'],
                            'platforms.github.longestStreakEnd': streak_info['longest_streak_end'],
                            'platforms.github.lastUpdated': datetime.now()
                        }
                        
                        students_collection.update_one(
                            {'_id': student['_id']},
                            {'$set': update_data}
                        )
                        
                        updated_count += 1
                        print(f"    ✅ Current: {streak_info['current_streak']} days ({streak_info['current_streak_start']} to {streak_info['current_streak_end']})")
                        print(f"    🏆 Longest: {streak_info['longest_streak']} days ({streak_info['longest_streak_start']} to {streak_info['longest_streak_end']})")
                        print(f"    📊 Total: {streak_info['total_contributions']} contributions")
                    else:
                        print(f"    ❌ Could not parse streak data")
                        failed_count += 1
                else:
                    print(f"    ❌ No data returned from API")
                    failed_count += 1
                    
            except Exception as e:
                print(f"    ❌ Error: {e}")
                failed_count += 1
            
            # Rate limiting - increase delay to avoid overwhelming the API
            if index < len(students):
                time.sleep(3)  # 3 seconds between requests
        
        # Save results to JSON
        output_file = 'github_streaks_api_results.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str, ensure_ascii=False)
        
        # Final statistics
        print(f"\n{'='*60}")
        print("📊 STREAK FETCHING COMPLETE!")
        print(f"{'='*60}")
        print(f"✅ Successfully updated: {updated_count}/{len(students)}")
        print(f"❌ Failed: {failed_count}/{len(students)}")
        print(f"💾 Results saved to: {output_file}")
        
        # Summary statistics
        if results:
            print(f"\n{'='*60}")
            print("📈 SUMMARY STATISTICS")
            print(f"{'='*60}")
            
            avg_current = sum(r['current_streak'] for r in results) / len(results)
            avg_longest = sum(r['longest_streak'] for r in results) / len(results)
            avg_contributions = sum(r['total_contributions'] for r in results) / len(results)
            
            print(f"Average current streak: {avg_current:.1f} days")
            print(f"Average longest streak: {avg_longest:.1f} days")
            print(f"Average total contributions: {avg_contributions:.0f}")
            
            # Top 5 current streaks
            top_current = sorted(results, key=lambda x: x['current_streak'], reverse=True)[:5]
            print(f"\n🔥 Top 5 Current Streaks:")
            for i, r in enumerate(top_current, 1):
                print(f"  {i}. {r['name']} ({r['username']}): {r['current_streak']} days")
            
            # Top 5 longest streaks
            top_longest = sorted(results, key=lambda x: x['longest_streak'], reverse=True)[:5]
            print(f"\n🏆 Top 5 Longest Streaks (All Time):")
            for i, r in enumerate(top_longest, 1):
                print(f"  {i}. {r['name']} ({r['username']}): {r['longest_streak']} days")
            
            # Top 5 contributors
            top_contrib = sorted(results, key=lambda x: x['total_contributions'], reverse=True)[:5]
            print(f"\n⭐ Top 5 Total Contributors:")
            for i, r in enumerate(top_contrib, 1):
                print(f"  {i}. {r['name']} ({r['username']}): {r['total_contributions']} contributions")
            
            # Students with active streaks
            active_streaks = [r for r in results if r['current_streak'] > 0]
            print(f"\n🎯 Students with Active Streaks: {len(active_streaks)}/{len(results)}")
            
            # Longest streak ever
            max_streak = max(results, key=lambda x: x['longest_streak'])
            print(f"\n🥇 Longest Streak Ever: {max_streak['name']} with {max_streak['longest_streak']} days!")
        
        print(f"\n{'='*60}\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("\n🚀 Using GitHub Readme Streak Stats API")
    print("📖 Source: https://github.com/DenverCoder1/github-readme-streak-stats")
    fetch_streaks_for_all_students()
