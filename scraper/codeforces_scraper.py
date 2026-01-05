#!/usr/bin/env python3
"""
Codeforces Scraper - Production Ready
Uses Official Codeforces API + Safe Rate Limiting
"""

import requests
import time
import random
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

CODEFORCES_API_BASE = 'https://codeforces.com/api'

def safe_codeforces_request(endpoint, params=None, timeout=10, retries=3):
    """Make a safe Codeforces API request with rate limiting"""
    url = f"{CODEFORCES_API_BASE}/{endpoint}"
    
    for attempt in range(retries):
        try:
            # Codeforces API rate limit: 5 requests per second
            time.sleep(random.uniform(1, 2))
            
            response = requests.get(url, params=params, timeout=timeout)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'OK':
                    return data.get('result')
                else:
                    logger.warning(f"Codeforces API error: {data.get('comment', 'Unknown error')}")
                    return None
            elif response.status_code == 429:  # Rate limited
                wait_time = 2 ** attempt * 2  # Exponential backoff
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
            time.sleep(2 ** attempt)  # Exponential backoff
    
    return None

def scrape_codeforces_user(username):
    """
    Scrape Codeforces user data using official API
    Returns: dict with rating, solved problems, contests, etc.
    """
    try:
        logger.info(f"Scraping Codeforces for {username}")
        
        # Get user info
        user_info = safe_codeforces_request('user.info', {'handles': username})
        if not user_info or len(user_info) == 0:
            logger.warning(f"No Codeforces user found: {username}")
            return None
        
        user_data = user_info[0]
        
        # Get user rating history
        rating_history = safe_codeforces_request('user.rating', {'handle': username})
        if rating_history is None:
            rating_history = []
        
        # Get user submissions
        submissions = safe_codeforces_request('user.status', {'handle': username, 'from': 1, 'count': 1000})
        if submissions is None:
            submissions = []
        
        # Calculate basic stats
        current_rating = user_data.get('rating', 0)
        max_rating = user_data.get('maxRating', current_rating)
        rank = user_data.get('rank', 'unrated')
        max_rank = user_data.get('maxRank', rank)
        
        # Calculate contest stats
        total_contests = len(rating_history)
        
        # Calculate recent contest performance
        recent_contests = 0
        rating_change_last_contest = 0
        
        if rating_history:
            # Recent contests (last 30 days)
            cutoff_time = datetime.now().timestamp() - (30 * 24 * 60 * 60)
            recent_contests = sum(1 for contest in rating_history 
                                if contest.get('ratingUpdateTimeSeconds', 0) > cutoff_time)
            
            # Last contest rating change
            if len(rating_history) >= 2:
                last_contest = rating_history[-1]
                prev_contest = rating_history[-2]
                rating_change_last_contest = last_contest.get('newRating', 0) - prev_contest.get('newRating', 0)
        
        # Calculate problem solving stats
        solved_problems = set()
        total_submissions = len(submissions)
        accepted_submissions = 0
        
        # Problem difficulty stats
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
        
        total_solved = len(solved_problems)
        
        # Calculate average problem rating
        avg_problem_rating = 0
        if problem_ratings:
            avg_problem_rating = sum(problem_ratings) // len(problem_ratings)
        
        # Recent activity (last 7 days)
        recent_cutoff = datetime.now().timestamp() - (7 * 24 * 60 * 60)
        recent_submissions = sum(1 for sub in submissions 
                               if sub.get('creationTimeSeconds', 0) > recent_cutoff)
        
        recent_solved = len(set(
            f"{sub.get('problem', {}).get('contestId', '')}{sub.get('problem', {}).get('index', '')}"
            for sub in submissions
            if sub.get('creationTimeSeconds', 0) > recent_cutoff and sub.get('verdict') == 'OK'
        ))
        
        # Build result
        result = {
            'username': username,
            'rating': current_rating,
            'maxRating': max_rating,
            'rank': rank,
            'maxRank': max_rank,
            'totalSolved': total_solved,
            'totalSubmissions': total_submissions,
            'acceptedSubmissions': accepted_submissions,
            'contestsAttended': total_contests,
            'recentContests': recent_contests,
            'ratingChangeLastContest': rating_change_last_contest,
            'avgProblemRating': avg_problem_rating,
            'recentSubmissions': recent_submissions,
            'recentSolved': recent_solved,
            'country': user_data.get('country', ''),
            'city': user_data.get('city', ''),
            'organization': user_data.get('organization', ''),
            'contribution': user_data.get('contribution', 0),
            'friendOfCount': user_data.get('friendOfCount', 0),
            'lastOnlineTime': user_data.get('lastOnlineTimeSeconds', 0),
            'registrationTime': user_data.get('registrationTimeSeconds', 0),
            'lastUpdated': datetime.utcnow(),
            'dataSource': 'codeforces_api'
        }
        
        logger.info(f"✅ Codeforces data for {username}: {total_solved} solved, {current_rating} rating, {total_contests} contests")
        return result
        
    except Exception as e:
        logger.error(f"Error scraping Codeforces for {username}: {e}")
        return None

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
    test_username = "tourist"  # Famous competitive programmer
    result = scrape_codeforces_user(test_username)
    if result:
        print(f"✅ Test successful: {result}")
    else:
        print("❌ Test failed")