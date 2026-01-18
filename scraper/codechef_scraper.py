#!/usr/bin/env python3
"""
Enhanced CodeChef Scraper - Production Ready
BeautifulSoup (Primary) + Selenium (Fallback)
Safe + Rate Limited + Comprehensive Data Extraction
"""

import requests  # type: ignore
import time
import random
import logging
import re
import json
import traceback
import platform
from datetime import datetime, timezone, timedelta

# #region agent log
try:
    log_path = r"c:\Users\inbat\Downloads\GO_TRACKER\.cursor\debug.log"
    with open(log_path, 'a', encoding='utf-8') as f:
        f.write(json.dumps({"sessionId":"debug-session","runId":"pre-fix","hypothesisId":"B","location":"codechef_scraper.py:15","message":"Before BeautifulSoup import","data":{"timestamp":int(time.time()*1000)}})+'\n')
except: pass
# #endregion agent log

try:
    from bs4 import BeautifulSoup  # type: ignore
    # #region agent log
    try:
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(json.dumps({"sessionId":"debug-session","runId":"pre-fix","hypothesisId":"B","location":"codechef_scraper.py:16","message":"BeautifulSoup import succeeded","data":{"timestamp":int(time.time()*1000)}})+'\n')
    except: pass
    # #endregion agent log
except ImportError as e:
    # #region agent log
    try:
        import sys
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(json.dumps({"sessionId":"debug-session","runId":"pre-fix","hypothesisId":"B","location":"codechef_scraper.py:16","message":"BeautifulSoup ImportError","data":{"error_type":type(e).__name__,"error_msg":str(e),"python_path":sys.executable,"timestamp":int(time.time()*1000)}})+'\n')
    except: pass
    # #endregion agent log
    raise

# Selenium imports (optional - only used if BeautifulSoup fails)
# #region agent log
try:
    with open(log_path, 'a', encoding='utf-8') as f:
        f.write(json.dumps({"sessionId":"debug-session","runId":"pre-fix","hypothesisId":"A","location":"codechef_scraper.py:44","message":"Attempting Selenium imports","data":{"timestamp":int(time.time()*1000)}})+'\n')
except: pass
# #endregion agent log

try:
    # #region agent log
    try:
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(json.dumps({"sessionId":"debug-session","runId":"pre-fix","hypothesisId":"A","location":"codechef_scraper.py:46","message":"Before selenium.webdriver import","data":{"timestamp":int(time.time()*1000)}})+'\n')
    except: pass
    # #endregion agent log
    
    from selenium import webdriver  # type: ignore
    # #region agent log
    try:
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(json.dumps({"sessionId":"debug-session","runId":"pre-fix","hypothesisId":"A","location":"codechef_scraper.py:46","message":"selenium.webdriver import succeeded","data":{"timestamp":int(time.time()*1000)}})+'\n')
    except: pass
    # #endregion agent log
    
    from selenium.webdriver.common.by import By  # type: ignore
    from selenium.webdriver.chrome.options import Options  # type: ignore
    from selenium.webdriver.chrome.service import Service  # type: ignore
    from selenium.webdriver.support.ui import WebDriverWait  # type: ignore
    from selenium.webdriver.support import expected_conditions as EC  # type: ignore
    from selenium.common.exceptions import TimeoutException  # type: ignore
    from webdriver_manager.chrome import ChromeDriverManager  # type: ignore
    SELENIUM_AVAILABLE = True
    # #region agent log
    try:
        import sys
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(json.dumps({"sessionId":"debug-session","runId":"pre-fix","hypothesisId":"A","location":"codechef_scraper.py:54","message":"All Selenium imports succeeded","data":{"selenium_available":True,"python_path":sys.executable,"timestamp":int(time.time()*1000)}})+'\n')
    except: pass
    # #endregion agent log
except ImportError as e:
    SELENIUM_AVAILABLE = False
    TimeoutException = Exception  # Fallback for when Selenium not available
    # #region agent log
    try:
        import sys
        with open(log_path, 'a', encoding='utf-8') as f:
            f.write(json.dumps({"sessionId":"debug-session","runId":"pre-fix","hypothesisId":"A,B,C,D","location":"codechef_scraper.py:56","message":"ImportError caught","data":{"error_type":type(e).__name__,"error_msg":str(e),"selenium_available":False,"python_path":sys.executable,"missing_module":str(e).split()[-1] if "No module named" in str(e) else "unknown","timestamp":int(time.time()*1000)}})+'\n')
    except: pass
    # #endregion agent log
    logging.warning(f"Selenium not available - will only use BeautifulSoup. Error: {e}")

logger = logging.getLogger(__name__)

# Constants
DEFAULT_TIMEOUT = 15
DEFAULT_RETRIES = 3
HEATMAP_WAIT_TIME = 2
SELENIUM_RENDER_WAIT = 3
PAGE_LOAD_TIMEOUT = 60  # Increased from 30 to 60 seconds for slow connections
SCRIPT_TIMEOUT = 30  # Timeout for JavaScript execution

# Compiled regex patterns for better performance
CONTESTS_PATTERN_PAREN = re.compile(r'contests?\s*\((\d+)\)', re.IGNORECASE)
CONTESTS_PATTERN_COLON = re.compile(r'contests?\s*[:\s]+(\d+)', re.IGNORECASE)
PROBLEMS_PATTERN = re.compile(r'total\s+problems\s+solved[:\s]+(\d+)', re.IGNORECASE)
NUMBER_PATTERN = re.compile(r'\d+')

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
    numbers = NUMBER_PATTERN.findall(text.replace(',', ''))
    return int(numbers[0]) if numbers else 0

def normalize_codechef_input(url_or_username):
    """
    Normalize input to get both URL and username
    Returns: (profile_url, username)
    """
    if not url_or_username or not url_or_username.strip():
        return None, None
    
    url_or_username = url_or_username.strip()
    
    # If it's already a URL
    if url_or_username.startswith('http'):
        # Extract username from URL
        match = re.search(r'codechef\.com/users/([^/?]+)', url_or_username)
        if match:
            username = match.group(1)
            # Normalize URL - remove query params and fragments
            profile_url = url_or_username.split('?')[0].split('#')[0]
            # Ensure it's https://
            if not profile_url.startswith('https://'):
                profile_url = f"https://www.codechef.com/users/{username}"
            return profile_url, username
        else:
            logger.warning(f"Could not extract username from URL: {url_or_username}")
            return None, None
    else:
        # It's a username
        username = url_or_username
        profile_url = f"https://www.codechef.com/users/{username}"
        return profile_url, username

def _create_result_dict(username, data_source='codechef_bs4'):
    """Helper function to create standardized result dictionary"""
    return {
        'username': username,
        'rating': 0,
        'maxRating': 0,
        'globalRank': 0,
        'countryRank': 0,
        'totalSolved': 0,
        'problemsSolved': 0,
        'contestsAttended': 0,
        'totalSubmissions': 0,
        'submissionHeatmap': [],
        'submissionByDate': {},
        'submissionStats': {
            'daysWithSubmissions': 0,
            'maxDailySubmissions': 0,
            'avgDailySubmissions': 0.0
        },
        'stars': 0,
        'division': '',
        'league': '',
        'institution': '',
        'country': '',
        'name': '',
        'fullySolved': 0,
        'partiallySolved': 0,
        'recentContests': [],
        'contestHistory': [],
        'lastUpdated': datetime.now(timezone.utc),
        'dataSource': data_source
    }

def _extract_name(soup):
    """Extract user's full name - Enhanced method from working scraper"""
    try:
        name_tag = soup.find('div', class_='user-details-container')
        if name_tag:
            header = name_tag.find('header')
            if header:
                return header.text.strip()
    except Exception as e:
        logger.debug(f"Error extracting name: {e}")
    return ""

def _extract_country(soup):
    """Extract country - Enhanced method from working scraper"""
    try:
        country_tag = soup.find('span', class_='user-country-name')
        if country_tag:
            return country_tag.text.strip()
        # Alternative
        country_tag = soup.find('span', class_='country-name')
        if country_tag:
            return country_tag.text.strip()
    except Exception as e:
        logger.debug(f"Error extracting country: {e}")
    return ""

def _extract_institution(soup):
    """Extract institution/organization - Enhanced method from working scraper"""
    try:
        inst = soup.find('div', class_='user-institution')
        if inst:
            return inst.text.strip()
        # Alternative
        header = soup.find('header', class_='user-details')
        if header:
            span = header.find('span', class_='user-institution-name')
            if span:
                return span.text.strip()
        # Another alternative
        span = soup.find('span', class_='institution')
        if span:
            return span.text.strip()
    except Exception as e:
        logger.debug(f"Error extracting institution: {e}")
    return ""

def _extract_fully_solved(soup):
    """Extract fully solved problems count - Enhanced method from working scraper"""
    try:
        sections = soup.find_all('section', class_='problems-solved')
        for section in sections:
            if 'Fully Solved' in section.text or 'fully' in section.text.lower():
                h5 = section.find('h5')
                if h5:
                    numbers = re.findall(r'\d+', h5.text)
                    if numbers:
                        return int(numbers[0])
    except Exception as e:
        logger.debug(f"Error extracting fully solved: {e}")
    return 0

def _extract_partially_solved(soup):
    """Extract partially solved problems count - Enhanced method from working scraper"""
    try:
        sections = soup.find_all('section', class_='problems-solved')
        for section in sections:
            if 'Partially Solved' in section.text or 'partially' in section.text.lower():
                h5 = section.find('h5')
                if h5:
                    numbers = re.findall(r'\d+', h5.text)
                    if numbers:
                        return int(numbers[0])
    except Exception as e:
        logger.debug(f"Error extracting partially solved: {e}")
    return 0

def extract_contests_from_html(soup):
    """
    Universal contest extraction - handles multiple HTML formats
    Priority: h3 with parentheses -> "No. of Contests Participated" -> h3/h4/h5 tags -> regex
    """
    contests_attended = 0
    
    # PATTERN 0 (HIGHEST PRIORITY): h3 tag with "Contests (90)" format
    try:
        h3_tags = soup.find_all('h3')
        for h3 in h3_tags:
            h3_text = h3.get_text(strip=True)
            # Match: "Contests (90)", "Contests(90)", etc.
            match = CONTESTS_PATTERN_PAREN.search(h3_text)
            if match:
                contests_attended = int(match.group(1))
                logger.info(f"[Contest Pattern 0-h3-Parentheses] Found: {contests_attended} contests")
                return contests_attended
    except Exception as e:
        logger.debug(f"Pattern 0 failed: {e}")
    
    # PATTERN 0.5: "No. of Contests Participated: **90**" (from rating graph section)
    try:
        all_text = soup.get_text()
        match = re.search(r'no\.?\s*of\s+contests?\s+participated\s*[:\s]*\*{0,2}\s*(\d+)', all_text, re.IGNORECASE)
        if match:
            contests_attended = int(match.group(1))
            logger.info(f"[Contest Pattern 0.5-NoOfContests] Found: {contests_attended} contests")
            return contests_attended
    except Exception as e:
        logger.debug(f"Pattern 0.5 failed: {e}")
    
    # PATTERN 1: Look for "Contests" in h3/h4/h5 tags (any format)
    for tag_name in ['h3', 'h4', 'h5', 'h2']:
        try:
            tags = soup.find_all(tag_name)
            for tag in tags:
                tag_text = tag.get_text(strip=True).lower()
                if 'contest' in tag_text:
                    # Try parentheses first
                    paren_match = CONTESTS_PATTERN_PAREN.search(tag_text)
                    if paren_match:
                        contests_attended = int(paren_match.group(1))
                        logger.info(f"[Contest Pattern 1-{tag_name}-Parentheses] Found: {contests_attended} contests")
                        return contests_attended
                    # Try colon format
                    colon_match = CONTESTS_PATTERN_COLON.search(tag_text)
                    if colon_match:
                        contests_attended = int(colon_match.group(1))
                        logger.info(f"[Contest Pattern 1-{tag_name}-Colon] Found: {contests_attended} contests")
                        return contests_attended
        except Exception as e:
            logger.debug(f"Pattern 1-{tag_name} failed: {e}")
    
    # PATTERN 2: Regex search in entire page text
    try:
        all_text = soup.get_text()
        patterns = [
            r'contests?\s*\((\d+)\)',
            r'no\.?\s*of\s+contests?\s+participated[:\s]*\*{0,2}\s*(\d+)',
            r'total\s+contests?\s*[:\s]+(\d+)',
            r'contests?\s+attended\s*[:\s]+(\d+)',
            r'contests?\s+participated\s*[:\s]+(\d+)',
            r'(\d+)\s+contests?\s+attended',
            r'(\d+)\s+contests?\s+participated',
            r'(\d+)\s+total\s+contests?',
        ]
        for pattern in patterns:
            match = re.search(pattern, all_text, re.IGNORECASE)
            if match:
                contests_attended = int(match.group(1).replace(',', ''))
                if contests_attended > 0:
                    logger.info(f"[Contest Pattern 2-Regex] Found: {contests_attended} contests")
                    return contests_attended
    except Exception as e:
        logger.debug(f"Pattern 2 failed: {e}")
    
    # PATTERN 3: Look in rating-data-section
    try:
        rating_section = soup.find('section', class_='rating-data-section')
        if rating_section:
            section_text = rating_section.get_text()
            contest_matches = re.findall(r'(\d+)\s+contests?', section_text, re.IGNORECASE)
            if contest_matches:
                contest_numbers = [int(match) for match in contest_matches if int(match) > 5]
                if contest_numbers:
                    contests_attended = max(contest_numbers)
                    logger.info(f"[Contest Pattern 3-RatingSection] Found: {contests_attended} contests")
                    return contests_attended
    except Exception as e:
        logger.debug(f"Pattern 3 failed: {e}")
    
    # PATTERN 4: Search in contest-related divs
    try:
        contest_divs = soup.find_all('div', class_=re.compile(r'contest|participation', re.I))
        for div in contest_divs:
            div_text = div.get_text().lower()
            if 'contest' in div_text:
                numbers = re.findall(r'\d+', div_text.replace(',', ''))
                if numbers:
                    large_numbers = [int(n) for n in numbers if int(n) > 10]
                    if large_numbers:
                        contests_attended = max(large_numbers)
                        logger.info(f"[Contest Pattern 4-DivClass] Found: {contests_attended} contests")
                        return contests_attended
    except Exception as e:
        logger.debug(f"Pattern 4 failed: {e}")
    
    # PATTERN 5: Fallback - find all contest mentions
    try:
        all_text = soup.get_text()
        contest_matches = re.findall(r'(\d+)\s+contests?', all_text, re.IGNORECASE)
        if contest_matches:
            contest_numbers = [int(match) for match in contest_matches if int(match) > 10]
            if contest_numbers:
                contests_attended = max(contest_numbers)
                logger.info(f"[Contest Pattern 5-Fallback] Found: {contests_attended} contests")
                return contests_attended
    except Exception as e:
        logger.debug(f"Pattern 5 failed: {e}")
    
    return 0

def extract_submissions_from_heatmap(soup):
    """
    Universal submission heatmap extraction
    Handles the heatmap container and SVG structure
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
        # METHOD 1: Find heatmap container by ID
        heatmap_container = soup.find('div', id='js-heatmap')
        if not heatmap_container:
            # METHOD 2: Find by class
            heatmap_container = soup.find('div', class_=re.compile(r'heatmap', re.I))
        
        if not heatmap_container:
            # METHOD 3: Find by looking for "Submissions Heat Map" heading
            headings = soup.find_all(['h2', 'h3', 'h4'])
            for heading in headings:
                if 'submissions' in heading.get_text().lower() and 'heat' in heading.get_text().lower():
                    next_sibling = heading.find_next_sibling()
                    while next_sibling:
                        if next_sibling.name == 'div' and ('heatmap' in str(next_sibling.get('id', '')).lower() or 
                                                           'heatmap' in str(next_sibling.get('class', [])).lower()):
                            heatmap_container = next_sibling
                            break
                        if next_sibling.find('svg'):
                            heatmap_container = next_sibling
                            break
                        next_sibling = next_sibling.find_next_sibling()
                    break
        
        if heatmap_container:
            # Extract all rect elements with data-count attribute
            rects = heatmap_container.find_all('rect', class_='day')
            if not rects:
                rects = heatmap_container.find_all('rect', attrs={'data-count': True})
            
            total_submissions = 0
            submissions_by_date = []
            max_daily = 0
            
            for rect in rects:
                date_attr = rect.get('data-date')
                count_attr = rect.get('data-count')
                category_attr = rect.get('category')
                
                if date_attr and count_attr:
                    try:
                        count = int(count_attr)
                        if count > 0:
                            total_submissions += count
                            max_daily = max(max_daily, count)
                            
                            submission_entry = {
                                'date': date_attr,
                                'count': count,
                                'category': int(category_attr) if category_attr and category_attr.isdigit() else 0
                            }
                            
                            submissions_by_date.append(submission_entry)
                            result['submissionByDate'][date_attr] = count
                    except (ValueError, TypeError):
                        continue
            
            result['totalSubmissions'] = total_submissions
            result['submissionHeatmap'] = submissions_by_date
            result['submissionStats']['daysWithSubmissions'] = len(submissions_by_date)
            result['submissionStats']['maxDailySubmissions'] = max_daily
            result['submissionStats']['avgDailySubmissions'] = (
                round(total_submissions / len(submissions_by_date), 2) 
                if submissions_by_date else 0.0
            )
            
            if total_submissions > 0:
                logger.info(f"[Submissions] Extracted {total_submissions} total submissions from {len(submissions_by_date)} days")
        else:
            logger.debug("[Submissions] Heatmap container not found")
    
    except Exception as e:
        logger.warning(f"Error extracting submission data: {e}")
    
    return result

def extract_submissions_from_heatmap_selenium(driver):
    """
    Extract submission heatmap data using Selenium (for JS-rendered content)
    This function directly accesses DOM elements after JavaScript has rendered them
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
        logger.info("[Selenium-Heatmap] Waiting for heatmap to render...")
        
        # Wait for heatmap container to be present
        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.ID, "js-heatmap"))
            )
            # Additional wait for JavaScript to populate data attributes (increased wait time)
            time.sleep(HEATMAP_WAIT_TIME + 2)
            
            # Scroll to heatmap to ensure it's fully rendered
            try:
                heatmap_element = driver.find_element(By.ID, "js-heatmap")
                driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", heatmap_element)
                time.sleep(1)
            except:
                pass
        except (Exception, TimeoutException) as e:
            # Try alternative selectors
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".heatmap-content, #js-heatmap"))
                )
                time.sleep(HEATMAP_WAIT_TIME + 2)
            except (Exception, TimeoutException) as e2:
                logger.warning(f"[Selenium-Heatmap] Heatmap container not found: {e2}")
                return result
        
        # METHOD 1: Extract using Selenium WebElements directly
        try:
            # Find all rect elements with data-count attribute
            rect_elements = driver.find_elements(By.CSS_SELECTOR, 'rect.day[data-count]')
            
            if not rect_elements:
                # Try without class selector
                rect_elements = driver.find_elements(By.CSS_SELECTOR, 'rect[data-count]')
            
            total_submissions = 0
            submissions_by_date = []
            max_daily = 0
            
            for rect in rect_elements:
                try:
                    date_attr = rect.get_attribute('data-date')
                    count_attr = rect.get_attribute('data-count')
                    category_attr = rect.get_attribute('category')
                    
                    if date_attr and count_attr:
                        try:
                            count = int(count_attr)
                            if count > 0:
                                total_submissions += count
                                max_daily = max(max_daily, count)
                                
                                submission_entry = {
                                    'date': date_attr,
                                    'count': count,
                                    'category': int(category_attr) if category_attr and category_attr.isdigit() else 0
                                }
                                
                                submissions_by_date.append(submission_entry)
                                result['submissionByDate'][date_attr] = count
                        except (ValueError, TypeError):
                            continue
                except Exception as e:
                    logger.debug(f"Error processing rect element: {e}")
                    continue
            
            if total_submissions > 0:
                result['totalSubmissions'] = total_submissions
                result['submissionHeatmap'] = submissions_by_date
                result['submissionStats']['daysWithSubmissions'] = len(submissions_by_date)
                result['submissionStats']['maxDailySubmissions'] = max_daily
                result['submissionStats']['avgDailySubmissions'] = (
                    round(total_submissions / len(submissions_by_date), 2) 
                    if submissions_by_date else 0.0
                )
                logger.info(f"[Selenium-Heatmap] Extracted {total_submissions} total submissions from {len(submissions_by_date)} days")
                return result
        except Exception as e:
            logger.warning(f"[Selenium-Heatmap] Error with WebElements method: {e}")
        
        # METHOD 2: Enhanced JavaScript execution with multiple strategies
        try:
            logger.info("[Selenium-Heatmap] Trying enhanced JavaScript extraction...")
            
            # Strategy 2A: Async script that waits for data
            try:
                async_js_script = """
                var callback = arguments[arguments.length - 1];
                
                function waitForHeatmap() {
                    return new Promise((resolve) => {
                        let attempts = 0;
                        const maxAttempts = 15;
                        const checkInterval = setInterval(() => {
                            const rects = document.querySelectorAll('rect.day[data-count], rect[data-count], rect[data-date]');
                            const hasData = Array.from(rects).some(r => r.getAttribute('data-count') && parseInt(r.getAttribute('data-count')) > 0);
                            
                            if (hasData || attempts >= maxAttempts) {
                                clearInterval(checkInterval);
                                resolve(rects);
                            }
                            attempts++;
                        }, 300);
                    });
                }
                
                waitForHeatmap().then(rects => {
                    var data = [];
                    var total = 0;
                    var maxDaily = 0;
                    
                    for (var i = 0; i < rects.length; i++) {
                        var rect = rects[i];
                        var date = rect.getAttribute('data-date');
                        var count = rect.getAttribute('data-count');
                        var category = rect.getAttribute('category');
                        
                        if (date && count) {
                            var countInt = parseInt(count);
                            if (countInt > 0) {
                                total += countInt;
                                maxDaily = Math.max(maxDaily, countInt);
                                data.push({
                                    date: date,
                                    count: countInt,
                                    category: parseInt(category || '0')
                                });
                            }
                        }
                    }
                    
                    callback({
                        total: total,
                        data: data,
                        maxDaily: maxDaily,
                        daysWithSubmissions: data.length
                    });
                });
                """
                
                js_result = driver.execute_async_script(async_js_script)
                logger.info("[Selenium-Heatmap] Async script executed successfully")
            except Exception as e:
                logger.debug(f"[Selenium-Heatmap] Async script failed: {e}, trying synchronous...")
                # Strategy 2B: Synchronous script (fallback)
                js_script = """
                var rects = document.querySelectorAll('rect.day[data-count], rect[data-count], rect[data-date]');
                var data = [];
                var total = 0;
                var maxDaily = 0;
                
                for (var i = 0; i < rects.length; i++) {
                    var rect = rects[i];
                    var date = rect.getAttribute('data-date');
                    var count = rect.getAttribute('data-count');
                    var category = rect.getAttribute('category');
                    
                    if (date && count) {
                        var countInt = parseInt(count);
                        if (countInt > 0) {
                            total += countInt;
                            maxDaily = Math.max(maxDaily, countInt);
                            data.push({
                                date: date,
                                count: countInt,
                                category: parseInt(category || '0')
                            });
                        }
                    }
                }
                
                return {
                    total: total,
                    data: data,
                    maxDaily: maxDaily,
                    daysWithSubmissions: data.length
                };
                """
                
                js_result = driver.execute_script(js_script)
            
            if js_result and js_result.get('total', 0) > 0:
                total_submissions = js_result['total']
                submissions_by_date = js_result['data']
                max_daily = js_result.get('maxDaily', 0)
                if not max_daily and submissions_by_date:
                    max_daily = max([item['count'] for item in submissions_by_date])
                days_count = js_result.get('daysWithSubmissions', len(submissions_by_date))
                
                result['totalSubmissions'] = total_submissions
                result['submissionHeatmap'] = submissions_by_date
                result['submissionStats']['daysWithSubmissions'] = days_count
                result['submissionStats']['maxDailySubmissions'] = max_daily
                result['submissionStats']['avgDailySubmissions'] = (
                    round(total_submissions / days_count, 2) if days_count > 0 else 0.0
                )
                
                # Build submissionByDate dict
                for item in submissions_by_date:
                    result['submissionByDate'][item['date']] = item['count']
                
                logger.info(f"[Selenium-Heatmap-JS] ✅ Extracted {total_submissions} total submissions from {days_count} days")
                return result
            else:
                logger.debug("[Selenium-Heatmap] JavaScript returned no data")
        except Exception as e:
            logger.warning(f"[Selenium-Heatmap] Error with JavaScript method: {e}")
        
        # METHOD 3: Fallback to BeautifulSoup on page source
        logger.info("[Selenium-Heatmap] Falling back to BeautifulSoup parsing...")
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        return extract_submissions_from_heatmap(soup)
        
    except Exception as e:
        logger.error(f"[Selenium-Heatmap] Error extracting submission data: {e}")
        return result

def scrape_with_beautifulsoup(url_or_username):
    """
    Primary scraping method using BeautifulSoup (fast, lightweight)
    Enhanced error handling with retries and better exception catching
    Accepts either URL or username
    """
    # Normalize input to get URL and username
    profile_url, username = normalize_codechef_input(url_or_username)
    
    if not profile_url or not username:
        logger.error(f"[BeautifulSoup] Invalid input: {url_or_username}")
        return None
    
    try:
        logger.info(f"[BeautifulSoup] Scraping CodeChef for {username} (URL: {profile_url})")
        
        # Try to get the page with retries
        response = None
        max_request_retries = 2
        for attempt in range(max_request_retries):
            try:
                response = safe_request(profile_url, timeout=20, retries=2)
                if response:
                    break
                elif attempt < max_request_retries - 1:
                    wait_time = (attempt + 1) * 3
                    logger.info(f"[BeautifulSoup] Request failed, retrying after {wait_time}s...")
                    time.sleep(wait_time)
            except Exception as req_error:
                logger.warning(f"[BeautifulSoup] Request error on attempt {attempt + 1}: {req_error}")
                if attempt < max_request_retries - 1:
                    time.sleep((attempt + 1) * 3)
                else:
                    logger.error(f"[BeautifulSoup] All request attempts failed for {username}")
                    return None
        
        if not response:
            logger.warning(f"[BeautifulSoup] Failed to get CodeChef profile for {username} after {max_request_retries} attempts")
            return None
        
        # Handle encoding properly to avoid REPLACEMENT CHARACTER errors
        try:
            # Use response.text which requests handles encoding for
            html_content = response.text
            logger.debug(f"[BeautifulSoup] Successfully retrieved HTML content ({len(html_content)} chars)")
        except (UnicodeDecodeError, AttributeError) as encoding_error:
            logger.warning(f"[BeautifulSoup] Encoding error, using fallback: {encoding_error}")
            # Fallback: decode with UTF-8 and ignore errors
            try:
                html_content = response.content.decode('utf-8', errors='ignore')
            except Exception as decode_error:
                logger.error(f"[BeautifulSoup] Failed to decode HTML content: {decode_error}")
                return None
        
        # Parse HTML with BeautifulSoup
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            logger.debug(f"[BeautifulSoup] HTML parsed successfully")
        except Exception as parse_error:
            logger.error(f"[BeautifulSoup] Failed to parse HTML with BeautifulSoup: {parse_error}")
            logger.exception("BeautifulSoup parse error:")
            return None
        
        # Initialize result with all fields including submissions
        result = _create_result_dict(username, 'codechef_bs4')
        
        # Extract rating information
        try:
            rating_section = soup.find('div', class_='rating-number')
            if rating_section:
                rating_text = rating_section.get_text(strip=True)
                result['rating'] = extract_number_from_text(rating_text)
            
            # Max rating extraction - Multiple methods (prioritize rating graph data)
            max_rating = 0
            max_rating_from_graph = 0
            
            # Method 1: Extract from rating graph JavaScript data FIRST (most accurate)
            try:
                scripts = soup.find_all('script', type='text/javascript')
                for script in scripts:
                    if script.string and 'allrating' in script.string.lower():
                        script_text = script.string
                        
                        # Extract allrating array
                        pattern = r'allrating\s*=\s*(\[[^\]]*(?:\{[^\}]*\}[^\]]*)*\])'
                        matches = re.findall(pattern, script_text, re.DOTALL)
                        
                        if matches:
                            try:
                                json_str = matches[0]
                                json_str = json_str.replace("'", '"')
                                json_str = re.sub(r'(\w+):', r'"\1":', json_str)
                                json_str = re.sub(r',\s*}', '}', json_str)
                                json_str = re.sub(r',\s*]', ']', json_str)
                                
                                rating_data = json.loads(json_str)
                                
                                # Find maximum rating from all contests
                                ratings = []
                                for entry in rating_data:
                                    rating = entry.get('rating', 0) or entry.get('getrating', 0)
                                    if rating:
                                        ratings.append(int(rating))
                                
                                if ratings:
                                    max_rating_from_graph = max(ratings)
                                    logger.info(f"[Max Rating] Found from rating graph: {max_rating_from_graph} (from {len(ratings)} contests)")
                                    logger.info(f"[Max Rating] Rating range: {min(ratings)} - {max_rating_from_graph}")
                                    max_rating = max_rating_from_graph  # Use graph data as primary source
                            except Exception as e:
                                logger.debug(f"[Max Rating] Error parsing rating graph: {e}")
            except Exception as e:
                logger.debug(f"[Max Rating] Error extracting from scripts: {e}")
            
            # Method 2: Extract from rating-header div (fallback if graph data not available)
            if max_rating == 0:
                max_rating_section = soup.find('div', class_='rating-header')
                if max_rating_section:
                    max_rating_text = max_rating_section.get_text()
                    # Try multiple patterns
                    patterns = [
                        r'Highest Rating[:\s]*(\d+)',
                        r'Max Rating[:\s]*(\d+)',
                        r'(\d+)\s*\(Highest\)',
                        r'(\d+)\s*\(Max\)'
                    ]
                    for pattern in patterns:
                        match = re.search(pattern, max_rating_text, re.IGNORECASE)
                        if match:
                            max_rating = int(match.group(1))
                            logger.info(f"[Max Rating] Found from rating-header: {max_rating}")
                            break
                    
                    # Try finding in small tag
                    if max_rating == 0:
                        small_tag = max_rating_section.find('small')
                        if small_tag:
                            small_text = small_tag.get_text()
                            for pattern in patterns:
                                match = re.search(pattern, small_text, re.IGNORECASE)
                                if match:
                                    max_rating = int(match.group(1))
                                    logger.info(f"[Max Rating] Found from small tag: {max_rating}")
                                    break
            
            # Method 3: Search in page text as fallback
            if max_rating == 0:
                page_text = soup.get_text()
                patterns = [
                    r'Highest Rating[:\s]*(\d+)',
                    r'Max Rating[:\s]*(\d+)',
                    r'Peak Rating[:\s]*(\d+)'
                ]
                for pattern in patterns:
                    match = re.search(pattern, page_text, re.IGNORECASE)
                    if match:
                        max_rating = int(match.group(1))
                        logger.info(f"[Max Rating] Found from page text: {max_rating}")
                        break
            
            # Set max rating - prioritize graph data, but ensure it's >= current rating
            if max_rating > 0:
                # Ensure max rating is at least equal to current rating
                if result['rating'] > 0 and max_rating < result['rating']:
                    logger.warning(f"[Max Rating] Max rating ({max_rating}) is less than current rating ({result['rating']}), using current rating")
                    result['maxRating'] = result['rating']
                else:
                    result['maxRating'] = max_rating
            elif result['rating'] > 0:
                result['maxRating'] = result['rating']
                logger.info(f"[Max Rating] Using current rating as max: {result['rating']}")
            
        except Exception as e:
            logger.warning(f"Error extracting rating for {username}: {e}")
        
        # Extract ranking information - ENHANCED
        try:
            # Method 1: Look for rating-ranks div with links
            rank_sections = soup.find_all('div', class_='rating-ranks')
            for rank_section in rank_sections:
                links = rank_section.find_all('a')
                for link in links:
                    link_text = link.get_text().lower()
                    rank_value = extract_number_from_text(link.get_text())
                    if 'global' in link_text and rank_value > 0:
                        result['globalRank'] = rank_value
                    elif 'country' in link_text and rank_value > 0:
                        result['countryRank'] = rank_value
            
            # Method 2: Extract from text patterns (fallback)
            if result['globalRank'] == 0 or result['countryRank'] == 0:
                page_text = soup.get_text()
                # Pattern: "152091 Global Rank" or "Global Rank: 152091"
                global_match = re.search(r'global\s+rank[:\s]*\*{0,2}\s*(\d+)', page_text, re.IGNORECASE)
                if global_match:
                    result['globalRank'] = int(global_match.group(1).replace(',', ''))
                
                country_match = re.search(r'country\s+rank[:\s]*\*{0,2}\s*(\d+)', page_text, re.IGNORECASE)
                if country_match:
                    result['countryRank'] = int(country_match.group(1).replace(',', ''))
            
            # Method 3: Extract from specific HTML structure
            if result['globalRank'] == 0 or result['countryRank'] == 0:
                rank_divs = soup.find_all('div', string=re.compile(r'rank', re.I))
                for div in rank_divs:
                    parent = div.find_parent()
                    if parent:
                        text = parent.get_text()
                        numbers = re.findall(r'\d+', text.replace(',', ''))
                        if numbers:
                            rank_val = int(numbers[0])
                            if 'global' in text.lower() and result['globalRank'] == 0:
                                result['globalRank'] = rank_val
                            elif 'country' in text.lower() and result['countryRank'] == 0:
                                result['countryRank'] = rank_val
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
        
        # Extract problems solved - ENHANCED COMPREHENSIVE METHOD
        try:
            logger.info(f"[BeautifulSoup] Extracting problems solved for {username}...")
            
            # Pattern 1: Direct h3/h4/h5 tag search (for "Total Problems Solved: 335")
            for tag_name in ['h3', 'h4', 'h5', 'h2']:
                if result['totalSolved'] > 0:
                    break
                tags = soup.find_all(tag_name)
                for tag in tags:
                    tag_text = tag.get_text(strip=True)
                    if 'total problems solved' in tag_text.lower():
                        numbers = re.findall(r'\d+', tag_text.replace(',', ''))
                        if numbers:
                            result['totalSolved'] = int(numbers[0])
                            result['problemsSolved'] = result['totalSolved']
                            logger.info(f"[Method 1-{tag_name}] Found: {result['totalSolved']} problems")
                            break
            
            # Pattern 2: Regex search in entire page
            if result['totalSolved'] == 0:
                page_text = soup.get_text()
                patterns = [
                    r'total\s+problems\s+solved[:\s]+(\d+)',  # "Total Problems Solved: 335"
                    r'problems\s+solved[:\s]+(\d+)',          # "Problems Solved: 335"
                    r'total[:\s]+(\d+)\s+problems\s+solved',  # "Total: 335 Problems Solved"
                ]
                for pattern in patterns:
                    match = re.search(pattern, page_text, re.IGNORECASE)
                    if match:
                        result['totalSolved'] = int(match.group(1).replace(',', ''))
                        result['problemsSolved'] = result['totalSolved']
                        logger.info(f"[Method 2-Regex] Found: {result['totalSolved']} problems")
                        break
            
            # Pattern 3: Problems-solved div section
            if result['totalSolved'] == 0:
                problems_div = soup.find('div', class_='problems-solved')
                if problems_div:
                    # Search in h5 tags
                    h5_tags = problems_div.find_all('h5')
                    for h5 in h5_tags:
                        text = h5.get_text().lower()
                        if 'problems' in text:
                            numbers = re.findall(r'\d+', text.replace(',', ''))
                            if numbers:
                                result['totalSolved'] = int(numbers[-1])  # Last number is usually total
                                result['problemsSolved'] = result['totalSolved']
                                logger.info(f"[Method 3-Div] Found: {result['totalSolved']} problems")
                                break
            
            # Pattern 4: Rating data section
            if result['totalSolved'] == 0:
                rating_section = soup.find('section', class_='rating-data-section')
                if rating_section:
                    all_text = rating_section.get_text()
                    match = PROBLEMS_PATTERN.search(all_text)
                    if match:
                        result['totalSolved'] = int(match.group(1).replace(',', ''))
                        result['problemsSolved'] = result['totalSolved']
                        logger.info(f"[Method 4-Rating] Found: {result['totalSolved']} problems")
            
            # Pattern 5: Search in all divs with stats-related classes
            if result['totalSolved'] == 0:
                stat_divs = soup.find_all('div', class_=re.compile(r'stat|problem|solve', re.I))
                for div in stat_divs:
                    div_text = div.get_text()
                    if 'total problems solved' in div_text.lower():
                        numbers = re.findall(r'\d+', div_text.replace(',', ''))
                        if numbers:
                            result['totalSolved'] = int(numbers[0])
                            result['problemsSolved'] = result['totalSolved']
                            logger.info(f"[Method 5-StatDiv] Found: {result['totalSolved']} problems")
                        break
            
            if result['totalSolved'] > 0:
                logger.info(f"✅ Successfully extracted {result['totalSolved']} problems solved")
            else:
                logger.warning(f"⚠️ Could not extract problems solved count for {username}")
                        
        except Exception as e:
            logger.warning(f"Error extracting problems solved for {username}: {e}")
            traceback.print_exc()
        
        # Extract contest participation - USING UNIVERSAL FUNCTION
        try:
            logger.info(f"[BeautifulSoup] Extracting contest count for {username}...")
            result['contestsAttended'] = extract_contests_from_html(soup)
            
            if result['contestsAttended'] > 0:
                logger.info(f"✅ Successfully extracted {result['contestsAttended']} contests attended")
            else:
                logger.warning(f"⚠️ Could not extract contest count for {username}")
                    
        except Exception as e:
            logger.warning(f"Error extracting contests for {username}: {e}")
            traceback.print_exc()
        
        # Extract submission data from heatmap - USING UNIVERSAL FUNCTION
        try:
            logger.info(f"[BeautifulSoup] Extracting submission data from heatmap for {username}...")
            submission_data = extract_submissions_from_heatmap(soup)
            result['totalSubmissions'] = submission_data['totalSubmissions']
            result['submissionHeatmap'] = submission_data['submissionHeatmap']
            result['submissionByDate'] = submission_data['submissionByDate']
            result['submissionStats'] = submission_data['submissionStats']
            
            # If no submissions found with BeautifulSoup, recommend using Selenium
            if result['totalSubmissions'] == 0:
                logger.info("[BeautifulSoup] No submissions found in static HTML - heatmap likely requires JavaScript rendering")
                logger.info("[BeautifulSoup] Consider using Selenium fallback for this user")
        except Exception as e:
            logger.warning(f"Error extracting submission data for {username}: {e}")
        
        # Extract additional profile info - Using enhanced methods
        try:
            result['name'] = _extract_name(soup)
            result['country'] = _extract_country(soup)
            result['institution'] = _extract_institution(soup)
            result['fullySolved'] = _extract_fully_solved(soup)
            result['partiallySolved'] = _extract_partially_solved(soup)
            
            # Set totalSolved to fullySolved if not found by other methods
            if result['totalSolved'] == 0 and result['fullySolved'] > 0:
                result['totalSolved'] = result['fullySolved']
                result['problemsSolved'] = result['fullySolved']
                logger.info(f"[BeautifulSoup] Using fullySolved count: {result['totalSolved']}")
        except Exception as e:
            logger.warning(f"Error extracting profile info for {username}: {e}")
        
        # Validate data
        if result['rating'] == 0 and result['totalSolved'] == 0:
            logger.warning(f"[BeautifulSoup] No meaningful data found for CodeChef user {username} - might be invalid user or page structure changed")
            # Check if we got any data at all
            if result.get('name') or result.get('country') or result.get('institution'):
                logger.info(f"[BeautifulSoup] Some profile data found (name/country/institution) - returning partial data")
                return result
            return None
        
        logger.info(f"[BeautifulSoup] ✅ SUCCESS CodeChef data for {username}: {result['totalSolved']} solved, {result['rating']} rating, {result['contestsAttended']} contests, {result['totalSubmissions']} submissions")
        return result
        
    except KeyboardInterrupt:
        logger.warning(f"[BeautifulSoup] Scraping interrupted by user for {username}")
        raise  # Re-raise to allow proper cleanup
    except Exception as e:
        error_msg = f"[BeautifulSoup] Error scraping CodeChef for {username}: {str(e)}"
        logger.error(error_msg)
        logger.exception("Full traceback:")
        traceback.print_exc()
        return None

def scrape_with_selenium(url_or_username):
    """
    Fallback scraping method using Selenium (for JS-heavy content)
    Enhanced with better ChromeDriver setup for Windows
    Accepts either URL or username
    """
    # Normalize input to get URL and username
    profile_url, username = normalize_codechef_input(url_or_username)
    
    if not profile_url or not username:
        logger.error(f"[Selenium] Invalid input: {url_or_username}")
        return None
    
    if not SELENIUM_AVAILABLE:
        logger.error(f"[Selenium] Cannot scrape {username} - Selenium not installed")
        return None
    
    driver = None
    try:
        logger.info(f"[Selenium] Scraping CodeChef for {username} (URL: {profile_url})")
        
        # Setup Chrome options - Clean setup per friend's recommendation
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Optional: run without GUI
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")  # Avoid GPU errors
        
        # Use ChromeDriverManager to automatically install and manage ChromeDriver
        # DO NOT manually use cached paths or license files
        try:
            logger.info(f"[Selenium] Setting up ChromeDriver using ChromeDriverManager...")
            logger.info(f"[Selenium] System architecture: {platform.machine()}, OS: {platform.system()}")
            
            # Use ChromeDriverManager - it handles path resolution correctly
            driver_path = ChromeDriverManager().install()
            logger.info(f"[Selenium] ChromeDriver installed at: {driver_path}")
            
            # Verify the path points to an executable, not a license file
            import os
            if os.path.isdir(driver_path):
                # If it returns a directory, find chromedriver.exe/chromedriver
                if platform.system() == 'Windows':
                    driver_exe = os.path.join(driver_path, 'chromedriver.exe')
                else:
                    driver_exe = os.path.join(driver_path, 'chromedriver')
                
                if os.path.exists(driver_exe):
                    driver_path = driver_exe
                    logger.info(f"[Selenium] Found ChromeDriver executable: {driver_path}")
                else:
                    # Search for executable in directory
                    for file in os.listdir(driver_path):
                        if file == 'chromedriver.exe' or file == 'chromedriver':
                            driver_path = os.path.join(driver_path, file)
                            logger.info(f"[Selenium] Found ChromeDriver executable: {driver_path}")
                            break
            elif not driver_path.endswith('.exe') and platform.system() == 'Windows':
                # If path doesn't end with .exe, it might be wrong file
                # Try to find chromedriver.exe in the same directory
                driver_dir = os.path.dirname(driver_path)
                driver_exe = os.path.join(driver_dir, 'chromedriver.exe')
                if os.path.exists(driver_exe):
                    driver_path = driver_exe
                    logger.info(f"[Selenium] Corrected ChromeDriver path to: {driver_path}")
            
            # Verify the executable exists
            if not os.path.exists(driver_path):
                raise FileNotFoundError(f"ChromeDriver executable not found at: {driver_path}")
            
            logger.info(f"[Selenium] Using ChromeDriver at: {driver_path}")
            
            # Create service with the driver path
            service = Service(driver_path)
            
            # Try to initialize Chrome with headless mode first
            try:
                driver = webdriver.Chrome(service=service, options=chrome_options)
                logger.info("[Selenium] ✅ ChromeDriver initialized successfully (headless mode)")
            except Exception as headless_error:
                # If headless fails, try without headless as fallback
                logger.warning(f"[Selenium] Headless mode failed: {headless_error}")
                logger.info("[Selenium] Trying non-headless mode as fallback...")
                
                # Create new options without headless
                chrome_options_no_headless = Options()
                chrome_options_no_headless.add_argument("--no-sandbox")
                chrome_options_no_headless.add_argument("--disable-dev-shm-usage")
                chrome_options_no_headless.add_argument("--disable-gpu")
                
                try:
                    driver = webdriver.Chrome(service=service, options=chrome_options_no_headless)
                    logger.info("[Selenium] ✅ ChromeDriver initialized successfully (non-headless mode)")
                except Exception as fallback_error:
                    raise Exception(f"Both headless and non-headless modes failed. Headless: {headless_error}. Fallback: {fallback_error}")
            
        except Exception as e:
            error_msg = f"[Selenium] ChromeDriver initialization failed: {str(e)}"
            logger.error(error_msg)
            logger.exception("ChromeDriver error traceback:")
            # Return error information in result format
            return {
                'error': 'selenium_driver_error',
                'error_message': str(e),
                'error_type': type(e).__name__
            }
        
        # Set timeouts
        driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
        driver.set_script_timeout(SCRIPT_TIMEOUT)
        driver.implicitly_wait(10)  # Implicit wait for elements
        
        # Execute script to hide webdriver
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        # Navigate to profile (using the normalized URL)
        try:
            logger.info(f"[Selenium] Navigating to {profile_url}...")
            driver.get(profile_url)
            logger.info(f"[Selenium] Page loaded successfully")
        except TimeoutException as page_timeout:
            logger.warning(f"[Selenium] Page load timeout after {PAGE_LOAD_TIMEOUT}s, but continuing...")
            # Continue anyway - page might have partially loaded
        
        # Wait for key elements to load with longer timeout
        try:
            logger.info(f"[Selenium] Waiting for rating-number element...")
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CLASS_NAME, "rating-number"))
            )
            logger.info(f"[Selenium] Rating element found")
        except TimeoutException:
            logger.warning(f"[Selenium] Timeout waiting for rating-number element, trying to continue...")
            # Try to continue anyway - might still be able to extract some data
        
        # Additional wait for JS to render
        logger.info(f"[Selenium] Waiting {SELENIUM_RENDER_WAIT}s for JavaScript to render...")
        time.sleep(SELENIUM_RENDER_WAIT)
        
        # Get page source and parse with BeautifulSoup for universal extraction
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        
        # Initialize result with all fields including submissions
        result = _create_result_dict(username, 'codechef_selenium')
        
        # Extract rating
        try:
            rating_element = driver.find_element(By.CLASS_NAME, 'rating-number')
            result['rating'] = extract_number_from_text(rating_element.text)
        except Exception as e:
            logger.warning(f"[Selenium] Error extracting rating: {e}")
        
        # Extract max rating - Enhanced (prioritize rating graph)
        try:
            max_rating = 0
            max_rating_from_graph = 0
            
            # Method 1: From rating graph JavaScript FIRST (most accurate)
            try:
                # Wait a bit for JavaScript to render
                time.sleep(2)
                
                # Extract using JavaScript execution
                js_script = """
                var maxRating = 0;
                var scripts = document.getElementsByTagName('script');
                for (var i = 0; i < scripts.length; i++) {
                    var scriptText = scripts[i].innerHTML || scripts[i].textContent || '';
                    if (scriptText.indexOf('allrating') !== -1) {
                        try {
                            // Try to extract allrating array
                            var match = scriptText.match(/allrating\\s*=\\s*(\\[[\\s\\S]*?\\])/);
                            if (match) {
                                var jsonStr = match[1];
                                // Clean up JSON string
                                jsonStr = jsonStr.replace(/'/g, '"');
                                jsonStr = jsonStr.replace(/(\\w+):/g, '"$1":');
                                jsonStr = jsonStr.replace(/,\\s*}/g, '}');
                                jsonStr = jsonStr.replace(/,\\s*]/g, ']');
                                
                                var data = JSON.parse(jsonStr);
                                if (Array.isArray(data)) {
                                    for (var j = 0; j < data.length; j++) {
                                        var rating = data[j].rating || data[j].getrating || 0;
                                        if (rating > maxRating) maxRating = rating;
                                    }
                                    if (maxRating > 0) return maxRating;
                                }
                            }
                        } catch(e) {
                            console.log('Error parsing rating data:', e);
                        }
                    }
                }
                return 0;
                """
                try:
                    max_rating_from_graph = driver.execute_script(js_script)
                    if max_rating_from_graph and max_rating_from_graph > 0:
                        max_rating = max_rating_from_graph
                        logger.info(f"[Selenium-Max Rating] Found from rating graph: {max_rating}")
                except Exception as e:
                    logger.debug(f"[Selenium] JavaScript extraction failed: {e}")
            except Exception as e:
                logger.debug(f"[Selenium] Error extracting from rating graph: {e}")
            
            # Method 2: From rating-header (fallback)
            if max_rating == 0:
                try:
                    rating_header = driver.find_element(By.CLASS_NAME, 'rating-header')
                    header_text = rating_header.text
                    patterns = [
                        r'Highest Rating[:\s]*(\d+)',
                        r'Max Rating[:\s]*(\d+)',
                        r'(\d+)\s*\(Highest\)'
                    ]
                    for pattern in patterns:
                        match = re.search(pattern, header_text, re.IGNORECASE)
                        if match:
                            max_rating = int(match.group(1))
                            logger.info(f"[Selenium-Max Rating] Found from header: {max_rating}")
                            break
                except Exception as e:
                    logger.debug(f"[Selenium] Rating header not found: {e}")
            
            # Set max rating - ensure it's >= current rating
            if max_rating > 0:
                if result['rating'] > 0 and max_rating < result['rating']:
                    logger.warning(f"[Selenium-Max Rating] Max rating ({max_rating}) < current rating ({result['rating']}), using current")
                    result['maxRating'] = result['rating']
                else:
                    result['maxRating'] = max_rating
            elif result['rating'] > 0:
                result['maxRating'] = result['rating']
                logger.info(f"[Selenium-Max Rating] Using current rating as max: {result['rating']}")
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
        
        # Extract global and country ranks from profile header - ENHANCED
        try:
            # Method 1: Look for rating-ranks section (most reliable)
            try:
                rank_section = driver.find_element(By.CLASS_NAME, "rating-ranks")
                links = rank_section.find_elements(By.TAG_NAME, "a")
                for link in links:
                    link_text = link.text.strip()
                    rank_value = extract_number_from_text(link_text)
                    if rank_value > 0:
                        link_text_lower = link_text.lower()
                        if 'global' in link_text_lower:
                            result['globalRank'] = rank_value
                            logger.info(f"[Selenium] Global Rank: {result['globalRank']}")
                        elif 'country' in link_text_lower or 'india' in link_text_lower:
                            result['countryRank'] = rank_value
                            logger.info(f"[Selenium] Country Rank: {result['countryRank']}")
            except Exception as rank_section_error:
                logger.debug(f"[Selenium] Rating-ranks section not found: {rank_section_error}")
            
            # Method 2: Extract from page text (fallback)
            if result['globalRank'] == 0 or result['countryRank'] == 0:
                page_text = driver.page_source
                global_match = re.search(r'global\s+rank[:\s]*\*{0,2}\s*(\d+)', page_text, re.IGNORECASE)
                if global_match:
                    result['globalRank'] = int(global_match.group(1).replace(',', ''))
                    logger.info(f"[Selenium] Global Rank (text): {result['globalRank']}")
                
                country_match = re.search(r'country\s+rank[:\s]*\*{0,2}\s*(\d+)', page_text, re.IGNORECASE)
                if country_match:
                    result['countryRank'] = int(country_match.group(1).replace(',', ''))
                    logger.info(f"[Selenium] Country Rank (text): {result['countryRank']}")
                
                # Also try "Indian Rank" pattern
                if result['countryRank'] == 0:
                    indian_match = re.search(r'indian\s+rank[:\s]*\*{0,2}\s*(\d+)', page_text, re.IGNORECASE)
                    if indian_match:
                        result['countryRank'] = int(indian_match.group(1).replace(',', ''))
                        logger.info(f"[Selenium] Indian Rank (text): {result['countryRank']}")
        except Exception as e:
            logger.warning(f"[Selenium] Error extracting ranks: {e}")
        
        # Extract problems solved - ENHANCED (using BeautifulSoup on page source)
        try:
            # Use the same comprehensive method as BeautifulSoup
            for tag_name in ['h3', 'h4', 'h5', 'h2']:
                if result['totalSolved'] > 0:
                    break
                tags = soup.find_all(tag_name)
                for tag in tags:
                    tag_text = tag.get_text(strip=True)
                    if 'total problems solved' in tag_text.lower():
                        numbers = re.findall(r'\d+', tag_text.replace(',', ''))
                        if numbers:
                            result['totalSolved'] = int(numbers[0])
                            result['problemsSolved'] = result['totalSolved']
                            logger.info(f"[Selenium-Method 1-{tag_name}] Found: {result['totalSolved']} problems")
                            break
            
            # Pattern 2: Regex search in entire page
            if result['totalSolved'] == 0:
                page_text = soup.get_text()
                patterns = [
                    r'total\s+problems\s+solved[:\s]+(\d+)',
                    r'problems\s+solved[:\s]+(\d+)',
                    r'total[:\s]+(\d+)\s+problems\s+solved',
                ]
                for pattern in patterns:
                    match = re.search(pattern, page_text, re.IGNORECASE)
                    if match:
                        result['totalSolved'] = int(match.group(1).replace(',', ''))
                        result['problemsSolved'] = result['totalSolved']
                        logger.info(f"[Selenium-Method 2-Regex] Found: {result['totalSolved']} problems")
                        break
        except Exception as e:
            logger.warning(f"[Selenium] Error extracting problems: {e}")
        
        # Extract additional profile info using enhanced methods
        try:
            result['name'] = _extract_name(soup)
            result['country'] = _extract_country(soup)
            result['institution'] = _extract_institution(soup)
            result['fullySolved'] = _extract_fully_solved(soup)
            result['partiallySolved'] = _extract_partially_solved(soup)
            
            # Set totalSolved to fullySolved if not found by other methods
            if result['totalSolved'] == 0 and result['fullySolved'] > 0:
                result['totalSolved'] = result['fullySolved']
                result['problemsSolved'] = result['fullySolved']
                logger.info(f"[Selenium] Using fullySolved count: {result['totalSolved']}")
        except Exception as e:
            logger.warning(f"[Selenium] Error extracting profile info: {e}")
        
        # Extract contests - USING UNIVERSAL FUNCTION with BeautifulSoup
        try:
            logger.info(f"[Selenium] Extracting contest count for {username}...")
            result['contestsAttended'] = extract_contests_from_html(soup)
            
            if result['contestsAttended'] > 0:
                logger.info(f"[Selenium] ✅ Extracted {result['contestsAttended']} contests")
        except Exception as e:
            logger.warning(f"[Selenium] Error extracting contests: {e}")
        
        # Extract submission data - USING SELENIUM-SPECIFIC METHOD
        try:
            logger.info(f"[Selenium] Extracting submission data from heatmap (JS-rendered)...")
            submission_data = extract_submissions_from_heatmap_selenium(driver)
            result['totalSubmissions'] = submission_data['totalSubmissions']
            result['submissionHeatmap'] = submission_data['submissionHeatmap']
            result['submissionByDate'] = submission_data['submissionByDate']
            result['submissionStats'] = submission_data['submissionStats']
            
            if result['totalSubmissions'] > 0:
                logger.info(f"[Selenium] ✅ Extracted {result['totalSubmissions']} submissions from heatmap")
            else:
                logger.warning(f"[Selenium] ⚠️ No submissions found in heatmap")
        except Exception as e:
            logger.warning(f"[Selenium] Error extracting submission data: {e}")
        
        # Validate data
        if result['rating'] == 0 and result['totalSolved'] == 0:
            logger.warning(f"[Selenium] No meaningful data found for CodeChef user {username}")
            return None
        
        logger.info(f"[Selenium] SUCCESS CodeChef data for {username}: {result['totalSolved']} solved, {result['rating']} rating, {result['contestsAttended']} contests, {result['totalSubmissions']} submissions")
        return result
        
    except Exception as e:
        logger.error(f"[Selenium] Error scraping CodeChef for {username}: {e}")
        return None
    finally:
        if driver:
            try:
                driver.quit()
            except Exception as e:
                logger.debug(f"Error closing driver: {e}")

def scrape_codechef_user(url_or_username, include_contest_history=True):
    """
    Main scraping function - tries BeautifulSoup first, falls back to Selenium
    Returns: dict with rating, solved problems, contests, etc.
    
    Args:
        url_or_username: CodeChef profile URL or username
        include_contest_history: If True, fetches recent contest history with dates (default: True)
    """
    # Normalize input to get username for logging
    profile_url, username = normalize_codechef_input(url_or_username)
    
    if not profile_url or not username:
        logger.error(f"[Main] Invalid input: {url_or_username}")
        return None
    
    logger.info(f"[Main] Starting scraping for username: {username} (URL: {profile_url})")
    
    try:
        result = None
        bs4_error = None
        selenium_error = None
        
        # For CodeChef, skip BeautifulSoup since it's JS-heavy and can't extract data reliably
        # Go directly to Selenium for better results
        logger.info(f"[Main] Using Selenium directly for CodeChef (JS-heavy site)")
        result = None
        bs4_error = None
        selenium_error = None
        
        # Try Selenium directly for CodeChef (primary method since it's JS-heavy)
        if SELENIUM_AVAILABLE:
            try:
                result = scrape_with_selenium(url_or_username)
                
                # Check if result contains an error
                if isinstance(result, dict) and 'error' in result:
                    selenium_error = result.get('error_message', result.get('error', 'Unknown error'))
                    logger.error(f"[Main] ❌ Selenium driver error: {selenium_error}")
                    result = None
                elif result:
                    logger.info(f"[Main] ✅ Selenium succeeded")
                else:
                    logger.warning(f"[Main] ⚠️ Selenium returned None")
            except Exception as e:
                selenium_error = str(e)
                logger.error(f"[Main] ❌ Selenium failed: {e}")
                logger.exception("Selenium error traceback:")
                result = None
        else:
            logger.warning(f"[Main] Selenium not available")
        
        if not result:
            # If scraping failed, return structured error information
            error_summary = f"CodeChef scraping failed for {username}"
            if selenium_error:
                error_summary += f" | Selenium: {selenium_error[:100]}"
            
            logger.error(f"[Main] {error_summary}")
            
            # Return error info in a structured format for backend handling
            return {
                'error': 'scraping_failed',
                'error_message': error_summary,
                'username': username,
                'selenium_error': selenium_error[:200] if selenium_error else None,
                'selenium_available': SELENIUM_AVAILABLE
            }
        
        # Add contest history with dates if requested
        if include_contest_history:
            try:
                logger.info(f"[Main] Fetching contest history for {username}...")
                # Always try Selenium for contest history if available (more reliable for CodeChef)
                use_selenium_for_contests = SELENIUM_AVAILABLE
                contest_history = get_codechef_contest_history(username, limit=10, use_selenium=use_selenium_for_contests)
                if contest_history:
                    result['recentContests'] = contest_history
                    result['contestHistory'] = contest_history  # Alias for compatibility
                    logger.info(f"[Main] ✅ Added {len(contest_history)} contests with dates")
                    
                    # Update max rating from contest history if higher
                    if contest_history:
                        ratings_from_history = [c.get('rating', 0) for c in contest_history if c.get('rating', 0) > 0]
                        if ratings_from_history:
                            max_from_history = max(ratings_from_history)
                            if max_from_history > result.get('maxRating', 0):
                                logger.info(f"[Max Rating] Updated from contest history: {result.get('maxRating', 0)} -> {max_from_history}")
                                result['maxRating'] = max_from_history
                else:
                    result['recentContests'] = []
                    result['contestHistory'] = []
                    logger.info(f"[Main] ⚠️ No contest history found for {username}")
            except Exception as contest_error:
                logger.warning(f"[Main] Error fetching contest history: {contest_error}")
                result['recentContests'] = []
                result['contestHistory'] = []
        
        # Validate result has minimum required data
        if result:
            if result.get('rating', 0) == 0 and result.get('totalSolved', 0) == 0:
                logger.warning(f"[Main] ⚠️ Scraped data has no rating or problems solved - might be invalid user")
            else:
                logger.info(f"[Main] ✅ Scraping complete: Rating={result.get('rating', 0)}, "
                          f"Problems={result.get('totalSolved', 0)}, "
                          f"Contests={result.get('contestsAttended', 0)}")
            
            # Add field aliases for UI compatibility
            if 'rating' in result:
                result['currentRating'] = result['rating']
            if 'maxRating' in result:
                result['highestRating'] = result['maxRating']
            if 'division' in result:
                result['ratingDiv'] = result['division']
            
            logger.info(f"[Main] Added field aliases: currentRating={result.get('currentRating', 0)}, "
                      f"highestRating={result.get('highestRating', 0)}, ratingDiv={result.get('ratingDiv', '')}")
        
        return result
        
    except KeyboardInterrupt:
        logger.warning(f"[Main] Scraping interrupted by user for {username}")
        return None
    except Exception as e:
        error_msg = f"Unexpected error in main scrape function for {username}: {str(e)}"
        logger.error(f"[Main] {error_msg}")
        logger.exception("Full traceback:")
        traceback.print_exc()
        return None

def get_codechef_contest_history(username, limit=8, use_selenium=False):
    """
    Get detailed contest history for a user with dates and problems solved
    Returns last 8 most recent contests in descending order (newest first)
    """
    try:
        logger.info(f"Fetching contest history with dates and problems solved for {username} (limit: {limit}, use_selenium: {use_selenium})")
        
        # Try Selenium first if requested and available
        if use_selenium and SELENIUM_AVAILABLE:
            try:
                logger.info(f"[Contest History] Attempting Selenium extraction for {username}")
                driver = None
                try:
                    # Setup ChromeDriver (reuse logic from scrape_with_selenium)
                    from selenium.webdriver.chrome.service import Service
                    from selenium.webdriver.chrome.options import Options
                    from webdriver_manager.chrome import ChromeDriverManager
                    from selenium.webdriver.common.by import By
                    from selenium.webdriver.support.ui import WebDriverWait
                    from selenium.webdriver.support import expected_conditions as EC
                    
                    chrome_options = Options()
                    chrome_options.add_argument("--headless")
                    chrome_options.add_argument("--no-sandbox")
                    chrome_options.add_argument("--disable-dev-shm-usage")
                    chrome_options.add_argument("--disable-gpu")
                    
                    driver_path = ChromeDriverManager().install()
                    # Handle path resolution (same logic as in scrape_with_selenium)
                    import os
                    if os.path.isdir(driver_path):
                        if platform.system() == 'Windows':
                            driver_exe = os.path.join(driver_path, 'chromedriver.exe')
                        else:
                            driver_exe = os.path.join(driver_path, 'chromedriver')
                        if os.path.exists(driver_exe):
                            driver_path = driver_exe
                    elif not driver_path.endswith('.exe') and platform.system() == 'Windows':
                        driver_dir = os.path.dirname(driver_path)
                        driver_exe = os.path.join(driver_dir, 'chromedriver.exe')
                        if os.path.exists(driver_exe):
                            driver_path = driver_exe
                    
                    service = Service(driver_path)
                    driver = webdriver.Chrome(service=service, options=chrome_options)
                    
                    # Set timeouts for contest history extraction
                    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
                    driver.set_script_timeout(SCRIPT_TIMEOUT)
                    driver.implicitly_wait(10)
                    
                    profile_url = f"https://www.codechef.com/users/{username}"
                    try:
                        logger.info(f"[Contest History-Selenium] Navigating to {profile_url}...")
                        driver.get(profile_url)
                    except TimeoutException:
                        logger.warning(f"[Contest History-Selenium] Page load timeout, but continuing...")
                    
                    # Wait for page to load with longer timeout
                    try:
                        WebDriverWait(driver, 25).until(
                            EC.presence_of_element_located((By.CLASS_NAME, "rating-number"))
                        )
                    except TimeoutException:
                        logger.warning(f"[Contest History-Selenium] Timeout waiting for rating-number, continuing anyway...")
                    
                    # Wait for contest table to render (JS-rendered)
                    try:
                        WebDriverWait(driver, 15).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, "table.user-contests, table.dataTable, .user-contests-table"))
                        )
                        logger.info(f"[Contest History-Selenium] ✅ Contest table found")
                    except TimeoutException:
                        logger.warning(f"[Contest History-Selenium] Contest table not found, trying alternative selectors")
                        # Try waiting a bit more for JS to render
                        time.sleep(3)
                    
                    # Try multiple table selectors
                    table = None
                    table_selectors = [
                        "table.user-contests",
                        "table.dataTable",
                        ".user-contests-table",
                        "table[class*='contest']",
                        "table tbody"
                    ]
                    
                    for selector in table_selectors:
                        try:
                            table = driver.find_element(By.CSS_SELECTOR, selector)
                            tbody = table.find_element(By.TAG_NAME, "tbody")
                            if tbody:
                                logger.info(f"[Contest History-Selenium] Found table with selector: {selector}")
                                break
                        except:
                            continue
                    
                    if not table:
                        logger.warning(f"[Contest History-Selenium] Could not find contest table, trying JavaScript extraction")
                        # Fallback to JavaScript extraction
                        js_script = """
                        var contests = [];
                        try {
                            var scripts = document.getElementsByTagName('script');
                            for (var i = 0; i < scripts.length; i++) {
                                var scriptText = scripts[i].innerHTML || scripts[i].textContent || '';
                                if (scriptText.indexOf('allrating') !== -1) {
                                    var match = scriptText.match(/allrating\\s*=\\s*(\\[[\\s\\S]*?\\])/);
                                    if (match) {
                                        var jsonStr = match[1].replace(/'/g, '"').replace(/(\\w+):/g, '"$1":');
                                        try {
                                            var data = JSON.parse(jsonStr);
                                            for (var j = 0; j < data.length && j < 10; j++) {
                                                contests.push({
                                                    contestCode: data[j].contest_code || data[j].code || '',
                                                    name: data[j].contest_code ? data[j].contest_code.replace('START', 'Starters ').replace('COOK', 'Cook-Off ').replace('LTIME', 'Lunchtime ') : '',
                                                    date: data[j].getdate || data[j].date || '',
                                                    rating: data[j].rating || data[j].getrating || 0,
                                                    rank: data[j].rank || data[j].getrank || 0,
                                                    ratingChange: data[j].rating_change || data[j].change || 0
                                                });
                                            }
                                            break;
                                        } catch(e) {
                                            console.log('JSON parse error:', e);
                                        }
                                    }
                                }
                            }
                        } catch(e) {
                            console.log('Error:', e);
                        }
                        return contests;
                        """
                        selenium_contests = driver.execute_script(js_script)
                        driver.quit()
                        
                        if selenium_contests and len(selenium_contests) > 0:
                            logger.info(f"[Contest History-Selenium-JS] ✅ Found {len(selenium_contests)} contests from JavaScript")
                            formatted_contests = []
                            for contest in selenium_contests:
                                date_str = contest.get('date', '')
                                contest_date = None
                                if date_str:
                                    try:
                                        if isinstance(date_str, (int, float)):
                                            if date_str > 1e10:
                                                contest_date = datetime.fromtimestamp(date_str / 1000, tz=timezone.utc).isoformat()
                                            else:
                                                contest_date = datetime.fromtimestamp(date_str, tz=timezone.utc).isoformat()
                                        elif isinstance(date_str, str):
                                            if '+' in date_str or date_str.count('-') >= 2:
                                                contest_date = datetime.fromisoformat(date_str).isoformat()
                                    except:
                                        pass
                                
                                formatted_contests.append({
                                    'contestCode': contest.get('contestCode', ''),
                                    'name': contest.get('name', ''),
                                    'date': contest_date or (datetime.now(timezone.utc) - timedelta(weeks=len(formatted_contests))).isoformat(),
                                    'rating': int(contest.get('rating', 0)) if contest.get('rating') else 0,
                                    'rank': int(contest.get('rank', 0)) if contest.get('rank') else 0,
                                    'ratingChange': int(contest.get('ratingChange', 0)) if contest.get('ratingChange') else 0,
                                    'problemsSolved': [],
                                    'problemsCount': 0,
                                    'attended': True
                                })
                            
                            return formatted_contests[:limit]
                        else:
                            driver.quit()
                            return []
                    
                    # Extract problems solved from problems-solved section
                    # OPTIMIZATION: Build contest history directly from problems-solved section (faster, more reliable)
                    formatted_contests = []
                    try:
                        # Wait for problems-solved section to load
                        time.sleep(2)  # Give JS time to render
                        
                        # Try multiple selectors for problems-solved section
                        problems_section = None
                        section_selectors = [
                            "section.problems-solved",
                            ".problems-solved",
                            "div[class*='problems-solved']",
                            "section[class*='problems']"
                        ]
                        
                        for selector in section_selectors:
                            try:
                                problems_section = driver.find_element(By.CSS_SELECTOR, selector)
                                logger.info(f"[Contest History-Selenium] Found problems-solved section with selector: {selector}")
                                break
                            except:
                                continue
                        
                        if problems_section:
                            # Find all contest divs (usually div.content or similar)
                            contest_divs = problems_section.find_elements(By.CSS_SELECTOR, "div.content, div[class*='content']")
                            total_contests_found = len(contest_divs)
                            logger.info(f"[Contest History-Selenium] Found {total_contests_found} contest divs in problems-solved section")
                            
                            # OPTIMIZATION: Only process the most recent contests (first N divs, where N = limit)
                            # The divs are usually in reverse chronological order (newest first)
                            contests_to_process = min(limit, total_contests_found)
                            logger.info(f"[Contest History-Selenium] Processing only the most recent {contests_to_process} contests (total: {total_contests_found})")
                            
                            for i, div in enumerate(contest_divs[:contests_to_process]):
                                try:
                                    # Extract contest name from h5 tag
                                    contest_name_elem = div.find_element(By.TAG_NAME, "h5")
                                    contest_name = contest_name_elem.text.strip()
                                    
                                    # Extract problems solved from p tag or spans
                                    problems_solved = []
                                    try:
                                        # Try p tag first
                                        problems_p = div.find_element(By.TAG_NAME, "p")
                                        problems_text = problems_p.text.strip()
                                        if problems_text:
                                            # Split by comma and clean up
                                            problems = [p.strip() for p in problems_text.split(',') if p.strip()]
                                            problems_solved = [p for p in problems if p and p not in [',', '', ' ']]
                                    except:
                                        # Try spans if p tag doesn't work
                                        try:
                                            problem_spans = div.find_elements(By.TAG_NAME, "span")
                                            for span in problem_spans:
                                                problem_text = span.text.strip()
                                                if problem_text and problem_text not in [',', '', ' ']:
                                                    problems_solved.append(problem_text)
                                        except:
                                            pass
                                    
                                    if contest_name:
                                        # Extract contest code from name
                                        contest_code = ''
                                        contest_code_match = re.search(r'(START|COOK|LTIME)(\d+)', contest_name, re.IGNORECASE)
                                        if contest_code_match:
                                            contest_code = f"{contest_code_match.group(1).upper()}{contest_code_match.group(2)}"
                                        
                                        # Build contest entry directly from problems-solved section
                                        formatted_contests.append({
                                            'name': contest_name,  # Contest name
                                            'problemsSolved': problems_solved,  # List of problem names
                                            'problemsCount': len(problems_solved),    # Count of solved problems
                                            'contestCode': contest_code,  # Keep for reference
                                            'date': (datetime.now(timezone.utc) - timedelta(weeks=i)).isoformat(),  # Estimate date
                                            'rank': 0,
                                            'attended': len(problems_solved) > 0
                                        })
                                except Exception as div_error:
                                    logger.debug(f"[Contest History-Selenium] Error parsing contest div {i}: {div_error}")
                                    continue
                            
                            if formatted_contests:
                                driver.quit()
                                logger.info(f"[Contest History-Selenium] ✅ Extracted {len(formatted_contests)} contests from problems-solved section")
                                return formatted_contests
                        else:
                            logger.warning(f"[Contest History-Selenium] Problems-solved section not found")
                    except Exception as e:
                        logger.warning(f"[Contest History-Selenium] Error extracting problems-solved section: {e}")
                    
                    # Parse table rows (fallback if problems-solved section didn't work)
                    if not formatted_contests and table:
                        try:
                            tbody = table.find_element(By.TAG_NAME, "tbody")
                            rows = tbody.find_elements(By.TAG_NAME, "tr")
                            logger.info(f"[Contest History-Selenium] Found {len(rows)} contest rows in table (fallback)")
                            
                            # Build problems_by_contest mapping for table matching
                            problems_by_contest = {}
                            if problems_section:
                                contest_divs = problems_section.find_elements(By.CSS_SELECTOR, "div.content, div[class*='content']")
                                for div in contest_divs[:limit]:
                                    try:
                                        contest_name_elem = div.find_element(By.TAG_NAME, "h5")
                                        contest_name = contest_name_elem.text.strip()
                                        problems_p = div.find_element(By.TAG_NAME, "p")
                                        problems_text = problems_p.text.strip()
                                        if problems_text:
                                            problems = [p.strip() for p in problems_text.split(',') if p.strip()]
                                            problems_by_contest[contest_name] = problems
                                    except:
                                        continue
                            
                            formatted_contests = []
                            for i, row in enumerate(rows[:limit]):
                                try:
                                    cols = row.find_elements(By.TAG_NAME, "td")
                                    if len(cols) >= 1:
                                        # Extract contest name (try multiple methods)
                                        contest_name = ''
                                        
                                        # Method 1: Try to get from link text (most reliable)
                                        try:
                                            link = cols[0].find_element(By.TAG_NAME, "a")
                                            contest_name = link.text.strip()
                                            if not contest_name:
                                                # Try title attribute
                                                contest_name = link.get_attribute('title') or link.get_attribute('textContent') or ''
                                        except:
                                            # Method 2: Get from column text
                                            contest_name = cols[0].text.strip()
                                        
                                        # If still empty, try other columns
                                        if not contest_name and len(cols) > 1:
                                            for col_idx in range(1, min(4, len(cols))):
                                                col_text = cols[col_idx].text.strip()
                                                # Check if this looks like a contest name (contains "Starters", "Cook", etc.)
                                                if any(keyword in col_text for keyword in ['Starters', 'Cook', 'Lunchtime', 'Contest']):
                                                    contest_name = col_text
                                                    break
                                        
                                        # Extract date (usually second column, but might vary)
                                        date_text = ''
                                        for col_idx in range(1, min(5, len(cols))):
                                            col_text = cols[col_idx].text.strip()
                                            # Check if it looks like a date (contains numbers and separators)
                                            if re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', col_text) or re.search(r'\d{1,2}\s+\w{3}', col_text):
                                                date_text = col_text
                                                break
                                        
                                        # Extract rank (look for column with rank-like text)
                                        rank_text = '0'
                                        rank_value = 0
                                        for col_idx in range(1, min(5, len(cols))):
                                            col_text = cols[col_idx].text.strip()
                                            # Check if it looks like a rank (just numbers, possibly with # or commas)
                                            if re.match(r'^[#\d,\s-]+$', col_text) and any(c.isdigit() for c in col_text):
                                                rank_text = col_text
                                                try:
                                                    rank_text_clean = rank_text.replace(',', '').replace('#', '').replace('-', '0').replace('N/A', '0').strip()
                                                    rank_value = int(rank_text_clean) if rank_text_clean.isdigit() else 0
                                                except:
                                                    rank_value = 0
                                                break
                                        
                                        # Extract score/rating (usually last column or one with score-like text)
                                        score_text = ''
                                        if len(cols) > 3:
                                            score_text = cols[-1].text.strip()  # Try last column
                                        elif len(cols) > 2:
                                            score_text = cols[2].text.strip()
                                        
                                        # Parse date
                                        contest_date = None
                                        if date_text:
                                            try:
                                                # Try common date formats
                                                for fmt in ['%d %b %Y', '%Y-%m-%d', '%d-%m-%Y', '%m/%d/%Y']:
                                                    try:
                                                        contest_date = datetime.strptime(date_text, fmt).replace(tzinfo=timezone.utc).isoformat()
                                                        break
                                                    except:
                                                        continue
                                            except:
                                                pass
                                        
                                        # Extract contest code from name or link
                                        contest_code = ''
                                        try:
                                            # Try to get from link href first
                                            link = cols[0].find_element(By.TAG_NAME, "a")
                                            href = link.get_attribute('href')
                                            if href and '/contests/' in href:
                                                contest_code = href.split('/contests/')[-1].split('/')[0]
                                        except:
                                            pass
                                        
                                        # If no code from link, try to extract from contest name
                                        if not contest_code and contest_name:
                                            contest_name_upper = contest_name.upper()
                                            if 'STARTERS' in contest_name_upper or 'START' in contest_name_upper:
                                                match = re.search(r'(\d+)', contest_name)
                                                if match:
                                                    contest_code = f"START{match.group(1)}"
                                            elif 'COOK' in contest_name_upper:
                                                match = re.search(r'(\d+)', contest_name)
                                                if match:
                                                    contest_code = f"COOK{match.group(1)}"
                                            elif 'LUNCHTIME' in contest_name_upper or 'LTIME' in contest_name_upper:
                                                match = re.search(r'(\d+)', contest_name)
                                                if match:
                                                    contest_code = f"LTIME{match.group(1)}"
                                        
                                        # Get problems solved for this contest
                                        problems_solved = []
                                        problems_count = 0
                                        
                                        # Try to match by contest code first
                                        if contest_code and contest_code in problems_by_contest:
                                            problems_solved = problems_by_contest[contest_code]
                                            problems_count = len(problems_solved)
                                        # Try to match by contest name
                                        elif contest_name in problems_by_contest:
                                            problems_solved = problems_by_contest[contest_name]
                                            problems_count = len(problems_solved)
                                        
                                        # Only add if we have a contest name
                                        if contest_name:
                                            formatted_contests.append({
                                                'name': contest_name,  # Contest name
                                                'problemsSolved': problems_solved,  # List of problem names
                                                'problemsCount': problems_count,    # Count of solved problems
                                                'contestCode': contest_code,  # Keep for reference
                                                'date': contest_date or (datetime.now(timezone.utc) - timedelta(weeks=i)).isoformat(),
                                                'rank': rank_value,
                                                'attended': True
                                            })
                                            logger.info(f"[Contest History-Selenium] Added contest: {contest_name} - {problems_count} problems")
                                        else:
                                            logger.warning(f"[Contest History-Selenium] Skipping row {i} - no contest name found. Columns: {[col.text.strip()[:50] for col in cols]}")
                                except Exception as row_error:
                                    logger.warning(f"[Contest History-Selenium] Error parsing row {i}: {row_error}")
                                    continue
                            
                            driver.quit()
                            logger.info(f"[Contest History-Selenium] ✅ Extracted {len(formatted_contests)} contests from table")
                            return formatted_contests
                        except Exception as table_error:
                            logger.warning(f"[Contest History-Selenium] Error parsing table: {table_error}")
                            if driver:
                                driver.quit()
                            return []
                except Exception as selenium_error:
                    logger.warning(f"[Contest History-Selenium] Failed: {selenium_error}, falling back to BeautifulSoup")
                    if driver:
                        try:
                            driver.quit()
                        except:
                            pass
            except Exception as e:
                logger.warning(f"[Contest History-Selenium] Error: {e}, falling back to BeautifulSoup")
        
        # Continue with existing BeautifulSoup extraction
        profile_url = f"https://www.codechef.com/users/{username}"
        response = safe_request(profile_url)
        
        if not response:
            logger.warning(f"Failed to get contest history for {username}")
            return []
        
        # Handle encoding properly to avoid REPLACEMENT CHARACTER errors
        try:
            html_content = response.text
        except (UnicodeDecodeError, AttributeError):
            html_content = response.content.decode('utf-8', errors='ignore')
        
        soup = BeautifulSoup(html_content, 'html.parser')
        contests = []
        
        # Helper function to estimate date from contest name/code
        def estimate_contest_date(contest_code, contest_name):
            """Estimate contest date from contest code/name"""
            try:
                # Extract number from contest name (e.g., "Starters 219" -> 219)
                match = re.search(r'(\d+)', contest_code or contest_name)
                if match:
                    contest_num = int(match.group(1))
                    
                    # Starters contests happen weekly (roughly)
                    # Starters 1 was around Jan 2021, estimate from there
                    if 'START' in contest_code or 'starters' in contest_name.lower():
                        base_date = datetime(2021, 1, 1, tzinfo=timezone.utc)
                        weeks_since = contest_num * 7
                        estimated_date = base_date + timedelta(days=weeks_since)
                        return estimated_date.isoformat()
                    # Cook-Off happens monthly
                    elif 'COOK' in contest_code or 'cook' in contest_name.lower():
                        base_date = datetime(2021, 1, 1, tzinfo=timezone.utc)
                        months_since = contest_num
                        estimated_date = base_date + timedelta(days=months_since * 30)
                        return estimated_date.isoformat()
                    # Lunchtime happens monthly
                    elif 'LTIME' in contest_code or 'lunchtime' in contest_name.lower():
                        base_date = datetime(2021, 1, 1, tzinfo=timezone.utc)
                        months_since = contest_num
                        estimated_date = base_date + timedelta(days=months_since * 30)
                        return estimated_date.isoformat()
            except Exception as e:
                logger.debug(f"Date estimation failed: {e}")
            
            # Fallback: use current date minus weeks based on position
            return (datetime.now(timezone.utc) - timedelta(weeks=len(contests))).isoformat()
        
        # STEP 1: Extract problems solved from rating-data-section (most reliable for problems)
        problems_by_contest = {}  # Map contest name/code to problems solved
        contest_dates_from_html = {}  # Map contest name/code to dates from HTML
        
        try:
            # Try both class variations
            problems_section = soup.find('section', class_='rating-data-section problems-solved')
            if not problems_section:
                problems_section = soup.find('section', class_='rating-data-section')
            
            if problems_section:
                contest_divs = problems_section.find_all('div', class_='content')
                logger.info(f"[Problems Extraction] Found {len(contest_divs)} contest entries with problems")
                
                for i, div in enumerate(contest_divs):
                    contest_name_elem = div.find('h5')
                    problems_elem = div.find('p')
                    
                    if contest_name_elem:
                        contest_name = contest_name_elem.get_text(strip=True)
                        problems_solved = []
                        
                        if problems_elem:
                            problems_text = problems_elem.get_text(strip=True)
                            if problems_text:
                                # Split by comma and clean up
                                problems = [p.strip() for p in problems_text.split(',')]
                                problems_solved = [p for p in problems if p and p != '']
                        
                        # Store problems by contest name
                        problems_by_contest[contest_name] = problems_solved
                        
                        # Try to extract date from HTML (look for date elements)
                        date_elem = div.find('span', class_=re.compile(r'date|time', re.I))
                        if not date_elem:
                            date_elem = div.find('div', class_=re.compile(r'date|time', re.I))
                        if date_elem:
                            date_text = date_elem.get_text(strip=True)
                            try:
                                # Try to parse date from text
                                parsed_date = datetime.strptime(date_text, '%Y-%m-%d')
                                contest_dates_from_html[contest_name] = parsed_date.replace(tzinfo=timezone.utc).isoformat()
                            except:
                                pass
                        
                        # Also try to extract contest code from links
                        contest_link = div.find('a', href=re.compile(r'/contests/'))
                        if contest_link:
                            href = contest_link.get('href', '')
                            contest_code = href.split('/')[-1] if href and '/contests/' in href else ''
                            if contest_code:
                                problems_by_contest[contest_code] = problems_solved
                                # Also map by partial match (e.g., "START219" -> "Starters 219")
                                if contest_code.startswith('START'):
                                    problems_by_contest[f"Starters {contest_code.replace('START', '')}"] = problems_solved
                                elif contest_code.startswith('COOK'):
                                    problems_by_contest[f"Cook-Off {contest_code.replace('COOK', '')}"] = problems_solved
                                elif contest_code.startswith('LTIME'):
                                    problems_by_contest[f"Lunchtime {contest_code.replace('LTIME', '')}"] = problems_solved
                        
                        logger.debug(f"[Problems] Contest: {contest_name}, Problems: {problems_solved}")
        except Exception as e:
            logger.warning(f"Error extracting problems from rating-data-section: {e}")
        
        # STEP 2: Extract contests from rating graph JavaScript data (most accurate for dates/ratings)
        try:
            scripts = soup.find_all('script', type='text/javascript')
            for script in scripts:
                if script.string and 'allrating' in script.string.lower():
                    script_text = script.string
                    
                    # Extract allrating array from JavaScript
                    pattern = r'allrating\s*=\s*(\[[^\]]*(?:\{[^\}]*\}[^\]]*)*\])'
                    matches = re.findall(pattern, script_text, re.DOTALL)
                    
                    if matches:
                        try:
                            # Clean up the JavaScript array to make it valid JSON
                            json_str = matches[0]
                            json_str = json_str.replace("'", '"')
                            json_str = re.sub(r'(\w+):', r'"\1":', json_str)
                            json_str = re.sub(r',\s*}', '}', json_str)
                            json_str = re.sub(r',\s*]', ']', json_str)
                            
                            rating_data = json.loads(json_str)
                            
                            for entry in rating_data:
                                contest_code = entry.get('contest_code', '') or entry.get('code', '')
                                rating = entry.get('rating', 0) or entry.get('getrating', 0)
                                rank = entry.get('rank', 0) or entry.get('getrank', 0)
                                
                                # Extract date - CodeChef uses 'getdate' or 'date'
                                date_str = entry.get('getdate', '') or entry.get('date', '')
                                
                                # Parse date if it's in CodeChef format
                                contest_date = None
                                if date_str:
                                    try:
                                        # CodeChef date format: "2024-01-15" or timestamp
                                        if isinstance(date_str, (int, float)):
                                            # Handle both seconds and milliseconds timestamps
                                            if date_str > 1e10:
                                                contest_date = datetime.fromtimestamp(date_str / 1000, tz=timezone.utc).isoformat()
                                            else:
                                                contest_date = datetime.fromtimestamp(date_str, tz=timezone.utc).isoformat()
                                        elif isinstance(date_str, str):
                                            # Try parsing as ISO date
                                            if date_str.endswith('Z'):
                                                contest_date = datetime.fromisoformat(date_str.replace('Z', '+00:00')).isoformat()
                                            elif '+' in date_str or date_str.count('-') >= 2:
                                                contest_date = datetime.fromisoformat(date_str).isoformat()
                                            else:
                                                # Try other formats
                                                for fmt in ['%Y-%m-%d', '%d-%m-%Y', '%m/%d/%Y']:
                                                    try:
                                                        contest_date = datetime.strptime(date_str, fmt).replace(tzinfo=timezone.utc).isoformat()
                                                        break
                                                    except:
                                                        continue
                                        
                                        if not contest_date:
                                            # Fallback: estimate from contest code
                                            contest_date = estimate_contest_date(contest_code, '')
                                    except (ValueError, TypeError) as date_error:
                                        logger.debug(f"Date parsing failed for '{date_str}': {date_error}")
                                        contest_date = estimate_contest_date(contest_code, '')
                                else:
                                    contest_date = estimate_contest_date(contest_code, '')
                                
                                rating_change = entry.get('rating_change', 0) or entry.get('change', 0)
                                
                                # Format contest name
                                contest_name = contest_code
                                if contest_code.startswith('START'):
                                    contest_name = contest_code.replace('START', 'Starters ')
                                elif contest_code.startswith('COOK'):
                                    contest_name = contest_code.replace('COOK', 'Cook-Off ')
                                elif contest_code.startswith('LTIME'):
                                    contest_name = contest_code.replace('LTIME', 'Lunchtime ')
                                
                                # Find problems solved for this contest
                                problems_solved = []
                                if contest_name in problems_by_contest:
                                    problems_solved = problems_by_contest[contest_name]
                                elif contest_code in problems_by_contest:
                                    problems_solved = problems_by_contest[contest_code]
                                else:
                                    # Try partial match
                                    for key, probs in problems_by_contest.items():
                                        if contest_code in key or contest_name in key or key in contest_name:
                                            problems_solved = probs
                                            break
                                
                                contests.append({
                                    'contestCode': contest_code,
                                    'name': contest_name,
                                    'date': contest_date,
                                    'rating': int(rating) if rating else 0,
                                    'rank': int(rank) if rank else 0,
                                    'ratingChange': int(rating_change) if rating_change else 0,
                                    'problemsSolved': problems_solved,
                                    'problemsCount': len(problems_solved),
                                    'attended': True
                                })
                        except json.JSONDecodeError as e:
                            logger.warning(f"JSON parse error: {e}, trying alternative parsing")
                            # Alternative: Extract data using regex
                            contest_pattern = r'\{[^}]*contest_code[^}]*\}'
                            contest_matches = re.findall(contest_pattern, script_text)
                            for match in contest_matches:
                                code_match = re.search(r'contest_code["\']?\s*:\s*["\']?([^"\']+)', match)
                                rating_match = re.search(r'rating["\']?\s*:\s*(\d+)', match)
                                date_match = re.search(r'getdate["\']?\s*:\s*["\']?([^"\']+)', match)
                                
                                if code_match:
                                    contest_code = code_match.group(1)
                                    contest_name = contest_code.replace('START', 'Starters ') if contest_code.startswith('START') else contest_code
                                    
                                    # Parse date
                                    contest_date = None
                                    if date_match:
                                        date_str = date_match.group(1)
                                        try:
                                            contest_date = datetime.fromisoformat(date_str).isoformat()
                                        except:
                                            contest_date = estimate_contest_date(contest_code, contest_name)
                                    else:
                                        contest_date = estimate_contest_date(contest_code, contest_name)
                                    
                                    # Find problems solved
                                    problems_solved = problems_by_contest.get(contest_name, problems_by_contest.get(contest_code, []))
                                    
                                    contests.append({
                                        'contestCode': contest_code,
                                        'name': contest_name,
                                        'date': contest_date,
                                        'rating': int(rating_match.group(1)) if rating_match else 0,
                                        'rank': 0,
                                        'ratingChange': 0,
                                        'problemsSolved': problems_solved,
                                        'problemsCount': len(problems_solved),
                                        'attended': True
                                    })
                        except Exception as e:
                            logger.warning(f"Error parsing rating data: {e}")
        except Exception as e:
            logger.warning(f"Error extracting from rating graph: {e}")
        
        # STEP 3: If we don't have enough contests from rating graph, add from problems section directly
        # But only if rating graph extraction failed completely
        if len(contests) == 0 or len(contests) < limit:
            try:
                problems_section = soup.find('section', class_='rating-data-section problems-solved')
                if not problems_section:
                    problems_section = soup.find('section', class_='rating-data-section')
                
                if problems_section:
                    contest_divs = problems_section.find_all('div', class_='content')
                    # Reverse order since contests might be listed oldest-first, we want newest first
                    contest_divs = list(reversed(contest_divs))
                    
                    for i, div in enumerate(contest_divs):
                        if len(contests) >= limit:
                            break
                            
                        contest_name_elem = div.find('h5')
                        if contest_name_elem:
                            contest_name = contest_name_elem.get_text(strip=True)
                            
                            # Skip if already added (check both name and code)
                            already_added = False
                            for c in contests:
                                if (c.get('name') == contest_name or 
                                    contest_name in c.get('name', '') or 
                                    c.get('contestCode') in contest_name or
                                    contest_name in c.get('contestCode', '')):
                                    already_added = True
                                    break
                            
                            if already_added:
                                continue
                            
                            problems_elem = div.find('p')
                            problems_text = problems_elem.get_text(strip=True) if problems_elem else ''
                            problems_solved = [p.strip() for p in problems_text.split(',') if p.strip()] if problems_text else []
                            
                            # Try to extract contest code from link
                            contest_code = f'CONTEST_{len(contests)}'
                            contest_link = div.find('a', href=re.compile(r'/contests/'))
                            if contest_link:
                                href = contest_link.get('href', '')
                                contest_code = href.split('/')[-1] if href and '/contests/' in href else contest_code
                            
                            # Extract contest number for better date estimation
                            contest_num_match = re.search(r'(\d+)', contest_name)
                            if contest_num_match:
                                contest_num = int(contest_num_match.group(1))
                                # Better estimation: Starters contests happen weekly
                                # Starters 219 was around Dec 2025, estimate backwards
                                if 'starters' in contest_name.lower() or 'START' in contest_code:
                                    # Estimate: Starters 219 = Dec 2025, so calculate backwards
                                    base_starters = 219
                                    base_date = datetime(2025, 12, 31, tzinfo=timezone.utc)
                                    weeks_diff = (base_starters - contest_num) * 7
                                    contest_date = (base_date - timedelta(days=weeks_diff)).isoformat()
                                else:
                                    contest_date = estimate_contest_date(contest_code, contest_name)
                            else:
                                # Get date - prefer from HTML, then estimate
                                contest_date = contest_dates_from_html.get(contest_name)
                                if not contest_date:
                                    contest_date = estimate_contest_date(contest_code, contest_name)
                            
                            contests.append({
                                'contestCode': contest_code,
                                'name': contest_name,
                                'date': contest_date,
                                'rating': 0,
                                'rank': 0,
                                'ratingChange': 0,
                                'problemsSolved': problems_solved,
                                'problemsCount': len(problems_solved),
                                'attended': len(problems_solved) > 0
                            })
            except Exception as e:
                logger.warning(f"Error parsing problems section: {e}")
        
        # STEP 4: Sort by date descending (most recent first)
        contests.sort(key=lambda x: x.get('date', ''), reverse=True)
        
        # STEP 5: Ensure all contests have problemsSolved field and date (even if empty/estimated)
        for contest in contests:
            if 'problemsSolved' not in contest:
                contest['problemsSolved'] = []
            if 'problemsCount' not in contest:
                contest['problemsCount'] = len(contest.get('problemsSolved', []))
            if 'date' not in contest or not contest['date']:
                contest['date'] = estimate_contest_date(contest.get('contestCode', ''), contest.get('name', ''))
        
        # STEP 6: Return top N contests (limit=8)
        result = contests[:limit] if len(contests) >= limit else contests
        
        logger.info(f"✅ Returning {len(result)} contests (descending order, most recent first) for {username}")
        for i, contest in enumerate(result, 1):
            date_str = contest.get('date', 'Unknown')[:10] if contest.get('date') else 'Unknown'
            logger.info(f"  {i}. {contest.get('name', 'Unknown')} - Date: {date_str} - {contest.get('problemsCount', 0)} problems solved")
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting contest history for {username}: {e}")
        traceback.print_exc()
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

