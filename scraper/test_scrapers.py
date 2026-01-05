#!/usr/bin/env python3
"""
Test Script for All Platform Scrapers
Verifies that each scraper is working correctly
"""

import sys
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_scraper(scraper_name, scraper_func, test_username):
    """Test a single scraper"""
    print(f"\n{'='*60}")
    print(f"🧪 Testing {scraper_name} Scraper")
    print(f"{'='*60}")
    print(f"Username: {test_username}")
    
    try:
        start_time = datetime.now()
        result = scraper_func(test_username)
        end_time = datetime.now()
        
        duration = (end_time - start_time).total_seconds()
        
        if result:
            print(f"✅ {scraper_name} scraper working!")
            print(f"⏱️  Duration: {duration:.2f} seconds")
            print(f"📊 Data points: {len([v for v in result.values() if v is not None and v != 0])}")
            print(f"🔍 Sample data: {dict(list(result.items())[:3])}")
            return True
        else:
            print(f"❌ {scraper_name} scraper failed - no data returned")
            return False
            
    except Exception as e:
        print(f"❌ {scraper_name} scraper error: {str(e)[:100]}")
        return False

def main():
    """Run all scraper tests"""
    print("🚀 GO Tracker Scraper Test Suite")
    print("=" * 60)
    
    test_results = {}
    
    # Test LeetCode Scraper
    try:
        from leetcode_scraper import scrape_leetcode_user
        test_results['LeetCode'] = test_scraper('LeetCode', scrape_leetcode_user, 'tourist')
    except ImportError as e:
        print(f"❌ Cannot import LeetCode scraper: {e}")
        test_results['LeetCode'] = False
    
    # Test CodeChef Scraper
    try:
        from codechef_scraper import scrape_codechef_user
        test_results['CodeChef'] = test_scraper('CodeChef', scrape_codechef_user, 'gennady.korotkevich')
    except ImportError as e:
        print(f"❌ Cannot import CodeChef scraper: {e}")
        test_results['CodeChef'] = False
    
    # Test Codeforces Scraper
    try:
        from codeforces_scraper import scrape_codeforces_user
        test_results['Codeforces'] = test_scraper('Codeforces', scrape_codeforces_user, 'tourist')
    except ImportError as e:
        print(f"❌ Cannot import Codeforces scraper: {e}")
        test_results['Codeforces'] = False
    
    # Test GitHub Scraper
    try:
        from github_scraper import scrape_github_user
        test_results['GitHub'] = test_scraper('GitHub', scrape_github_user, 'octocat')
    except ImportError as e:
        print(f"❌ Cannot import GitHub scraper: {e}")
        test_results['GitHub'] = False
    
    # Test Codolio Scraper (skip if no Chrome driver)
    try:
        from codolio_scraper import scrape_codolio_user
        print(f"\n⚠️  Codolio scraper test skipped (requires Chrome driver)")
        print(f"   To test manually: python -c \"from codolio_scraper import scrape_codolio_user; print(scrape_codolio_user('test_user'))\"")
        test_results['Codolio'] = None  # Skip
    except ImportError as e:
        print(f"❌ Cannot import Codolio scraper: {e}")
        test_results['Codolio'] = False
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 TEST RESULTS SUMMARY")
    print(f"{'='*60}")
    
    passed = 0
    failed = 0
    skipped = 0
    
    for platform, result in test_results.items():
        if result is True:
            print(f"✅ {platform}: PASSED")
            passed += 1
        elif result is False:
            print(f"❌ {platform}: FAILED")
            failed += 1
        else:
            print(f"⏭️  {platform}: SKIPPED")
            skipped += 1
    
    print(f"\n📈 Results: {passed} passed, {failed} failed, {skipped} skipped")
    
    if failed == 0:
        print("🎉 All available scrapers are working!")
        return True
    else:
        print("⚠️  Some scrapers need attention")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)