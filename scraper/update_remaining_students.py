"""
Update remaining students including INBATAMIZHAN P
"""
import requests
from bs4 import BeautifulSoup
import re
import time
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('../.env')

# Remaining students to update
REMAINING_STUDENTS = {
    "711523BCB023": "kit27csbs23",  # INBATAMIZHAN P
    "711523BCB039": "kit27.csbs39",  # NIVED V PUTHEN PURAKKAL
}

def scrape_profile(username):
    """Scrape CodeChef profile"""
    url = f"https://www.codechef.com/users/{username}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        profile_data = {
            'username': username,
            'total_contests': 0,
            'rating': 0,
            'problems_solved': 0,
            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'status': 'success'
        }
        
        # Look for "Contests (XX)" pattern
        contests_text = soup.find(string=re.compile(r'Contests\s*\(\s*\d+\s*\)'))
        if contests_text:
            match = re.search(r'Contests\s*\(\s*(\d+)\s*\)', contests_text)
            if match:
                profile_data['total_contests'] = int(match.group(1))
        
        return profile_data
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

def update_mongodb(roll_number, username, profile_data):
    """Update MongoDB"""
    try:
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/go-tracker')
        client = MongoClient(mongodb_uri)
        db = client['go-tracker']
        students = db['students']
        
        result = students.update_one(
            {'rollNumber': roll_number},
            {'$set': {
                'platforms.codechef.username': username,
                'platforms.codechef.totalContests': profile_data['total_contests'],
                'platforms.codechef.contestCountUpdatedAt': profile_data['scraped_at'],
                'platforms.codechef.lastUpdated': profile_data['scraped_at']
            }}
        )
        
        client.close()
        return result.modified_count > 0
        
    except Exception as e:
        print(f"  ❌ MongoDB error: {e}")
        return False

def main():
    print("🔄 Updating remaining students...")
    
    for roll_number, username in REMAINING_STUDENTS.items():
        print(f"\n📍 {roll_number} ({username})")
        
        profile_data = scrape_profile(username)
        
        if profile_data and profile_data['total_contests'] > 0:
            print(f"  ✅ Found {profile_data['total_contests']} contests")
            if update_mongodb(roll_number, username, profile_data):
                print(f"  ✅ MongoDB updated")
        else:
            print(f"  ⚠️ No contest data found")
        
        time.sleep(5)
    
    print("\n✅ Done!")

if __name__ == "__main__":
    main()
