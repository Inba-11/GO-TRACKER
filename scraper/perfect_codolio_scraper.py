#!/usr/bin/env python3
"""
Perfect Codolio scraper - Uses actual profile links to get real data
No changes to existing data, just perfect extraction from links
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import re

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def setup_driver():
    """Setup Chrome driver for perfect scraping"""
    chrome_options = Options()
    # Use non-headless for better compatibility
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

def extract_codolio_data(driver, url):
    """Extract real Codolio data from profile page"""
    try:
        print(f"    🌐 Loading: {url}")
        driver.get(url)
        
        # Wait for page to fully load
        time.sleep(8)
        
        # Initialize data structure
        data = {
            'totalActiveDays': 0,
            'totalContests': 0,
            'totalSubmissions': 0,
            'badges': []
        }
        
        # Get page source for analysis
        page_source = driver.page_source
        page_text = driver.find_element(By.TAG_NAME, 'body').text
        
        print(f"    📄 Page loaded, analyzing content...")
        
        # Strategy 1: Look for specific stat elements
        try:
            # Find all elements that might contain stats
            stat_elements = driver.find_elements(By.XPATH, "//div | //span | //p")
            
            for element in stat_elements:
                try:
                    text = element.text.strip().lower()
                    if not text:
                        continue
                    
                    # Look for Total Active Days
                    if 'total active days' in text:
                        numbers = re.findall(r'\d+', text)
                        if numbers:
                            data['totalActiveDays'] = int(numbers[0])
                            print(f"    ✅ Found Active Days: {data['totalActiveDays']}")
                    
                    # Look for Total Contests
                    elif 'total contests' in text:
                        numbers = re.findall(r'\d+', text)
                        if numbers:
                            data['totalContests'] = int(numbers[0])
                            print(f"    ✅ Found Contests: {data['totalContests']}")
                    
                    # Look for Total Questions/Submissions
                    elif 'total questions' in text or 'total submissions' in text:
                        numbers = re.findall(r'\d+', text)
                        if numbers:
                            data['totalSubmissions'] = int(numbers[0])
                            print(f"    ✅ Found Submissions: {data['totalSubmissions']}")
                            
                except:
                    continue
        except Exception as e:
            print(f"    ⚠️ Strategy 1 failed: {str(e)[:30]}")
        
        # Strategy 2: Look for large numbers (typical Codolio display)
        try:
            # Find elements with large text classes
            large_elements = driver.find_elements(By.XPATH, "//span[contains(@class, 'text-') and (contains(@class, '5xl') or contains(@class, '6xl') or contains(@class, '4xl'))]")
            
            for element in large_elements:
                try:
                    text = element.text.strip()
                    if text.isdigit():
                        number = int(text)
                        parent_text = element.find_element(By.XPATH, "./..").text.lower()
                        
                        if 'active' in parent_text and 'day' in parent_text and data['totalActiveDays'] == 0:
                            data['totalActiveDays'] = number
                            print(f"    ✅ Found Active Days (large): {number}")
                        elif 'contest' in parent_text and data['totalContests'] == 0:
                            data['totalContests'] = number
                            print(f"    ✅ Found Contests (large): {number}")
                        elif ('question' in parent_text or 'submission' in parent_text) and data['totalSubmissions'] == 0:
                            data['totalSubmissions'] = number
                            print(f"    ✅ Found Submissions (large): {number}")
                except:
                    continue
        except Exception as e:
            print(f"    ⚠️ Strategy 2 failed: {str(e)[:30]}")
        
        # Strategy 3: Parse entire page text for patterns
        try:
            lines = page_text.split('\n')
            for line in lines:
                line = line.strip().lower()
                if not line:
                    continue
                
                # Look for "X total active days" pattern
                if 'total active days' in line and data['totalActiveDays'] == 0:
                    numbers = re.findall(r'\b(\d+)\b', line)
                    if numbers:
                        data['totalActiveDays'] = int(numbers[0])
                        print(f"    ✅ Found Active Days (text): {data['totalActiveDays']}")
                
                # Look for "X total contests" pattern
                elif 'total contests' in line and data['totalContests'] == 0:
                    numbers = re.findall(r'\b(\d+)\b', line)
                    if numbers:
                        data['totalContests'] = int(numbers[0])
                        print(f"    ✅ Found Contests (text): {data['totalContests']}")
                
                # Look for "X total questions" pattern
                elif ('total questions' in line or 'total submissions' in line) and data['totalSubmissions'] == 0:
                    numbers = re.findall(r'\b(\d+)\b', line)
                    if numbers:
                        data['totalSubmissions'] = int(numbers[0])
                        print(f"    ✅ Found Submissions (text): {data['totalSubmissions']}")
        except Exception as e:
            print(f"    ⚠️ Strategy 3 failed: {str(e)[:30]}")
        
        # Strategy 4: Look for badges
        try:
            badge_images = driver.find_elements(By.XPATH, "//img[contains(@src, 'badge') or contains(@alt, 'badge')]")
            for img in badge_images:
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
            
            if data['badges']:
                print(f"    🏆 Found {len(data['badges'])} badges")
        except:
            pass
        
        # Return data if we found anything meaningful
        if data['totalActiveDays'] > 0 or data['totalContests'] > 0 or data['totalSubmissions'] > 0:
            return data
        else:
            print(f"    ❌ No meaningful data found")
            return None
            
    except Exception as e:
        print(f"    ❌ Error loading page: {str(e)[:50]}")
        return None

def perfect_codolio_run():
    """Perfect Codolio scraping run using actual profile links"""
    
    print("\n" + "="*70)
    print("🎯 PERFECT CODOLIO SCRAPER")
    print("="*70)
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB")
        
        # Get ALL students with Codolio links
        students = list(students_collection.find({
            'platformLinks.codolio': {'$exists': True, '$ne': ''}
        }))
        
        # Filter to only those with actual codolio.com links
        codolio_students = []
        for student in students:
            link = student.get('platformLinks', {}).get('codolio', '')
            if link and 'codolio.com/profile/' in link:
                codolio_students.append(student)
        
        print(f"📊 Found {len(codolio_students)} students with Codolio profile links")
        
        # Setup Chrome driver
        print("🌐 Setting up Chrome driver...")
        driver = setup_driver()
        
        if not driver:
            print("❌ Failed to setup Chrome driver")
            return
        
        print("✅ Chrome driver ready\n")
        
        results = []
        updated_count = 0
        failed_count = 0
        
        print(f"🔄 Starting perfect Codolio scraping...")
        print(f"{'='*70}\n")
        
        for index, student in enumerate(codolio_students, 1):
            name = student.get('name', 'Unknown')
            codolio_link = student.get('platformLinks', {}).get('codolio', '')
            
            print(f"[{index}/{len(codolio_students)}] {name}")
            print(f"    Link: {codolio_link}")
            
            # Extract data from the profile
            data = extract_codolio_data(driver, codolio_link)
            
            if data:
                # Extract username from URL
                username = codolio_link.split('codolio.com/profile/')[-1].split('/')[0]
                data['username'] = username
                data['lastUpdated'] = datetime.now()
                
                results.append(data)
                
                # Update MongoDB with the real data
                update_result = students_collection.update_one(
                    {'_id': student['_id']},
                    {'$set': {
                        'platformUsernames.codolio': username,
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
                    print(f"    ✅ PERFECT! Username: {username}")
                    print(f"       📊 Days: {data['totalActiveDays']} | Contests: {data['totalContests']} | Submissions: {data['totalSubmissions']} | Badges: {badge_count}")
                else:
                    print(f"    ⚠️ Database update failed")
                    failed_count += 1
            else:
                print(f"    ❌ Could not extract data")
                failed_count += 1
            
            print()  # Empty line for readability
            
            # Small delay between requests
            time.sleep(3)
        
        # Close driver
        driver.quit()
        
        # Final statistics
        print(f"{'='*70}")
        print("🎉 PERFECT SCRAPING COMPLETE!")
        print(f"{'='*70}")
        print(f"✅ Successfully updated: {updated_count}/{len(codolio_students)}")
        print(f"❌ Failed: {failed_count}/{len(codolio_students)}")
        print(f"📈 Success rate: {(updated_count/len(codolio_students)*100):.1f}%")
        
        if results:
            print(f"\n🏆 PERFECT DATA EXTRACTED:")
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
    print("\n🚀 Starting PERFECT Codolio scraper...")
    print("⚠️  This will use actual profile links to get REAL Codolio data")
    perfect_codolio_run()