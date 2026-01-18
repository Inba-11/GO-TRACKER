#!/usr/bin/env python3
"""
Extract max rating from CodeChef rating graph JavaScript data
"""

import sys
import os
import re
import json
import requests
from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def extract_max_rating_from_graph(username):
    """Extract maximum rating from rating graph JavaScript data"""
    try:
        url = f"https://www.codechef.com/users/{username}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        print(f"Fetching {url}...")
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            print(f"Failed to fetch: {response.status_code}")
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find rating number
        rating_section = soup.find('div', class_='rating-number')
        current_rating = 0
        if rating_section:
            rating_text = rating_section.get_text(strip=True)
            current_rating = int(re.findall(r'\d+', rating_text)[0]) if re.findall(r'\d+', rating_text) else 0
        
        print(f"Current Rating: {current_rating}")
        
        # Extract from rating graph JavaScript
        scripts = soup.find_all('script', type='text/javascript')
        max_rating = 0
        all_ratings = []
        
        for script in scripts:
            if script.string and 'allrating' in script.string.lower():
                script_text = script.string
                print("\nFound script with 'allrating'")
                
                # Try to extract allrating array
                pattern = r'allrating\s*=\s*(\[[\s\S]*?\])'
                matches = re.findall(pattern, script_text, re.DOTALL)
                
                if matches:
                    print(f"Found {len(matches)} matches")
                    json_str = matches[0]
                    
                    # Try to parse as-is first
                    try:
                        # Clean up JSON
                        json_str_clean = json_str.replace("'", '"')
                        json_str_clean = re.sub(r'(\w+):', r'"\1":', json_str_clean)
                        json_str_clean = re.sub(r',\s*}', '}', json_str_clean)
                        json_str_clean = re.sub(r',\s*]', ']', json_str_clean)
                        
                        rating_data = json.loads(json_str_clean)
                        
                        if isinstance(rating_data, list):
                            print(f"Parsed {len(rating_data)} rating entries")
                            for entry in rating_data:
                                rating = entry.get('rating', 0) or entry.get('getrating', 0)
                                if rating:
                                    all_ratings.append(int(rating))
                            
                            if all_ratings:
                                max_rating = max(all_ratings)
                                min_rating = min(all_ratings)
                                print(f"\nRating Statistics:")
                                print(f"  Total contests: {len(all_ratings)}")
                                print(f"  Min rating: {min_rating}")
                                print(f"  Max rating: {max_rating}")
                                print(f"  Current rating: {current_rating}")
                                return {
                                    'currentRating': current_rating,
                                    'maxRating': max_rating,
                                    'minRating': min_rating,
                                    'totalContests': len(all_ratings),
                                    'allRatings': all_ratings
                                }
                    except json.JSONDecodeError as e:
                        print(f"JSON parse error: {e}")
                        print(f"First 500 chars of JSON string:")
                        print(json_str[:500])
        
        # Fallback: check header
        rating_header = soup.find('div', class_='rating-header')
        if rating_header:
            header_text = rating_header.get_text()
            match = re.search(r'Highest Rating[:\s]*(\d+)', header_text, re.IGNORECASE)
            if match:
                max_rating = int(match.group(1))
                print(f"\nFound max rating from header: {max_rating}")
                return {
                    'currentRating': current_rating,
                    'maxRating': max_rating,
                    'source': 'header'
                }
        
        return {
            'currentRating': current_rating,
            'maxRating': current_rating if current_rating > 0 else 0,
            'source': 'current_rating'
        }
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    username = 'kit27csbs23'
    print("="*80)
    print("EXTRACTING MAX RATING FROM RATING GRAPH")
    print("="*80)
    print(f"Username: {username}")
    print("="*80 + "\n")
    
    result = extract_max_rating_from_graph(username)
    
    if result:
        print("\n" + "="*80)
        print("RESULTS")
        print("="*80)
        print(f"Current Rating: {result.get('currentRating', 0)}")
        print(f"Max Rating: {result.get('maxRating', 0)}")
        if 'minRating' in result:
            print(f"Min Rating: {result.get('minRating', 0)}")
            print(f"Total Contests: {result.get('totalContests', 0)}")
        print(f"Source: {result.get('source', 'unknown')}")
        print("="*80 + "\n")
    else:
        print("\nFailed to extract rating data\n")

