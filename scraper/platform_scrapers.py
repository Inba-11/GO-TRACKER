"""
Platform Scrapers - Fetch real data from coding platforms
IMPROVED VERSION - Gets all missing data points
"""
import requests
from bs4 import BeautifulSoup
import time
import re
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class PlatformScraper:
    def __init__(self, delay=3, max_retries=3):
        self.delay = delay
        self.max_retries = max_retries
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        # GitHub token for GraphQL API (optional but recommended)
        self.github_token = os.getenv('GITHUB_TOKEN', '')
    
    def sleep(self):
        """Rate limiting delay"""
        time.sleep(self.delay)
    
    def scrape_leetcode(self, username):
        """Scrape LeetCode profile using GraphQL API"""
        try:
            print(f"  📊 Scraping LeetCode: {username}")
            
            # LeetCode GraphQL API
            url = "https://leetcode.com/graphql"
            query = """
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    profile {
                        ranking
                        reputation
                    }
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                    }
                }
                userContestRanking(username: $username) {
                    attendedContestsCount
                    rating
                    globalRanking
                    topPercentage
                }
            }
            """
            
            response = requests.post(
                url,
                json={'query': query, 'variables': {'username': username}},
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('data') and data['data'].get('matchedUser'):
                    user_data = data['data']['matchedUser']
                    contest_data = data['data'].get('userContestRanking', {})
                    
                    # Calculate total problems
                    total_solved = 0
                    if user_data.get('submitStats'):
                        for item in user_data['submitStats']['acSubmissionNum']:
                            if item['difficulty'] == 'All':
                                total_solved = item['count']
                                break
                    
                    result = {
                        'username': username,
                        'problemsSolved': total_solved,
                        'rating': int(contest_data.get('rating', 0)) if contest_data else 0,
                        'maxRating': int(contest_data.get('rating', 0)) if contest_data else 0,
                        'rank': contest_data.get('globalRanking', 0) if contest_data else 0,
                        'contests': contest_data.get('attendedContestsCount', 0) if contest_data else 0,
                        'contestsAttended': contest_data.get('attendedContestsCount', 0) if contest_data else 0,
                        'lastWeekRating': 0,
                        'lastUpdated': datetime.now()
                    }
                    
                    print(f"    ✅ LeetCode: {total_solved} problems, Rating: {result['rating']}")
                    return result
            
            print(f"    ⚠️ LeetCode: No data found for {username}")
            return self._get_default_leetcode(username)
            
        except Exception as e:
            print(f"    ❌ LeetCode error: {str(e)}")
            return self._get_default_leetcode(username)
    
    def scrape_codechef(self, username):
        """Scrape CodeChef profile using API"""
        try:
            print(f"  📊 Scraping CodeChef: {username}")
            
            # Try CodeChef API first (more reliable)
            api_url = f"https://codechef-api.vercel.app/{username}"
            try:
                api_response = requests.get(api_url, timeout=10)
                if api_response.status_code == 200:
                    api_data = api_response.json()
                    
                    rating = api_data.get('currentRating', 0)
                    max_rating = api_data.get('highestRating', rating)
                    
                    # Count fully solved problems
                    fully_solved = api_data.get('fully_solved', [])
                    problems_solved = len(fully_solved) if isinstance(fully_solved, list) else 0
                    
                    result = {
                        'username': username,
                        'rating': rating,
                        'maxRating': max_rating,
                        'problemsSolved': problems_solved,
                        'rank': api_data.get('global_rank', 0),
                        'stars': api_data.get('stars', ''),
                        'contests': 0,
                        'contestsAttended': 0,
                        'lastWeekRating': 0,
                        'lastUpdated': datetime.now()
                    }
                    
                    print(f"    ✅ CodeChef (API): {problems_solved} problems, Rating: {rating}, Max: {max_rating}")
                    return result
            except Exception as api_error:
                print(f"    ⚠️ CodeChef API failed, trying web scraping: {api_error}")
            
            # Fallback to web scraping
            url = f"https://www.codechef.com/users/{username}"
            response = requests.get(url, headers=self.headers, timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract rating
                rating = 0
                max_rating = 0
                
                # Try to find rating in header
                rating_container = soup.find('div', {'class': 'rating-number'})
                if rating_container:
                    rating_text = rating_container.text.strip()
                    try:
                        rating = int(rating_text)
                    except:
                        pass
                
                # Try to find max rating
                rating_header = soup.find('div', {'class': 'rating-header'})
                if rating_header:
                    rating_text = rating_header.text
                    # Look for pattern like "Highest Rating 1800"
                    match = re.search(r'Highest Rating\s*(\d+)', rating_text)
                    if match:
                        max_rating = int(match.group(1))
                
                if max_rating == 0:
                    max_rating = rating
                
                # Extract problems solved - IMPROVED METHOD
                problems_solved = 0
                
                # Method 1: Look for "Total Problems Solved: XXX" in headers
                all_headers = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5'])
                for header in all_headers:
                    header_text = header.get_text().strip()
                    # Match "Total Problems Solved: 408" pattern
                    match = re.search(r'Total Problems Solved[:\s]*(\d+)', header_text, re.IGNORECASE)
                    if match:
                        problems_solved = int(match.group(1))
                        break
                
                # Method 2: Fallback - search in entire page text
                if problems_solved == 0:
                    page_text = soup.get_text()
                    match = re.search(r'Total Problems Solved[:\s]*(\d+)', page_text, re.IGNORECASE)
                    if match:
                        problems_solved = int(match.group(1))
                
                # Method 3: Look in rating-data-section as last resort
                if problems_solved == 0:
                    stats_section = soup.find('section', {'class': 'rating-data-section'})
                    if stats_section:
                        for div in stats_section.find_all('div'):
                            text = div.text.strip()
                            if 'Fully Solved' in text or 'Problems Solved' in text:
                                numbers = re.findall(r'\d+', text)
                                if numbers:
                                    problems_solved = int(numbers[0])
                                    break
                
                # Extract contest count
                contests = 0
                try:
                    # Look for "Contests (XX)" pattern in headers
                    for header in all_headers:
                        header_text = header.get_text().strip()
                        match = re.search(r'Contests\s*\((\d+)\)', header_text, re.IGNORECASE)
                        if match:
                            contests = int(match.group(1))
                            break
                    
                    # Alternative: search in page text
                    if contests == 0:
                        page_text = soup.get_text()
                        match = re.search(r'Contests\s*\((\d+)\)', page_text, re.IGNORECASE)
                        if match:
                            contests = int(match.group(1))
                except:
                    pass
                
                result = {
                    'username': username,
                    'rating': rating,
                    'maxRating': max_rating,
                    'problemsSolved': problems_solved,
                    'rank': 0,
                    'contests': contests,
                    'contestsAttended': contests,
                    'lastWeekRating': 0,
                    'lastUpdated': datetime.now()
                }
                
                print(f"    ✅ CodeChef (Web): {problems_solved} problems, Rating: {rating}, Max: {max_rating}, Contests: {contests}")
                return result
            
            print(f"    ⚠️ CodeChef: No data found for {username}")
            return self._get_default_codechef(username)
            
        except Exception as e:
            print(f"    ❌ CodeChef error: {str(e)}")
            return self._get_default_codechef(username)
    
    def scrape_codeforces(self, username):
        """Scrape Codeforces using official API"""
        try:
            print(f"  📊 Scraping Codeforces: {username}")
            
            # Get user info
            url = f"https://codeforces.com/api/user.info?handles={username}"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('status') == 'OK' and data.get('result'):
                    user = data['result'][0]
                    
                    rating = user.get('rating', 0)
                    max_rating = user.get('maxRating', rating)
                    rank = user.get('rank', 'newbie')
                    
                    # Get contest count using rating history API
                    contests = 0
                    try:
                        contest_url = f"https://codeforces.com/api/user.rating?handle={username}"
                        contest_response = requests.get(contest_url, headers=self.headers, timeout=10)
                        if contest_response.status_code == 200:
                            contest_data = contest_response.json()
                            if contest_data.get('status') == 'OK':
                                contests = len(contest_data.get('result', []))
                    except Exception as contest_error:
                        print(f"    ⚠️ Contest count error: {contest_error}")
                    
                    # Get submission count
                    problems_solved = 0
                    try:
                        submissions_url = f"https://codeforces.com/api/user.status?handle={username}&from=1&count=10000"
                        sub_response = requests.get(submissions_url, headers=self.headers, timeout=10)
                        
                        if sub_response.status_code == 200:
                            sub_data = sub_response.json()
                            if sub_data.get('status') == 'OK':
                                # Count unique solved problems
                                solved_problems = set()
                                for submission in sub_data.get('result', []):
                                    if submission.get('verdict') == 'OK':
                                        problem_id = f"{submission['problem']['contestId']}{submission['problem']['index']}"
                                        solved_problems.add(problem_id)
                                problems_solved = len(solved_problems)
                    except Exception as sub_error:
                        print(f"    ⚠️ Submission count error: {sub_error}")
                    
                    result = {
                        'username': username,
                        'rating': rating,
                        'maxRating': max_rating,
                        'problemsSolved': problems_solved,
                        'rank': rank,
                        'contests': contests,
                        'contestsAttended': contests,
                        'lastWeekRating': 0,
                        'lastUpdated': datetime.now()
                    }
                    
                    print(f"    ✅ Codeforces: {problems_solved} problems, Rating: {rating}, Max: {max_rating}, Contests: {contests}")
                    return result
            
            print(f"    ⚠️ Codeforces: No data found for {username}")
            return self._get_default_codeforces(username)
            
        except Exception as e:
            print(f"    ❌ Codeforces error: {str(e)}")
            return self._get_default_codeforces(username)
    
    def scrape_github(self, username):
        """Scrape GitHub profile with contributions"""
        try:
            print(f"  📊 Scraping GitHub: {username}")
            
            # GitHub REST API for basic info
            url = f"https://api.github.com/users/{username}"
            headers = self.headers.copy()
            if self.github_token:
                headers['Authorization'] = f'token {self.github_token}'
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                repositories = data.get('public_repos', 0)
                followers = data.get('followers', 0)
                
                # Get contributions using GraphQL API (if token available)
                contributions = 0
                if self.github_token:
                    try:
                        graphql_url = "https://api.github.com/graphql"
                        query = """
                        query($username: String!) {
                            user(login: $username) {
                                contributionsCollection {
                                    contributionCalendar {
                                        totalContributions
                                    }
                                }
                            }
                        }
                        """
                        graphql_response = requests.post(
                            graphql_url,
                            json={'query': query, 'variables': {'username': username}},
                            headers=headers,
                            timeout=10
                        )
                        if graphql_response.status_code == 200:
                            graphql_data = graphql_response.json()
                            if 'data' in graphql_data and graphql_data['data'].get('user'):
                                contributions = graphql_data['data']['user']['contributionsCollection']['contributionCalendar']['totalContributions']
                    except Exception as graphql_error:
                        print(f"    ⚠️ GraphQL error, trying web scraping: {graphql_error}")
                
                # Fallback: scrape from profile page
                if contributions == 0:
                    try:
                        profile_url = f"https://github.com/{username}"
                        profile_response = requests.get(profile_url, headers=self.headers, timeout=10)
                        
                        if profile_response.status_code == 200:
                            soup = BeautifulSoup(profile_response.text, 'html.parser')
                            
                            # Try multiple selectors for contributions
                            contrib_elem = soup.find('h2', class_='f4 text-normal mb-2')
                            if contrib_elem:
                                contrib_text = contrib_elem.text
                                match = re.search(r'([\d,]+)\s+contributions?', contrib_text)
                                if match:
                                    contributions = int(match.group(1).replace(',', ''))
                            
                            # Alternative: look in the calendar SVG
                            if contributions == 0:
                                calendar = soup.find('div', class_='js-yearly-contributions')
                                if calendar:
                                    h2 = calendar.find('h2')
                                    if h2:
                                        match = re.search(r'([\d,]+)\s+contributions?', h2.text)
                                        if match:
                                            contributions = int(match.group(1).replace(',', ''))
                    except Exception as scrape_error:
                        print(f"    ⚠️ Web scraping error: {scrape_error}")
                
                result = {
                    'username': username,
                    'repositories': repositories,
                    'followers': followers,
                    'following': data.get('following', 0),
                    'contributions': contributions,
                    'commits': contributions,  # Approximate
                    'streak': 0,
                    'lastWeekContributions': 0,
                    'lastUpdated': datetime.now()
                }
                
                print(f"    ✅ GitHub: {repositories} repos, {contributions} contributions, {followers} followers")
                return result
            
            print(f"    ⚠️ GitHub: No data found for {username}")
            return self._get_default_github(username)
            
        except Exception as e:
            print(f"    ❌ GitHub error: {str(e)}")
            return self._get_default_github(username)
    
    def scrape_codolio(self, username):
        """Scrape Codolio profile (requires Selenium for full data)"""
        try:
            print(f"  📊 Scraping Codolio: {username}")
            
            # Try basic scraping first
            try:
                url = f"https://codolio.com/profile/{username}"
                response = requests.get(url, headers=self.headers, timeout=10)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Try to extract any visible data
                    # Note: Codolio is heavily JavaScript-based, so this may not work
                    score = 0
                    submissions = 0
                    
                    # Look for score/rating elements
                    score_elem = soup.find('div', class_='score')
                    if score_elem:
                        score_text = score_elem.text.strip()
                        numbers = re.findall(r'\d+', score_text)
                        if numbers:
                            score = int(numbers[0])
                    
                    result = {
                        'username': username,
                        'score': score,
                        'totalSubmissions': submissions,
                        'currentStreak': 0,
                        'maxStreak': 0,
                        'dailySubmissions': [],
                        'badges': [],
                        'lastUpdated': datetime.now()
                    }
                    
                    if score > 0:
                        print(f"    ✅ Codolio: Score {score}")
                        return result
            except Exception as basic_error:
                print(f"    ⚠️ Basic scraping failed: {basic_error}")
            
            # Selenium implementation would go here
            # For now, return default data with note
            result = {
                'username': username,
                'score': 0,
                'totalSubmissions': 0,
                'currentStreak': 0,
                'maxStreak': 0,
                'dailySubmissions': [],
                'badges': [],
                'lastUpdated': datetime.now()
            }
            
            print(f"    ⚠️ Codolio: Requires Selenium for full data (returning defaults)")
            return result
            
        except Exception as e:
            print(f"    ❌ Codolio error: {str(e)}")
            return self._get_default_codolio(username)
    
    # Default data methods
    def _get_default_leetcode(self, username):
        return {
            'username': username,
            'problemsSolved': 0,
            'rating': 0,
            'maxRating': 0,
            'rank': 0,
            'contests': 0,
            'contestsAttended': 0,
            'lastWeekRating': 0,
            'lastUpdated': datetime.now()
        }
    
    def _get_default_codechef(self, username):
        return {
            'username': username,
            'rating': 0,
            'maxRating': 0,
            'problemsSolved': 0,
            'rank': 0,
            'contests': 0,
            'contestsAttended': 0,
            'lastWeekRating': 0,
            'lastUpdated': datetime.now()
        }
    
    def _get_default_codeforces(self, username):
        return {
            'username': username,
            'rating': 0,
            'maxRating': 0,
            'problemsSolved': 0,
            'rank': 'newbie',
            'contests': 0,
            'contestsAttended': 0,
            'lastWeekRating': 0,
            'lastUpdated': datetime.now()
        }
    
    def _get_default_github(self, username):
        return {
            'username': username,
            'repositories': 0,
            'followers': 0,
            'following': 0,
            'contributions': 0,
            'commits': 0,
            'streak': 0,
            'lastWeekContributions': 0,
            'lastUpdated': datetime.now()
        }
    
    def _get_default_codolio(self, username):
        return {
            'username': username,
            'score': 0,
            'totalSubmissions': 0,
            'currentStreak': 0,
            'maxStreak': 0,
            'dailySubmissions': [],
            'badges': [],
            'lastUpdated': datetime.now()
        }
