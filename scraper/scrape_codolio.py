"""
Codolio Scraper - Fetch Total Active Days and Total Contests
Uses Selenium for JavaScript-rendered content
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import time
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

# All 63 Codolio usernames (extracted from student data)
CODOLIO_USERNAMES = [
    "Aadhamsharief_@05", "Aaruuu", "abinaya rajkumar", "Abinaya R",
    "ahamed-ammar07", "akshai0426", "Alfred", "ANANDHAKUMAR S",
    "Arjunvb", "arunaaa", "Hazeena S", "", "devanya",
    "Dhiva_S", "Dinesh_s", "divyadharshini", "durga0103", "githendran k",
    "Gowsi_7476", "Harish S", "HarivarshaSenthilKumar", "Harthi__",
    "Inba", "jegan_", "imirin", "oel_", "kasthuri",
    "Kitcsbs29", "Kowsalya_", "lakshana", "Sathish", "cVmLPWrV",
    "", "Manonikila_2", "Syfudeen", "Monisha", "Nishanth",
    "", "Pradeepa", "Prakash", "Pravin", "Ragavi",
    "Raja", "Rajadurai", "Rishi", "Robert", "Rudresh",
    "Sabari", "Sadhana", "Sanjay", "Saran@07", "ciZNdQIq",
    "sharveshl14", "Sobhika", "Sowmiya", "Swathi", "Thirumal",
    "Vignesh", "Vikram", "Vishwa", "Yoganayahi", "Chandran",
    "Nishanth"
]

def setup_driver():
    """Setup Chrome driver with headless mode"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        print(f"❌ Error setting up Chrome driver: {e}")
        print("💡 Make sure Chrome and ChromeDriver are installed")
        return None

def scrape_codolio_profile(driver, username):
    """Scrape Codolio profile for active days and contests"""
    if not username or username == "":
        return None
    
    try:
        url = f"https://codolio.com/profile/{username}"
        driver.get(url)
        
        # Wait for page to load
        time.sleep(3)
        
        # Try to find Total Active Days
        total_active_days = 0
        try:
            # Look for the element with "Total Active Days" text
            active_days_element = driver.find_element(By.XPATH, "//div[contains(text(), 'Total Active Days')]/following-sibling::span")
            total_active_days = int(active_days_element.text)
        except:
            try:
                # Alternative: look for the specific structure
                active_days_element = driver.find_element(By.XPATH, "//div[@id='total_questions']//span[@class='text-5xl font-sans dark:text-darkText-300 font-extrabold']")
                total_active_days = int(active_days_element.text)
            except:
                pass
        
        # Try to find Total Contests
        total_contests = 0
        try:
            # Look for the element with "Total Contests" text
            contests_element = driver.find_element(By.XPATH, "//div[contains(text(), 'Total Contests')]/following-sibling::span")
            total_contests = int(contests_element.text)
        except:
            try:
                # Alternative: look for text-6xl span (contests are usually larger)
                contests_element = driver.find_element(By.XPATH, "//span[@class='text-6xl dark:text-darkText-300 font-sans font-extrabold']")
                total_contests = int(contests_element.text)
            except:
                pass
        
        # Try to get total submissions
        total_submissions = 0
        try:
            submissions_element = driver.find_element(By.XPATH, "//div[contains(text(), 'Total Questions')]/following-sibling::span")
            total_submissions = int(submissions_element.text)
        except:
            pass
        
        # Try to get badges/awards
        badges = []
        try:
            # Look for the badges section
            badges_section = driver.find_element(By.ID, "badges")
            
            # Count total badges from the header
            badge_count_element = badges_section.find_element(By.XPATH, ".//span[contains(@class, 'font-bold')]")
            badge_count = int(badge_count_element.text)
            
            # Try to extract individual badge information
            badge_images = badges_section.find_elements(By.TAG_NAME, "img")
            
            for img in badge_images:
                try:
                    badge_src = img.get_attribute('src')
                    badge_alt = img.get_attribute('alt') or 'Badge'
                    
                    # Extract badge name from alt or src
                    badge_name = badge_alt
                    if 'sql' in badge_src.lower():
                        badge_name = 'SQL'
                    elif 'java' in badge_src.lower():
                        badge_name = 'Java'
                    elif 'python' in badge_src.lower():
                        badge_name = 'Python'
                    elif 'streak' in badge_src.lower():
                        badge_name = 'Streak Badge'
                    
                    badges.append({
                        'name': badge_name,
                        'icon': badge_src,
                        'description': badge_alt
                    })
                except:
                    continue
        except:
            pass
        
        return {
            'username': username,
            'totalActiveDays': total_active_days,
            'totalContests': total_contests,
            'totalSubmissions': total_submissions,
            'badges': badges,
            'lastUpdated': datetime.now()
        }
        
    except Exception as e:
        print(f"    ❌ Error: {str(e)[:50]}")
        return None

def scrape_all_codolio():
    """Scrape Codolio data for all 63 students"""
    
    print("\n" + "="*70)
    print("🎯 CODOLIO SCRAPER")
    print("="*70)
    print(f"📊 Total users: {len(CODOLIO_USERNAMES)}")
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
        
        print(f"🔄 Starting Codolio scraping...")
        print(f"{'='*70}\n")
        
        for index, username in enumerate(CODOLIO_USERNAMES, 1):
            if not username or username == "":
                print(f"[{index}/{len(CODOLIO_USERNAMES)}] ⚠️ No username")
                failed_count += 1
                continue
            
            print(f"[{index}/{len(CODOLIO_USERNAMES)}] {username}")
            
            try:
                data = scrape_codolio_profile(driver, username)
                
                if data and (data['totalActiveDays'] > 0 or data['totalContests'] > 0):
                    results.append(data)
                    
                    # Update MongoDB
                    students_collection.update_one(
                        {'platformUsernames.codolio': username},
                        {'$set': {
                            'platforms.codolio.totalActiveDays': data['totalActiveDays'],
                            'platforms.codolio.totalContests': data['totalContests'],
                            'platforms.codolio.totalSubmissions': data['totalSubmissions'],
                            'platforms.codolio.badges': data.get('badges', []),
                            'platforms.codolio.lastUpdated': datetime.now()
                        }}
                    )
                    
                    updated_count += 1
                    badge_count = len(data.get('badges', []))
                    print(f"    ✅ Active Days: {data['totalActiveDays']} | Contests: {data['totalContests']} | Submissions: {data['totalSubmissions']} | Badges: {badge_count}")
                else:
                    print(f"    ⚠️ No data found")
                    failed_count += 1
                    
            except Exception as e:
                print(f"    ❌ Error: {str(e)[:50]}")
                failed_count += 1
            
            # Small delay between requests
            time.sleep(2)
        
        # Close driver
        driver.quit()
        
        # Save results
        import json
        output_file = 'codolio_results.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str, ensure_ascii=False)
        
        # Final statistics
        print(f"\n{'='*70}")
        print("📊 SCRAPING COMPLETE!")
        print(f"{'='*70}")
        print(f"✅ Successfully updated: {updated_count}/{len(CODOLIO_USERNAMES)}")
        print(f"❌ Failed: {failed_count}/{len(CODOLIO_USERNAMES)}")
        print(f"💾 Results saved to: {output_file}")
        
        if results:
            print(f"\n{'='*70}")
            print("📈 STATISTICS")
            print(f"{'='*70}")
            
            avg_days = sum(r['totalActiveDays'] for r in results) / len(results)
            avg_contests = sum(r['totalContests'] for r in results) / len(results)
            
            print(f"Average active days: {avg_days:.1f}")
            print(f"Average contests: {avg_contests:.1f}")
            
            # Top 5 active days
            top_days = sorted(results, key=lambda x: x['totalActiveDays'], reverse=True)[:5]
            print(f"\n🔥 Top 5 Active Days:")
            for i, r in enumerate(top_days, 1):
                print(f"  {i}. {r['username']}: {r['totalActiveDays']} days")
            
            # Top 5 contests
            top_contests = sorted(results, key=lambda x: x['totalContests'], reverse=True)[:5]
            print(f"\n🏆 Top 5 Contests:")
            for i, r in enumerate(top_contests, 1):
                print(f"  {i}. {r['username']}: {r['totalContests']} contests")
        
        print(f"\n{'='*70}\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("\n🚀 Starting Codolio scraper...")
    print("⚠️  This requires Chrome and ChromeDriver to be installed")
    scrape_all_codolio()
