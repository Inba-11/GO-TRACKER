"""
Quick test script to verify GitHub token is working
"""
import os
from dotenv import load_dotenv
from platform_scrapers import PlatformScraper

load_dotenv()

def test_github_token():
    """Test if GitHub token is configured and working"""
    
    print("\n" + "="*60)
    print("🧪 GITHUB TOKEN TEST")
    print("="*60)
    
    # Check if token exists
    token = os.getenv('GITHUB_TOKEN', '')
    
    if not token:
        print("❌ No GitHub token found in .env file")
        print("\n📖 To fix this:")
        print("1. Visit: https://github.com/settings/tokens")
        print("2. Generate new token (classic)")
        print("3. Select scopes: read:user, public_repo")
        print("4. Copy token and add to go-tracker/scraper/.env:")
        print("   GITHUB_TOKEN=ghp_your_token_here")
        print("\n📄 See GITHUB_TOKEN_SETUP.md for detailed guide")
        return False
    
    print(f"✅ Token found: {token[:10]}...{token[-4:]}")
    print(f"   Length: {len(token)} characters")
    
    # Test with a sample username
    print("\n🔍 Testing with sample GitHub username: 'torvalds'")
    
    scraper = PlatformScraper(delay=1)
    result = scraper.scrape_github('torvalds')
    
    print("\n📊 Results:")
    print(f"   Repositories: {result['repositories']}")
    print(f"   Contributions: {result['contributions']}")
    print(f"   Followers: {result['followers']}")
    
    if result['contributions'] > 0:
        print("\n✅ SUCCESS! Token is working correctly")
        print("   You can now run: python scrape_all_students.py")
        return True
    else:
        print("\n⚠️  Token found but contributions = 0")
        print("   This might mean:")
        print("   - Token doesn't have correct permissions")
        print("   - Token is expired")
        print("   - Rate limit reached")
        print("\n   Try regenerating the token with scopes: read:user, public_repo")
        return False

if __name__ == '__main__':
    test_github_token()
