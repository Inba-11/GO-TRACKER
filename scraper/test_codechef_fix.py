"""
Test improved CodeChef scraper with problems count
"""
from platform_scrapers import PlatformScraper

scraper = PlatformScraper(delay=2)

print("\n" + "="*70)
print("🧪 TESTING CODECHEF PROBLEMS COUNT FIX")
print("="*70 + "\n")

# Test with multiple students
test_users = [
    ('kit27csbs01', 'AADHAM SHARIEF A'),
    ('ahamed_ammar07', 'AHAMED AMMAR O A'),
    ('kit27csbs02', 'AARTHI V'),
]

for username, name in test_users:
    print(f"👤 Testing: {name} ({username})")
    result = scraper.scrape_codechef(username)
    
    print(f"   ✅ Rating: {result.get('rating', 0)}")
    print(f"   ✅ Max Rating: {result.get('maxRating', 0)}")
    print(f"   {'✅' if result.get('problemsSolved', 0) > 0 else '❌'} Problems: {result.get('problemsSolved', 0)}")
    print()
    
    scraper.sleep()

print("="*70)
print("✅ TEST COMPLETE")
print("="*70)
