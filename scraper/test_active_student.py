"""
Test with more active student profiles
"""
from platform_scrapers import PlatformScraper

scraper = PlatformScraper(delay=2)

print("\n🧪 Testing with AHAMED AMMAR (more active student)\n")

# CodeChef
print("📊 CodeChef: ahamed_ammar07")
cc = scraper.scrape_codechef('ahamed_ammar07')
print(f"   Problems: {cc.get('problemsSolved', 0)}")
print(f"   Rating: {cc.get('rating', 0)}")
print(f"   Max Rating: {cc.get('maxRating', 0)}")
print()

scraper.sleep()

# GitHub
print("📊 GitHub: Ahamed-ammar")
gh = scraper.scrape_github('Ahamed-ammar')
print(f"   Repos: {gh.get('repositories', 0)}")
print(f"   Contributions: {gh.get('contributions', 0)}")
print(f"   Followers: {gh.get('followers', 0)}")
print()

scraper.sleep()

# Codeforces
print("📊 Codeforces: ahamedammar25")
cf = scraper.scrape_codeforces('ahamedammar25')
print(f"   Problems: {cf.get('problemsSolved', 0)}")
print(f"   Rating: {cf.get('rating', 0)}")
print(f"   Contests: {cf.get('contests', 0)}")
print()
