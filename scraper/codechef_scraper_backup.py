#!/usr/bin/env python3
"""
Enhanced CodeChef Scraper - Production Ready
BeautifulSoup (Primary) + Selenium (Fallback)
Safe + Rate Limited + Comprehensive Data Extraction
"""

import requests
import time
import random
import logging
import re
from datetime import datetime
from bs4 import BeautifulSoup

# Selenium imports (optional - only used if BeautifulSoup fails)
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    logging.warning("Selenium not available - will only use BeautifulSoup")

logger = logging.getLogger(__name__)

def safe_request(url, headers=None, timeout=15, retries=3):
    """Make a safe HTTP request with retries"""
    if headers is None:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
    
    for attempt in range(retries):
        try:
            # Random delay to avoid rate limiting
            if attempt > 0:
                time.sleep(random.uniform(2, 4))
            
            response = requests.get(url, headers=headers, timeout=timeout)
            
            if response.status_code == 200:
                return response
            elif response.status_code == 429:  # Rate limited
                wait_time = 2 ** attempt * 5
                logger.warning(f"CodeChef rate limited, waiting {wait_time}s before retry {attempt + 1}")
                time.sleep(wait_time)
                continue
            elif response.status_code == 404:
                logger.warning(f"CodeChef user not found: {url}")
                return None
            elif response.status_code == 403:
                logger.warning(f"CodeChef access forbidden (403) - may need Selenium")
                return None
            else:
                logger.warning(f"CodeChef HTTP {response.status_code} for {url}")
                return None
                
        except requests.exceptions.Timeout:
            logger.warning(f"CodeChef timeout on attempt {attempt + 1} for {url}")
        except requests.exceptions.RequestException as e:
            logger.warning(f"CodeChef request error on attempt {attempt + 1}: {e}")
        
        if attempt < retries - 1:
            time.sleep(2 ** attempt)  # Exponential backoff
    
    return None

def extract_number_from_text(text):
    """Extract number from text using regex"""
    if not text:
        return 0
    
    # Remove commas and extract numbers
    numbers = re.findall(r'\d+', text.replace(',', ''))
    return int(numbers[0]) if numbers else 0

def scrape_with_beautifulsoup(username):
    """
    Primary scraping method using BeautifulSoup (fast, lightweight)
    """
    try:
        logger.info(f"[BeautifulSoup] Scraping CodeChef for {username}")
        
        profile_url = f"https://www.codechef.com/users/{username}"
        response = safe_request(profile_url)
        
        if not response:
            logger.warning(f"[BeautifulSoup] Failed to get CodeChef profile for {username}")
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Initialize result
        result = {
            'username': username,
            'rating': 0,
            'maxRating': 0,
            'globalRank': 0,
            'countryRank': 0,
            'totalSolved': 0,
            'problemsSolved': 0,
            'contestsAttended': 0,
            'stars': 0,
            'division': '',
            'league': '',
            'institution': '',
            'country': '',
            'lastUpdated': datetime.utcnow(),
            'dataSource': 'codechef_bs4'
        }
        
        # Extract rating information
        try:
            rating_section = soup.find('div', class_='rating-number')
            if rating_section:
                rating_text = rating_section.get_text(strip=True)
                result['rating'] = extract_number_from_text(rating_text)
            
            # Max rating from rating-header
            max_rating_section = soup.find('div', class_='rating-header')
            if max_rating_section:
                max_rating_text = max_rating_section.get_text()
                if 'Highest Rating' in max_rating_text:
                    result['maxRating'] = extract_number_from_text(max_rating_text)
                else:
                    # Try finding in small tag
                    small_tag = max_rating_section.find('small')
                    if small_tag and 'Highest Rating' in small_tag.get_text():
                        result['maxRating'] = extract_number_from_text(small_tag.get_text())
            
        except Exception as e:
            logger.warning(f"Error extracting rating for {username}: {e}")
        
        # Extract ranking information
        try:
            rank_sections = soup.find_all('div', class_='rating-ranks')
            for rank_section in rank_sections:
                rank_text = rank_section.get_text().lower()
                links = rank_section.find_all('a')
                for link in links:
                    link_text = link.get_text().lower()
                    rank_value = extract_number_from_text(link.get_text())
                    if 'global' in link_text:
                        result['globalRank'] = rank_value
                    elif 'country' in link_text:
                        result['countryRank'] = rank_value
        except Exception as e:
            logger.warning(f"Error extracting ranks for {username}: {e}")
        
        # Extract stars and league
        try:
            star_section = soup.find('span', class_='rating')
            if star_section:
                stars = star_section.find_all('span', class_='star')
                result['stars'] = len(stars)
                
                # Get league from star section
                star_text = star_section.get_text()
                if '★' in star_text:
                    result['league'] = star_text.strip()
                
                # Determine division based on rating
                if result['rating'] >= 2500:
                    result['division'] = 'Division 1'
                elif result['rating'] >= 1800:
                    result['division'] = 'Division 2'
                elif result['rating'] >= 1400:
                    result['division'] = 'Division 3'
                else:
                    result['division'] = 'Division 4'
        except Exception as e:
            logger.warning(f"Error extracting stars for {username}: {e}")
        
        # Extract problems solved - Multiple methods
        try:
            # Method 1: Look in rating-data-section
            problems_section = soup.find('section', class_='rating-data-section')
            if problems_section:
                problem_stats = problems_section.find_all('h5')
                for stat in problem_stats:
                    stat_text = stat.get_text().lower()
                    if 'problems solved' in stat_text or 'total problems' in stat_text:
                        result['totalSolved'] = extract_number_from_text(stat_text)
                        result['problemsSolved'] = result['totalSolved']
                        break
            
            # Method 2: Look for problems-solved class
            if result['totalSolved'] == 0:
                problems_div = soup.find('div', class_='problems-solved')
                if problems_div:
                    h5_tags = problems_div.find_all('h5')
                    for h5 in h5_tags:
                        text = h5.get_text().lower()
                        if 'problems' in text:
                            result['totalSolved'] = extract_number_from_text(text)
                            result['problemsSolved'] = result['totalSolved']
                            break
            
            # Method 3: Search in all h5 tags
            if result['totalSolved'] == 0:
                all_h5 = soup.find_all('h5')
                for h5 in all_h5:
                    text = h5.get_text().lower()
                    if 'problems solved' in text:
                        result['totalSolved'] = extract_number_from_text(text)
                        result['problemsSolved'] = result['totalSolved']
                        break
            
            # Method 4: Look for fully solved count
            if result['totalSolved'] == 0:
                fully_solved = soup.find('div', class_='content', string=re.compile(r'Fully.*Solved', re.I))
                if fully_solved:
                    result['totalSolved'] = extract_number_from_text(fully_solved.get_text())
                    result['problemsSolved'] = result['totalSolved']
                        
        except Exception as e:
            logger.warning(f"Error extracting problems solved for {username}: {e}")
        
        # Extract contest participation
        try:
            # Look for contest count in various places
            all_text = soup.get_text()
            
            # Pattern 1: "X contests"
            contest_matches = re.findall(r'(\d+)\s+contests?', all_text, re.IGNORECASE)
            if contest_matches:
                # Take the largest number as it's likely the total contests
                result['contestsAttended'] = max(int(match) for match in contest_matches)
            
            # Pattern 2: Look in rating-data-section
            if result['contestsAttended'] == 0:
                contest_sections = soup.find_all('div', class_='contest-participation-data')
                for section in contest_sections:
                    section_text = section.get_text().lower()
                    if 'contests' in section_text:
                        result['contestsAttended'] = extract_number_from_text(section_text)
                        break
                    
        except Exception as e:
            logger.warning(f"Error extracting contests for {username}: {e}")
        
        # Extract additional profile info
        try:
            # Institution
            institution = soup.find('span', class_='institution')
            if institution:
                result['institution'] = institution.get_text(strip=True)
            
            # Country
            country = soup.find('span', class_='country-name')
            if country:
                result['country'] = country.get_text(strip=True)
        except Exception as e:
            logger.warning(f"Error extracting profile info for {username}: {e}")
        
        # Validate data
        if result['rating'] == 0 and result['totalSolved'] == 0:
            logger.warning(f"[BeautifulSoup] No meaningful data found for CodeChef user {username}")
            return None
        
        logger.info(f"[BeautifulSoup] SUCCESS CodeChef data for {username}: {result['totalSolved']} solved, {result['rating']} rating, {result['contestsAttended']} contests")
        return result
        
    except Exception as e:
        logger.error(f"[BeautifulSoup] Error scraping CodeChef for {username}: {e}")
        return None

def scrape_with_selenium(username):
    """
    Fallback scraping method using Selenium (for JS-heavy content)
    """
    if not SELENIUM_AVAILABLE:
        logger.error(f"[Selenium] Cannot scrape {username} - Selenium not installed")
        return None
    
    driver = None
    try:
        logger.info(f"[Selenium] Scraping CodeChef for {username}")
        
        # Setup Chrome options
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Create driver
        driver = webdriver.Chrome(options=chrome_options)
        driver.set_page_load_timeout(30)
        
        # Navigate to profile
        profile_url = f"https://www.codechef.com/users/{username}"
        driver.get(profile_url)
        
        # Wait for key elements to load
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "rating-number"))
            )
        except:
            logger.warning(f"[Selenium] Timeout waiting for page elements")
        
        # Additional wait for JS to render
        time.sleep(3)
        
        # Initialize result
        result = {
            'username': username,
            'rating': 0,
            'maxRating': 0,
            'globalRank': 0,
            'countryRank': 0,
            'totalSolved': 0,
            'problemsSolved': 0,
            'contestsAttended': 0,
            'stars': 0,
            'division': '',
            'league': '',
            'institution': '',
            'country': '',
            'lastUpdated': datetime.utcnow(),
            'dataSource': 'codechef_selenium'
        }
        
        # Extract rating
        try:
            rating_element = driver.find_element(By.CLASS_NAME, 'rating-number')
            result['rating'] = extract_number_from_text(rating_element.text)
        except Exception as e:
            logger.warning(f"[Selenium] Error extracting rating: {e}")
        
        # Extract max rating
        try:
            rating_header = driver.find_element(By.CLASS_NAME, 'rating-header')
            header_text = rating_header.text
            if 'Highest Rating' in header_text:
                result['maxRating'] = extract_number_from_text(header_text)
        except Exception as e:
            logger.warning(f"[Selenium] Error extracting max rating: {e}")
        
        # Extract stars
        try:
            stars = driver.find_elements(By.CSS_SELECTOR, '.rating .star')
            result['stars'] = len(stars)
            
            # Determine division
            if result['rating'] >= 2500:
                result['division'] = 'Division 1'
            elif result['rating'] >= 1800:
                result['division'] = 'Division 2'
            elif result['rating'] >= 1400:
                result['division'] = 'Division 3'
            else:
                result['division'] = 'Division 4'
        except Exception as e:
            logger.warning(f"[Selenium] Error extracting stars: {e}")
        
        # Extract ranks
        try:
            rank_elements = driver.find_elements(By.CLASS_NAME, 'rating-ranks')
            for rank_elem in rank_elements:
                rank_text = rank_elem.text.lower()
                if 'global rank' in rank_text:
                    result['globalRank'] = extract_number_from_text(rank_text)
                elif 'country rank' in rank_text:
                    result['countryRank'] = extract_number_from_text(rank_text)
        except Exception as e:
            logger.warning(f"[Selenium] Error extracting ranks: {e}")
        
        # Extract problems solved
        try:
            # Method 1: Look in rating-data-section
            h5_elements = driver.find_elements(By.CSS_SELECTOR, 'section.rating-data-section h5')
            for h5 in h5_elements:
                text = h5.text.lower()
                if 'problems solved' in text or 'total problems' in text:
                    result['totalSolved'] = extract_number_from_text(h5.text)
                    result['problemsSolved'] = result['totalSolved']
                    break
            
            # Method 2: Search all h5 elements
            if result['totalSolved'] == 0:
                all_h5 = driver.find_elements(By.TAG_NAME, 'h5')
                for h5 in all_h5:
                    text = h5.text.lower()
                    if 'problems' in text and ('solved' in text or 'total' in text):
                        result['totalSolved'] = extract_number_from_text(h5.text)
                        result['problemsSolved'] = result['totalSolved']
                        break
        except Exception as e:
            logger.warning(f"[Selenium] Error extracting problems: {e}")
        
        # Extract contests
        try:
            page_text = driver.find_element(By.TAG_NAME, 'body').text
            contest_matches = re.findall(r'(\d+)\s+contests?', page_text, re.IGNORECASE)
            if contest_matches:
                result['contestsAttended'] = max(int(match) for match in contest_matches)
        except Exception as e:
            logger.warning(f"[Selenium] Error extracting contests: {e}")
        
        # Validate data
        if result['rating'] == 0 and result['totalSolved'] == 0:
            logger.warning(f"[Selenium] No meaningful data found for CodeChef user {username}")
            return None
        
        logger.info(f"[Selenium] SUCCESS CodeChef data for {username}: {result['totalSolved']} solved, {result['rating']} rating")
        return result
        
    except Exception as e:
        logger.error(f"[Selenium] Error scraping CodeChef for {username}: {e}")
        return None
    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass

def scrape_codechef_user(username):
    """
    Main scraping function - tries BeautifulSoup first, falls back to Selenium
    Returns: dict with rating, solved problems, contests, etc.
    """
    try:
        # Try BeautifulSoup first (fast and lightweight)
        result = scrape_with_beautifulsoup(username)
        
        if result:
            return result
        
        # If BeautifulSoup fails, try Selenium
        logger.info(f"BeautifulSoup failed for {username}, trying Selenium...")
        result = scrape_with_selenium(username)
        
        if result:
            return result
        
        # Both methods failed
        logger.error(f"Both scraping methods failed for {username}")
        return None
        
    except Exception as e:
        logger.error(f"Error in main scrape function for {username}: {e}")
        return None

def get_codechef_contest_history(username):
    """Get detailed contest history for a user"""
    try:
        # This would require scraping the contest history page
        # URL: https://www.codechef.com/users/{username}#contests
        # For now, return empty list
        return []
    except Exception as e:
        logger.error(f"Error getting contest history for {username}: {e}")
        return []

def get_codechef_problem_categories(username):
    """Get problem solving stats by category"""
    try:
        # This would require scraping the problem stats page
        # For now, return empty dict
        return {
            'easy': 0,
            'medium': 0,
            'hard': 0,
            'challenge': 0
        }
    except Exception as e:
        logger.error(f"Error getting problem categories for {username}: {e}")
        return {
            'easy': 0,
            'medium': 0,
            'hard': 0,
            'challenge': 0
        }

# ===== TEST SCRIPT =====

if __name__ == "__main__":
    import sys
    import io
    
    # Set UTF-8 encoding for Windows console
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    # Setup logging for testing
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Test with example usernames
    test_users = [
        'gennady.korotkevich',  # Famous coder
        'tourist',               # Another famous coder
    ]
    
    # Allow custom username from command line
    if len(sys.argv) > 1:
        test_users = [sys.argv[1]]
    
    print("\n" + "="*70)
    print("ENHANCED CODECHEF SCRAPER TEST")
    print("="*70)
    print(f"Testing with {len(test_users)} user(s)\n")
    
    for username in test_users:
        print(f"\n{'='*70}")
        print(f"Testing: {username}")
        print('='*70)
        
        try:
            result = scrape_codechef_user(username)
            
            if result:
                print(f"\nSUCCESS - Data scraped using: {result['dataSource']}")
                print("\nScraped Data:")
                print("-" * 70)
                for key, value in result.items():
                    if key != 'lastUpdated':
                        print(f"  {key:20s}: {value}")
                print("-" * 70)
            else:
                print("\nFAILED - No data could be scraped")
        
        except Exception as e:
            print(f"\nERROR: {e}")
        
        # Delay between tests
        if len(test_users) > 1:
            print("\nWaiting 5 seconds before next test...")
            time.sleep(5)
    
    print("\n" + "="*70)
    print("Test complete!")
    print("="*70 + "\n")

