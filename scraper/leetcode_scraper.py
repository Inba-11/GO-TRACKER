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
import sys

# Configure logging if not already configured
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    force=True  # Override existing config if any
)

logger = logging.getLogger(__name__)

def safe_request(url, headers=None, json_data=None, timeout=60, retries=3):
    """Make a safe HTTP request with retries (supports GET and POST)"""
    if headers is None:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    
    for attempt in range(retries):
        try:
            # Random delay to avoid rate limiting
            if attempt > 0:
                time.sleep(random.uniform(1, 3))
            
            # Use POST if json_data is provided, otherwise GET
            if json_data:
                response = requests.post(url, headers=headers, json=json_data, timeout=timeout)
            else:
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
                if response.status_code == 400:
                    logger.warning(f"Response: {response.text[:500]}")
                elif response.status_code == 403:
                    logger.error(f"Access forbidden - LeetCode may be blocking requests")
                elif response.status_code == 500:
                    logger.error(f"LeetCode server error")
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
        print(f"📊 Scraping LeetCode for username: {username}")
        sys.stdout.flush()
        
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
                        reputation
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
                        icon
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
        
        # Query for activity, streak, and calendar
        activity_query = {
            "query": """
            query getUserActivity($username: String!) {
                matchedUser(username: $username) {
                    userCalendar {
                        activeYears
                        streak
                        totalActiveDays
                        submissionCalendar
                    }
                }
            }
            """,
            "variables": {"username": username}
        }
        
        # Query for all badges
        badges_query = {
            "query": """
            query getUserBadges($username: String!) {
                matchedUser(username: $username) {
                    badges {
                        id
                        displayName
                        icon
                        creationDate
                    }
                    upcomingBadges {
                        name
                        icon
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
        profile_response = safe_request(graphql_url, headers=headers, json_data=profile_query)
        if not profile_response or not isinstance(profile_response, dict):
            logger.error(f"Failed to get profile data for {username}")
            print(f"❌ ERROR: Failed to get profile data from LeetCode API")
            sys.stdout.flush()
            return None
        
        # Check for GraphQL errors
        if 'errors' in profile_response:
            errors = profile_response.get('errors', [])
            logger.error(f"GraphQL errors for {username}: {errors}")
            print(f"❌ ERROR: GraphQL API returned errors for {username}")
            print(f"   Errors: {errors}")
            sys.stdout.flush()
            return None
        
        # Get contest data
        time.sleep(random.uniform(2, 4))  # Delay between requests
        contest_response = safe_request(graphql_url, headers=headers, json_data=contest_query)
        
        # Get activity data (streak, submissions)
        time.sleep(random.uniform(2, 4))  # Delay between requests
        activity_response = safe_request(graphql_url, headers=headers, json_data=activity_query)
        
        # Get badges data
        time.sleep(random.uniform(2, 4))  # Delay between requests
        badges_response = safe_request(graphql_url, headers=headers, json_data=badges_query)
        
        # Parse profile data
        profile_data = profile_response.get('data', {})
        if not profile_data:
            logger.warning(f"No data in response for {username}")
            return None
            
        user_data = profile_data.get('matchedUser')
        if not user_data:
            logger.warning(f"No user data found for {username} - user may not exist")
            print(f"❌ ERROR: User '{username}' not found on LeetCode")
            sys.stdout.flush()
            return None
        
        # Extract profile data
        profile = user_data.get('profile', {}) or {}
        profile_ranking = profile.get('ranking', 0) or 0
        reputation = profile.get('reputation', 0) or 0
        real_name = profile.get('realName', '')
        user_avatar = profile.get('userAvatar', '')
        
        # Extract solved problems
        submit_stats = user_data.get('submitStats', {}) or {}
        ac_submissions = submit_stats.get('acSubmissionNum', []) if submit_stats else []
        total_submissions = submit_stats.get('totalSubmissionNum', []) if submit_stats else []
        
        total_solved = 0
        easy_solved = 0
        medium_solved = 0
        hard_solved = 0
        
        total_submissions_count = 0
        easy_submissions = 0
        medium_submissions = 0
        hard_submissions = 0
        
        # First, look for "All" difficulty which gives total
        for stat in ac_submissions:
            difficulty = stat.get('difficulty', '').lower()
            count = stat.get('count', 0)
            
            if difficulty == 'all':
                total_solved = count
                break
        
        # Extract total submissions
        for stat in total_submissions:
            difficulty = stat.get('difficulty', '').lower()
            count = stat.get('count', 0)
            
            if difficulty == 'all':
                total_submissions_count = count
                break
        
        # If "All" not found, calculate from individual difficulties
        if total_solved == 0:
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
        else:
            # Extract individual difficulties
            for stat in ac_submissions:
                difficulty = stat.get('difficulty', '').lower()
                count = stat.get('count', 0)
                
                if difficulty == 'easy':
                    easy_solved = count
                elif difficulty == 'medium':
                    medium_solved = count
                elif difficulty == 'hard':
                    hard_solved = count
        
        # Extract individual submission counts
        for stat in total_submissions:
            difficulty = stat.get('difficulty', '').lower()
            count = stat.get('count', 0)
            
            if difficulty == 'easy':
                easy_submissions = count
            elif difficulty == 'medium':
                medium_submissions = count
            elif difficulty == 'hard':
                hard_submissions = count
        
        # Calculate acceptance rate
        acceptance_rate = 0.0
        if total_submissions_count > 0:
            acceptance_rate = round((total_solved / total_submissions_count) * 100, 2)
        
        # Extract contest data
        contest_data = {}
        if contest_response and isinstance(contest_response, dict):
            contest_data = contest_response.get('data', {})
        contest_ranking = contest_data.get('userContestRanking', {}) if contest_data else {}
        contest_history = contest_data.get('userContestRankingHistory', []) if contest_data else []
        
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
        
        # Process full contest history with all details
        contest_history_details = []
        if contest_history:
            for contest in contest_history:
                contest_info = contest.get('contest', {})
                contest_history_details.append({
                    'title': contest_info.get('title', ''),
                    'startTime': contest_info.get('startTime', 0),
                    'attended': contest.get('attended', False),
                    'rating': contest.get('rating', 0),
                    'ranking': contest.get('ranking', 0),
                    'problemsSolved': contest.get('problemsSolved', 0),
                    'totalProblems': contest.get('totalProblems', 0),
                    'finishTimeInSeconds': contest.get('finishTimeInSeconds', 0),
                    'trendDirection': contest.get('trendDirection', '')
                })
        
        # Extract activity data (streak, totalActiveDays, recent submissions)
        streak = 0
        total_active_days = 0
        recent_submissions = []
        
        if activity_response and isinstance(activity_response, dict):
            activity_data = activity_response.get('data', {})
            matched_user_activity = activity_data.get('matchedUser', {}) if activity_data else {}
            user_calendar = matched_user_activity.get('userCalendar', {}) if matched_user_activity else {}
            
            streak = user_calendar.get('streak', 0) if user_calendar else 0
            total_active_days = user_calendar.get('totalActiveDays', 0) if user_calendar else 0
            
            # Parse submission calendar (JSON string with timestamp: count pairs)
            submission_calendar_str = user_calendar.get('submissionCalendar', '') if user_calendar else ''
            submission_calendar_data = {}
            if submission_calendar_str:
                try:
                    import json
                    submission_calendar_data = json.loads(submission_calendar_str)
                    # submission_calendar is a dict with timestamp keys and count values
                    # We can use this to calculate activity, but recent submissions need a different approach
                except:
                    submission_calendar_str = '{}'  # Fallback to empty object if parsing fails
            else:
                submission_calendar_str = '{}'  # Ensure it's always a valid JSON string
        
        # Extract badges data
        badges_list = []
        active_badge = ''
        
        if badges_response and isinstance(badges_response, dict):
            badges_data = badges_response.get('data', {})
            matched_user_badges = badges_data.get('matchedUser', {}) if badges_data else {}
            
            badges = matched_user_badges.get('badges', []) if matched_user_badges else []
            for badge in badges:
                badges_list.append({
                    'id': badge.get('id', ''),
                    'displayName': badge.get('displayName', ''),
                    'icon': badge.get('icon', ''),
                    'creationDate': badge.get('creationDate', '')
                })
            
            # Get active badge from contest ranking if available
            if contest_ranking and contest_ranking.get('badge'):
                active_badge = contest_ranking.get('badge', {}).get('name', '')
        
        # Calculate last week rating (rating from 7 days ago)
        last_week_rating = current_rating
        if contest_history:
            week_ago_cutoff = datetime.now().timestamp() - (7 * 24 * 60 * 60)
            for contest in reversed(contest_history):  # Start from most recent
                contest_info = contest.get('contest', {})
                start_time = contest_info.get('startTime', 0)
                if start_time and start_time <= week_ago_cutoff:
                    last_week_rating = contest.get('rating', current_rating)
                    break
        
        # Build comprehensive result with ALL available data
        result = {
            # Profile Information
            'username': username,
            'realName': real_name,
            'userAvatar': user_avatar,
            'ranking': profile_ranking,
            'reputation': reputation,
            
            # Problem Solving Statistics
            'totalSolved': total_solved,
            'easySolved': easy_solved,
            'mediumSolved': medium_solved,
            'hardSolved': hard_solved,
            'totalSubmissions': total_submissions_count,
            'acceptanceRate': acceptance_rate,
            
            # Contest Data
            'rating': current_rating,
            'maxRating': max_rating,
            'lastWeekRating': last_week_rating,
            'globalRanking': contest_ranking.get('globalRanking', 0) if contest_ranking else 0,
            'contestsAttended': contest_ranking.get('attendedContestsCount', 0) if contest_ranking else 0,
            'contests': contest_ranking.get('attendedContestsCount', 0) if contest_ranking else 0,
            'recentContests': recent_contests,
            'topPercentage': contest_ranking.get('topPercentage', 0) if contest_ranking else 0,
            'totalParticipants': contest_ranking.get('totalParticipants', 0) if contest_ranking else 0,
            'badge': active_badge,
            
            # Activity Data
            'streak': streak,
            'totalActiveDays': total_active_days,
            'recentSubmissions': recent_submissions,
            'submissionCalendar': submission_calendar_str,  # JSON string for frontend parsing
            
            # Contest History (Full Details)
            'contestHistory': contest_history_details,
            
            # Badges
            'badges': badges_list,
            'activeBadge': active_badge,
            
            # Metadata
            'lastUpdated': datetime.utcnow(),
            'dataSource': 'leetcode_graphql'
        }
        
        logger.info(f"✅ LeetCode data for {username}: {total_solved} solved, {current_rating} rating")
        print(f"✅ Successfully scraped LeetCode data for {username}")
        print(f"   📊 Problems Solved: {total_solved}")
        print(f"   ⭐ Rating: {current_rating}")
        print(f"   🏆 Max Rating: {max_rating}")
        sys.stdout.flush()
        return result
        
    except Exception as e:
        logger.error(f"Error scraping LeetCode for {username}: {e}")
        print(f"❌ ERROR: Failed to scrape LeetCode data for {username}")
        print(f"   Error: {str(e)}")
        sys.stdout.flush()
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
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