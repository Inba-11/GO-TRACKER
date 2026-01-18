#!/usr/bin/env python3
"""
Scrape student data from provided LeetCode URLs
Extracts LeetCode usernames and scrapes LeetCode data for all students
"""

import os
import re
import sys
from pymongo import MongoClient
from dotenv import load_dotenv
import time
from datetime import datetime
import logging

# Import LeetCode scraper only
try:
    from leetcode_scraper import scrape_leetcode_user
except ImportError as e:
    print(f"Error importing LeetCode scraper: {e}")
    print("Make sure you're in the scraper directory")
    exit(1)

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('batch_scrape.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Student data from your list
STUDENTS_DATA = {
    'AADHAM SHARIEF A': 'https://leetcode.com/u/Aadhamsharief/',
    'AARTHI V': 'https://leetcode.com/u/kit27csbs02/',
    'ABINAYA R': 'https://leetcode.com/u/kit27csbs03/',
    'ABINAYA RENGANATHAN': 'https://leetcode.com/u/AbinayaRenganathan/',
    'AHAMED AMMAR O A': 'https://leetcode.com/u/ahamedammar25/',
    'AKSHAI KANNAA MB': 'https://leetcode.com/u/akshai426/',
    'ALFRED ANTONY M': 'https://leetcode.com/u/AlfredAntony07M/',
    'ANANDHAKUMAR S': 'https://leetcode.com/u/Anandhakumars13/',
    'ARJUN V B': 'https://leetcode.com/u/Arjun_vb/',
    'ARUNA T': 'https://leetcode.com/u/Aruna777/',
    'AYISHATHUL HAZEENA S': 'https://leetcode.com/u/Hasee_28/',
    'DELHI KRISHNAN S': 'https://leetcode.com/u/delhikrishnan/',
    'DEVANYA N': 'https://leetcode.com/u/Devanya/',
    'DHIVAKAR S': 'https://leetcode.com/u/kit27csbs14/',
    'DINESH S': 'https://leetcode.com/u/kit27csbs15',
    'DIVYADHARSHINI M': 'https://leetcode.com/u/kit27csbs16/',
    'DURGA S': 'https://leetcode.com/u/durga0103/',
    'GITHENDRAN K': 'https://leetcode.com/u/githendran14232005/',
    'GOWSIKA S A': 'https://leetcode.com/u/GowsikaArul/',
    'HARISH S': 'https://leetcode.com/u/Kit27csbs20/',
    'HARIVARSHA C S': 'https://leetcode.com/u/kit27csbs/',
    'HARTHI S': 'https://leetcode.com/u/harthi__/',
    'INBATAMIZHAN P': 'https://leetcode.com/u/inbatamizh/',
    'JEGAN S': 'https://leetcode.com/u/jegan08356/',
    'JENCY IRIN J': 'https://leetcode.com/u/user6421FH/',
    'JOEL G': 'https://leetcode.com/u/kit27csbs26/',
    'KASTHURI S': 'https://leetcode.com/u/user8879Yd/',
    'KAVIYA K': 'https://leetcode.com/u/kit27csbs29/',
    'KOWSALYA S': 'https://leetcode.com/u/Kowsalya_30/',
    'LAKSHANA S': 'https://leetcode.com/u/lakshanasampath/',
    'LOURDU SATHISH J': 'https://leetcode.com/u/sathishjl07/',
    'MAHA LAKSHMI M': 'https://leetcode.com/u/kit27csbs33/',
    'MAHESHWARI D': 'https://leetcode.com/u/Mahesh--/',
    'MANO NIKILA R': 'https://leetcode.com/u/Manonikila_2/',
    'MOHAMMED SYFUDEEN S': 'https://leetcode.com/u/Syfudeen_17/',
    'MONISHA G': 'https://leetcode.com/u/monisha_ganesh20/',
    'NISHANTH S': 'https://leetcode.com/u/user7544G/',
    'NIVED V PUTHEN PURAKKAL': 'https://leetcode.com/u/user0990Ac/',
    'PRADEEPA P': 'https://leetcode.com/u/kit27csbs40/',
    'PRAKASH B': 'https://leetcode.com/u/prakashme/',
    'PRAVIN M': 'https://leetcode.com/u/pravin4211/',
    'RAGAVI A': 'https://leetcode.com/u/kit27csbs43/',
    'RAJA S': 'https://leetcode.com/u/Raja_37/',
    'RAJADURAI R': 'https://leetcode.com/u/Rajadurai31/',
    'RISHI ADHINARAYAN V': 'https://leetcode.com/u/rishi_adhinarayan_v',
    'ROBERT MITHRAN': 'https://leetcode.com/u/robertmithran/',
    'RUDRESH M': 'https://leetcode.com/u/rudreshrudhu/',
    'SABARI YUHENDHRAN M': 'https://leetcode.com/u/sabariyuhendhran/',
    'SADHANA M': 'https://leetcode.com/u/kit27csbssadhana/',
    'SANJAY N': 'https://leetcode.com/u/user8425jb/',
    'SARAN G': 'https://leetcode.com/u/SaranGunasegaran/',
    'SHANMUGAPRIYA P': 'https://leetcode.com/u/shamugapriya/',
    'SHARVESH L': 'https://leetcode.com/u/sharveshl/',
    'SOBHIKA P M': 'https://leetcode.com/u/kit27csbs55/',
    'SOWMIYA S R': 'https://leetcode.com/u/sowmiyasr/',
    'SWATHI K': 'https://leetcode.com/u/thecode_1215/',
    'THIRUMAL T': 'https://leetcode.com/u/Thiru_17/',
    'VIGNESHKUMAR N': 'https://leetcode.com/u/vignesh_59/',
    'VIKRAM S': 'https://leetcode.com/u/vikram-s/',
    'VISHWA J': 'https://leetcode.com/u/kit27csbs61/',
    'YOGANAYAHI M': 'kit27csbs63 - LeetCode Profile',
    'CHANDRAN M': 'https://leetcode.com/u/chandran_tech/',
    'NISHANTH M': 'https://leetcode.com/u/Nishanth_tech/',
}

def extract_leetcode_username(url_or_text):
    """Extract username from LeetCode URL or text"""
    if not url_or_text or url_or_text.upper() in ['NULL', '']:
        return None
    
    url_or_text = url_or_text.strip()
    
    # Pattern 1: https://leetcode.com/u/username/ or https://leetcode.com/u/username
    match = re.search(r'leetcode\.com/u/([^/\s]+)', url_or_text)
    if match:
        return match.group(1)
    
    # Pattern 2: "username - LeetCode Profile"
    if ' - LeetCode Profile' in url_or_text:
        username = url_or_text.split(' - LeetCode Profile')[0].strip()
        return username
    
    # Pattern 3: Just the username (fallback)
    if not url_or_text.startswith('http'):
        return url_or_text.strip()
    
    return None

def scrape_student_platforms(student, usernames):
    """Scrape LeetCode only for a student
    
    Args:
        student: Student document from MongoDB
        usernames: Dict of platform usernames (only LeetCode is used)
    """
    results = {}
    errors = []
    
    # LeetCode only
    if usernames.get('leetcode'):
        try:
            logger.info(f"  🔍 Scraping LeetCode: {usernames['leetcode']}")
            data = scrape_leetcode_user(usernames['leetcode'])
            if data:
                results['leetcode'] = data
                logger.info(f"  ✅ LeetCode: {data.get('totalSolved', 0)} problems, Rating: {data.get('rating', 0)}")
            time.sleep(2)  # Rate limiting
        except Exception as e:
            logger.error(f"  ❌ LeetCode error: {e}")
            errors.append({'platform': 'leetcode', 'error': str(e)})
    
    return results, errors

def update_student_in_db(db, student_name, leetcode_url):
    """Find student by name and update with LeetCode scraped data
    
    Args:
        db: MongoDB database
        student_name: Name of the student
        leetcode_url: LeetCode URL or text
    """
    students_collection = db.students
    
    # Find student by name (case-insensitive)
    student = students_collection.find_one({
        'name': {'$regex': f'^{re.escape(student_name)}$', '$options': 'i'}
    })
    
    if not student:
        logger.warning(f"  ⚠️  Student '{student_name}' not found in database")
        return False
    
    # Extract LeetCode username
    leetcode_username = extract_leetcode_username(leetcode_url)
    
    if not leetcode_username:
        logger.warning(f"  ⚠️  Could not extract LeetCode username from: {leetcode_url}")
        return False
    
    logger.info(f"\n{'='*60}")
    logger.info(f"🎓 Processing: {student['name']} ({student.get('rollNumber', 'N/A')})")
    logger.info(f"   LeetCode URL: {leetcode_url}")
    logger.info(f"   Extracted Username: {leetcode_username}")
    logger.info(f"{'='*60}")
    
    # Update platform usernames
    update_data = {
        'platformUsernames.leetcode': leetcode_username,
        'platformLinks.leetcode': leetcode_url if leetcode_url.startswith('http') else ''
    }
    
    # Prepare usernames for scraping (LeetCode only)
    usernames = {
        'leetcode': leetcode_username
    }
    
    # Scrape LeetCode only
    results, errors = scrape_student_platforms(student, usernames)
    
    # Update platform data
    for platform, data in results.items():
        update_data[f'platforms.{platform}'] = {
            **data,
            'updatedAt': datetime.utcnow()
        }
    
    # Update last scraped time
    update_data['lastScrapedAt'] = datetime.utcnow()
    
    # Add scraping errors
    if errors:
        existing_errors = student.get('scrapingErrors', [])
        for error in errors:
            existing_errors.append({
                'platform': error['platform'],
                'error': error['error'],
                'timestamp': datetime.utcnow()
            })
        # Keep only last 10 errors
        update_data['scrapingErrors'] = existing_errors[-10:]
    
    # Update in database
    students_collection.update_one(
        {'_id': student['_id']},
        {'$set': update_data}
    )
    
    logger.info(f"  ✅ Updated database for {student['name']}")
    logger.info(f"  📊 Platforms scraped: {list(results.keys())}")
    if errors:
        logger.warning(f"  ⚠️  Errors: {len(errors)}")
    
    return True

def main():
    """Main function - supports single student or batch processing"""
    client = MongoClient(MONGO_URI)
    db = client['go-tracker']
    
    # Check if a specific student name was provided as command-line argument
    if len(sys.argv) > 1:
        student_name = sys.argv[1]
        if student_name not in STUDENTS_DATA:
            logger.error(f"❌ Student '{student_name}' not found in STUDENTS_DATA")
            logger.info(f"\nAvailable students (first 10):")
            for i, name in enumerate(list(STUDENTS_DATA.keys())[:10], 1):
                logger.info(f"  {i}. {name}")
            logger.info(f"\n... and {len(STUDENTS_DATA) - 10} more students")
            client.close()
            return
        
        leetcode_url = STUDENTS_DATA[student_name]
        logger.info(f"🎯 Scraping single student: {student_name}")
        logger.info(f"📋 LeetCode URL: {leetcode_url}\n")
        
        try:
            if update_student_in_db(db, student_name, leetcode_url):
                logger.info(f"\n✅ Successfully scraped {student_name}")
            else:
                logger.error(f"\n❌ Failed to scrape {student_name} (student not found in database)")
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
        
        client.close()
        return
    
    # Original batch processing for all students
    logger.info("🚀 Starting batch scraping from LeetCode URLs")
    logger.info(f"📋 Total students to process: {len(STUDENTS_DATA)}\n")
    logger.info("💡 Tip: To scrape a single student, run: python scrape_all_students_from_list.py \"STUDENT NAME\"\n")
    
    success_count = 0
    error_count = 0
    not_found_count = 0
    
    for idx, (student_name, leetcode_url) in enumerate(STUDENTS_DATA.items(), 1):
        try:
            logger.info(f"\n[{idx}/{len(STUDENTS_DATA)}] Processing: {student_name}")
            
            if update_student_in_db(db, student_name, leetcode_url):
                success_count += 1
            else:
                not_found_count += 1
            
            # Delay between students to avoid rate limiting
            if idx < len(STUDENTS_DATA):
                delay = 3
                logger.info(f"  ⏳ Waiting {delay} seconds before next student...")
                time.sleep(delay)
                
        except Exception as e:
            logger.error(f"  ❌ Error processing {student_name}: {e}")
            error_count += 1
            time.sleep(2)
    
    logger.info(f"\n{'='*60}")
    logger.info(f"✅ Batch scraping completed!")
    logger.info(f"   ✅ Successful: {success_count}")
    logger.info(f"   ⚠️  Not found: {not_found_count}")
    logger.info(f"   ❌ Errors: {error_count}")
    logger.info(f"   📊 Total processed: {len(STUDENTS_DATA)}")
    logger.info(f"{'='*60}")
    
    client.close()

if __name__ == "__main__":
    main()

