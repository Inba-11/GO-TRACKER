"""
Debug CodeChef practice page to get problems count
"""
import requests
from bs4 import BeautifulSoup
import re

username = 'ahamed_ammar07'  # Active user

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

print(f"\n{'='*70}")
print(f"Testing CodeChef Practice Page: {username}")
print(f"{'='*70}\n")

# Try different URLs
urls = [
    f"https://www.codechef.com/users/{username}",
    f"https://www.codechef.com/users/{username}/practice",
]

for url in urls:
    print(f"\n🔍 Testing: {url}")
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            print(f"   ✅ Page loaded ({len(response.text)} bytes)")
            
            # Look for problem count in various places
            
            # Method 1: Search for "problems solved" text
            text = soup.get_text()
            matches = re.findall(r'(\d+)\s*problems?\s*solved', text, re.IGNORECASE)
            if matches:
                print(f"   Method 1 - Found in text: {matches}")
            
            # Method 2: Look for specific sections
            sections = soup.find_all('section')
            for i, section in enumerate(sections):
                section_text = section.get_text()
                if 'problem' in section_text.lower() or 'solved' in section_text.lower():
                    print(f"   Method 2 - Section {i}: {section_text[:150]}")
            
            # Method 3: Look for data attributes
            elements_with_data = soup.find_all(attrs={'data-problems': True})
            if elements_with_data:
                print(f"   Method 3 - Found elements with data-problems")
                for elem in elements_with_data:
                    print(f"      {elem.get('data-problems')}")
            
            # Method 4: Look in headers
            all_headers = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5'])
            for h in all_headers:
                h_text = h.get_text().strip()
                if 'problem' in h_text.lower() or 'solved' in h_text.lower():
                    print(f"   Method 4 - Header: {h_text}")
            
            # Method 5: Look for specific classes
            problem_divs = soup.find_all('div', class_=re.compile('problem|solved'))
            if problem_divs:
                print(f"   Method 5 - Found {len(problem_divs)} divs with problem/solved class")
                for div in problem_divs[:3]:
                    print(f"      {div.get('class')}: {div.get_text().strip()[:100]}")
            
            # Method 6: Look in tables
            tables = soup.find_all('table')
            if tables:
                print(f"   Method 6 - Found {len(tables)} tables")
                for i, table in enumerate(tables):
                    rows = table.find_all('tr')
                    if rows:
                        print(f"      Table {i}: {len(rows)} rows")
            
            # Method 7: Look for JavaScript data
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string and 'problem' in script.string.lower():
                    # Look for JSON data
                    json_match = re.search(r'problems["\']?\s*:\s*(\d+)', script.string)
                    if json_match:
                        print(f"   Method 7 - Found in JS: {json_match.group(1)}")
                        break
            
        else:
            print(f"   ❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

print(f"\n{'='*70}\n")
