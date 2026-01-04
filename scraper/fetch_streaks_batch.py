"""
Fetch GitHub Streaks in Batches
Processes 20 users at a time with breaks between batches
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

# All 63 GitHub usernames
GITHUB_USERNAMES = [
    "Aadhamsharief05", "Aarthi07-V", "Abi0063", "AbinayaRenganathan2006",
    "Ahamed-ammar", "AKSHAI0426", "AlfredAntonyM07", "Anandhakumar-0013",
    "Arjun-115", "aruna7904", "HazSha28", "DELHIKRISHNAN",
    "Devanya21", "Dhiva-1510", "Dinesh0203s", "Divyadharshini18",
    "durga0103", "Githendran1403", "Gowsikakho", "HARISH112006",
    "Harivarsha09", "Harthi-s-1011", "Inba-11", "Jegan-005",
    "imirin", "joelpersonal", "Kasthuri008", "Kaviya2408",
    "Kowsalya1025", "lakshanaaaaa", "sathish1807j", "mahalakshmimariisaac33",
    "Maheshwaridhandapani", "manonikila", "Syfudeen", "Monishamatthew",
    "Nishanth-S-2005", "ignt-nived", "PRADEEPA-48", "prakashb96",
    "Pravin2182005", "Ragavi-05", "Raja-037", "Rajadurai31",
    "rishitech-cyber", "Robert-Mithhran-N", "rudreshrudhu18", "sabariyuhendh",
    "Sadhanas123", "Sanjayn230", "shanmugapriya143", "sharveshl",
    "sobhika11", "srsowmiya", "SwathiKaruppaiya15", "Thirumal5",
    "vig-nesh-kumar", "Vikramsaravanan", "VishwaJ27", "Yoganayahi",
    "chandran33", "Nishanth355183"
]

STREAK_API_URL = "https://github-readme-streak-stats.herokuapp.com"
BATCH_SIZE = 20
BREAK_TIME = 10  # seconds between batches

def fetch_streak_data(username, token=None):
    """Fetch streak data from API"""
    try:
        url = f"{STREAK_API_URL}/?user={username}&type=json"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        
        if token:
            headers['Authorization'] = f'token {token}'
        
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"    ⚠️ Status {response.status_code}")
            return None
    except Exception as e:
        print(f"    ❌ Error: {str(e)[:50]}")
        return None

def parse_streak_data(data):
    """Parse streak data"""
    if not data:
        return None
    
    try:
        return {
            'total_contributions': int(data.get('totalContributions', 0)),
            'current_streak': int(data.get('currentStreak', {}).get('length', 0)),
            'longest_streak': int(data.get('longestStreak', {}).get('length', 0)),
        }
    except:
        return None

def fetch_streaks_in_batches():
    """Fetch streaks for all users in batches"""
    
    print("\n" + "="*70)
    print("🔥 GITHUB STREAK BATCH FETCHER")
    print("="*70)
    print(f"📊 Total users: {len(GITHUB_USERNAMES)}")
    print(f"📦 Batch size: {BATCH_SIZE}")
    print(f"⏸️  Break time: {BREAK_TIME} seconds")
    print(f"📡 Connecting to MongoDB...")
    
    try:
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB\n")
        
        results = []
        total_batches = (len(GITHUB_USERNAMES) + BATCH_SIZE - 1) // BATCH_SIZE
        
        for batch_num in range(total_batches):
            start_idx = batch_num * BATCH_SIZE
            end_idx = min(start_idx + BATCH_SIZE, len(GITHUB_USERNAMES))
            batch = GITHUB_USERNAMES[start_idx:end_idx]
            
            print(f"\n{'='*70}")
            print(f"📦 BATCH {batch_num + 1}/{total_batches} - Users {start_idx + 1} to {end_idx}")
            print(f"{'='*70}\n")
            
            batch_results = []
            
            for idx, username in enumerate(batch, start=start_idx + 1):
                print(f"[{idx}/{len(GITHUB_USERNAMES)}] {username}")
                
                try:
                    data = fetch_streak_data(username, GITHUB_TOKEN)
                    
                    if data:
                        streak_info = parse_streak_data(data)
                        
                        if streak_info:
                            result = {
                                'username': username,
                                'total_contributions': streak_info['total_contributions'],
                                'current_streak': streak_info['current_streak'],
                                'longest_streak': streak_info['longest_streak'],
                                'scraped_at': datetime.now()
                            }
                            
                            batch_results.append(result)
                            results.append(result)
                            
                            # Update MongoDB
                            students_collection.update_one(
                                {'platformUsernames.github': username},
                                {'$set': {
                                    'platforms.github.streak': streak_info['current_streak'],
                                    'platforms.github.longestStreak': streak_info['longest_streak'],
                                    'platforms.github.lastUpdated': datetime.now()
                                }}
                            )
                            
                            print(f"    ✅ Current: {streak_info['current_streak']} | Longest: {streak_info['longest_streak']} | Total: {streak_info['total_contributions']}")
                        else:
                            print(f"    ❌ Could not parse data")
                    else:
                        print(f"    ❌ No data")
                        
                except Exception as e:
                    print(f"    ❌ Error: {str(e)[:50]}")
                
                time.sleep(2)  # Delay between requests
            
            # Batch summary
            print(f"\n📊 Batch {batch_num + 1} Summary: {len(batch_results)}/{len(batch)} successful")
            
            # Break between batches (except after last batch)
            if batch_num < total_batches - 1:
                print(f"\n⏸️  Taking a {BREAK_TIME} second break before next batch...")
                time.sleep(BREAK_TIME)
        
        # Save results
        output_file = 'github_streaks_batch_results.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str, ensure_ascii=False)
        
        # Final statistics
        print(f"\n{'='*70}")
        print("📊 FINAL RESULTS")
        print(f"{'='*70}")
        print(f"✅ Successfully fetched: {len(results)}/{len(GITHUB_USERNAMES)}")
        print(f"❌ Failed: {len(GITHUB_USERNAMES) - len(results)}/{len(GITHUB_USERNAMES)}")
        print(f"💾 Results saved to: {output_file}")
        
        if results:
            print(f"\n{'='*70}")
            print("📈 STATISTICS")
            print(f"{'='*70}")
            
            avg_current = sum(r['current_streak'] for r in results) / len(results)
            avg_longest = sum(r['longest_streak'] for r in results) / len(results)
            avg_contrib = sum(r['total_contributions'] for r in results) / len(results)
            
            print(f"Average current streak: {avg_current:.1f} days")
            print(f"Average longest streak: {avg_longest:.1f} days")
            print(f"Average contributions: {avg_contrib:.0f}")
            
            # Top 5 current streaks
            top_current = sorted(results, key=lambda x: x['current_streak'], reverse=True)[:5]
            print(f"\n🔥 Top 5 Current Streaks:")
            for i, r in enumerate(top_current, 1):
                print(f"  {i}. {r['username']}: {r['current_streak']} days")
            
            # Top 5 longest streaks
            top_longest = sorted(results, key=lambda x: x['longest_streak'], reverse=True)[:5]
            print(f"\n🏆 Top 5 Longest Streaks:")
            for i, r in enumerate(top_longest, 1):
                print(f"  {i}. {r['username']}: {r['longest_streak']} days")
            
            # Active streaks
            active = [r for r in results if r['current_streak'] > 0]
            print(f"\n🎯 Active Streaks: {len(active)}/{len(results)}")
        
        print(f"\n{'='*70}\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("\n🚀 Starting batch streak fetcher...")
    print("📖 Using: github-readme-streak-stats API")
    fetch_streaks_in_batches()
