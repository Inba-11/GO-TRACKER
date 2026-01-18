#!/usr/bin/env python3
"""
Update Codeforces data for a specific student
Usage: python update_codeforces_student.py <roll_number> <url_or_username>
"""

import sys
import os
import io
from datetime import datetime

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    # Note: Unbuffered output is handled via Python -u flag in Node.js commands

# Add the scraper directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient
from codeforces_scraper_enhanced import CodeforcesProfileScraper, update_mongodb
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def main():
    """Main function"""
    if len(sys.argv) < 3:
        logger.error("Usage: python update_codeforces_student.py <roll_number> <url_or_username>")
        logger.info("")
        logger.info("Examples:")
        logger.info("  python update_codeforces_student.py 711523BCB001 https://codeforces.com/profile/tourist")
        logger.info("  python update_codeforces_student.py 711523BCB001 tourist")
        sys.exit(1)
    
    roll_number = sys.argv[1]
    url_or_username = sys.argv[2]
    
    logger.info(f"")
    logger.info(f"================================================================================")
    logger.info(f"CODEFORCES STUDENT DATA UPDATER")
    logger.info(f"================================================================================")
    logger.info(f"Roll Number: {roll_number}")
    logger.info(f"URL/Username: {url_or_username}")
    logger.info(f"================================================================================")
    logger.info(f"")
    
    try:
        # Scrape Codeforces data
        scraper = CodeforcesProfileScraper(url_or_username)
        data = scraper.scrape_all()
        
        if not data:
            logger.error("❌ Failed to scrape Codeforces data")
            sys.exit(1)
        
        # Save to JSON
        scraper.save_to_json(data)
        
        # Update MongoDB
        success = update_mongodb(roll_number, data)
        
        if success:
            logger.info(f"")
            logger.info(f"================================================================================")
            logger.info(f"✅ Update Complete!")
            logger.info(f"================================================================================")
            # Add print statements for Node.js to detect success (with error handling)
            try:
                print("✅ Successfully updated Codeforces data!")
                sys.stdout.flush()
                if data and 'userInfo' in data:
                    user_info = data.get('userInfo', {})
                    problem_stats = data.get('problemStats', {})
                    print(f"   📊 Rating: {user_info.get('rating', 0)}")
                    sys.stdout.flush()
                    print(f"   🎯 Problems: {problem_stats.get('totalSolved', 0)}")
                    sys.stdout.flush()
                    print(f"   🏆 Contests: {data.get('contestStats', {}).get('totalContests', 0)}")
                    sys.stdout.flush()
            except (ValueError, OSError) as e:
                logger.warning(f"Could not write to stdout (stdout may be closed): {e}")
            sys.exit(0)
        else:
            logger.error("❌ Failed to update MongoDB")
            try:
                print("❌ Failed to update MongoDB")
                sys.stdout.flush()
            except (ValueError, OSError) as e:
                logger.warning(f"Could not write to stdout: {e}")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

