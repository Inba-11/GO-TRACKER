#!/usr/bin/env python3
"""
Scrape Codolio data using the actual profile links from the database
This will fix the username mismatches and get real data
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

def scrape_codolio_from_url(driver, url, expected_username):
    """Scrape Codolio profile from direct URL"""
    if not url or 'codolio.com/profile/' not in url:
        return None
    
    try:
        print(f"    🌐 Visiting: {url}")
        driver.get(url)
        
        # Wait for page to load
        time.sleep(4)
        
        # Check if profile exists
        try:
            # Look for 404 or error messages
            error_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '404') or contains(text(), 'not found') or contains(text(), 'Not Found')]")
            if error_elements:
                print(f"    ❌ Profile not found at URL")
                return None
        except:
            pass
        
        # Extract actual username from URL
        actual_username = url.split('codolio.com/profile/')[-1].split('/')[0]
        
        # Initialize data
        data = {
            'username': actual_username,
            'totalActiveDays': 0,
            'totalContests': 0,
            'totalSubmissions': 0,
            'badges': [],
            'lastUpdated': datetime.now()
        }
        
        # Strategy 1: Look for the main stats section
        try:
            # Look for the stats cards/containers
            stats_containers = driver.find_elements(By.XPATH, "//div[contains(@class, 'bg-white') or contains(@class, 'card') or contains(@class, 'stat')]")
            
            for container in stats_containers:
                container_text = container.text.lower()
                
                # Look for Total Active Days
                if 'total active days' in container_text or 'active days' in container_text:
                    numbers = re.findall(r'\d+', container.text.replace(',', ''))
                    if numbers:
                        data['totalActiveDays'] = int(numbers[0])
                
                # Look for Total Contests
                elif 'total contests' in container_text or 'contests' in container_text:
                    numbers = re.findall(r'\d+', container.text.replace(',', ''))
                    if numbers:
                        data['totalContests'] = int(numbers[0])
                
                # Look for Total Submissions/Questions
                elif 'total questions' in container_text or 'total submissions' in container_text or 'questions' in container_text:
                    numbers = re.findall(r'\d+', container.text.replace(',', ''))
                    if numbers:
                        data['totalSubmissions'] = int(numbers[0])
        except Exception as e:
            print(f"    ⚠️ Strategy 1 failed: {str(e)[:50]}")
        
        # Strategy 2: Look for large numbers with specific classes
        try:
            # Look for large text elements (common in Codolio)
            large_numbers = driver.find_elements(By.XPATH, "//span[contains(@class, 'text-5xl') or contains(@class, 'text-6xl') or contains(@class, 'text-4xl') or contains(@class, 'font-extrabold') or contains(@class, 'font-bold')]")
            
            number_values = []
            for element in large_numbers:
                text = element.text.strip()
                if text and text.isdigit():
                    number_values.append(int(text))
            
            # Assign numbers based on typical Codolio layout
            if len(number_values) >= 1 and data['totalSubmissions'] == 0:
                data['totalSubmissions'] = number_values[0]  # Usually first large number
            if len(number_values) >= 2 and data['totalContests'] == 0:
                data['totalContests'] = number_values[1]  # Usually second
            if len(number_values) >= 3 and data['totalActiveDays'] == 0:
                data['totalActiveDays'] = number_values[2]  # Usually third
                
        except Exception as e:
            print(f"    ⚠️ Strategy 2 failed: {str(e)[:50]}")
        
        # Strategy 3: Look for specific text patterns in page source
        try:
            page_source = driver.page_source.lower()
            
            # Look for patterns like "123 total active days"
            active_days_patterns = [
                r'(\d+)\s*total\s*active\s*days',
                r'(\d+)\s*active\s*days',
                r'active\s*days[^\d]*(\d+)',
            ]
            
            for pattern in active_days_patterns:
                match = re.search(pattern, page_source)
                if match and data['totalActiveDays'] == 0:
                    data['totalActiveDays'] = int(match.group(1))
                    break
            
            # Look for contest patterns
            contest_patterns = [
                r'(\d+)\s*total\s*contests',
                r'(\d+)\s*contests',
                r'contests[^\d]*(\d+)',
            ]
            
            for pattern in contest_patterns:
                match = re.search(pattern, page_source)
                if match and data['totalContests'] == 0:
                    data['totalContests'] = int(match.group(1))
                    break
            
            # Look for submission patterns
            submission_patterns = [
                r'(\d+)\s*total\s*questions',
                r'(\d+)\s*total\s*submissions',
                r'(\d+)\s*questions',
                r'(\d+)\s*submissions',
                r'questions[^\d]*(\d+)',
                r'submissions[^\d]*(\d+)',
            ]
            
            for pattern in submission_patterns:
                match = re.search(pattern, page_source)
                if match and data['totalSubmissions'] == 0:
                    data['totalSubmissions'] = int(match.group(1))
                    break
                    
        except Exception as e:
            print(f"    ⚠️ Strategy 3 failed: {str(e)[:50]}")
        
        # Strategy 4: Try to get badges
        try:
            # Look for badge images
            badge_images = driver.find_elements(By.XPATH, "//img[contains(@src, 'badge') or contains(@alt, 'badge') or contains(@class, 'badge')]")
            
            for img in badge_images:
                try:
                    badge_src = img.get_attribute('src')
                    badge_alt = img.get_attribute('alt') or 'Badge'
                    
                    if badge_src and ('badge' in badge_src.lower() or 'award' in badge_src.lower()):
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
        except Exception as e:
            print(f"    ⚠️ Badge extraction failed: {str(e)[:50]}")
        
        # Check if we got any meaningful data
        if data['totalActiveDays'] > 0 or data['totalContests'] > 0 or data['totalSubmissions'] > 0:
            return data
        else:
            print(f"    ⚠️ No meaningful data found")
            return None
            
    except Exception as e:
        print(f"    ❌ Error: {str(e)[:100]}")
        return None

def scrape_from_codolio_links():
    """Scrape Codolio data using the actual profile links"""
    
    print("\n" + "="*70)
    print("🔗 CODOLIO LINK-BASED SCRAPER")
    print("="*70)
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB")
        
        # Get students with profile not found status
        students = students_collection.find({
            'platforms.codolio.status': 'Profile Not Found'
        })
        
        failed_students = []
        for student in students:
            codolio_link = student.get('platformLinks', {}).get('codolio', '')
            if codolio_link and 'codolio.com/profile/' in codolio_link:
                failed_students.append(student)
        
        print(f"📊 Found {len(failed_students)} students with Codolio links to retry")
        
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
        
        print(f"🔄 Starting link-based Codolio scraping...")
        print(f"{'='*70}\n")
        
        for index, student in enumerate(failed_students, 1):
            name = student.get('name', 'Unknown')
            codolio_link = student.get('platformLinks', {}).get('codolio', '')
            old_username = student.get('platformUsernames', {}).get('codolio', '')
            
            print(f"[{index}/{len(failed_students)}] {name}")
            print(f"    Old Username: {old_username}")
            print(f"    Link: {codolio_link}")
            
            try:
                data = scrape_codolio_from_url(driver, codolio_link, old_username)
                
                if data and (data['totalActiveDays'] > 0 or data['totalContests'] > 0 or data['totalSubmissions'] > 0):
                    results.append(data)
                    
                    # Update MongoDB with both new username and data
                    update_result = students_collection.update_one(
                        {'_id': student['_id']},
                        {'$set': {
                            'platformUsernames.codolio': data['username'],  # Update username
                            'platforms.codolio.totalActiveDays': data['totalActiveDays'],
                            'platforms.codolio.totalContests': data['totalContests'],
                            'platforms.codolio.totalSubmissions': data['totalSubmissions'],
                            'platforms.codolio.badges': data.get('badges', []),
                            'platforms.codolio.lastUpdated': datetime.now(),
                            'platforms.codolio.status': 'Active'  # Update status
                        }}
                    )
                    
                    if update_result.modified_count > 0:
                        updated_count += 1
                        badge_count = len(data.get('badges', []))
                        print(f"    ✅ SUCCESS! Username: {data['username']} | Days: {data['totalActiveDays']} | Contests: {data['totalContests']} | Submissions: {data['totalSubmissions']} | Badges: {badge_count}")
                    else:
                        print(f"    ⚠️ Database update failed")
                        failed_count += 1
                else:
                    print(f"    ❌ No data found")
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
        print("📊 LINK-BASED SCRAPING COMPLETE!")
        print(f"{'='*70}")
        print(f"✅ Successfully updated: {updated_count}/{len(failed_students)}")
        print(f"❌ Still failed: {failed_count}/{len(failed_students)}")
        
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
    print("\n🚀 Starting link-based Codolio scraper...")
    print("⚠️  This will use actual profile links to get data and fix usernames")
    scrape_from_codolio_links()