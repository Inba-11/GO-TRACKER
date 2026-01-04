"""
Debug GitHub contributions scraping
"""
import requests
from bs4 import BeautifulSoup
import re

username = "Ahamed-ammar"
url = f"https://github.com/{username}"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

response = requests.get(url, headers=headers, timeout=10)

if response.status_code == 200:
    soup = BeautifulSoup(response.text, 'html.parser')
    
    print(f"✅ Successfully loaded {url}\n")
    
    # Try different selectors
    print("🔍 Looking for contribution count...\n")
    
    # Method 1: h2 with class
    h2_elem = soup.find('h2', class_='f4 text-normal mb-2')
    if h2_elem:
        print(f"Method 1 (h2.f4): {h2_elem.text.strip()}")
    
    # Method 2: Look for any h2 with "contributions"
    all_h2 = soup.find_all('h2')
    for h2 in all_h2:
        if 'contribution' in h2.text.lower():
            print(f"Method 2 (h2 with 'contribution'): {h2.text.strip()}")
            match = re.search(r'([\d,]+)\s+contributions?', h2.text)
            if match:
                print(f"   → Extracted: {match.group(1)}")
    
    # Method 3: Look in calendar div
    calendar = soup.find('div', class_='js-yearly-contributions')
    if calendar:
        print(f"Method 3 (calendar div): Found")
        h2_in_calendar = calendar.find('h2')
        if h2_in_calendar:
            print(f"   Text: {h2_in_calendar.text.strip()}")
    
    # Method 4: Look for SVG graph
    svg = soup.find('svg', class_='js-calendar-graph-svg')
    if svg:
        print(f"Method 4 (SVG): Found calendar graph")
    
    # Method 5: Search all text for pattern
    print("\nMethod 5 (Full text search):")
    matches = re.findall(r'([\d,]+)\s+contributions?', response.text)
    if matches:
        print(f"   Found {len(matches)} matches: {matches[:5]}")
    
else:
    print(f"❌ Failed to load page: {response.status_code}")
