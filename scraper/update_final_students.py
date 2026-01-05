"""
Update final remaining students with CodeChef data
"""
import requests
from bs4 import BeautifulSoup
import re
import time
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('../.env')

# Final students to update with correct roll numbers
FINAL_STUDENTS = {
    "711523BCB022": "kit27csbs22",
    "711523BCB039": "kit27.csbs39",
    "711523BCB060": "kit27csbs60",
    "711523BCB061": "kit27csbs61",
    "711523BCB063": "kit27csbs63",
    "711523BCB302": "kit27csbs302",
    "711523BCB320": "nish_m_20"
}

def scrape_profile(username):
    """Scrape CodeChef profile"""
    url = f"https://www.codechef.com/users/{username}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
    
    try:
        print(f"  🔍 Fetching {url}")
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
        page_text = soup.get_text()
        contests_match = re.search(r'Contests\s*\(\s*(\d+)\s*\)', page_text)
        if contests_match:
            profile_data['total_contests'] = int(contests_match.group(1))
            print(f"  ✅ Found {profile_data['total_contests']} contests")
        else:
            print(f"  ⚠️ No contest count found in page")
            # Try to find any number that might be contests
            all_text = soup.get_text()
            print(f"  📄 Page length: {len(all_text)} chars")
        
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
        
        # First check if student exists
        student = students.find_one({'rollNumber': roll_number})
        if not student:
            print(f"  ⚠️ Student {roll_number} not found in database")
            # Try with different roll number format
            alt_roll = roll_number.replace('711523BCB', '71153BCB')
            student = students.find_one({'rollNumber': alt_roll})
            if student:
                roll_number = alt_roll
                print(f"  📍 Found with alternate roll: {alt_roll}")
        
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
        
        if result.modified_count > 0:
            print(f"  ✅ MongoDB updated")
            return True
        elif result.matched_count > 0:
            print(f"  ℹ️ No changes needed")
            return True
        else:
            print(f"  ⚠️ Student not found")
            return False
        
    except Exception as e:
        print(f"  ❌ MongoDB error: {e}")
        return False

def main():
    print("🔄 Updating final remaining students...")
    print(f"📊 Students to process: {len(FINAL_STUDENTS)}\n")
    
    success = 0
    failed = 0
    
    for roll_number, username in FINAL_STUDENTS.items():
        print(f"📍 {roll_number} ({username})")
        
        profile_data = scrape_profile(username)
        
        if profile_data and profile_data['total_contests'] > 0:
            if update_mongodb(roll_number, username, profile_data):
                success += 1
            else:
                failed += 1
        else:
            failed += 1
        
        print()
        time.sleep(8)  # Longer delay to avoid rate limiting
    
    print(f"🎉 Complete!")
    print(f"✅ Success: {success}")
    print(f"❌ Failed: {failed}")

if __name__ == "__main__":
    main()
