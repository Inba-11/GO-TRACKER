#!/usr/bin/env python3
"""
Improved Codolio Scraper - Fix missing data for all students
Handles edge cases and different profile layouts
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

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

# Failed usernames from the status check
FAILED_USERNAMES = [
    'Gowsi_7476', 'Manonikila', 'Syf', 'monisha.ganesh20', 'Nishanth_Sasikumar',
    'nived', 'Pradhu', 'prakashb', 'pravin-42', 'RagaviAsokan', 'Raja_37', 
    'Rajadurai31', '_myth_x_46', 'rudhu18', 'sabariyuhendhran', 'sadhana@02', 
    'SANJAY_N', 'sobhika', 'Swathi Karuppaiya', 'THIRU6', 'vignesh_59', 
    'Mr.Annonymous', 'Vishwa_J', 'yoga', 'nishanth@20'
]

def setup_driver():
    """Setup Chrome driver with optimized settings"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        return driver
    except Exception as e:
        print(f"❌ Error setting up Chrome driver: {e}")
        return None

def extract_number_from_text(text):
    """Extract number from text using regex"""
    if not text:
        return 0
    
    # Remove commas and extract numbers
    numbers = re.findall(r'\d+', text.replace(',', ''))
    return int(numbers[0]) if numbers else 0

def scrape_codolio_profile_improved(driver, username):
    """Improved Codolio profile scraper with multiple strategies"""
    if not username or username == "" or "codeforces.com" in username:
        return None
    
    try:
        url = f"https://codolio.com/profile/{username}"
        print(f"    🌐 Visiting: {url}")
        driver.get(url)
        
        # Wait for page to load
        wait = WebDriverWait(driver, 10)
        time.sleep(3)
        
        # Check if profile exists
        try:
            # Look for 404 or error messages
            error_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '404') or contains(text(), 'not found') or contains(text(), 'Not Found')]")
            if error_elements:
                print(f"    ❌ Profile not found: {username}")
                return None
        except:
            pass
        
        # Initialize data
        data = {
            'username': username,
            'totalActiveDays': 0,
            'totalContests': 0,
            'totalSubmissions': 0,
            'badges': [],
            'lastUpdated': datetime.now()
        }
        
        # Strategy 1: Look for specific stat containers
        try:
            # Find all stat containers
            stat_containers = driver.find_elements(By.XPATH, "//div[contains(@class, 'stat') or contains(@class, 'metric') or contains(@class, 'count')]")
            
            for container in stat_containers:
                text = container.text.lower()
                if 'active' in text and 'day' in text:
                    number = extract_number_from_text(container.text)
                    if number > 0:
                        data['totalActiveDays'] = number
                elif 'contest' in text:
                    number = extract_number_from_text(container.text)
                    if number > 0:
                        data['totalContests'] = number
                elif 'submission' in text or 'question' in text:
                    number = extract_number_from_text(container.text)
                    if number > 0:
                        data['totalSubmissions'] = number
        except:
            pass
        
        # Strategy 2: Look for large numbers (common pattern)
        try:
            large_numbers = driver.find_elements(By.XPATH, "//span[contains(@class, 'text-5xl') or contains(@class, 'text-6xl') or contains(@class, 'font-extrabold')]")
            
            for i, element in enumerate(large_numbers):
                number = extract_number_from_text(element.text)
                if number > 0:
                    # First large number is usually submissions/questions
                    if i == 0 and data['totalSubmissions'] == 0:
                        data['totalSubmissions'] = number
                    # Second might be contests
                    elif i == 1 and data['totalContests'] == 0:
                        data['totalContests'] = number
                    # Third might be active days
                    elif i == 2 and data['totalActiveDays'] == 0:
                        data['totalActiveDays'] = number
        except:
            pass
        
        # Strategy 3: Look for specific text patterns
        try:
            page_text = driver.page_source.lower()
            
            # Look for patterns like "123 active days"
            active_days_match = re.search(r'(\d+)\s*(?:total\s*)?active\s*days?', page_text)
            if active_days_match and data['totalActiveDays'] == 0:
                data['totalActiveDays'] = int(active_days_match.group(1))
            
            # Look for patterns like "45 contests"
            contests_match = re.search(r'(\d+)\s*(?:total\s*)?contests?', page_text)
            if contests_match and data['totalContests'] == 0:
                data['totalContests'] = int(contests_match.group(1))
            
            # Look for patterns like "567 submissions"
            submissions_match = re.search(r'(\d+)\s*(?:total\s*)?(?:submissions?|questions?)', page_text)
            if submissions_match and data['totalSubmissions'] == 0:
                data['totalSubmissions'] = int(submissions_match.group(1))
        except:
            pass
        
        # Strategy 4: Try to get badges
        try:
            # Look for badge images
            badge_images = driver.find_elements(By.XPATH, "//img[contains(@src, 'badge') or contains(@alt, 'badge') or contains(@class, 'badge')]")
            
            for img in badge_images:
                try:
                    badge_src = img.get_attribute('src')
                    badge_alt = img.get_attribute('alt') or 'Badge'
                    
                    if badge_src and 'badge' in badge_src.lower():
                        badge_name = badge_alt
                        if 'sql' in badge_src.lower():
                            badge_name = 'SQL Badge'
                        elif 'java' in badge_src.lower():
                            badge_name = 'Java Badge'
                        elif 'python' in badge_src.lower():
                            badge_name = 'Python Badge'
                        elif 'streak' in badge_src.lower():
                            badge_name = 'Streak Badge'
                        
                        data['badges'].append({
                            'name': badge_name,
                            'icon': badge_src,
                            'description': badge_alt
                        })
                except:
                    continue
        except:
            pass
        
        # Check if we got any meaningful data
        if data['totalActiveDays'] > 0 or data['totalContests'] > 0 or data['totalSubmissions'] > 0:
            return data
        else:
            print(f"    ⚠️ No meaningful data found")
            return None
            
    except Exception as e:
        print(f"    ❌ Error: {str(e)[:100]}")
        return None

def fix_codolio_data():
    """Fix Codolio data for failed usernames"""
    
    print("\n" + "="*70)
    print("🔧 CODOLIO DATA FIXER")
    print("="*70)
    print(f"📊 Failed usernames to retry: {len(FAILED_USERNAMES)}")
    print(f"📡 Connecting to MongoDB...")
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB")
        
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
        
        print(f"🔄 Starting Codolio data fixing...")
        print(f"{'='*70}\n")
        
        for index, username in enumerate(FAILED_USERNAMES, 1):
            print(f"[{index}/{len(FAILED_USERNAMES)}] {username}")
            
            try:
                data = scrape_codolio_profile_improved(driver, username)
                
                if data and (data['totalActiveDays'] > 0 or data['totalContests'] > 0 or data['totalSubmissions'] > 0):
                    results.append(data)
                    
                    # Update MongoDB
                    update_result = students_collection.update_one(
                        {'platformUsernames.codolio': username},
                        {'$set': {
                            'platforms.codolio.totalActiveDays': data['totalActiveDays'],
                            'platforms.codolio.totalContests': data['totalContests'],
                            'platforms.codolio.totalSubmissions': data['totalSubmissions'],
                            'platforms.codolio.badges': data.get('badges', []),
                            'platforms.codolio.lastUpdated': datetime.now()
                        }}
                    )
                    
                    if update_result.modified_count > 0:
                        updated_count += 1
                        badge_count = len(data.get('badges', []))
                        print(f"    ✅ Updated! Days: {data['totalActiveDays']} | Contests: {data['totalContests']} | Submissions: {data['totalSubmissions']} | Badges: {badge_count}")
                    else:
                        print(f"    ⚠️ No student found with username: {username}")
                        failed_count += 1
                else:
                    print(f"    ❌ Still no data found")
                    failed_count += 1
                    
            except Exception as e:
                print(f"    ❌ Error: {str(e)[:50]}")
                failed_count += 1
            
            # Delay between requests
            time.sleep(3)
        
        # Close driver
        driver.quit()
        
        # Final statistics
        print(f"\n{'='*70}")
        print("📊 FIXING COMPLETE!")
        print(f"{'='*70}")
        print(f"✅ Successfully updated: {updated_count}/{len(FAILED_USERNAMES)}")
        print(f"❌ Still failed: {failed_count}/{len(FAILED_USERNAMES)}")
        
        if results:
            print(f"\n📈 NEWLY FIXED DATA:")
            for r in results:
                print(f"  {r['username']}: Days={r['totalActiveDays']}, Contests={r['totalContests']}, Submissions={r['totalSubmissions']}")
        
        print(f"\n{'='*70}\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("\n🚀 Starting Codolio data fixer...")
    print("⚠️  This will retry scraping for failed usernames")
    fix_codolio_data()