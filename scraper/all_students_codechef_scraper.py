"""
Comprehensive CodeChef Scraper for All 63 Students
Scrapes real contest data and total contest counts for all students
"""
import requests
from bs4 import BeautifulSoup
import re
import json
import time
import sys
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

# All 63 students' CodeChef usernames
CODECHEF_USERNAMES = {
    "711523BCB001": "kit27csbs01",
    "711523BCB002": "kit27csbs02", 
    "711523BCB003": "kit27csbs03",
    "711523BCB004": "kit27csbs04",
    "711523BCB005": "ahamed_ammar07",
    "711523BCB006": "kit27csbs06",
    "711523BCB007": "kit27csbs07",
    "711523BCB008": "kit27csbs08",
    "711523BCB009": "kit27csbs09",
    "711523BCB010": "kit27csbs10",
    "711523BCB011": "kit27csbs11",
    "711523BCB012": "kit27csbs12",
    "711523BCB013": "kit27csbs13",
    "711523BCB014": "kit27csbs14",
    "711523BCB015": "kit27csbs15",
    "711523BCB016": "kit27csbs16",
    "711523BCB017": "durga0103",
    "711523BCB018": "githendran_vfc",
    "711523BCB019": "arul_gowsi",
    "711523BCB020": "kit27csbs20",
    "711523BCB021": "kit27csbs21",
    "711523BCB022": "kit27csbs22",
    "711523BCB023": "kit27csbs23",  # INBATAMIZHAN P - already done
    "711523BCB024": "kit27csbs24",
    "711523BCB025": "imirin",
    "711523BCB026": "kit27csbs26",
    "711523BCB028": "kit27csbs28",
    "711523BCB029": "kitcsbs29",
    "711523BCB030": "ki27csbs30",
    "711523BCB031": "lakshana_11",
    "711523BCB032": "kit27csbs32",
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
    "711523BCB044": "kit27csbs44",
    "711523BCB045": "rajadurai_31",
    "711523BCB046": "rishi_tech",
    "711523BCB047": "kit27csbs47",
    "711523BCB048": "rudreshrudhu",
    "711523BCB049": "sabariyuhendh",
    "711523BCB050": "kit27csbs_50",
    "711523BCB051": "kit27csbs51",
    "711523BCB052": "kit27csbs52",
    "711523BCB053": "kit27csbs53",
    "711523BCB054": "sharveshl",
    "711523BCB055": "kit27csbs55",
    "711523BCB056": "sowmiyasr",
    "711523BCB057": "thecode_1215",
    "711523BCB058": "kit27csbs58",
    "711523BCB059": "vignesh_59",
    "711523BCB060": "kit27csbs60",
    "711523BCB061": "kit27csbs61",
    "711523BCB063": "kit27csbs63",
    "711523BCB302": "kit27csbs302",
    "711523BCB320": "nish_m_20"
}

def scrape_codechef_profile(username):
    """
    Scrape CodeChef profile for contest count and basic stats
    """
    url = f"https://www.codechef.com/users/{username}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        print(f"🔍 Scraping {username}...")
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        profile_data = {
            'username': username,
            'url': url,
            'total_contests': 0,
            'rating': 0,
            'max_rating': 0,
            'problems_solved': 0,
            'global_rank': 0,
            'country_rank': 0,
            'division': 'Unrated',
            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'status': 'success'
        }
        
        # Method 1: Look for "Contests (XX)" pattern
        contests_text = soup.find(string=re.compile(r'Contests\s*\(\s*\d+\s*\)'))
        if contests_text:
            match = re.search(r'Contests\s*\(\s*(\d+)\s*\)', contests_text)
            if match:
                profile_data['total_contests'] = int(match.group(1))
                print(f"✅ {username}: Found {profile_data['total_contests']} contests")
        
        # Method 2: Look for rating information
        rating_section = soup.find('div', class_=re.compile(r'rating', re.I))
        if rating_section:
            rating_text = rating_section.get_text()
            rating_numbers = re.findall(r'\d+', rating_text)
            if rating_numbers:
                profile_data['rating'] = int(rating_numbers[0])
        
        # Method 3: Look for problems solved
        problems_text = soup.find(string=re.compile(r'Problems\s*Solved', re.I))
        if problems_text:
            parent = problems_text.find_parent()
            if parent:
                numbers = re.findall(r'\d+', parent.get_text())
                if numbers:
                    profile_data['problems_solved'] = int(numbers[-1])
        
        # Method 4: Look for division info
        division_text = soup.find(string=re.compile(r'Div\s*\d+', re.I))
        if division_text:
            div_match = re.search(r'(Div\s*\d+)', division_text, re.I)
            if div_match:
                profile_data['division'] = div_match.group(1)
        
        # Method 5: Look for rank information
        rank_elements = soup.find_all(string=re.compile(r'Rank', re.I))
        for rank_elem in rank_elements:
            parent = rank_elem.find_parent()
            if parent:
                rank_numbers = re.findall(r'\d+', parent.get_text())
                if rank_numbers:
                    if 'global' in parent.get_text().lower():
                        profile_data['global_rank'] = int(rank_numbers[0])
                    elif 'country' in parent.get_text().lower():
                        profile_data['country_rank'] = int(rank_numbers[0])
        
        # If no contests found, try alternative methods
        if profile_data['total_contests'] == 0:
            # Look for any contest-related numbers
            all_numbers = re.findall(r'\b(\d{1,3})\b', soup.get_text())
            contest_candidates = [int(n) for n in all_numbers if 10 <= int(n) <= 500]
            if contest_candidates:
                profile_data['total_contests'] = max(contest_candidates)
                profile_data['status'] = 'estimated'
                print(f"⚠️ {username}: Estimated {profile_data['total_contests']} contests")
        
        return profile_data
        
    except requests.RequestException as e:
        print(f"❌ {username}: Network error - {e}")
        return {
            'username': username,
            'url': url,
            'total_contests': 0,
            'status': 'network_error',
            'error': str(e),
            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        print(f"❌ {username}: Parse error - {e}")
        return {
            'username': username,
            'url': url,
            'total_contests': 0,
            'status': 'parse_error',
            'error': str(e),
            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }

def update_mongodb_with_contest_data(roll_number, username, profile_data):
    """
    Update MongoDB with scraped contest data
    """
    try:
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/go-tracker')
        client = MongoClient(mongodb_uri)
        db = client['go-tracker']
        students_collection = db['students']
        
        # Update student record
        update_data = {
            'platforms.codechef.username': username,
            'platforms.codechef.totalContests': profile_data['total_contests'],
            'platforms.codechef.contestCountUpdatedAt': profile_data['scraped_at'],
            'platforms.codechef.rating': profile_data.get('rating', 0),
            'platforms.codechef.problemsSolved': profile_data.get('problems_solved', 0),
            'platforms.codechef.rank': profile_data.get('global_rank', 0),
            'platforms.codechef.lastUpdated': profile_data['scraped_at']
        }
        
        result = students_collection.update_one(
            {'rollNumber': roll_number},
            {'$set': update_data}
        )
        
        if result.modified_count > 0:
            print(f"✅ Updated MongoDB for {roll_number} ({username})")
            return True
        else:
            print(f"⚠️ No MongoDB update for {roll_number} (may not exist)")
            return False
            
        client.close()
        
    except Exception as e:
        print(f"❌ MongoDB error for {roll_number}: {e}")
        return False

def scrape_all_students():
    """
    Scrape all students' CodeChef data
    """
    print("🚀 Starting comprehensive CodeChef scraping for all 63 students...")
    print(f"📊 Total students to process: {len(CODECHEF_USERNAMES)}")
    
    results = {}
    successful_scrapes = 0
    failed_scrapes = 0
    
    for i, (roll_number, username) in enumerate(CODECHEF_USERNAMES.items(), 1):
        # Skip INBATAMIZHAN P as it's already done
        if roll_number == "711523BCB023":
            print(f"⏭️ Skipping {roll_number} ({username}) - already processed")
            continue
            
        print(f"\n[{i}/{len(CODECHEF_USERNAMES)}] Processing {roll_number} ({username})")
        
        # Scrape profile data
        profile_data = scrape_codechef_profile(username)
        results[roll_number] = profile_data
        
        # Update MongoDB
        if profile_data['status'] == 'success':
            update_mongodb_with_contest_data(roll_number, username, profile_data)
            successful_scrapes += 1
        else:
            failed_scrapes += 1
        
        # Rate limiting - wait between requests
        if i < len(CODECHEF_USERNAMES):
            print("⏳ Waiting 2 seconds...")
            time.sleep(2)
    
    # Save results to JSON
    output_file = 'all_students_codechef_data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎉 Scraping Complete!")
    print(f"✅ Successful: {successful_scrapes}")
    print(f"❌ Failed: {failed_scrapes}")
    print(f"📁 Results saved to: {output_file}")
    
    # Summary statistics
    total_contests = sum(data.get('total_contests', 0) for data in results.values())
    avg_contests = total_contests / len(results) if results else 0
    
    print(f"\n📊 Summary Statistics:")
    print(f"   Total Contests Across All Students: {total_contests}")
    print(f"   Average Contests Per Student: {avg_contests:.1f}")
    
    # Top performers
    top_performers = sorted(
        [(roll, data) for roll, data in results.items() if data.get('total_contests', 0) > 0],
        key=lambda x: x[1]['total_contests'],
        reverse=True
    )[:10]
    
    print(f"\n🏆 Top 10 Contest Participants:")
    for i, (roll, data) in enumerate(top_performers, 1):
        username = data['username']
        contests = data['total_contests']
        print(f"   {i}. {roll} ({username}): {contests} contests")
    
    return results

if __name__ == "__main__":
    results = scrape_all_students()