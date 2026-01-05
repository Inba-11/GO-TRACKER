#!/usr/bin/env python3
"""
LeetCode Scraper - Production Ready
Safe + Rate Limited + Comprehensive Data
"""

import requests
import time
import random
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def safe_request(url, headers=None, timeout=10, retries=3):
    """Make a safe HTTP request with retries"""
    if headers is None:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    
    for attempt in range(retries):
        try:
            # Random delay to avoid rate limiting
            time.sleep(random.uniform(1, 3))
            
            response = requests.get(url, headers=headers, timeout=timeout)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:  # Rate limited
                wait_time = 2 ** attempt  # Exponential backoff
                logger.warning(f"Rate limited, waiting {wait_time}s before retry {attempt + 1}")
                time.sleep(wait_time)
                continue
            else:
                logger.warning(f"HTTP {response.status_code} for {url}")
                return None
                
        except requests.exceptions.Timeout:
            logger.warning(f"Timeout on attempt {attempt + 1} for {url}")
        except requests.exceptions.RequestException as e:
            logger.warning(f"Request error on attempt {attempt + 1}: {e}")
        
        if attempt < retries - 1:
            time.sleep(2 ** attempt)  # Exponential backoff
    
    return None

def scrape_leetcode_user(username):
    """
    Scrape LeetCode user data
    Returns: dict with rating, solved problems, contests, etc.
    """
    try:
        logger.info(f"Scraping LeetCode for {username}")
        
        # LeetCode GraphQL endpoint
        graphql_url = "https://leetcode.com/graphql"
        
        # Query for user profile data
        profile_query = {
            "query": """
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    profile {
                        ranking
                        userAvatar
                        realName
                    }
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                        totalSubmissionNum {
                            difficulty
                            count
                        }
                    }
                }
            }
            """,
            "variables": {"username": username}
        }
        
        # Query for contest data
        contest_query = {
            "query": """
            query getUserContestRanking($username: String!) {
                userContestRanking(username: $username) {
                    attendedContestsCount
                    rating
                    globalRanking
                    totalParticipants
                    topPercentage
                    badge {
                        name
                    }
                }
                userContestRankingHistory(username: $username) {
                    attended
                    trendDirection
                    problemsSolved
                    totalProblems
                    finishTimeInSeconds
                    rating
                    ranking
                    contest {
                        title
                        startTime
                    }
                }
            }
            """,
            "variables": {"username": username}
        }
        
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        # Get profile data
        profile_response = safe_request(graphql_url, headers=headers)
        if not profile_response:
            logger.error(f"Failed to get profile data for {username}")
            return None
        
        # Get contest data
        time.sleep(random.uniform(2, 4))  # Delay between requests
        contest_response = safe_request(graphql_url, headers=headers)
        
        # Parse profile data
        user_data = profile_response.get('data', {}).get('matchedUser')
        if not user_data:
            logger.warning(f"No user data found for {username}")
            return None
        
        # Extract solved problems
        submit_stats = user_data.get('submitStats', {})
        ac_submissions = submit_stats.get('acSubmissionNum', [])
        
        total_solved = 0
        easy_solved = 0
        medium_solved = 0
        hard_solved = 0
        
        for stat in ac_submissions:
            difficulty = stat.get('difficulty', '').lower()
            count = stat.get('count', 0)
            
            if difficulty == 'easy':
                easy_solved = count
            elif difficulty == 'medium':
                medium_solved = count
            elif difficulty == 'hard':
                hard_solved = count
            
            total_solved += count
        
        # Extract contest data
        contest_data = contest_response.get('data', {}) if contest_response else {}
        contest_ranking = contest_data.get('userContestRanking', {})
        contest_history = contest_data.get('userContestRankingHistory', [])
        
        # Calculate additional metrics
        current_rating = contest_ranking.get('rating', 0) if contest_ranking else 0
        max_rating = current_rating
        
        # Find max rating from history
        if contest_history:
            ratings = [h.get('rating', 0) for h in contest_history if h.get('rating')]
            if ratings:
                max_rating = max(ratings)
        
        # Recent activity (last 7 days)
        recent_cutoff = datetime.now().timestamp() - (7 * 24 * 60 * 60)
        recent_contests = 0
        
        if contest_history:
            for contest in contest_history:
                contest_info = contest.get('contest', {})
                start_time = contest_info.get('startTime', 0)
                if start_time and start_time > recent_cutoff:
                    recent_contests += 1
        
        # Build result
        result = {
            'username': username,
            'rating': current_rating,
            'maxRating': max_rating,
            'globalRanking': contest_ranking.get('globalRanking', 0) if contest_ranking else 0,
            'totalSolved': total_solved,
            'easySolved': easy_solved,
            'mediumSolved': medium_solved,
            'hardSolved': hard_solved,
            'contestsAttended': contest_ranking.get('attendedContestsCount', 0) if contest_ranking else 0,
            'recentContests': recent_contests,
            'badge': contest_ranking.get('badge', {}).get('name', '') if contest_ranking else '',
            'lastUpdated': datetime.utcnow(),
            'dataSource': 'leetcode_graphql'
        }
        
        logger.info(f"✅ LeetCode data for {username}: {total_solved} solved, {current_rating} rating")
        return result
        
    except Exception as e:
        logger.error(f"Error scraping LeetCode for {username}: {e}")
        return None

def get_leetcode_daily_stats(username):
    """Get today's solved problems count"""
    try:
        # This would require more complex tracking
        # For now, return 0 as placeholder
        return {
            'solvedToday': 0,
            'solvedThisWeek': 0,
            'solvedThisMonth': 0
        }
    except Exception as e:
        logger.error(f"Error getting daily stats for {username}: {e}")
        return {
            'solvedToday': 0,
            'solvedThisWeek': 0,
            'solvedThisMonth': 0
        }

if __name__ == "__main__":
    # Test the scraper
    test_username = "tourist"  # Famous competitive programmer
    result = scrape_leetcode_user(test_username)
    if result:
        print(f"✅ Test successful: {result}")
    else:
        print("❌ Test failed")