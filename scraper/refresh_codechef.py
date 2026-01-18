#!/usr/bin/env python3
"""
Refresh CodeChef Data for Single Student
Usage: python refresh_codechef.py <student_id> [username]
"""
import sys
import os
import io
import json
import time
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
import logging

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add the scraper directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from codechef_scraper import scrape_codechef_user

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def extract_username_from_url(url_or_username):
    """Extract username from CodeChef URL or return as-is if already username"""
    if not url_or_username:
        return None
    
    # If it's already a username (no http/https)
    if not url_or_username.startswith('http'):
        return url_or_username.strip()
    
    # Extract from URL patterns: https://www.codechef.com/users/username
    import re
    pattern = r'codechef\.com/users/([^/?]+)'
    match = re.search(pattern, url_or_username)
    if match:
        return match.group(1).strip()
    
    return None

def refresh_student_platform(student_id, username=None):
    """Refresh CodeChef data for a student by MongoDB _id"""
    client = None
    try:
        # Connect to MongoDB
        mongodb_uri = os.getenv('MONGO_URI', os.getenv('MONGODB_URI', 'mongodb://localhost:27017/go-tracker'))
        logger.info(f"Connecting to MongoDB: {mongodb_uri.split('@')[-1] if '@' in mongodb_uri else mongodb_uri}")
        
        try:
            client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
            db = client['go-tracker']
            students_collection = db['students']
        except Exception as conn_error:
            error_msg = f"Failed to connect to MongoDB: {str(conn_error)}"
            print(f"❌ ERROR: {error_msg}", file=sys.stderr)
            sys.stderr.flush()
            logger.error(error_msg)
            return False
        
        # Find student by _id
        try:
            student = students_collection.find_one({'_id': ObjectId(student_id)})
        except Exception as e:
            error_msg = f"Invalid student ID format: {student_id} - {str(e)}"
            print(f"❌ ERROR: {error_msg}", file=sys.stderr)
            sys.stderr.flush()
            logger.error(error_msg)
            if client:
                client.close()
            return False
        
        if not student:
            error_msg = f"Student with ID {student_id} not found in database"
            print(f"❌ ERROR: {error_msg}", file=sys.stderr)
            sys.stderr.flush()
            logger.error(error_msg)
            if client:
                client.close()
            return False
        
        logger.info(f"Found student: {student.get('name', 'Unknown')} ({student.get('rollNumber', 'N/A')})")
        
        # Get CodeChef profile URL from platformLinks
        codechef_url = student.get('platformLinks', {}).get('codechef', '')
        
        # If URL not found, try to construct from username
        if not codechef_url:
            # Try platformUsernames first
            username = student.get('platformUsernames', {}).get('codechef', '')
            logger.info(f"Username from platformUsernames: {username or 'Not found'}")
            
            if username:
                codechef_url = f"https://www.codechef.com/users/{username}"
                logger.info(f"Constructed URL from username: {codechef_url}")
        
        if not codechef_url:
            error_msg = f"CodeChef profile URL not found for student {student.get('name', 'Unknown')} ({student.get('rollNumber', 'N/A')})"
            print(f"❌ ERROR: {error_msg}", file=sys.stderr)
            sys.stderr.flush()
            print(f"   Platform Link: {student.get('platformLinks', {}).get('codechef', 'Not set')}", file=sys.stderr)
            sys.stderr.flush()
            print(f"   Platform Username: {student.get('platformUsernames', {}).get('codechef', 'Not set')}", file=sys.stderr)
            sys.stderr.flush()
            logger.error(error_msg)
            if client:
                client.close()
            return False
        
        # Extract username from URL for storage and logging
        username = extract_username_from_url(codechef_url)
        if not username:
            # If we can't extract username, try to get it from URL manually
            import re
            match = re.search(r'codechef\.com/users/([^/?]+)', codechef_url)
            if match:
                username = match.group(1)
            else:
                error_msg = f"Could not extract username from CodeChef URL: {codechef_url}"
                print(f"❌ ERROR: {error_msg}", file=sys.stderr)
                sys.stderr.flush()
                logger.error(error_msg)
                if client:
                    client.close()
                return False
        
        print(f"📊 Scraping CodeChef for URL: {codechef_url}")
        sys.stdout.flush()
        print(f"👤 Username: {username}")
        sys.stdout.flush()
        print(f"📝 Student: {student.get('name', 'Unknown')} ({student.get('rollNumber', 'N/A')})")
        sys.stdout.flush()
        logger.info(f"Starting CodeChef scraping for URL: {codechef_url} (username: {username})")
        
        # Scrape CodeChef data with retry logic - pass URL directly
        codechef_data = None
        max_retries = 2
        for attempt in range(max_retries):
            try:
                logger.info(f"Scraping attempt {attempt + 1}/{max_retries}")
                codechef_data = scrape_codechef_user(codechef_url, include_contest_history=True)
                
                if codechef_data:
                    logger.info(f"✅ Scraping succeeded on attempt {attempt + 1}")
                    break
                else:
                    logger.warning(f"⚠️ Scraping returned None on attempt {attempt + 1}")
                    if attempt < max_retries - 1:
                        wait_time = (attempt + 1) * 3
                        logger.info(f"Waiting {wait_time} seconds before retry...")
                        time.sleep(wait_time)
            except Exception as scrape_error:
                error_details = f"Scraping error on attempt {attempt + 1}: {str(scrape_error)}"
                logger.error(error_details)
                logger.exception("Full traceback:")
                
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 3
                    logger.info(f"Retrying after {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    # Final attempt failed
                    print(f"❌ ERROR: Failed to scrape CodeChef data for {username} after {max_retries} attempts", file=sys.stderr)
                    sys.stderr.flush()
                    print(f"   Last error: {str(scrape_error)}", file=sys.stderr)
                    sys.stderr.flush()
                    import traceback
                    traceback.print_exc(file=sys.stderr)
                    sys.stderr.flush()
                    if client:
                        client.close()
                    return False
        
        if not codechef_data:
            error_msg = f"Failed to scrape CodeChef data for {username} after {max_retries} attempts"
            print(f"❌ ERROR: {error_msg}", file=sys.stderr)
            sys.stderr.flush()
            logger.error(error_msg)
            if client:
                client.close()
            return False
        
        # Check if result contains error information
        if isinstance(codechef_data, dict) and 'error' in codechef_data:
            error_type = codechef_data.get('error', 'unknown_error')
            error_message = codechef_data.get('error_message', 'Unknown scraping error')
            
            # Get existing data timestamp for backend
            existing_data = student.get('platforms', {}).get('codechef', {})
            last_updated = existing_data.get('lastUpdated', None)
            
            print(f"❌ ERROR: CodeChef scraping failed", file=sys.stderr)
            sys.stderr.flush()
            print(f"   Error Type: {error_type}", file=sys.stderr)
            sys.stderr.flush()
            print(f"   Error Message: {error_message}", file=sys.stderr)
            sys.stderr.flush()
            print(f"   Last Updated: {last_updated}", file=sys.stderr)
            sys.stderr.flush()
            
            # Print structured error JSON for backend to capture
            print(f"\n📦 ERROR_JSON_START")
            sys.stdout.flush()
            print(json.dumps({
                'success': False,
                'platform': 'codechef',
                'status': 'failed',
                'reason': error_type,
                'message': error_message,
                'username': username,
                'lastUpdated': str(last_updated) if last_updated else None,
                'studentId': student_id,
                'timestamp': datetime.utcnow().isoformat(),
                'details': codechef_data
            }, default=str))
            sys.stdout.flush()
            print(f"📦 ERROR_JSON_END\n")
            sys.stdout.flush()
            
            logger.error(f"Scraping failed with error: {error_type} - {error_message}")
            if client:
                client.close()
            return False
        
        # Log scraped data summary
        logger.info(f"Scraped data summary: Rating={codechef_data.get('rating', 0)}, "
                   f"Problems={codechef_data.get('totalSolved', 0)}, "
                   f"Contests={codechef_data.get('contestsAttended', 0)}, "
                   f"Submissions={codechef_data.get('totalSubmissions', 0)}")
        
        # Build comprehensive update data
        try:
            update_data = {
                'platforms.codechef.rating': codechef_data.get('rating', 0),
                'platforms.codechef.maxRating': codechef_data.get('maxRating', 0),
                'platforms.codechef.currentRating': codechef_data.get('currentRating') or codechef_data.get('rating', 0),
                'platforms.codechef.highestRating': codechef_data.get('highestRating') or codechef_data.get('maxRating', 0),
                'platforms.codechef.ratingDiv': codechef_data.get('ratingDiv') or codechef_data.get('division', ''),
                'platforms.codechef.problemsSolved': codechef_data.get('totalSolved', 0),
                'platforms.codechef.totalSolved': codechef_data.get('totalSolved', 0),
                'platforms.codechef.globalRank': codechef_data.get('globalRank', 0),
                'platforms.codechef.countryRank': codechef_data.get('countryRank', 0),
                'platforms.codechef.stars': codechef_data.get('stars', 0),
                'platforms.codechef.league': codechef_data.get('league', ''),
                'platforms.codechef.division': codechef_data.get('division', ''),
                'platforms.codechef.institution': codechef_data.get('institution', ''),
                'platforms.codechef.country': codechef_data.get('country', ''),
                'platforms.codechef.name': codechef_data.get('name', ''),
                'platforms.codechef.fullySolved': codechef_data.get('fullySolved', 0),
                'platforms.codechef.partiallySolved': codechef_data.get('partiallySolved', 0),
                'platforms.codechef.contestsAttended': codechef_data.get('contestsAttended', 0),
                'platforms.codechef.contests': codechef_data.get('contestsAttended', 0),
                'platforms.codechef.totalContests': codechef_data.get('contestsAttended', 0),
                'platforms.codechef.totalSubmissions': codechef_data.get('totalSubmissions', 0),
                'platforms.codechef.submissionHeatmap': codechef_data.get('submissionHeatmap', []),
                'platforms.codechef.submissionByDate': codechef_data.get('submissionByDate', {}),
                'platforms.codechef.submissionStats': codechef_data.get('submissionStats', {}),
                'platforms.codechef.contestHistory': codechef_data.get('contestHistory', []),
                'platforms.codechef.recentContests': codechef_data.get('recentContests', []),
                'platforms.codechef.username': username,
                'platforms.codechef.lastUpdated': datetime.utcnow(),
                'platforms.codechef.dataSource': codechef_data.get('dataSource', 'codechef_refresh_script'),
                'lastScrapedAt': datetime.utcnow()
            }
            
            # Update platform username
            update_data['platformUsernames.codechef'] = username
            
            logger.info(f"Preparing to update MongoDB with {len(update_data)} fields")
            
            # Update student in MongoDB (with upsert to create if doesn't exist)
            result = students_collection.update_one(
                {'_id': ObjectId(student_id)},
                {'$set': update_data},
                upsert=True  # Creates document if it doesn't exist
            )
            
            if result.modified_count > 0 or result.matched_count > 0:
                success_msg = f"✅ Successfully updated CodeChef data for {username}"
                print(success_msg)
                sys.stdout.flush()
                print(f"   📊 Rating: {codechef_data.get('rating', 0)}")
                sys.stdout.flush()
                print(f"   🎯 Problems Solved: {codechef_data.get('totalSolved', 0)}")
                sys.stdout.flush()
                print(f"   🏆 Contests: {codechef_data.get('contestsAttended', 0)}")
                sys.stdout.flush()
                print(f"   📝 Submissions: {codechef_data.get('totalSubmissions', 0)}")
                sys.stdout.flush()
                
                # Print JSON data to stdout for backend to capture
                print(f"\n📦 SCRAPED_DATA_JSON_START")
                sys.stdout.flush()
                print(json.dumps({
                    'success': True,
                    'username': username,
                    'data': codechef_data,
                    'studentId': student_id,
                    'timestamp': datetime.utcnow().isoformat()
                }, default=str))
                sys.stdout.flush()
                print(f"📦 SCRAPED_DATA_JSON_END\n")
                sys.stdout.flush()
                
                logger.info(success_msg)
                if client:
                    client.close()
                return True
            else:
                warning_msg = f"⚠️  No changes made (data might be the same)"
                print(warning_msg)
                sys.stdout.flush()
                logger.warning(warning_msg)
                if client:
                    client.close()
                return False
        except Exception as update_error:
            error_msg = f"Failed to update MongoDB: {str(update_error)}"
            print(f"❌ ERROR: {error_msg}", file=sys.stderr)
            sys.stderr.flush()
            logger.error(error_msg)
            logger.exception("MongoDB update error:")
            if client:
                client.close()
            return False
            
    except KeyboardInterrupt:
        print("\n⚠️  Process interrupted by user", file=sys.stderr)
        sys.stderr.flush()
        logger.warning("Process interrupted by user")
        if client:
            client.close()
        return False
    except Exception as e:
        error_msg = f"Unexpected error in refresh_student_platform: {str(e)}"
        print(f"❌ ERROR: {error_msg}", file=sys.stderr)
        sys.stderr.flush()
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        logger.error(error_msg)
        logger.exception("Full traceback:")
        if client:
            try:
                client.close()
            except:
                pass
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python refresh_codechef.py <student_id> [username]")
        sys.exit(1)
    
    student_id = sys.argv[1]
    username = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = refresh_student_platform(student_id, username)
    sys.exit(0 if success else 1)
