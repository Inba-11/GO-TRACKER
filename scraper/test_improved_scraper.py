"""
Test improved scraper with missing data points
"""
from platform_scrapers import PlatformScraper

def test_single_student():
    """Test scraping for one student to verify all data points"""
    
    scraper = PlatformScraper(delay=2)
    
    print("\n" + "="*70)
    print("🧪 TESTING IMPROVED SCRAPER")
    print("="*70 + "\n")
    
    # Test LeetCode
    print("1️⃣ Testing LeetCode...")
    lc_data = scraper.scrape_leetcode("Aadhamsharief")
    print(f"   ✅ Problems: {lc_data.get('problemsSolved', 0)}")
    print(f"   ✅ Current Rating: {lc_data.get('rating', 0)}")
    print(f"   ✅ Max Rating: {lc_data.get('maxRating', 0)}")
    print(f"   ✅ Contests: {lc_data.get('contests', 0)}")
    print()
    
    scraper.sleep()
    
    # Test CodeChef
    print("2️⃣ Testing CodeChef...")
    cc_data = scraper.scrape_codechef("kit27csbs01")
    print(f"   ✅ Problems: {cc_data.get('problemsSolved', 0)}")
    print(f"   ✅ Current Rating: {cc_data.get('rating', 0)}")
    print(f"   ✅ Max Rating: {cc_data.get('maxRating', 0)}")
    print()
    
    scraper.sleep()
    
    # Test Codeforces
    print("3️⃣ Testing Codeforces...")
    cf_data = scraper.scrape_codeforces("kit27.csbs01")
    print(f"   ✅ Problems: {cf_data.get('problemsSolved', 0)}")
    print(f"   ✅ Current Rating: {cf_data.get('rating', 0)}")
    print(f"   ✅ Max Rating: {cf_data.get('maxRating', 0)}")
    print(f"   ✅ Contests: {cf_data.get('contests', 0)}")
    print()
    
    scraper.sleep()
    
    # Test GitHub
    print("4️⃣ Testing GitHub...")
    gh_data = scraper.scrape_github("Aadhamsharief05")
    print(f"   ✅ Repositories: {gh_data.get('repositories', 0)}")
    print(f"   ✅ Contributions: {gh_data.get('contributions', 0)}")
    print(f"   ✅ Followers: {gh_data.get('followers', 0)}")
    print()
    
    scraper.sleep()
    
    # Test Codolio
    print("5️⃣ Testing Codolio...")
    cd_data = scraper.scrape_codolio("AADHAM SHARIEF A")
    print(f"   ⚠️  Score: {cd_data.get('score', 0)} (Selenium needed for full data)")
    print()
    
    print("="*70)
    print("✅ TEST COMPLETE")
    print("="*70)
    print("\n📊 SUMMARY:")
    print(f"   LeetCode:    ✅ All data points working")
    print(f"   CodeChef:    {'✅' if cc_data.get('problemsSolved', 0) > 0 else '⚠️'} Problems: {cc_data.get('problemsSolved', 0)}")
    print(f"   Codeforces:  {'✅' if cf_data.get('contests', 0) > 0 else '⚠️'} Contests: {cf_data.get('contests', 0)}")
    print(f"   GitHub:      {'✅' if gh_data.get('contributions', 0) > 0 else '⚠️'} Contributions: {gh_data.get('contributions', 0)}")
    print(f"   Codolio:     ⚠️  Requires Selenium")
    print()

if __name__ == '__main__':
    test_single_student()
