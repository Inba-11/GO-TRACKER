#!/usr/bin/env python3
"""
Codeforces Complete Profile Scraper
Scrapes user profile, ratings, submissions, contests, and heatmap data
Enhanced with MongoDB integration and command-line support
"""

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import json
import time
import sys
import os
import io
from datetime import datetime
from collections import defaultdict
import re
from pymongo import MongoClient
import logging

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    # Note: Unbuffered output is handled via Python -u flag in Node.js commands

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CodeforcesProfileScraper:
    def __init__(self, profile_url):
        """Initialize scraper with profile URL"""
        self.profile_url = profile_url
        self.username = self.extract_username(profile_url)
        self.base_url = "https://codeforces.com"
        self.api_base = "https://codeforces.com/api"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.driver = None
        
    def extract_username(self, url):
        """Extract username from profile URL"""
        # Handle both URLs and direct usernames
        if not url.startswith('http'):
            return url.strip()
        
        match = re.search(r'codeforces\.com/profile/([^/?]+)', url)
        if match:
            return match.group(1)
        raise ValueError(f"Invalid Codeforces profile URL: {url}")
    
    def setup_selenium(self):
        """Setup Selenium WebDriver (optional, for future use)"""
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            return True
        except Exception as e:
            logger.warning(f"Selenium setup failed: {e}. Continuing without Selenium.")
            return False
        
    def close_selenium(self):
        """Close Selenium WebDriver"""
        if self.driver:
            self.driver.quit()
            self.driver = None
    
    def safe_api_request(self, endpoint, params=None, retries=3):
        """Make safe API request with retry logic"""
        url = f"{self.api_base}/{endpoint}"
        
        for attempt in range(retries):
            try:
                # Rate limiting: wait between requests
                if attempt > 0:
                    wait_time = (attempt + 1) * 1.5
                    logger.info(f"Retrying API request (attempt {attempt + 1}/{retries}) after {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    time.sleep(0.5)  # Small delay even on first attempt
                
                response = self.session.get(url, params=params, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('status') == 'OK':
                        return data.get('result')
                    else:
                        error_msg = data.get('comment', 'Unknown error')
                        logger.warning(f"API error: {error_msg}")
                        if 'not found' in error_msg.lower():
                            return None
                elif response.status_code == 429:
                    wait_time = 2 ** attempt * 2
                    logger.warning(f"Rate limited (429), waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                else:
                    logger.warning(f"HTTP {response.status_code} for {endpoint}")
                    if response.status_code == 404:
                        return None
                        
            except requests.exceptions.Timeout:
                logger.warning(f"Timeout on attempt {attempt + 1}/{retries}")
            except Exception as e:
                logger.warning(f"Request error: {e}")
            
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
        
        return None
    
    def get_user_info_api(self):
        """Fetch user info from Codeforces API"""
        logger.info(f"Fetching user info for {self.username}...")
        result = self.safe_api_request('user.info', {'handles': self.username})
        return result if result else None
    
    def get_user_rating_api(self):
        """Fetch user rating history from API"""
        logger.info(f"Fetching rating history for {self.username}...")
        result = self.safe_api_request('user.rating', {'handle': self.username})
        return result if result else []
    
    def get_user_submissions_api(self, count=10000):
        """Fetch user submissions from API"""
        logger.info(f"Fetching submissions for {self.username} (up to {count})...")
        result = self.safe_api_request('user.status', {
            'handle': self.username,
            'from': 1,
            'count': count
        })
        return result if result else []
    
    def get_recent_contests_details(self, rating_history, submissions, num_contests=8):
        """Get detailed information about recent contests"""
        try:
            if not rating_history:
                return []
            
            # Get the most recent contests from rating history
            recent_contests = rating_history[-num_contests:] if len(rating_history) >= num_contests else rating_history
            recent_contests.reverse()  # Most recent first
            
            contests_details = []
            
            for contest in recent_contests:
                contest_id = contest['contestId']
                contest_name = contest['contestName']
                contest_time = datetime.fromtimestamp(contest['ratingUpdateTimeSeconds'])
                
                # Find all submissions for this contest
                contest_submissions = [
                    s for s in submissions 
                    if s.get('author', {}).get('participantType') in ['CONTESTANT', 'OUT_OF_COMPETITION', 'VIRTUAL']
                    and s.get('contestId') == contest_id
                ]
                
                # Get solved problems (unique problems with OK verdict)
                solved_problems = {}
                attempted_problems = set()
                
                for sub in contest_submissions:
                    problem = sub.get('problem', {})
                    problem_index = problem.get('index', '')
                    problem_name = problem.get('name', 'Unknown')
                    problem_rating = problem.get('rating', 'N/A')
                    verdict = sub.get('verdict', 'UNKNOWN')
                    submission_time = datetime.fromtimestamp(sub.get('creationTimeSeconds', 0))
                    
                    problem_key = f"{contest_id}{problem_index}"
                    attempted_problems.add(problem_key)
                    
                    # Only count if solved (OK verdict)
                    if verdict == 'OK' and problem_key not in solved_problems:
                        solved_problems[problem_key] = {
                            'index': problem_index,
                            'name': problem_name,
                            'rating': problem_rating,
                            'solved_time': submission_time.strftime('%Y-%m-%d %H:%M:%S')
                        }
                
                # Calculate contest statistics
                old_rating = contest.get('oldRating', 0)
                new_rating = contest.get('newRating', 0)
                rating_change = new_rating - old_rating
                rank = contest.get('rank', 'N/A')
                
                contest_detail = {
                    'contestId': contest_id,
                    'contestName': contest_name,
                    'date': contest_time.strftime('%Y-%m-%d'),
                    'time': contest_time.strftime('%H:%M:%S'),
                    'datetime': contest_time.isoformat(),
                    'rank': rank,
                    'oldRating': old_rating,
                    'newRating': new_rating,
                    'ratingChange': rating_change,
                    'problemsSolved': len(solved_problems),
                    'problemsAttempted': len(attempted_problems),
                    'solvedProblems': list(solved_problems.values()),
                    'contestUrl': f"https://codeforces.com/contest/{contest_id}"
                }
                
                contests_details.append(contest_detail)
            
            return contests_details
            
        except Exception as e:
            logger.error(f"Error getting contest details: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def calculate_problem_stats(self, submissions):
        """Calculate problem solving statistics"""
        solved_problems = set()
        problem_count_by_rating = defaultdict(int)
        problem_count_by_tag = defaultdict(int)
        total_submissions = len(submissions)
        accepted_submissions = 0
        
        for submission in submissions:
            verdict = submission.get('verdict', '')
            if verdict == 'OK':
                accepted_submissions += 1
                problem_id = f"{submission['problem']['contestId']}{submission['problem']['index']}"
                
                if problem_id not in solved_problems:
                    solved_problems.add(problem_id)
                    
                    # Count by rating
                    rating = submission['problem'].get('rating', 'Unrated')
                    if isinstance(rating, int):
                        rating_bucket = (rating // 100) * 100
                        problem_count_by_rating[rating_bucket] += 1
                    
                    # Count by tags
                    for tag in submission['problem'].get('tags', []):
                        problem_count_by_tag[tag] += 1
        
        return {
            'totalSolved': len(solved_problems),
            'totalSubmissions': total_submissions,
            'acceptedSubmissions': accepted_submissions,
            'acceptanceRate': round((accepted_submissions / total_submissions * 100) if total_submissions > 0 else 0, 2),
            'byRating': dict(problem_count_by_rating),
            'byTag': dict(problem_count_by_tag)
        }
    
    def generate_heatmap_data(self, submissions):
        """Generate heatmap data from submissions"""
        heatmap = defaultdict(int)
        
        for submission in submissions:
            timestamp = submission.get('creationTimeSeconds', 0)
            if timestamp:
                date = datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')
                
                if submission.get('verdict') == 'OK':
                    heatmap[date] += 1
        
        # Convert to list format
        heatmap_list = [
            {'date': date, 'count': count}
            for date, count in sorted(heatmap.items())
        ]
        
        return heatmap_list
    
    def get_contest_stats(self, rating_history):
        """Calculate contest statistics"""
        if not rating_history:
            return {}
        
        contests_count = len(rating_history)
        ratings = [c['newRating'] for c in rating_history]
        max_rating = max(ratings) if ratings else 0
        min_rating = min(ratings) if ratings else 0
        
        # Calculate rating changes
        rating_changes = [c['newRating'] - c['oldRating'] for c in rating_history]
        best_performance = max(rating_changes) if rating_changes else 0
        worst_performance = min(rating_changes) if rating_changes else 0
        
        return {
            'totalContests': contests_count,
            'maxRating': max_rating,
            'minRating': min_rating,
            'bestPerformance': best_performance,
            'worstPerformance': worst_performance
        }
    
    def scrape_all(self):
        """Scrape all available data"""
        logger.info(f"")
        logger.info(f"================================================================================")
        logger.info(f"CODEFORCES PROFILE SCRAPER")
        logger.info(f"================================================================================")
        logger.info(f"Scraping profile for: {self.username}")
        logger.info(f"Profile URL: {self.profile_url}")
        logger.info(f"================================================================================")
        
        all_data = {
            'username': self.username,
            'profileUrl': self.profile_url,
            'scrapedAt': datetime.now().isoformat()
        }
        
        try:
            # 1. Fetch from API
            logger.info(f"[1/6] Fetching user info from API...")
            user_info_list = self.get_user_info_api()
            if user_info_list and len(user_info_list) > 0:
                user_info = user_info_list[0]
                all_data['userInfo'] = {
                    'handle': user_info.get('handle'),
                    'firstName': user_info.get('firstName', ''),
                    'lastName': user_info.get('lastName', ''),
                    'country': user_info.get('country', ''),
                    'city': user_info.get('city', ''),
                    'organization': user_info.get('organization', ''),
                    'rank': user_info.get('rank', 'unrated'),
                    'maxRank': user_info.get('maxRank', 'unrated'),
                    'rating': user_info.get('rating', 0),
                    'maxRating': user_info.get('maxRating', 0),
                    'contribution': user_info.get('contribution', 0),
                    'friendOfCount': user_info.get('friendOfCount', 0),
                    'avatar': user_info.get('titlePhoto', user_info.get('avatar', '')),
                    'registrationTime': user_info.get('registrationTimeSeconds', 0)
                }
                logger.info(f"✓ Current Rating: {all_data['userInfo']['rating']}")
                logger.info(f"✓ Max Rating: {all_data['userInfo']['maxRating']}")
                logger.info(f"✓ Rank: {all_data['userInfo']['rank']}")
            else:
                logger.error("❌ Could not fetch user info")
                return None
            
            # 2. Fetch rating history
            logger.info(f"[2/6] Fetching rating history...")
            rating_history = self.get_user_rating_api()
            all_data['ratingHistory'] = rating_history
            contest_stats = self.get_contest_stats(rating_history)
            all_data['contestStats'] = contest_stats
            logger.info(f"✓ Total Contests: {contest_stats.get('totalContests', 0)}")
            
            # 3. Fetch submissions
            logger.info(f"[3/6] Fetching submissions (this may take a while)...")
            submissions = self.get_user_submissions_api()
            all_data['totalSubmissions'] = len(submissions)
            logger.info(f"✓ Total Submissions: {len(submissions)}")
            
            # 4. Get recent contest details
            logger.info(f"[4/6] Fetching recent contest details...")
            recent_contests = self.get_recent_contests_details(rating_history, submissions, 8)
            all_data['recentContests'] = recent_contests
            logger.info(f"✓ Recent Contests Retrieved: {len(recent_contests)}")
            
            # 5. Calculate problem stats
            logger.info(f"[5/6] Calculating problem statistics...")
            problem_stats = self.calculate_problem_stats(submissions)
            all_data['problemStats'] = problem_stats
            logger.info(f"✓ Total Problems Solved: {problem_stats['totalSolved']}")
            logger.info(f"✓ Acceptance Rate: {problem_stats['acceptanceRate']}%")
            
            # 6. Generate heatmap data
            logger.info(f"[6/6] Generating heatmap data...")
            heatmap_data = self.generate_heatmap_data(submissions)
            all_data['heatmap'] = heatmap_data
            logger.info(f"✓ Heatmap data points: {len(heatmap_data)}")
            
            logger.info(f"")
            logger.info(f"================================================================================")
            logger.info(f"✅ Scraping completed successfully!")
            logger.info(f"================================================================================")
            logger.info(f"")
            logger.info(f"📊 Scraped Data Summary:")
            logger.info(f"  ✅ Rating: {all_data['userInfo']['rating']} (Max: {all_data['userInfo']['maxRating']})")
            logger.info(f"  ✅ Rank: {all_data['userInfo']['rank']} (Max: {all_data['userInfo']['maxRank']})")
            logger.info(f"  ✅ Problems Solved: {problem_stats['totalSolved']}")
            logger.info(f"  ✅ Total Submissions: {problem_stats['totalSubmissions']}")
            logger.info(f"  ✅ Acceptance Rate: {problem_stats['acceptanceRate']}%")
            logger.info(f"  ✅ Contests Attended: {contest_stats.get('totalContests', 0)}")
            logger.info(f"  ✅ Recent Contests: {len(recent_contests)}")
            logger.info(f"  ✅ Heatmap Entries: {len(heatmap_data)}")
            logger.info(f"")
            
            return all_data
            
        except Exception as e:
            logger.error(f"❌ Error during scraping: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def save_to_json(self, data, filename=None):
        """Save scraped data to JSON file"""
        if filename is None:
            filename = f"{self.username}_codeforces_data.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)
        
        logger.info(f"💾 Data saved to: {filename}")
        return filename
    
    def print_recent_contests(self, data):
        """Print recent contests in a formatted table"""
        recent_contests = data.get('recentContests', [])
        
        if not recent_contests:
            logger.info("No recent contest data available")
            return
        
        logger.info("")
        logger.info("="*100)
        logger.info("RECENT 8 CONTESTS DETAILS")
        logger.info("="*100)
        
        for i, contest in enumerate(recent_contests, 1):
            logger.info(f"\n{'='*100}")
            logger.info(f"CONTEST #{i}: {contest['contestName']}")
            logger.info(f"{'='*100}")
            logger.info(f"📅 Date: {contest['date']}")
            logger.info(f"⏰ Time: {contest['time']}")
            logger.info(f"🔗 URL: {contest['contestUrl']}")
            logger.info(f"🏆 Rank: {contest['rank']}")
            logger.info(f"📊 Rating: {contest['oldRating']} → {contest['newRating']} ({contest['ratingChange']:+d})")
            logger.info(f"✅ Problems Solved: {contest['problemsSolved']}/{contest['problemsAttempted']}")
            
            if contest['solvedProblems']:
                logger.info(f"\n{'Problem':<10} {'Name':<50} {'Rating':<10} {'Solved Time'}")
                logger.info("-" * 100)
                for problem in contest['solvedProblems']:
                    logger.info(f"{problem['index']:<10} {problem['name'][:47]:<50} {str(problem['rating']):<10} {problem['solved_time']}")
            else:
                logger.info("\n❌ No problems solved in this contest")
        
        logger.info("\n" + "="*100)


def update_mongodb(roll_number: str, codeforces_data: dict):
    """Update MongoDB with scraped Codeforces data"""
    try:
        # Standardized to MONGO_URI (fallback to MONGODB_URI for compatibility)
        mongodb_uri = os.getenv('MONGO_URI', os.getenv('MONGODB_URI', 'mongodb://localhost:27017/go-tracker'))
        client = MongoClient(mongodb_uri)
        db = client['go-tracker']
        students_collection = db['students']
        
        logger.info(f"")
        logger.info(f"💾 Updating MongoDB for Roll Number: {roll_number}")
        
        # Find student
        student = students_collection.find_one({'rollNumber': roll_number})
        if not student:
            logger.error(f"❌ Student with roll number {roll_number} not found in MongoDB")
            return False
        
        logger.info(f"✅ Found student: {student.get('name', 'Unknown')} ({roll_number})")
        
        user_info = codeforces_data.get('userInfo', {})
        problem_stats = codeforces_data.get('problemStats', {})
        contest_stats = codeforces_data.get('contestStats', {})
        recent_contests = codeforces_data.get('recentContests', [])
        heatmap = codeforces_data.get('heatmap', [])
        
        # Convert integer keys to strings for MongoDB compatibility
        solved_by_rating = problem_stats.get('byRating', {})
        solved_by_tag = problem_stats.get('byTag', {})
        
        # Convert rating keys (integers) to strings
        solved_by_rating_str = {str(k): v for k, v in solved_by_rating.items()}
        
        # Tag keys should already be strings, but ensure they are
        solved_by_tag_str = {str(k): v for k, v in solved_by_tag.items()}
        
        # Calculate average problem rating (weighted average from rating buckets)
        avg_problem_rating = 0
        if solved_by_rating:
            total_problems = sum(solved_by_rating.values())
            if total_problems > 0:
                weighted_sum = sum(rating * count for rating, count in solved_by_rating.items())
                avg_problem_rating = round(weighted_sum / total_problems)
        
        # Get rating change from last contest
        rating_change_last_contest = 0
        if recent_contests and len(recent_contests) > 0:
            rating_change_last_contest = recent_contests[0].get('ratingChange', 0)
        
        # Prepare update data
        update_data = {
            'platforms.codeforces.username': codeforces_data.get('username', ''),
            'platforms.codeforces.rating': user_info.get('rating', 0),
            'platforms.codeforces.maxRating': user_info.get('maxRating', 0),
            'platforms.codeforces.rank': user_info.get('rank', 'unrated'),
            'platforms.codeforces.maxRank': user_info.get('maxRank', 'unrated'),
            'platforms.codeforces.problemsSolved': problem_stats.get('totalSolved', 0),
            'platforms.codeforces.totalSolved': problem_stats.get('totalSolved', 0),  # Alias for frontend
            'platforms.codeforces.totalSubmissions': problem_stats.get('totalSubmissions', 0),
            'platforms.codeforces.acceptedSubmissions': problem_stats.get('acceptedSubmissions', 0),
            'platforms.codeforces.acceptanceRate': problem_stats.get('acceptanceRate', 0),
            'platforms.codeforces.avgProblemRating': avg_problem_rating,
            'platforms.codeforces.contestsAttended': contest_stats.get('totalContests', 0),
            'platforms.codeforces.ratingChangeLastContest': rating_change_last_contest,
            'platforms.codeforces.country': user_info.get('country', ''),
            'platforms.codeforces.city': user_info.get('city', ''),
            'platforms.codeforces.organization': user_info.get('organization', ''),
            'platforms.codeforces.contribution': user_info.get('contribution', 0),
            'platforms.codeforces.friendOfCount': user_info.get('friendOfCount', 0),
            'platforms.codeforces.registrationTime': user_info.get('registrationTime', 0),
            'platforms.codeforces.contestHistory': recent_contests,
            'platforms.codeforces.heatmap': heatmap,
            'platforms.codeforces.solvedByRating': solved_by_rating_str,
            'platforms.codeforces.solvedByTag': solved_by_tag_str,
            'platforms.codeforces.lastUpdated': codeforces_data.get('scrapedAt', datetime.now().isoformat()),
        }
        
        result = students_collection.update_one(
            {'rollNumber': roll_number},
            {'$set': update_data}
        )
        
        if result.modified_count > 0:
            logger.info(f"")
            logger.info(f"✅ Successfully updated Codeforces data in MongoDB!")
            logger.info(f"")
            logger.info(f"📋 Update Summary:")
            logger.info(f"  ✅ Rating: {user_info.get('rating', 0)} (Max: {user_info.get('maxRating', 0)})")
            logger.info(f"  ✅ Problems: {problem_stats.get('totalSolved', 0)} solved")
            logger.info(f"  ✅ Contests: {contest_stats.get('totalContests', 0)} attended")
            logger.info(f"  ✅ Submissions: {problem_stats.get('totalSubmissions', 0)} total")
            logger.info(f"  ✅ Contest History: {len(recent_contests)} entries")
            logger.info(f"  ✅ Heatmap: {len(heatmap)} entries")
            logger.info(f"")
            # Add print statements for Node.js to detect success (with error handling)
            try:
                print("✅ Successfully updated Codeforces data in MongoDB!")
                sys.stdout.flush()
                print(f"   📊 Rating: {user_info.get('rating', 0)} (Max: {user_info.get('maxRating', 0)})")
                sys.stdout.flush()
                print(f"   🎯 Problems: {problem_stats.get('totalSolved', 0)}")
                sys.stdout.flush()
                print(f"   🏆 Contests: {contest_stats.get('totalContests', 0)}")
                sys.stdout.flush()
            except (ValueError, OSError) as e:
                # If stdout is closed, just log the error but don't fail
                logger.warning(f"Could not write to stdout (stdout may be closed): {e}")
            return True
        else:
            logger.warning(f"⚠️  No changes made to MongoDB (data may be identical)")
            try:
                print("⚠️ No changes made to MongoDB (data may be identical)")
                sys.stdout.flush()
            except (ValueError, OSError) as e:
                logger.warning(f"Could not write to stdout: {e}")
            return False
            
    except Exception as e:
        logger.error(f"❌ MongoDB update error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if 'client' in locals():
            client.close()


def main():
    """Main function - supports both interactive and command-line modes"""
    
    if len(sys.argv) > 1:
        # Command line mode: python script.py <url_or_username> [roll_number]
        url_or_username = sys.argv[1]
        roll_number = sys.argv[2] if len(sys.argv) > 2 else None
        
        try:
            scraper = CodeforcesProfileScraper(url_or_username)
            data = scraper.scrape_all()
            
            if not data:
                logger.error("❌ Failed to scrape Codeforces data")
                return
            
            # Save to JSON
            scraper.save_to_json(data)
            
            # Print recent contests
            scraper.print_recent_contests(data)
            
            # Update MongoDB if roll number provided
            if roll_number:
                update_mongodb(roll_number, data)
            else:
                logger.info("")
                logger.info("💡 Tip: To update MongoDB, provide roll number as second argument:")
                logger.info(f"   python {sys.argv[0]} {url_or_username} <roll_number>")
                logger.info("")
        
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
    
    else:
        # Interactive mode
        logger.info("")
        logger.info("="*80)
        logger.info("CODEFORCES PROFILE SCRAPER - INTERACTIVE MODE")
        logger.info("="*80)
        logger.info("")
        logger.info("Enter Codeforces URLs or usernames one by one.")
        logger.info("Type 'exit' or 'quit' to stop.")
        logger.info("")
        
        while True:
            try:
                url_or_username = input("Enter Codeforces URL or username: ").strip()
                
                if url_or_username.lower() in ['exit', 'quit', 'q']:
                    logger.info("👋 Exiting...")
                    break
                
                if not url_or_username:
                    continue
                
                scraper = CodeforcesProfileScraper(url_or_username)
                data = scraper.scrape_all()
                
                if not data:
                    logger.error("❌ Failed to scrape data. Please try again.")
                    continue
                
                # Save to JSON
                scraper.save_to_json(data)
                
                # Print recent contests
                scraper.print_recent_contests(data)
                
                # Ask if user wants to update MongoDB
                roll_number = input("\nEnter roll number to update MongoDB (or press Enter to skip): ").strip()
                if roll_number:
                    update_mongodb(roll_number, data)
                
                logger.info("")
                logger.info("✅ Done! Enter another URL or 'exit' to quit.")
                logger.info("")
                
            except KeyboardInterrupt:
                logger.info("")
                logger.info("👋 Exiting...")
                break
            except Exception as e:
                logger.error(f"❌ Error: {e}")
                import traceback
                traceback.print_exc()
                continue


if __name__ == "__main__":
    main()

