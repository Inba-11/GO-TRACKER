"""
Retry scraper for failed students with better rate limiting
Uses longer delays and retry logic to avoid 429 errors
"""
import requests
from bs4 import BeautifulSoup
import re
import json
import time
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

# Failed students from previous run
FAILED_STUDENTS = {
    "711523BCB003": "kit27csbs03",
    "711523BCB004": "kit27csbs04",
    "711523BCB006": "kit27csbs06",
    "711523BCB007": "kit27csbs07",
    "711523BCB008": "kit27csbs08",
    "711523BCB009": "kit27csbs09",
    "711523BCB011": "kit27csbs11",
    "711523BCB012": "kit27csbs12",
    "711523BCB013": "kit27csbs13",
    "711523BCB014": "kit27csbs14",
    "711523BCB016": "kit27csbs16",
    "711523BCB017": "durga0103",
    "711523BCB019": "arul_gowsi",
    "711523BCB020": "kit27csbs20",
    "711523BCB033": "kit27csbs33",
    "711523BCB034": "kit27csbs34",
    "711523BCB035": "manonikila",
    "711523BCB036": "syfudeen",
    "711523BCB037": "kit27csbs37",
    "711523BCB038": "kit27csbs38",
    "711523BCB039": "kit27.csbs39",
    "711523BCB040": "kit27csbs40",
    "711523BCB041": "prakashb",
    "711523BCB042": "pravin42",
    "711523BCB043": "kit27csbs43",
    "711523BCB054": "sharveshl",
    "711523BCB055": "kit27csbs55",
    "711523BCB056": "sowmiyasr",
    "711523BCB057": "thecode_1215",
    "711523BCB058": "kit27csbs58",
    "711523BCB059": "vignesh_59"
}

def scrape_with_retry(username, max_retries=3):
    """Scrape CodeChef profile with retry logic"""
    url = f"https://www.codechef.com/users/{username}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
    }
    
    for attempt in range(max_retries):
        try:
            print(f"  Attempt {attempt + 1}/{max_retries}...")
            response = requests.get(url, headers=headers, timeout=20)
            
            if response.status_code == 429:
                wait_time = 30 * (attempt + 1)  # Exponential backoff
                print(f"  ⚠️ Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue
                
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            profile_data = {
                'username': username,
                'url': url,
                'total_contests': 0,
                'rating': 0,
                'problems_solved': 0,
                'global_rank': 0,
                'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S'),
                'status': 'success'
            }
            
            # Look for "Contests (XX)" pattern
            contests_text = soup.find(string=re.compile(r'Contests\s*\(\s*\d+\s*\)'))
            if contests_text:
                match = re.search(r'Contests\s*\(\s*(\d+)\s*\)', contests_text)
                if match:
                    profile_data['total_contests'] = int(match.group(1))
            
            # Look for rating
            rating_section = soup.find('div', class_=re.compile(r'rating', re.I))
            if rating_section:
                rating_numbers = re.findall(r'\d+', rating_section.get_text())
                if rating_numbers:
                    profile_data['rating'] = int(rating_numbers[0])
            
            # Look for problems solved
            problems_text = soup.find(string=re.compile(r'Problems\s*Solved', re.I))
            if problems_text:
                parent = problems_text.find_parent()
                if parent:
                    numbers = re.findall(r'\d+', parent.get_text())
                    if numbers:
                        profile_data['problems_solved'] = int(numbers[-1])
            
            return profile_data
            
        except requests.RequestException as e:
            if attempt < max_retries - 1:
                wait_time = 15 * (attempt + 1)
                print(f"  ⚠️ Error: {e}. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                return {
                    'username': username,
                    'url': url,
                    'total_contests': 0,
                    'status': 'failed',
                    'error': str(e),
                    'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
                }
    
    return None

def update_mongodb(roll_number, username, profile_data):
    """Update MongoDB with scraped data"""
    try:
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/go-tracker')
        client = MongoClient(mongodb_uri)
        db = client['go-tracker']
        students_collection = db['students']
        
        update_data = {
            'platforms.codechef.username': username,
            'platforms.codechef.totalContests': profile_data['total_contests'],
            'platforms.codechef.contestCountUpdatedAt': profile_data['scraped_at'],
            'platforms.codechef.rating': profile_data.get('rating', 0),
            'platforms.codechef.problemsSolved': profile_data.get('problems_solved', 0),
            'platforms.codechef.lastUpdated': profile_data['scraped_at']
        }
        
        result = students_collection.update_one(
            {'rollNumber': roll_number},
            {'$set': update_data}
        )
        
        client.close()
        return result.modified_count > 0
        
    except Exception as e:
        print(f"  ❌ MongoDB error: {e}")
        return False

def main():
    print("🔄 Retrying failed students with better rate limiting...")
    print(f"📊 Students to retry: {len(FAILED_STUDENTS)}")
    print("⏱️ Using 10-second delays between requests\n")
    
    results = {}
    successful = 0
    failed = 0
    
    for i, (roll_number, username) in enumerate(FAILED_STUDENTS.items(), 1):
        print(f"[{i}/{len(FAILED_STUDENTS)}] {roll_number} ({username})")
        
        profile_data = scrape_with_retry(username)
        
        if profile_data and profile_data['status'] == 'success':
            if profile_data['total_contests'] > 0:
                print(f"  ✅ Found {profile_data['total_contests']} contests")
                if update_mongodb(roll_number, username, profile_data):
                    print(f"  ✅ MongoDB updated")
                successful += 1
            else:
                print(f"  ⚠️ No contest data found")
                failed += 1
        else:
            print(f"  ❌ Failed to scrape")
            failed += 1
        
        results[roll_number] = profile_data
        
        # Wait 10 seconds between requests
        if i < len(FAILED_STUDENTS):
            print("  ⏳ Waiting 10 seconds...")
            time.sleep(10)
    
    # Save results
    with open('retry_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n🎉 Retry Complete!")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    
    return results

if __name__ == "__main__":
    main()
