#!/usr/bin/env python3
"""
Production-Ready Scraping Scheduler
Clean + Safe + Auto-Updates + Rate-Limited + Logging

Update Strategy:
- LeetCode: every 30-60 mins (problem solves + rating change slowly)
- CodeChef: every 1-2 hours (avoids rate limits + fewer contests)
- Codeforces: every 30-60 mins (safe + stable)
- GitHub: every 30 mins (commits can happen anytime)
- Codolio: every 3-6 hours (JS rendering = heavier)
- Full refresh: once per day minimum
"""

import schedule
import time
import logging
import random
from datetime import datetime, timedelta
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import threading
import json

# Import our platform scrapers
scrapers = {}
try:
    from leetcode_scraper import scrape_leetcode_user
    scrapers['leetcode'] = scrape_leetcode_user
    print("✅ LeetCode scraper imported")
except ImportError as e:
    print(f"⚠️  Failed to import LeetCode scraper: {e}")

try:
    from codechef_scraper import scrape_codechef_user
    scrapers['codechef'] = scrape_codechef_user
    print("✅ CodeChef scraper imported")
except ImportError as e:
    print(f"⚠️  Failed to import CodeChef scraper: {e}")

try:
    from codeforces_scraper import scrape_codeforces_user
    scrapers['codeforces'] = scrape_codeforces_user
    print("✅ Codeforces scraper imported")
except ImportError as e:
    print(f"⚠️  Failed to import Codeforces scraper: {e}")

try:
    from github_scraper import scrape_github_user
    scrapers['github'] = scrape_github_user
    print("✅ GitHub scraper imported")
except ImportError as e:
    print(f"⚠️  Failed to import GitHub scraper: {e}")

try:
    from codolio_scraper import scrape_codolio_user
    scrapers['codolio'] = scrape_codolio_user
    print("✅ Codolio scraper imported")
except ImportError as e:
    print(f"⚠️  Failed to import Codolio scraper: {e}")

if not scrapers:
    print("❌ No scrapers could be imported!")
    raise ImportError("Failed to import any platform scrapers")

load_dotenv()

# Configuration
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Setup logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ProductionScraper:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client['go-tracker']
        self.students = self.db.students
        self.logs = self.db.scraper_logs
        self.running = False
        
    def log_activity(self, platform, username, status, message="", data_points=0):
        """Log scraping activity to MongoDB"""
        try:
            log_entry = {
                'platform': platform,
                'username': username,
                'status': status,  # success, error, skipped
                'message': message,
                'data_points': data_points,
                'timestamp': datetime.utcnow()
            }
            self.logs.insert_one(log_entry)
        except Exception as e:
            logger.error(f"Failed to log activity: {e}")
    
    def safe_delay(self, min_seconds=2, max_seconds=5):
        """Random delay to avoid rate limiting"""
        delay = random.uniform(min_seconds, max_seconds)
        time.sleep(delay)
    
    def get_active_students(self):
        """Get all active students with platform usernames"""
        try:
            students = list(self.students.find({
                'isActive': {'$ne': False}
            }))
            logger.info(f"Found {len(students)} active students")
            return students
        except Exception as e:
            logger.error(f"Failed to get students: {e}")
            return []
    
    def scrape_platform_batch(self, platform, scraper_func, update_interval_hours=1):
        """Scrape a platform for all students with rate limiting"""
        logger.info(f"🔄 Starting {platform} batch scrape")
        
        students = self.get_active_students()
        success_count = 0
        error_count = 0
        skipped_count = 0
        
        for student in students:
            username = None
            try:
                # Check if we need to update this student
                platform_data = student.get('platforms', {}).get(platform, {})
                last_updated = platform_data.get('updatedAt')
                
                if last_updated:
                    time_since_update = datetime.utcnow() - last_updated
                    if time_since_update < timedelta(hours=update_interval_hours):
                        skipped_count += 1
                        continue
                
                # Get platform username
                username = student.get('platformUsernames', {}).get(platform)
                if not username:
                    self.log_activity(platform, 'N/A', 'skipped', f"No username for {student.get('name')}")
                    skipped_count += 1
                    continue
                
                logger.info(f"Scraping {platform} for {student.get('name')} ({username})")
                
                # Scrape the platform
                data = scraper_func(username)
                
                if data:
                    # Update MongoDB with new data
                    update_data = {
                        f'platforms.{platform}': {
                            **data,
                            'updatedAt': datetime.utcnow()
                        }
                    }
                    
                    self.students.update_one(
                        {'_id': student['_id']},
                        {'$set': update_data}
                    )
                    
                    success_count += 1
                    data_points = len([v for v in data.values() if v is not None and v != 0])
                    self.log_activity(platform, username, 'success', 'Data updated', data_points)
                    logger.info(f"✅ Updated {platform} data for {username}")
                else:
                    error_count += 1
                    self.log_activity(platform, username, 'error', 'No data returned')
                    logger.warning(f"❌ No data for {username} on {platform}")
                
                # Safe delay between requests
                self.safe_delay()
                
            except Exception as e:
                error_count += 1
                if username:
                    self.log_activity(platform, username, 'error', str(e))
                logger.error(f"Error scraping {platform} for {username}: {e}")
                
                # Continue with next student
                continue
        
        logger.info(f"🏁 {platform} batch complete: {success_count} success, {error_count} errors, {skipped_count} skipped")
        return success_count, error_count, skipped_count
    
    def scrape_leetcode(self):
        """Scrape LeetCode for all students"""
        if 'leetcode' not in scrapers:
            logger.error("LeetCode scraper not available")
            return 0, 0, 0
        return self.scrape_platform_batch('leetcode', scrapers['leetcode'], update_interval_hours=0.5)
    
    def scrape_codechef(self):
        """Scrape CodeChef for all students"""
        if 'codechef' not in scrapers:
            logger.error("CodeChef scraper not available")
            return 0, 0, 0
        return self.scrape_platform_batch('codechef', scrapers['codechef'], update_interval_hours=1.5)
    
    def scrape_codeforces(self):
        """Scrape Codeforces for all students"""
        if 'codeforces' not in scrapers:
            logger.error("Codeforces scraper not available")
            return 0, 0, 0
        return self.scrape_platform_batch('codeforces', scrapers['codeforces'], update_interval_hours=0.5)
    
    def scrape_github(self):
        """Scrape GitHub for all students"""
        if 'github' not in scrapers:
            logger.error("GitHub scraper not available")
            return 0, 0, 0
        return self.scrape_platform_batch('github', scrapers['github'], update_interval_hours=0.5)
    
    def scrape_codolio(self):
        """Scrape Codolio for all students (heavy operation)"""
        if 'codolio' not in scrapers:
            logger.error("Codolio scraper not available")
            return 0, 0, 0
        return self.scrape_platform_batch('codolio', scrapers['codolio'], update_interval_hours=4)
    
    def daily_full_refresh(self):
        """Full refresh of all platforms once per day"""
        logger.info("🌅 Starting daily full refresh")
        
        # Force update all platforms regardless of last update time
        platforms = [
            ('leetcode', self.scrape_leetcode),
            ('codechef', self.scrape_codechef),
            ('codeforces', self.scrape_codeforces),
            ('github', self.scrape_github),
            ('codolio', self.scrape_codolio)
        ]
        
        total_success = 0
        total_errors = 0
        
        for platform_name, scraper_func in platforms:
            try:
                # Temporarily disable interval checking for full refresh
                success, errors, _ = scraper_func()
                total_success += success
                total_errors += errors
                
                # Longer delay between platforms
                time.sleep(10)
                
            except Exception as e:
                logger.error(f"Error in daily refresh for {platform_name}: {e}")
                total_errors += 1
        
        logger.info(f"🌅 Daily refresh complete: {total_success} total success, {total_errors} total errors")
        
        # Log daily summary
        self.log_activity('system', 'daily_refresh', 'complete', 
                         f"Success: {total_success}, Errors: {total_errors}", total_success)
    
    def cleanup_old_logs(self):
        """Clean up logs older than 30 days"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            result = self.logs.delete_many({'timestamp': {'$lt': cutoff_date}})
            logger.info(f"🧹 Cleaned up {result.deleted_count} old log entries")
        except Exception as e:
            logger.error(f"Error cleaning up logs: {e}")
    
    def get_system_stats(self):
        """Get system statistics for monitoring"""
        try:
            total_students = self.students.count_documents({'isActive': {'$ne': False}})
            
            # Count students with recent data for each platform
            recent_cutoff = datetime.utcnow() - timedelta(hours=24)
            
            stats = {
                'total_students': total_students,
                'last_updated': datetime.utcnow(),
                'platforms': {}
            }
            
            platforms = ['leetcode', 'codechef', 'codeforces', 'github', 'codolio']
            
            for platform in platforms:
                recent_count = self.students.count_documents({
                    f'platforms.{platform}.updatedAt': {'$gte': recent_cutoff}
                })
                stats['platforms'][platform] = {
                    'recent_updates': recent_count,
                    'coverage_percent': round((recent_count / total_students) * 100, 1) if total_students > 0 else 0
                }
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting system stats: {e}")
            return None
    
    def start_scheduler(self):
        """Start the production scheduler"""
        logger.info("🚀 Starting Production Scraper Scheduler")
        logger.info("📋 Schedule:")
        logger.info("  - LeetCode: every 45 minutes")
        logger.info("  - CodeChef: every 90 minutes") 
        logger.info("  - Codeforces: every 45 minutes")
        logger.info("  - GitHub: every 30 minutes")
        logger.info("  - Codolio: every 4 hours")
        logger.info("  - Full refresh: daily at 2:00 AM")
        logger.info("  - Log cleanup: weekly")
        
        # Schedule jobs with staggered timing to avoid conflicts
        schedule.every(45).minutes.do(self.scrape_leetcode)
        schedule.every(90).minutes.do(self.scrape_codechef)
        schedule.every(45).minutes.do(self.scrape_codeforces)
        schedule.every(30).minutes.do(self.scrape_github)
        schedule.every(4).hours.do(self.scrape_codolio)
        
        # Daily and weekly maintenance
        schedule.every().day.at("02:00").do(self.daily_full_refresh)
        schedule.every().sunday.at("03:00").do(self.cleanup_old_logs)
        
        self.running = True
        
        # Run initial scrape for immediate data
        logger.info("🔄 Running initial scrape...")
        threading.Thread(target=self.scrape_github, daemon=True).start()
        
        # Main scheduler loop
        while self.running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
                
                # Log system stats every hour
                if datetime.now().minute == 0:
                    stats = self.get_system_stats()
                    if stats:
                        logger.info(f"📊 System Stats: {json.dumps(stats, default=str, indent=2)}")
                        
            except KeyboardInterrupt:
                logger.info("🛑 Scheduler stopped by user")
                self.running = False
                break
            except Exception as e:
                logger.error(f"Scheduler error: {e}")
                time.sleep(60)  # Wait before retrying
    
    def stop_scheduler(self):
        """Stop the scheduler gracefully"""
        logger.info("🛑 Stopping scheduler...")
        self.running = False
        self.client.close()

def main():
    """Main entry point"""
    scraper = ProductionScraper()
    
    try:
        scraper.start_scheduler()
    except KeyboardInterrupt:
        scraper.stop_scheduler()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        scraper.stop_scheduler()

if __name__ == "__main__":
    main()