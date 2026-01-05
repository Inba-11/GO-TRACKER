#!/usr/bin/env python3
"""
Stable Codolio scraper - Creates fresh driver for each profile to avoid crashes
Uses actual profile links to get perfect real data
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
import re

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def create_driver():
    """Create a fresh Chrome driver instance"""
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
        print(f"❌ Error creating driver: {e}")
        return None

def extract_perfect_data(url):
    """Extract perfect Codolio data using fresh driver"""
    driver = create_driver()
    if not driver:
        return None
    
    try:
        print(f"    🌐 Loading: {url}")
        driver.get(url)
        
        # Wait for page to load
        time.sleep(6)
        
        data = {
            'totalActiveDays': 0,
            'totalContests': 0,
            'totalSubmissions': 0,
            'badges': []
        }
        
        # Get all text content
        try:
            page_text = driver.find_element(By.TAG_NAME, 'body').text
            lines = page_text.split('\n')
            
            print(f"    📄 Analyzing {len(lines)} lines of content...")
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                line_lower = line.lower()
                
                # Look for "Total Active Days" with number
                if 'total active days' in line_lower:
                    numbers = re.findall(r'\b(\d+)\b', line)
                    if numbers:
                        value = int(numbers[0])
                        if value > 0 and value < 2000:  # Reasonable range
                            data['totalActiveDays'] = value
                            print(f"    ✅ Active Days: {value}")
                
                # Look for "Total Contests" with number
                elif 'total contests' in line_lower:
                    numbers = re.findall(r'\b(\d+)\b', line)
                    if numbers:
                        value = int(numbers[0])
                        if value > 0 and value < 1000:  # Reasonable range
                            data['totalContests'] = value
                            print(f"    ✅ Contests: {value}")
                
                # Look for "Total Questions" or "Total Submissions"
                elif 'total questions' in line_lower or 'total submissions' in line_lower:
                    numbers = re.findall(r'\b(\d+)\b', line)
                    if numbers:
                        value = int(numbers[0])
                        if value > 0 and value < 10000:  # Reasonable range
                            data['totalSubmissions'] = value
                            print(f"    ✅ Submissions: {value}")
        
        except Exception as e:
            print(f"    ⚠️ Text extraction failed: {str(e)[:30]}")
        
        # Try to find large numbers in spans (Codolio's typical display)
        try:
            large_spans = driver.find_elements(By.XPATH, "//span[contains(@class, 'text-') and (contains(@class, '5xl') or contains(@class, '6xl') or contains(@class, '4xl'))]")
            
            for span in large_spans:
                try:
                    text = span.text.strip()
                    if text.isdigit():
                        number = int(text)
                        
                        # Get parent context
                        parent = span.find_element(By.XPATH, "./..")
                        parent_text = parent.text.lower()
                        
                        if 'active' in parent_text and 'day' in parent_text and data['totalActiveDays'] == 0:
                            if number > 0 and number < 2000:
                                data['totalActiveDays'] = number
                                print(f"    ✅ Active Days (span): {number}")
                        elif 'contest' in parent_text and data['totalContests'] == 0:
                            if number > 0 and number < 1000:
                                data['totalContests'] = number
                                print(f"    ✅ Contests (span): {number}")
                        elif ('question' in parent_text or 'submission' in parent_text) and data['totalSubmissions'] == 0:
                            if number > 0 and number < 10000:
                                data['totalSubmissions'] = number
                                print(f"    ✅ Submissions (span): {number}")
                except:
                    continue
        except Exception as e:
            print(f"    ⚠️ Span extraction failed: {str(e)[:30]}")
        
        # Look for badges
        try:
            badge_imgs = driver.find_elements(By.XPATH, "//img[contains(@src, 'badge') or contains(@alt, 'badge')]")
            for img in badge_imgs:
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
        
        # Return data if meaningful
        if data['totalActiveDays'] > 0 or data['totalContests'] > 0 or data['totalSubmissions'] > 0:
            return data
        else:
            print(f"    ❌ No meaningful data found")
            return None
            
    except Exception as e:
        print(f"    ❌ Error: {str(e)[:50]}")
        return None
    finally:
        try:
            driver.quit()
        except:
            pass

def stable_codolio_run():
    """Stable Codolio scraping with fresh driver for each profile"""
    
    print("\n" + "="*70)
    print("🎯 STABLE PERFECT CODOLIO SCRAPER")
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
        print("🔄 Using fresh driver for each profile to ensure stability\n")
        
        results = []
        updated_count = 0
        failed_count = 0
        
        for index, student in enumerate(codolio_students, 1):
            name = student.get('name', 'Unknown')
            codolio_link = student.get('platformLinks', {}).get('codolio', '')
            
            print(f"[{index}/{len(codolio_students)}] {name}")
            print(f"    Link: {codolio_link}")
            
            # Extract data using fresh driver
            data = extract_perfect_data(codolio_link)
            
            if data:
                # Extract username from URL
                username = codolio_link.split('codolio.com/profile/')[-1].split('/')[0]
                data['username'] = username
                data['lastUpdated'] = datetime.now()
                
                results.append(data)
                
                # Update MongoDB
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
            
            # Small delay between profiles
            time.sleep(2)
        
        # Final statistics
        print(f"{'='*70}")
        print("🎉 STABLE PERFECT SCRAPING COMPLETE!")
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
    print("\n🚀 Starting STABLE PERFECT Codolio scraper...")
    print("⚠️  This creates fresh driver for each profile to ensure stability")
    stable_codolio_run()