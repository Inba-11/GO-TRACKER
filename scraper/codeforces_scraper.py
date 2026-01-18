#!/usr/bin/env python3
"""
Enhanced Codeforces Scraper - Production Ready
Uses Official Codeforces API + Comprehensive Data Extraction
Based on CodeChef scraper structure
"""

import requests
import time
import random
import logging
import re
import json
import traceback
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

# Constants
CODEFORCES_API_BASE = 'https://codeforces.com/api'
DEFAULT_TIMEOUT = 15
DEFAULT_RETRIES = 3
API_RATE_LIMIT_DELAY = 1.5  # Codeforces: 5 requests per second

def safe_codeforces_request(endpoint, params=None, timeout=15, retries=3):
    """Make a safe Codeforces API request with rate limiting"""
    url = f"{CODEFORCES_API_BASE}/{endpoint}"
    
    for attempt in range(retries):
        try:
            # Codeforces API rate limit: 5 requests per second
            if attempt > 0:
                time.sleep(random.uniform(API_RATE_LIMIT_DELAY, API_RATE_LIMIT_DELAY + 1))
            else:
                time.sleep(random.uniform(0.2, 0.5))  # Small delay even on first attempt
            
            response = requests.get(url, params=params, timeout=timeout)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'OK':
                    return data.get('result')
                else:
                    error_comment = data.get('comment', 'Unknown error')
                    logger.warning(f"Codeforces API error: {error_comment}")
                    return None
            elif response.status_code == 429:  # Rate limited
                wait_time = 2 ** attempt * 2
                logger.warning(f"Codeforces rate limited, waiting {wait_time}s before retry {attempt + 1}")
                time.sleep(wait_time)
                continue
            else:
                logger.warning(f"Codeforces HTTP {response.status_code} for {url}")
                return None
                
        except requests.exceptions.Timeout:
            logger.warning(f"Codeforces timeout on attempt {attempt + 1}")
        except requests.exceptions.RequestException as e:
            logger.warning(f"Codeforces request error on attempt {attempt + 1}: {e}")
        
        if attempt < retries - 1:
            time.sleep(2 ** attempt)
    
    return None

def _create_result_dict(username, data_source='codeforces_api'):
    """Helper function to create standardized result dictionary"""
    return {
        'username': username,
        'rating': 0,
        'maxRating': 0,
        'currentRating': 0,
        'highestRating': 0,
        'rank': 'unrated',
        'maxRank': 'unrated',
        'globalRank': 0,
        'countryRank': 0,
        'totalSolved': 0,
        'problemsSolved': 0,
        'contestsAttended': 0,
        'totalSubmissions': 0,
        'acceptedSubmissions': 0,
        'submissionHeatmap': [],
        'submissionByDate': {},
        'submissionStats': {
            'daysWithSubmissions': 0,
            'maxDailySubmissions': 0,
            'avgDailySubmissions': 0.0
        },
        'recentContests': [],
        'contestHistory': [],
        'country': '',
        'city': '',
        'organization': '',
        'contribution': 0,
        'friendOfCount': 0,
        'lastOnlineTime': 0,
        'registrationTime': 0,
        'lastUpdated': datetime.now(timezone.utc),
        'dataSource': data_source
    }

def extract_submissions_heatmap(submissions):
    """
    Extract submission heatmap from Codeforces submissions
    Similar to CodeChef heatmap extraction
    """
    result = {
        'totalSubmissions': 0,
        'submissionHeatmap': [],
        'submissionByDate': {},
        'submissionStats': {
            'daysWithSubmissions': 0,
            'maxDailySubmissions': 0,
            'avgDailySubmissions': 0.0
        }
    }
    
    try:
        submissions_by_date = {}
        max_daily = 0
        
        for submission in submissions:
            # Convert timestamp to date
            timestamp = submission.get('creationTimeSeconds', 0)
            if timestamp:
                date_obj = datetime.fromtimestamp(timestamp, tz=timezone.utc)
                date_str = date_obj.strftime('%Y-%m-%d')
                
                submissions_by_date[date_str] = submissions_by_date.get(date_str, 0) + 1
                max_daily = max(max_daily, submissions_by_date[date_str])
        
        # Convert to heatmap format
        total_submissions = len(submissions)
        heatmap_data = []
        
        for date_str, count in sorted(submissions_by_date.items()):
            heatmap_data.append({
                'date': date_str,
                'count': count,
                'category': min(4, count // max(1, max_daily // 4)) if max_daily > 0 else 0  # 0-4 intensity
            })
        
        result['totalSubmissions'] = total_submissions
        result['submissionHeatmap'] = heatmap_data
        result['submissionByDate'] = submissions_by_date
        result['submissionStats']['daysWithSubmissions'] = len(submissions_by_date)
        result['submissionStats']['maxDailySubmissions'] = max_daily
        result['submissionStats']['avgDailySubmissions'] = (
            round(total_submissions / len(submissions_by_date), 2) 
            if submissions_by_date else 0.0
        )
        
        logger.info(f"[Heatmap] Extracted {total_submissions} submissions from {len(submissions_by_date)} days")
        
    except Exception as e:
        logger.warning(f"Error extracting submission heatmap: {e}")
    
    return result

def scrape_codeforces_user(username, include_contest_history=True):
    """
    Main scraping function - Enhanced version based on CodeChef structure
    Returns: dict with rating, solved problems, contests, heatmap, etc.
    
    Args:
        username: Codeforces handle
        include_contest_history: If True, fetches recent contest history with details (default: True)
    """
    try:
        logger.info(f"[Main] Starting scraping for username: {username}")
        
        # Initialize result
        result = _create_result_dict(username, 'codeforces_api')
        
        # Get user info
        logger.info(f"[API] Fetching user info for {username}...")
        user_info = safe_codeforces_request('user.info', {'handles': username})
        if not user_info or len(user_info) == 0:
            logger.warning(f"No Codeforces user found: {username}")
            return None
        
        user_data = user_info[0]
        
        # Extract basic user info
        result['rating'] = user_data.get('rating', 0)
        result['currentRating'] = result['rating']
        result['maxRating'] = user_data.get('maxRating', result['rating'])
        result['highestRating'] = result['maxRating']
        result['rank'] = user_data.get('rank', 'unrated')
        result['maxRank'] = user_data.get('maxRank', result['rank'])
        result['country'] = user_data.get('country', '')
        result['city'] = user_data.get('city', '')
        result['organization'] = user_data.get('organization', '')
        result['contribution'] = user_data.get('contribution', 0)
        result['friendOfCount'] = user_data.get('friendOfCount', 0)
        result['lastOnlineTime'] = user_data.get('lastOnlineTimeSeconds', 0)
        result['registrationTime'] = user_data.get('registrationTimeSeconds', 0)
        
        # Get user rating history (for contests)
        logger.info(f"[API] Fetching rating history for {username}...")
        rating_history = safe_codeforces_request('user.rating', {'handle': username})
        if rating_history is None:
            rating_history = []
        
        result['contestsAttended'] = len(rating_history)
        
        # Get user submissions (for problems solved and heatmap)
        logger.info(f"[API] Fetching submissions for {username}...")
        submissions = safe_codeforces_request('user.status', {'handle': username, 'from': 1, 'count': 10000})
        if submissions is None:
            submissions = []
        
        # Calculate problem solving stats
        solved_problems = set()
        total_submissions = len(submissions)
        accepted_submissions = 0
        problem_ratings = []
        
        for submission in submissions:
            if submission.get('verdict') == 'OK':
                accepted_submissions += 1
                problem = submission.get('problem', {})
                problem_id = f"{problem.get('contestId', '')}{problem.get('index', '')}"
                solved_problems.add(problem_id)
                
                # Track problem ratings
                if 'rating' in problem:
                    problem_ratings.append(problem['rating'])
        
        result['totalSolved'] = len(solved_problems)
        result['problemsSolved'] = result['totalSolved']
        result['totalSubmissions'] = total_submissions
        result['acceptedSubmissions'] = accepted_submissions
        
        # Extract submission heatmap
        logger.info(f"[Heatmap] Extracting submission heatmap...")
        heatmap_data = extract_submissions_heatmap(submissions)
        result['submissionHeatmap'] = heatmap_data['submissionHeatmap']
        result['submissionByDate'] = heatmap_data['submissionByDate']
        result['submissionStats'] = heatmap_data['submissionStats']
        
        # Extract contest history with details
        if include_contest_history:
            logger.info(f"[Contests] Fetching contest history for {username}...")
            contest_history = get_codeforces_contest_history(username, rating_history, limit=10)
            if contest_history:
                result['recentContests'] = contest_history
                result['contestHistory'] = contest_history
                logger.info(f"✅ Added {len(contest_history)} contests with details")
            else:
                result['recentContests'] = []
                result['contestHistory'] = []
        
        logger.info(f"[Main] SUCCESS Codeforces data for {username}: {result['totalSolved']} solved, {result['rating']} rating, {result['contestsAttended']} contests, {result['totalSubmissions']} submissions")
        return result
        
    except Exception as e:
        logger.error(f"[Main] Error scraping Codeforces for {username}: {e}")
        logger.exception("Full traceback:")
        return None

def get_codeforces_contest_history(username, rating_history, limit=10):
    """
    Get detailed contest history for a user with dates, ranks, and problems solved
    Returns last N most recent contests in descending order (newest first)
    Similar structure to CodeChef contest history
    """
    try:
        logger.info(f"[Contest History] Fetching contest history for {username} (limit: {limit})")
        
        if not rating_history:
            logger.warning(f"No rating history found for {username}")
            return []
        
        # Get recent submissions to find problems solved in contests
        submissions = safe_codeforces_request('user.status', {'handle': username, 'from': 1, 'count': 5000})
        if submissions is None:
            submissions = []
        
        # Map contest ID to problems solved
        problems_by_contest = {}
        for submission in submissions:
            if submission.get('verdict') == 'OK':
                problem = submission.get('problem', {})
                contest_id = problem.get('contestId')
                if contest_id:
                    problem_id = f"{contest_id}{problem.get('index', '')}"
                    if contest_id not in problems_by_contest:
                        problems_by_contest[contest_id] = set()
                    problems_by_contest[contest_id].add(problem_id)
        
        # Build contest history
        contests = []
        for i, contest in enumerate(reversed(rating_history[-limit:])):  # Reverse to get newest first
            contest_id = contest.get('contestId')
            old_rating = contest.get('oldRating', 0)
            new_rating = contest.get('newRating', 0)
            rating_change = new_rating - old_rating
            
            # Get problems solved for this contest
            problems_solved = list(problems_by_contest.get(contest_id, set()))
            problems_count = len(problems_solved)
            
            # Convert timestamp to ISO date
            timestamp = contest.get('ratingUpdateTimeSeconds', 0)
            contest_date = None
            if timestamp:
                contest_date = datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()
            
            contests.append({
                'contestId': contest_id,
                'contestCode': str(contest_id),
                'name': contest.get('contestName', f'Contest {contest_id}'),
                'date': contest_date,
                'rating': new_rating,
                'rank': contest.get('rank', 0),
                'ratingChange': rating_change,
                'oldRating': old_rating,
                'newRating': new_rating,
                'problemsSolved': problems_solved,
                'problemsCount': problems_count,
                'attended': True
            })
        
        logger.info(f"[Contest History] ✅ Extracted {len(contests)} contests for {username}")
        return contests
        
    except Exception as e:
        logger.error(f"[Contest History] Error getting contest history for {username}: {e}")
        logger.exception("Full traceback:")
        return []

def get_codeforces_contest_performance(username, limit=10):
    """Get recent contest performance details"""
    try:
        rating_history = safe_codeforces_request('user.rating', {'handle': username})
        if not rating_history:
            return []
        
        # Get last N contests
        recent_contests = rating_history[-limit:] if len(rating_history) > limit else rating_history
        
        performance = []
        for i, contest in enumerate(recent_contests):
            prev_rating = recent_contests[i-1].get('newRating', 0) if i > 0 else 0
            current_rating = contest.get('newRating', 0)
            rating_change = current_rating - prev_rating if prev_rating > 0 else 0
            
            performance.append({
                'contestId': contest.get('contestId'),
                'contestName': contest.get('contestName', ''),
                'rank': contest.get('rank', 0),
                'oldRating': contest.get('oldRating', 0),
                'newRating': current_rating,
                'ratingChange': rating_change,
                'time': contest.get('ratingUpdateTimeSeconds', 0)
            })
        
        return performance
        
    except Exception as e:
        logger.error(f"Error getting contest performance for {username}: {e}")
        return []

def get_codeforces_problem_stats(username):
    """Get detailed problem solving statistics"""
    try:
        submissions = safe_codeforces_request('user.status', {'handle': username, 'from': 1, 'count': 2000})
        if not submissions:
            return {}
        
        stats = {
            'by_rating': {},
            'by_tags': {},
            'by_verdict': {},
            'solved_by_rating': {}
        }
        
        solved_problems = set()
        
        for submission in submissions:
            verdict = submission.get('verdict', 'UNKNOWN')
            problem = submission.get('problem', {})
            
            # Count by verdict
            stats['by_verdict'][verdict] = stats['by_verdict'].get(verdict, 0) + 1
            
            # For accepted solutions only
            if verdict == 'OK':
                problem_id = f"{problem.get('contestId', '')}{problem.get('index', '')}"
                if problem_id not in solved_problems:
                    solved_problems.add(problem_id)
                    
                    # Count by rating
                    rating = problem.get('rating', 0)
                    if rating > 0:
                        rating_bucket = (rating // 100) * 100  # Round to nearest 100
                        stats['solved_by_rating'][rating_bucket] = stats['solved_by_rating'].get(rating_bucket, 0) + 1
                    
                    # Count by tags
                    tags = problem.get('tags', [])
                    for tag in tags:
                        stats['by_tags'][tag] = stats['by_tags'].get(tag, 0) + 1
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting problem stats for {username}: {e}")
        return {}

if __name__ == "__main__":
    # Test the scraper
    import sys
    import io
    
    # Set UTF-8 encoding for Windows console
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    test_username = "tourist" if len(sys.argv) < 2 else sys.argv[1]
    
    print("\n" + "="*70)
    print("ENHANCED CODEFORCES SCRAPER TEST")
    print("="*70)
    print(f"Testing with: {test_username}\n")
    
    result = scrape_codeforces_user(test_username, include_contest_history=True)
    
    if result:
        print(f"\n✅ SUCCESS - Data scraped using: {result['dataSource']}")
        print("\nScraped Data:")
        print("-" * 70)
        for key, value in result.items():
            if key not in ['lastUpdated', 'submissionHeatmap', 'submissionByDate']:
                print(f"  {key:25s}: {value}")
        print("-" * 70)
        print(f"\nSubmission Heatmap: {len(result.get('submissionHeatmap', []))} days")
        print(f"Contest History: {len(result.get('contestHistory', []))} contests")
    else:
        print("\n❌ FAILED - No data could be scraped")
    
    print("\n" + "="*70 + "\n")
