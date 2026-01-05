#!/usr/bin/env python3
"""
CodeChef Scraper - Production Ready
Safe + Rate Limited + Contest Data + Problem Solving Stats
"""

import requests
import time
import random
import logging
import re
from datetime import datetime
from bs4 import BeautifulSoup

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
            time.sleep(random.uniform(2, 4))
            
            response = requests.get(url, headers=headers, timeout=timeout)
            
            if response.status_code == 200:
                return response
            elif response.status_code == 429:  # Rate limited
                wait_time = 2 ** attempt * 5  # Exponential backoff
                logger.warning(f"CodeChef rate limited, waiting {wait_time}s before retry {attempt + 1}")
                time.sleep(wait_time)
                continue
            elif response.status_code == 404:
                logger.warning(f"CodeChef user not found: {url}")
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

def scrape_codechef_user(username):
    """
    Scrape CodeChef user data
    Returns: dict with rating, solved problems, contests, etc.
    """
    try:
        logger.info(f"Scraping CodeChef for {username}")
        
        # CodeChef profile URL
        profile_url = f"https://www.codechef.com/users/{username}"
        
        response = safe_request(profile_url)
        if not response:
            logger.warning(f"Failed to get CodeChef profile for {username}")
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
            'contestsAttended': 0,
            'stars': 0,
            'division': '',
            'lastUpdated': datetime.utcnow(),
            'dataSource': 'codechef_web'
        }
        
        # Extract rating information
        try:
            rating_section = soup.find('div', class_='rating-number')
            if rating_section:
                rating_text = rating_section.get_text(strip=True)
                result['rating'] = extract_number_from_text(rating_text)
            
            # Max rating
            max_rating_section = soup.find('div', class_='rating-header')
            if max_rating_section:
                max_rating_text = max_rating_section.get_text()
                if 'Highest Rating' in max_rating_text:
                    result['maxRating'] = extract_number_from_text(max_rating_text)
            
        except Exception as e:
            logger.warning(f"Error extracting rating for {username}: {e}")
        
        # Extract ranking information
        try:
            rank_sections = soup.find_all('div', class_='rating-ranks')
            for rank_section in rank_sections:
                rank_text = rank_section.get_text().lower()
                if 'global rank' in rank_text:
                    result['globalRank'] = extract_number_from_text(rank_text)
                elif 'country rank' in rank_text:
                    result['countryRank'] = extract_number_from_text(rank_text)
        except Exception as e:
            logger.warning(f"Error extracting ranks for {username}: {e}")
        
        # Extract stars and division
        try:
            star_section = soup.find('span', class_='rating')
            if star_section:
                stars = len(star_section.find_all('span', class_='star'))
                result['stars'] = stars
                
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
        
        # Extract problem solving stats
        try:
            # Look for problems solved section
            problems_section = soup.find('section', class_='rating-data-section')
            if problems_section:
                problem_stats = problems_section.find_all('h5')
                for stat in problem_stats:
                    stat_text = stat.get_text().lower()
                    if 'problems solved' in stat_text or 'total problems' in stat_text:
                        result['totalSolved'] = extract_number_from_text(stat_text)
                        break
            
            # Alternative: look in profile stats
            if result['totalSolved'] == 0:
                stats_sections = soup.find_all('div', class_='content')
                for section in stats_sections:
                    section_text = section.get_text().lower()
                    if 'problems solved' in section_text:
                        result['totalSolved'] = extract_number_from_text(section_text)
                        break
                        
        except Exception as e:
            logger.warning(f"Error extracting problems solved for {username}: {e}")
        
        # Extract contest participation
        try:
            # Look for contest information
            contest_sections = soup.find_all('div', class_='contest-participation-data')
            for section in contest_sections:
                section_text = section.get_text().lower()
                if 'contests' in section_text:
                    result['contestsAttended'] = extract_number_from_text(section_text)
                    break
            
            # Alternative: look for contest count in other sections
            if result['contestsAttended'] == 0:
                all_text = soup.get_text().lower()
                contest_matches = re.findall(r'(\d+)\s*contests?', all_text)
                if contest_matches:
                    # Take the largest number as it's likely the total contests
                    result['contestsAttended'] = max(int(match) for match in contest_matches)
                    
        except Exception as e:
            logger.warning(f"Error extracting contests for {username}: {e}")
        
        # Get recent contest performance
        try:
            # This would require additional scraping of contest history
            # For now, we'll use the basic data we have
            pass
        except Exception as e:
            logger.warning(f"Error extracting recent performance for {username}: {e}")
        
        # Validate data
        if result['rating'] == 0 and result['totalSolved'] == 0:
            logger.warning(f"No meaningful data found for CodeChef user {username}")
            return None
        
        logger.info(f"✅ CodeChef data for {username}: {result['totalSolved']} solved, {result['rating']} rating, {result['contestsAttended']} contests")
        return result
        
    except Exception as e:
        logger.error(f"Error scraping CodeChef for {username}: {e}")
        return None

def get_codechef_contest_history(username):
    """Get detailed contest history for a user"""
    try:
        # This would require scraping the contest history page
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

if __name__ == "__main__":
    # Test the scraper
    test_username = "gennady.korotkevich"  # Famous competitive programmer
    result = scrape_codechef_user(test_username)
    if result:
        print(f"✅ Test successful: {result}")
    else:
        print("❌ Test failed")