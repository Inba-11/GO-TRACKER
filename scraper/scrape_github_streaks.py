"""
GitHub Streak Scraper - Parse contribution calendar from HTML
Fetches streak data for all 63 students
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import json
import time
import re
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/go-tracker')

def scrape_profile_page(username, session=None):
    """Scrape contribution data from GitHub profile page HTML"""
    url = f"https://github.com/{username}"
    
    if session:
        response = session.get(url)
    else:
        response = requests.get(url)
    
    if response.status_code != 200:
        print(f"    ❌ Error: Could not fetch profile for {username}")
        return None
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find the contribution graph SVG
    contribution_graph = soup.find('svg', class_='js-calendar-graph-svg')
    
    if not contribution_graph:
        print(f"    ⚠️ Warning: Could not find contribution graph for {username}")
        return None
    
    # Extract contribution data from the SVG rects
    contributions = []
    rects = contribution_graph.find_all('rect')
    
    for rect in rects:
        date_str = rect.get('data-date')
        level_str = rect.get('data-level')  # 0-4 intensity level
        
        if date_str and level_str is not None:
            try:
                # data-level is 0-4 intensity
                # We'll estimate contributions based on level
                level = int(level_str)
                
                # Rough estimation: level 0=0, 1=1-3, 2=4-9, 3=10-19, 4=20+
                if level == 0:
                    count = 0
                elif level == 1:
                    count = 2  # estimate
                elif level == 2:
                    count = 6  # estimate
                elif level == 3:
                    count = 14  # estimate
                else:  # level 4
                    count = 25  # estimate
                
                contributions.append({
                    'date': datetime.strptime(date_str, '%Y-%m-%d'),
                    'count': count,
                    'level': level
                })
            except Exception as e:
                continue
    
    # Try to get total contributions from the h2 tag
    total_contributions = 0
    contribution_text = soup.find('h2', class_='f4 text-normal mb-2')
    
    if contribution_text:
        # Look for pattern like "1,234 contributions in the last year"
        text = contribution_text.get_text()
        match = re.search(r'([\d,]+)\s+contribution', text)
        if match:
            total_contributions = int(match.group(1).replace(',', ''))
    
    # Scrape "Contribution activity" section
    activity_data = {}
    activity_section = soup.find('h2', class_='f4 text-normal mt-4 mb-3', string=re.compile('Contribution activity'))
    
    if activity_section:
        # Find the parent container
        activity_container = activity_section.find_parent('div')
        
        if activity_container:
            # Extract activity items
            activity_items = []
            
            # Look for activity entries (commits, PRs, issues, etc.)
            activity_list = activity_container.find_all('div', class_='contribution-activity-listing')
            
            for item in activity_list:
                try:
                    # Extract text content
                    text = item.get_text(strip=True)
                    activity_items.append(text)
                except:
                    continue
            
            # Also try to find summary text
            summary_divs = activity_container.find_all('div', recursive=True)
            for div in summary_divs:
                text = div.get_text(strip=True)
                # Look for patterns like "Created 5 commits", "Opened 3 pull requests"
                if any(keyword in text.lower() for keyword in ['commit', 'pull request', 'issue', 'repository', 'review']):
                    if text and len(text) < 200:  # Avoid long text blocks
                        activity_items.append(text)
            
            activity_data['activity_items'] = list(set(activity_items))[:20]  # Limit to 20 unique items
            activity_data['has_activity'] = len(activity_items) > 0
    
    return {
        'contributions': contributions,
        'total_contributions': total_contributions,
        'activity_data': activity_data
    }

def calculate_streaks_from_html(data):
    """Calculate streaks from HTML-scraped data"""
    if not data or not data['contributions']:
        return None
    
    contributions = sorted(data['contributions'], key=lambda x: x['date'])
    today = datetime.now().date()
    
    # Calculate current streak (working backwards from today)
    current_streak = 0
    for i in range(len(contributions) - 1, -1, -1):
        day_date = contributions[i]['date'].date()
        
        if day_date > today:
            continue
        
        if contributions[i]['count'] > 0:
            current_streak += 1
        else:
            # Allow one day gap for "today" if no contributions yet
            if current_streak == 0 and (today - day_date).days <= 1:
                continue
            else:
                break
    
    # Calculate longest streak
    longest_streak = 0
    temp_streak = 0
    
    for day in contributions:
        if day['count'] > 0:
            temp_streak += 1
            longest_streak = max(longest_streak, temp_streak)
        else:
            temp_streak = 0
    
    return {
        'total_contributions': data['total_contributions'],
        'current_streak': current_streak,
        'longest_streak': longest_streak
    }

def scrape_github_streaks_for_students():
    """Scrape GitHub streaks for all 63 students from MongoDB"""
    
    print("\n" + "="*60)
    print("🔥 GITHUB STREAK SCRAPER")
    print("="*60)
    print(f"📡 Connecting to MongoDB: {MONGO_URI}")
    
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client['go-tracker']
        students_collection = db.students
        
        print("✅ Connected to MongoDB")
        
        # Get all active students with GitHub usernames
        students = list(students_collection.find({'isActive': True}))
        print(f"📊 Found {len(students)} active students")
        
        # Create session with user agent
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        
        results = []
        updated_count = 0
        failed_count = 0
        
        print(f"\n🔄 Starting streak scraping...")
        print(f"⏱️  Delay between requests: 2 seconds")
        print(f"{'='*60}\n")
        
        for index, student in enumerate(students, 1):
            github_username = student.get('platformUsernames', {}).get('github', '')
            
            if not github_username:
                print(f"[{index}/{len(students)}] {student['name']}: ⚠️ No GitHub username")
                continue
            
            print(f"[{index}/{len(students)}] {student['name']}")
            print(f"  🔍 GitHub: {github_username}")
            
            try:
                # Scrape profile page
                data = scrape_profile_page(github_username, session)
                
                if data and data['contributions']:
                    # Calculate streaks
                    streak_info = calculate_streaks_from_html(data)
                    
                    if streak_info:
                        result = {
                            'username': github_username,
                            'total_contributions': streak_info['total_contributions'],
                            'current_streak': streak_info['current_streak'],
                            'longest_streak': streak_info['longest_streak'],
                            'activity_data': data.get('activity_data', {}),
                            'scraped_at': datetime.now()
                        }
                        
                        results.append(result)
                        
                        # Update MongoDB with streak and activity data
                        update_data = {
                            'platforms.github.streak': streak_info['current_streak'],
                            'platforms.github.longestStreak': streak_info['longest_streak'],
                            'platforms.github.lastUpdated': datetime.now()
                        }
                        
                        # Add activity data if available
                        if data.get('activity_data', {}).get('has_activity'):
                            update_data['platforms.github.activityItems'] = data['activity_data'].get('activity_items', [])
                        
                        students_collection.update_one(
                            {'_id': student['_id']},
                            {'$set': update_data}
                        )
                        
                        updated_count += 1
                        print(f"    ✅ Current: {streak_info['current_streak']} days, Longest: {streak_info['longest_streak']} days")
                        print(f"    📊 Total contributions: {streak_info['total_contributions']}")
                        
                        # Show activity summary if available
                        if data.get('activity_data', {}).get('has_activity'):
                            activity_count = len(data['activity_data'].get('activity_items', []))
                            print(f"    🎯 Activity items found: {activity_count}")
                    else:
                        print(f"    ❌ Could not calculate streaks")
                        failed_count += 1
                else:
                    print(f"    ❌ No contribution data found")
                    failed_count += 1
                    
            except Exception as e:
                print(f"    ❌ Error: {e}")
                failed_count += 1
            
            # Be respectful - don't hammer GitHub
            if index < len(students):
                time.sleep(2)  # 2 seconds between requests
        
        # Save results to JSON file
        output_file = 'github_streaks_results.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str, ensure_ascii=False)
        
        # Final statistics
        print(f"\n{'='*60}")
        print("📊 STREAK SCRAPING COMPLETE!")
        print(f"{'='*60}")
        print(f"✅ Successfully updated: {updated_count}/{len(students)}")
        print(f"❌ Failed: {failed_count}/{len(students)}")
        print(f"💾 Results saved to: {output_file}")
        
        # Print summary
        if results:
            print(f"\n{'='*60}")
            print("📈 SUMMARY")
            print(f"{'='*60}")
            
            avg_current = sum(r['current_streak'] for r in results) / len(results)
            avg_longest = sum(r['longest_streak'] for r in results) / len(results)
            avg_contributions = sum(r['total_contributions'] for r in results) / len(results)
            
            print(f"Average current streak: {avg_current:.1f} days")
            print(f"Average longest streak: {avg_longest:.1f} days")
            print(f"Average contributions: {avg_contributions:.0f}")
            
            # Top 5 current streaks
            top_current = sorted(results, key=lambda x: x['current_streak'], reverse=True)[:5]
            print(f"\n🔥 Top 5 Current Streaks:")
            for r in top_current:
                print(f"  {r['username']}: {r['current_streak']} days")
            
            # Top 5 longest streaks
            top_longest = sorted(results, key=lambda x: x['longest_streak'], reverse=True)[:5]
            print(f"\n🏆 Top 5 Longest Streaks:")
            for r in top_longest:
                print(f"  {r['username']}: {r['longest_streak']} days")
            
            # Top 5 contributors
            top_contrib = sorted(results, key=lambda x: x['total_contributions'], reverse=True)[:5]
            print(f"\n⭐ Top 5 Contributors:")
            for r in top_contrib:
                print(f"  {r['username']}: {r['total_contributions']} contributions")
        
        print(f"\n{'='*60}\n")
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    scrape_github_streaks_for_students()
