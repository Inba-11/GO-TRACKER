"""
Test scraper with a few students
"""
from platform_scrapers import PlatformScraper

def test_scraper():
    scraper = PlatformScraper(delay=2)
    
    print("\n" + "="*60)
    print("🧪 TESTING PLATFORM SCRAPERS")
    print("="*60 + "\n")
    
    # Test LeetCode
    print("1️⃣ Testing LeetCode...")
    result = scraper.scrape_leetcode("Aadhamsharief")
    print(f"   Result: {result}\n")
    
    # Test CodeChef
    print("2️⃣ Testing CodeChef...")
    result = scraper.scrape_codechef("kit27csbs01")
    print(f"   Result: {result}\n")
    
    # Test Codeforces
    print("3️⃣ Testing Codeforces...")
    result = scraper.scrape_codeforces("kit27.csbs01")
    print(f"   Result: {result}\n")
    
    # Test GitHub
    print("4️⃣ Testing GitHub...")
    result = scraper.scrape_github("Aadhamsharief05")
    print(f"   Result: {result}\n")
    
    print("="*60)
    print("✅ TEST COMPLETE")
    print("="*60)

if __name__ == '__main__':
    test_scraper()
