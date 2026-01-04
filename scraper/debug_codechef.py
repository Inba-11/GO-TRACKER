"""
Debug CodeChef profile scraping to find problems count
"""
import requests
from bs4 import BeautifulSoup
import re
import json

# Test with multiple students
usernames = [
    'kit27csbs01',      # AADHAM
    'ahamed_ammar07',   # AHAMED AMMAR (active)
    'kit27csbs02',      # AARTHI
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

for username in usernames:
    print(f"\n{'='*70}")
    print(f"Testing: {username}")
    print(f"{'='*70}")
    
    # Try API first
    print("\n1️⃣ Testing CodeChef API...")
    api_url = f"https://codechef-api.vercel.app/{username}"
    try:
        api_response = requests.get(api_url, timeout=10)
        if api_response.status_code == 200:
            api_data = api_response.json()
            print(f"   ✅ API Response received")
            print(f"   Rating: {api_data.get('currentRating', 0)}")
            print(f"   Max Rating: {api_data.get('highestRating', 0)}")
            
            # Check for problems
            if 'fully_solved' in api_data:
                fully_solved = api_data['fully_solved']
                print(f"   Fully Solved: {len(fully_solved) if isinstance(fully_solved, list) else 0}")
                if isinstance(fully_solved, list) and len(fully_solved) > 0:
                    print(f"   Sample problems: {fully_solved[:3]}")
            
            if 'partially_solved' in api_data:
                partially = api_data['partially_solved']
                print(f"   Partially Solved: {len(partially) if isinstance(partially, list) else 0}")
            
            # Check for problem count field
            for key in api_data.keys():
                if 'problem' in key.lower() or 'solved' in key.lower():
                    print(f"   {key}: {api_data[key]}")
        else:
            print(f"   ❌ API failed: {api_response.status_code}")
    except Exception as e:
        print(f"   ❌ API error: {e}")
    
    # Try web scraping
    print("\n2️⃣ Testing Web Scraping...")
    url = f"https://www.codechef.com/users/{username}"
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            print(f"   ✅ Page loaded")
            
            # Look for rating data section
            rating_section = soup.find('section', {'class': 'rating-data-section'})
            if rating_section:
                print(f"   ✅ Found rating-data-section")
                
                # Find all headers and values
                headers_found = rating_section.find_all(['h3', 'h4', 'h5'])
                for h in headers_found:
                    text = h.text.strip()
                    if text and len(text) < 50:
                        print(f"   Header: {text}")
                
                # Look for specific problem-related text
                all_text = rating_section.get_text()
                if 'Fully Solved' in all_text:
                    print(f"   ✅ Found 'Fully Solved' text")
                    # Extract number after "Fully Solved"
                    match = re.search(r'Fully Solved[:\s]*(\d+)', all_text)
                    if match:
                        print(f"   Problems: {match.group(1)}")
            
            # Alternative: Look for problem stats in other sections
            print("\n   Looking for alternative selectors...")
            
            # Method 1: Look for any div with problem count
            for div in soup.find_all('div', class_=re.compile('problem|stat')):
                text = div.get_text().strip()
                if 'problem' in text.lower() or 'solved' in text.lower():
                    print(f"   Found: {text[:100]}")
            
            # Method 2: Look in profile stats
            profile_stats = soup.find('div', class_='rating-data-section problems-solved')
            if profile_stats:
                print(f"   ✅ Found problems-solved section")
                print(f"   Text: {profile_stats.get_text().strip()[:200]}")
            
            # Method 3: Look for numbers in specific containers
            containers = soup.find_all('div', class_='rating-number')
            for i, container in enumerate(containers):
                print(f"   Container {i}: {container.get_text().strip()}")
            
        else:
            print(f"   ❌ Page failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Web scraping error: {e}")
    
    print()
