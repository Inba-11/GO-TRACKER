#!/usr/bin/env python3
"""
Refined Codolio scraper that gets actual meaningful data
Filters out placeholder values like years (2026) and focuses on real stats
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import re
import requests
from bs4 import BeautifulSoup

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def setup_driver():
    """Setup Chrome driver with optimized settings"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"❌ Error setting up Chrome driver: {e}")
        return None

def is_valid_stat(value, stat_type):
    """Check if a value is a valid statistic (not a year, etc.)"""
    if value <= 0:
        return False
    
    # Filter out years and unrealistic values
    if stat_type == 'contests' and value > 1000:  # Too many contests
        return False
    if stat_type == 'days' and value > 2000:  # Too many days
        return False
    if stat_type == 'submissions' and value > 10000:  # Reasonable upper limit
        return False
    
    # Filter out common placeholder values
    if value in [2024, 2025, 2026, 404, 500]:  # Years and error codes
        return False
    
    return True

def scrape_codolio_refined(url):
    """Refined scraping that gets actual meaningful data"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        text = soup.get_text().lower()
        
        data = {
            'totalActiveDays': 0,
            'totalContests': 0,
            'totalSubmissions': 0,
            'badges': []
        }
        
        # Look for specific patterns with context
        patterns = {
            'totalActiveDays': [
                r'total\s+active\s+days\s*[:\-]?\s*(\d+)',
                r'active\s+days\s*[:\-]?\s*(\d+)',
                r'(\d+)\s+total\s+active\s+days',
                r'(\d+)\s+active\s+days',
            ],
            'totalContests': [
                r'total\s+contests\s*[:\-]?\s*(\d+)',
                r'contests\s*[:\-]?\s*(\d+)',
                r'(\d+)\s+total\s+contests',
                r'(\d+)\s+contests',
                r'contest\s+count\s*[:\-]?\s*(\d+)',
            ],
            'totalSubmissions': [
                r'total\s+(?:questions|submissions)\s*[:\-]?\s*(\d+)',
                r'(?:questions|submissions)\s*[:\-]?\s*(\d+)',
                r'(\d+)\s+total\s+(?:questions|submissions)',
                r'(\d+)\s+(?:questions|submissions)',
                r'problems?\s+solved\s*[:\-]?\s*(\d+)',
                r'(\d+)\s+problems?\s+solved',
            ]
        }
        
        # Extract data using patterns
        for key, pattern_list in patterns.items():
            for pattern in pattern_list:
                matches = re.findall(pattern, text)
                for match in matches:
                    value = int(match)
                    stat_type = key.replace('total', '').replace('Total', '').lower()
                    
                    if is_valid_stat(value, stat_type):
                        if data[key] == 0 or value > data[key]:  # Take the highest valid value
                            data[key] = value
        
        # Look for badges
        try:
            badge_imgs = soup.find_all('img', {'src': re.compile(r'badge|award', re.I)})
            for img in badge_imgs:
                src = img.get('src', '')
                alt = img.get('alt', 'Badge')
                if src:
                    data['badges'].append({
                        'name': alt,
                        'icon': src,
                        'description': alt
                    })
        except:
            pass
        
        return data if (data['totalActiveDays'] > 0 or data['totalContests'] > 0 or data['totalSubmissions'] > 0) else None
        
    except Exception as e:
        print(f"    ❌ Error: {str(e)[:50]}")
        return None

def scrape_with_selenium_refined(driver, url):
    """Selenium scraping with refined data extraction"""
    try:
        driver.get(url)
        time.sleep(5)
        
        data = {
            'totalActiveDays': 0,
            'totalContests': 0,
            'totalSubmissions': 0,
            'badges': []
        }
        
        # Look for stat cards or containers
        stat_containers = driver.find_elements(By.XPATH, "//div[contains(@class, 'card') or contains(@class, 'stat') or contains(@class, 'metric')]")
        
        for container in stat_containers:
            try:
                text = container.text.lower()
                
                # Look for active days
                if 'active' in text and 'day' in text:
                    numbers = re.findall(r'\b(\d+)\b', text)
                    for num_str in numbers:
                        num = int(num_str)
                        if is_valid_stat(num, 'days') and num > data['totalActiveDays']:
                            data['totalActiveDays'] = num
                
                # Look for contests
                elif 'contest' in text and 'total' in text:
                    numbers = re.findall(r'\b(\d+)\b', text)
                    for num_str in numbers:
                        num = int(num_str)
                        if is_valid_stat(num, 'contests') and num > data['totalContests']:
                            data['totalContests'] = num
                
                # Look for submissions
                elif ('submission' in text or 'question' in text) and ('total' in text or 'solved' in text):
                    numbers = re.findall(r'\b(\d+)\b', text)
                    for num_str in numbers:
                        num = int(num_str)
                        if is_valid_stat(num, 'submissions') and num > data['totalSubmissions']:
                            data['totalSubmissions'] = num
                            
            except:
                continue
        
        # If no data found in containers, look at all text elements
        if data['totalActiveDays'] == 0 and data['totalContests'] == 0 and data['totalSubmissions'] == 0:
            all_text = driver.find_element(By.TAG_NAME, 'body').text.lower()
            
            # Extract meaningful numbers with context
            lines = all_text.split('\n')
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Look for lines with stats
                if 'active' in line and 'day' in line:
                    numbers = re.findall(r'\b(\d+)\b', line)
                    for num_str in numbers:
                        num = int(num_str)
                        if is_valid_stat(num, 'days'):
                            data['totalActiveDays'] = max(data['totalActiveDays'], num)
                
                elif 'contest' in line:
                    numbers = re.findall(r'\b(\d+)\b', line)
                    for num_str in numbers:
                        num = int(num_str)
                        if is_valid_stat(num, 'contests'):
                            data['totalContests'] = max(data['totalContests'], num)
                
                elif 'question' in line or 'submission' in line or 'problem' in line:
                    numbers = re.findall(r'\b(\d+)\b', line)
                    for num_str in numbers:
                        num = int(num_str)
                        if is_valid_stat(num, 'submissions'):
                            data['totalSubmissions'] = max(data['totalSubmissions'], num)
        
        return data if (data['totalActiveDays'] > 0 or data['totalContests'] > 0 or data['totalSubmissions'] > 0) else None
        
    except Exception as e:
        print(f"    ❌ Selenium error: {str(e)[:50]}")
        return None

def refined_codolio_scraping():
    """Refined Codolio scraping that gets actual meaningful data"""
    
    print("\n" + "="*70)
    print("🎯 REFINED CODOLIO SCRAPER")
    print("="*70)
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB")
        
        # Get students with Codolio links (including those we just updated)
        students = list(students_collection.find({
            'platformLinks.codolio': {'$regex': 'codolio.com/profile/'},
            '$or': [
                {'platforms.codolio.status': 'Profile Not Found'},
                {'platforms.codolio.status': 'Active'},
                {'platforms.codolio.totalActiveDays': 0, 'platforms.codolio.totalSubmissions': 0}
            ]
        }))
        
        print(f"📊 Found {len(students)} students to refine data for")
        
        # Setup Selenium driver
        print("🌐 Setting up Chrome driver...")
        driver = setup_driver()
        
        if not driver:
            print("❌ Failed to setup Chrome driver")
            return
        
        print("✅ Chrome driver ready\n")
        
        results = []
        updated_count = 0
        failed_count = 0
        
        print(f"🔄 Starting refined Codolio scraping...")
        print(f"{'='*70}\n")
        
        for index, student in enumerate(students, 1):
            name = student.get('name', 'Unknown')
            codolio_link = student.get('platformLinks', {}).get('codolio', '')
            
            print(f"[{index}/{len(students)}] {name}")
            print(f"    Link: {codolio_link}")
            
            data = None
            
            # Method 1: Try refined requests scraping
            print(f"    📡 Trying refined requests...")
            data = scrape_codolio_refined(codolio_link)
            
            # Method 2: Try refined Selenium if requests failed
            if not data:
                print(f"    🌐 Trying refined Selenium...")
                data = scrape_with_selenium_refined(driver, codolio_link)
            
            if data and (data['totalActiveDays'] > 0 or data['totalContests'] > 0 or data['totalSubmissions'] > 0):
                # Extract username from URL
                actual_username = codolio_link.split('codolio.com/profile/')[-1].split('/')[0]
                data['username'] = actual_username
                data['lastUpdated'] = datetime.now()
                
                results.append(data)
                
                # Update MongoDB
                update_result = students_collection.update_one(
                    {'_id': student['_id']},
                    {'$set': {
                        'platformUsernames.codolio': actual_username,
                        'platforms.codolio.totalActiveDays': data['totalActiveDays'],
                        'platforms.codolio.totalContests': data['totalContests'],
                        'platforms.codolio.totalSubmissions': data['totalSubmissions'],
                        'platforms.codolio.badges': data.get('badges', []),
                        'platforms.codolio.lastUpdated': datetime.now(),
                        'platforms.codolio.status': 'Active'
                    }}
                )
                
                if update_result.modified_count > 0:
                    updated_count += 1
                    badge_count = len(data.get('badges', []))
                    print(f"    ✅ SUCCESS! Username: {actual_username} | Days: {data['totalActiveDays']} | Contests: {data['totalContests']} | Submissions: {data['totalSubmissions']} | Badges: {badge_count}")
                else:
                    print(f"    ⚠️ Database update failed")
                    failed_count += 1
            else:
                print(f"    ❌ No meaningful data found")
                failed_count += 1
            
            # Delay between requests
            time.sleep(2)
        
        # Close driver
        driver.quit()
        
        # Final statistics
        print(f"\n{'='*70}")
        print("📊 REFINED SCRAPING COMPLETE!")
        print(f"{'='*70}")
        print(f"✅ Successfully updated: {updated_count}/{len(students)}")
        print(f"❌ Still failed: {failed_count}/{len(students)}")
        
        if results:
            print(f"\n📈 REFINED DATA:")
            for r in results:
                if r['totalActiveDays'] > 0 or r['totalContests'] > 0 or r['totalSubmissions'] > 0:
                    print(f"  {r['username']}: Days={r['totalActiveDays']}, Contests={r['totalContests']}, Submissions={r['totalSubmissions']}")
        
        print(f"\n{'='*70}\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("\n🚀 Starting refined Codolio scraper...")
    print("⚠️  This will get actual meaningful data, filtering out placeholder values")
    refined_codolio_scraping()