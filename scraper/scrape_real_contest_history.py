"""
Scrape REAL Contest History from CodeChef Profiles for ALL Students
Extracts actual contest names, problems solved, ratings, ranks from profile pages
"""
import requests
from bs4 import BeautifulSoup
import re
import json
import time
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv('../.env')

# All students' CodeChef usernames
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
    "711523BCB023": "kit27csbs23",
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
    Scrape complete CodeChef profile data including:
    - Rating, Division, Stars
    - Global/Country Rank
    - Total Contests
    - Total Problems Solved
    - Contest History with problems solved in each
    """
    url = f"https://www.codechef.com/users/{username}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    try:
        print(f"  🔍 Fetching {url}")
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        page_text = soup.get_text()
        
        profile_data = {
            'username': username,
            'rating': 0,
            'division': 'Unrated',
            'stars': 0,
            'league': '',
            'global_rank': 0,
            'country_rank': 0,
            'total_contests': 0,
            'total_problems_solved': 0,
            'contest_history': [],
            'scraped_at': datetime.now().isoformat()
        }
        
        # Extract Rating
        rating_div = soup.find('div', class_='rating-number')
        if rating_div:
            try:
                profile_data['rating'] = int(rating_div.text.strip())
            except:
                pass
        
        # Extract Division
        div_match = re.search(r'\(Div\s*(\d+)\)', page_text)
        if div_match:
            profile_data['division'] = f"Div {div_match.group(1)}"
        
        # Extract Stars
        star_span = soup.find('span', class_='rating')
        if star_span:
            stars = star_span.text.count('★')
            profile_data['stars'] = stars
        
        # Extract League (Bronze, Silver, Gold, etc.)
        league_img = soup.find('img', alt=re.compile(r'League', re.I))
        if league_img:
            league_match = re.search(r'(\w+)\s*League', league_img.get('alt', ''))
            if league_match:
                profile_data['league'] = league_match.group(1)
        
        # Extract Global Rank
        global_rank_match = re.search(r'Global Rank[:\s]*(\d+)', page_text, re.I)
        if global_rank_match:
            profile_data['global_rank'] = int(global_rank_match.group(1))
        
        # Extract Country Rank
        country_rank_match = re.search(r'Country Rank[:\s]*(\d+)', page_text, re.I)
        if country_rank_match:
            profile_data['country_rank'] = int(country_rank_match.group(1))
        
        # Extract Total Contests
        contests_match = re.search(r'Contests\s*\(\s*(\d+)\s*\)', page_text)
        if contests_match:
            profile_data['total_contests'] = int(contests_match.group(1))
        
        # Alternative: "No. of Contests Participated: XX"
        if profile_data['total_contests'] == 0:
            alt_match = re.search(r'No\.\s*of\s*Contests\s*Participated[:\s]*(\d+)', page_text, re.I)
            if alt_match:
                profile_data['total_contests'] = int(alt_match.group(1))
        
        # Extract Total Problems Solved
        problems_match = re.search(r'Total Problems Solved[:\s]*(\d+)', page_text, re.I)
        if problems_match:
            profile_data['total_problems_solved'] = int(problems_match.group(1))
        
        # Extract Contest History
        contest_history = []
        
        # Find all contest entries in the "Contests (XX)" section
        contest_sections = soup.find_all('div', class_='content')
        
        for section in contest_sections:
            h5 = section.find('h5')
            if h5:
                contest_name_elem = h5.find('span', style=re.compile(r'font-size:\s*14px'))
                if contest_name_elem:
                    contest_name = contest_name_elem.text.strip()
                    
                    # Extract problems solved in this contest
                    problems_p = section.find('p')
                    problems_solved = []
                    
                    if problems_p:
                        problem_spans = problems_p.find_all('span', style=re.compile(r'font-size:\s*12px'))
                        for span in problem_spans:
                            problem_name = span.text.strip()
                            if problem_name and problem_name not in [',', '']:
                                problems_solved.append(problem_name)
                    
                    if contest_name:
                        contest_entry = {
                            'name': contest_name,
                            'problems_solved': problems_solved,
                            'problems_count': len(problems_solved)
                        }
                        contest_history.append(contest_entry)
        
        profile_data['contest_history'] = contest_history[:15]  # Last 15 contests
        
        print(f"  ✅ {username}: Rating {profile_data['rating']}, {profile_data['total_contests']} contests, {profile_data['total_problems_solved']} problems")
        print(f"     Contest history: {len(contest_history)} entries found")
        
        return profile_data
        
    except Exception as e:
        print(f"  ❌ Error scraping {username}: {e}")
        return None

def update_mongodb(roll_number, profile_data):
    """Update MongoDB with complete profile data"""
    try:
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/go-tracker')
        client = MongoClient(mongodb_uri)
        db = client['go-tracker']
        students = db['students']
        
        update_data = {
            'platforms.codechef.username': profile_data['username'],
            'platforms.codechef.rating': profile_data['rating'],
            'platforms.codechef.division': profile_data['division'],
            'platforms.codechef.stars': profile_data['stars'],
            'platforms.codechef.league': profile_data['league'],
            'platforms.codechef.globalRank': profile_data['global_rank'],
            'platforms.codechef.countryRank': profile_data['country_rank'],
            'platforms.codechef.totalContests': profile_data['total_contests'],
            'platforms.codechef.problemsSolved': profile_data['total_problems_solved'],
            'platforms.codechef.contestHistory': profile_data['contest_history'],
            'platforms.codechef.lastUpdated': profile_data['scraped_at']
        }
        
        result = students.update_one(
            {'rollNumber': roll_number},
            {'$set': update_data}
        )
        
        # Try alternate roll number format
        if result.modified_count == 0:
            alt_roll = roll_number.replace('711523BCB', '71153BCB')
            result = students.update_one(
                {'rollNumber': alt_roll},
                {'$set': update_data}
            )
        
        client.close()
        return result.modified_count > 0 or result.matched_count > 0
        
    except Exception as e:
        print(f"  ❌ MongoDB error: {e}")
        return False

def main():
    print("🚀 Scraping REAL Contest History for ALL Students")
    print(f"📊 Total students: {len(CODECHEF_USERNAMES)}")
    print("=" * 60)
    
    all_results = {}
    success_count = 0
    failed_count = 0
    
    for i, (roll_number, username) in enumerate(CODECHEF_USERNAMES.items(), 1):
        print(f"\n[{i}/{len(CODECHEF_USERNAMES)}] {roll_number} ({username})")
        
        profile_data = scrape_codechef_profile(username)
        
        if profile_data:
            all_results[roll_number] = profile_data
            
            if update_mongodb(roll_number, profile_data):
                print(f"  ✅ MongoDB updated")
                success_count += 1
            else:
                print(f"  ⚠️ MongoDB update failed")
                failed_count += 1
        else:
            failed_count += 1
        
        # Rate limiting - wait between requests
        if i < len(CODECHEF_USERNAMES):
            print("  ⏳ Waiting 5 seconds...")
            time.sleep(5)
    
    # Save all results to JSON
    output_file = 'all_students_real_contest_history.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 60)
    print(f"🎉 Scraping Complete!")
    print(f"✅ Success: {success_count}")
    print(f"❌ Failed: {failed_count}")
    print(f"📁 Results saved to: {output_file}")
    
    # Summary statistics
    total_contests = sum(d.get('total_contests', 0) for d in all_results.values())
    total_problems = sum(d.get('total_problems_solved', 0) for d in all_results.values())
    
    print(f"\n📊 Summary:")
    print(f"   Total Contests: {total_contests}")
    print(f"   Total Problems Solved: {total_problems}")
    
    return all_results

if __name__ == "__main__":
    main()
