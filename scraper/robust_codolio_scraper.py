#!/usr/bin/env python3
"""
Robust Codolio scraper that handles all edge cases and uses multiple strategies
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

def setup_driver(headless=True):
    """Setup Chrome driver with optimized settings"""
    chrome_options = Options()
    if headless:
        chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    chrome_options.add_argument('--disable-web-security')
    chrome_options.add_argument('--allow-running-insecure-content')
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        return driver
    except Exception as e:
        print(f"❌ Error setting up Chrome driver: {e}")
        return None

def try_requests_scraping(url):
    """Try scraping with requests + BeautifulSoup first"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for numbers in the page
            text = soup.get_text().lower()
            
            data = {
                'totalActiveDays': 0,
                'totalContests': 0,
                'totalSubmissions': 0,
                'badges': []
            }
            
            # Extract numbers using regex patterns
            active_days_patterns = [
                r'(\d+)\s*total\s*active\s*days',
                r'(\d+)\s*active\s*days',
                r'active\s*days[^\d]*(\d+)',
            ]
            
            for pattern in active_days_patterns:
                match = re.search(pattern, text)
                if match:
                    data['totalActiveDays'] = int(match.group(1))
                    break
            
            contest_patterns = [
                r'(\d+)\s*total\s*contests',
                r'(\d+)\s*contests',
                r'contests[^\d]*(\d+)',
            ]
            
            for pattern in contest_patterns:
                match = re.search(pattern, text)
                if match:
                    data['totalContests'] = int(match.group(1))
                    break
            
            submission_patterns = [
                r'(\d+)\s*total\s*questions',
                r'(\d+)\s*total\s*submissions',
                r'(\d+)\s*questions',
                r'(\d+)\s*submissions',
            ]
            
            for pattern in submission_patterns:
                match = re.search(pattern, text)
                if match:
                    data['totalSubmissions'] = int(match.group(1))
                    break
            
            if data['totalActiveDays'] > 0 or data['totalContests'] > 0 or data['totalSubmissions'] > 0:
                return data
                
    except Exception as e:
        print(f"    ⚠️ Requests scraping failed: {str(e)[:50]}")
    
    return None

def scrape_with_selenium(driver, url):
    """Scrape using Selenium with multiple strategies"""
    try:
        print(f"    🌐 Selenium: {url}")
        driver.get(url)
        
        # Wait longer for page to load
        time.sleep(6)
        
        # Check if we're on the right page
        current_url = driver.current_url
        if 'codolio.com' not in current_url:
            print(f"    ❌ Redirected away from Codolio: {current_url}")
            return None
        
        data = {
            'totalActiveDays': 0,
            'totalContests': 0,
            'totalSubmissions': 0,
            'badges': []
        }
        
        # Strategy 1: Look for any elements containing numbers
        try:
            all_elements = driver.find_elements(By.XPATH, "//*[text()]")
            for element in all_elements:
                try:
                    text = element.text.lower().strip()
                    if not text:
                        continue
                    
                    # Look for active days
                    if ('active' in text and 'day' in text) or 'total active days' in text:
                        numbers = re.findall(r'\d+', text.replace(',', ''))
                        if numbers and data['totalActiveDays'] == 0:
                            data['totalActiveDays'] = int(numbers[0])
                    
                    # Look for contests
                    elif 'contest' in text and 'total' in text:
                        numbers = re.findall(r'\d+', text.replace(',', ''))
                        if numbers and data['totalContests'] == 0:
                            data['totalContests'] = int(numbers[0])
                    
                    # Look for submissions/questions
                    elif ('submission' in text or 'question' in text) and 'total' in text:
                        numbers = re.findall(r'\d+', text.replace(',', ''))
                        if numbers and data['totalSubmissions'] == 0:
                            data['totalSubmissions'] = int(numbers[0])
                            
                except:
                    continue
        except Exception as e:
            print(f"    ⚠️ Strategy 1 failed: {str(e)[:30]}")
        
        # Strategy 2: Look for large numbers (typical stats display)
        try:
            large_text_elements = driver.find_elements(By.XPATH, "//span[contains(@class, 'text-') or contains(@class, 'font-')]")
            numbers_found = []
            
            for element in large_text_elements:
                try:
                    text = element.text.strip()
                    if text.isdigit() and len(text) <= 4:  # Reasonable stats range
                        numbers_found.append(int(text))
                except:
                    continue
            
            # Assign numbers based on common patterns
            if len(numbers_found) >= 1 and data['totalSubmissions'] == 0:
                data['totalSubmissions'] = max(numbers_found)  # Usually the largest number
            if len(numbers_found) >= 2 and data['totalActiveDays'] == 0:
                sorted_numbers = sorted(numbers_found, reverse=True)
                data['totalActiveDays'] = sorted_numbers[1] if len(sorted_numbers) > 1 else sorted_numbers[0]
            if len(numbers_found) >= 3 and data['totalContests'] == 0:
                sorted_numbers = sorted(numbers_found, reverse=True)
                data['totalContests'] = sorted_numbers[2] if len(sorted_numbers) > 2 else sorted_numbers[-1]
                
        except Exception as e:
            print(f"    ⚠️ Strategy 2 failed: {str(e)[:30]}")
        
        # Strategy 3: Page source analysis
        try:
            page_source = driver.page_source.lower()
            
            # More flexible patterns
            patterns = {
                'totalActiveDays': [
                    r'(\d+)\s*(?:total\s*)?active\s*days?',
                    r'active\s*days?\s*[:\-]?\s*(\d+)',
                    r'days?\s*active\s*[:\-]?\s*(\d+)',
                ],
                'totalContests': [
                    r'(\d+)\s*(?:total\s*)?contests?',
                    r'contests?\s*[:\-]?\s*(\d+)',
                    r'contest\s*count\s*[:\-]?\s*(\d+)',
                ],
                'totalSubmissions': [
                    r'(\d+)\s*(?:total\s*)?(?:questions?|submissions?)',
                    r'(?:questions?|submissions?)\s*[:\-]?\s*(\d+)',
                    r'(?:questions?|submissions?)\s*solved\s*[:\-]?\s*(\d+)',
                ]
            }
            
            for key, pattern_list in patterns.items():
                if data[key] == 0:
                    for pattern in pattern_list:
                        match = re.search(pattern, page_source)
                        if match:
                            data[key] = int(match.group(1))
                            break
                            
        except Exception as e:
            print(f"    ⚠️ Strategy 3 failed: {str(e)[:30]}")
        
        # Strategy 4: Try to find badges
        try:
            badge_elements = driver.find_elements(By.XPATH, "//img[contains(@src, 'badge') or contains(@alt, 'badge')]")
            for img in badge_elements:
                try:
                    src = img.get_attribute('src')
                    alt = img.get_attribute('alt') or 'Badge'
                    if src:
                        data['badges'].append({
                            'name': alt,
                            'icon': src,
                            'description': alt
                        })
                except:
                    continue
        except:
            pass
        
        return data if (data['totalActiveDays'] > 0 or data['totalContests'] > 0 or data['totalSubmissions'] > 0) else None
        
    except Exception as e:
        print(f"    ❌ Selenium error: {str(e)[:50]}")
        return None

def robust_codolio_scraping():
    """Robust Codolio scraping using multiple methods"""
    
    print("\n" + "="*70)
    print("🚀 ROBUST CODOLIO SCRAPER")
    print("="*70)
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB")
        
        # Get students with profile not found status and valid links
        students = list(students_collection.find({
            'platforms.codolio.status': 'Profile Not Found',
            'platformLinks.codolio': {'$regex': 'codolio.com/profile/'}
        }))
        
        print(f"📊 Found {len(students)} students with Codolio links to retry")
        
        # Setup Selenium driver
        print("🌐 Setting up Chrome driver...")
        driver = setup_driver(headless=True)
        
        if not driver:
            print("❌ Failed to setup Chrome driver")
            return
        
        print("✅ Chrome driver ready\n")
        
        results = []
        updated_count = 0
        failed_count = 0
        
        print(f"🔄 Starting robust Codolio scraping...")
        print(f"{'='*70}\n")
        
        for index, student in enumerate(students, 1):
            name = student.get('name', 'Unknown')
            codolio_link = student.get('platformLinks', {}).get('codolio', '')
            old_username = student.get('platformUsernames', {}).get('codolio', '')
            
            print(f"[{index}/{len(students)}] {name}")
            print(f"    Link: {codolio_link}")
            
            data = None
            
            # Method 1: Try requests first (faster)
            print(f"    📡 Trying requests...")
            data = try_requests_scraping(codolio_link)
            
            # Method 2: Try Selenium if requests failed
            if not data:
                print(f"    🌐 Trying Selenium...")
                data = scrape_with_selenium(driver, codolio_link)
            
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
                print(f"    ❌ No data found with any method")
                failed_count += 1
            
            # Delay between requests
            time.sleep(2)
        
        # Close driver
        driver.quit()
        
        # Final statistics
        print(f"\n{'='*70}")
        print("📊 ROBUST SCRAPING COMPLETE!")
        print(f"{'='*70}")
        print(f"✅ Successfully updated: {updated_count}/{len(students)}")
        print(f"❌ Still failed: {failed_count}/{len(students)}")
        
        if results:
            print(f"\n📈 NEWLY SCRAPED DATA:")
            for r in results:
                print(f"  {r['username']}: Days={r['totalActiveDays']}, Contests={r['totalContests']}, Submissions={r['totalSubmissions']}")
        
        print(f"\n{'='*70}\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("\n🚀 Starting robust Codolio scraper...")
    print("⚠️  This will use multiple methods to get data from profile links")
    robust_codolio_scraping()