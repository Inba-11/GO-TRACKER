#!/usr/bin/env python3
"""
Codolio Scraper - Production Ready
Uses Selenium for JavaScript-rendered content
Safe + Rate Limited + Comprehensive Data
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
import time
import random
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def create_driver():
    """Create a fresh Chrome driver instance"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        logger.error(f"Error creating Chrome driver: {e}")
        return None

def scrape_codolio_user(username):
    """
    Scrape Codolio user data using Selenium
    Returns: dict with active days, contests, submissions, badges
    """
    driver = create_driver()
    if not driver:
        logger.error("Failed to create Chrome driver for Codolio")
        return None
    
    try:
        logger.info(f"Scraping Codolio for {username}")
        
        url = f"https://codolio.com/profile/{username}"
        driver.get(url)
        
        # Wait for page to load
        time.sleep(6)
        
        # Initialize result
        result = {
            'username': username,
            'totalActiveDays': 0,
            'totalContests': 0,
            'totalSubmissions': 0,
            'badges': [],
            'lastUpdated': datetime.utcnow(),
            'dataSource': 'codolio_selenium'
        }
        
        # Get page text
        try:
            page_text = driver.find_element(By.TAG_NAME, 'body').text
            lines = page_text.split('\n')
            
            logger.info(f"Analyzing {len(lines)} lines of Codolio content")
            
            for line in lines:
                line = line.strip().lower()
                if not line:
                    continue
                
                # Look for Total Active Days
                if 'total active days' in line:
                    import re
                    numbers = re.findall(r'\b(\d+)\b', line)
                    if numbers:
                        value = int(numbers[0])
                        if 0 < value < 2000:
                            result['totalActiveDays'] = value
                            logger.info(f"Found Active Days: {value}")
                
                # Look for Total Contests
                elif 'total contests' in line:
                    import re
                    numbers = re.findall(r'\b(\d+)\b', line)
                    if numbers:
                        value = int(numbers[0])
                        if 0 < value < 1000:
                            result['totalContests'] = value
                            logger.info(f"Found Contests: {value}")
                
                # Look for Total Questions/Submissions
                elif 'total questions' in line or 'total submissions' in line:
                    import re
                    numbers = re.findall(r'\b(\d+)\b', line)
                    if numbers:
                        value = int(numbers[0])
                        if 0 < value < 10000:
                            result['totalSubmissions'] = value
                            logger.info(f"Found Submissions: {value}")
        
        except Exception as e:
            logger.warning(f"Text extraction failed: {str(e)[:30]}")
        
        # Try to find large numbers in spans (Codolio's typical display)
        try:
            large_spans = driver.find_elements(By.XPATH, "//span[contains(@class, 'text-') and (contains(@class, '5xl') or contains(@class, '6xl') or contains(@class, '4xl'))]")
            
            for span in large_spans:
                try:
                    text = span.text.strip()
                    if text.isdigit():
                        number = int(text)
                        
                        # Get parent context
                        parent = span.find_element(By.XPATH, "./..")
                        parent_text = parent.text.lower()
                        
                        if 'active' in parent_text and 'day' in parent_text and result['totalActiveDays'] == 0:
                            if 0 < number < 2000:
                                result['totalActiveDays'] = number
                                logger.info(f"Found Active Days (span): {number}")
                        elif 'contest' in parent_text and result['totalContests'] == 0:
                            if 0 < number < 1000:
                                result['totalContests'] = number
                                logger.info(f"Found Contests (span): {number}")
                        elif ('question' in parent_text or 'submission' in parent_text) and result['totalSubmissions'] == 0:
                            if 0 < number < 10000:
                                result['totalSubmissions'] = number
                                logger.info(f"Found Submissions (span): {number}")
                except:
                    continue
        except Exception as e:
            logger.warning(f"Span extraction failed: {str(e)[:30]}")
        
        # Look for badges
        try:
            badge_imgs = driver.find_elements(By.XPATH, "//img[contains(@src, 'badge') or contains(@alt, 'badge')]")
            for img in badge_imgs:
                try:
                    src = img.get_attribute('src')
                    alt = img.get_attribute('alt') or 'Badge'
                    if src:
                        result['badges'].append({
                            'name': alt,
                            'icon': src,
                            'description': alt
                        })
                except:
                    continue
            
            if result['badges']:
                logger.info(f"Found {len(result['badges'])} badges")
        except:
            pass
        
        # Return data if meaningful
        if result['totalActiveDays'] > 0 or result['totalContests'] > 0 or result['totalSubmissions'] > 0:
            logger.info(f"✅ Codolio data for {username}: Days={result['totalActiveDays']}, Contests={result['totalContests']}, Submissions={result['totalSubmissions']}")
            return result
        else:
            logger.warning(f"No meaningful data found for {username}")
            return None
            
    except Exception as e:
        logger.error(f"Error scraping Codolio for {username}: {str(e)[:50]}")
        return None
    finally:
        try:
            driver.quit()
        except:
            pass

def get_codolio_heatmap(username):
    """Get Codolio heatmap data for daily activity"""
    try:
        # This would require additional scraping
        # For now, return empty structure
        return {
            'dailySubmissions': [],
            'totalDays': 0,
            'currentStreak': 0,
            'maxStreak': 0
        }
    except Exception as e:
        logger.error(f"Error getting heatmap for {username}: {e}")
        return {
            'dailySubmissions': [],
            'totalDays': 0,
            'currentStreak': 0,
            'maxStreak': 0
        }

if __name__ == "__main__":
    # Test the scraper
    test_username = "Syfudeen"
    result = scrape_codolio_user(test_username)
    if result:
        print(f"✅ Test successful: {result}")
    else:
        print("❌ Test failed")