#!/usr/bin/env python3
"""
Test script to verify LeetCode API access and diagnose issues
"""

import requests
import json
import time

def test_basic_connection():
    """Test if we can reach LeetCode website"""
    print("\n" + "="*60)
    print("TEST 1: Basic Connection Test")
    print("="*60)
    
    try:
        response = requests.get("https://leetcode.com", timeout=10)
        print(f"[OK] Status Code: {response.status_code}")
        print(f"[OK] Can reach LeetCode.com")
        return True
    except requests.exceptions.ConnectionError as e:
        print(f"[ERROR] Connection Error: {e}")
        print("   Check your internet connection")
        return False
    except requests.exceptions.Timeout:
        print(f"[ERROR] Timeout - LeetCode took too long to respond")
        return False
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False

def test_graphql_endpoint():
    """Test if GraphQL endpoint is accessible"""
    print("\n" + "="*60)
    print("TEST 2: GraphQL Endpoint Test")
    print("="*60)
    
    graphql_url = "https://leetcode.com/graphql"
    
    # Simple test query
    test_query = {
        "query": """
        query {
            userStatus {
                isSignedIn
            }
        }
        """
    }
    
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com',
        'Origin': 'https://leetcode.com'
    }
    
    try:
        print(f"Testing: {graphql_url}")
        response = requests.post(
            graphql_url,
            json=test_query,
            headers=headers,
            timeout=60
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("[OK] GraphQL endpoint is accessible")
            try:
                data = response.json()
                print(f"Response: {json.dumps(data, indent=2)}")
            except:
                print(f"Response Text: {response.text[:500]}")
            return True
        else:
            print(f"[ERROR] GraphQL endpoint returned status {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except requests.exceptions.ConnectionError as e:
        print(f"[ERROR] Connection Error: {e}")
        return False
    except requests.exceptions.Timeout:
        print(f"[ERROR] Timeout after 60 seconds")
        return False
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_user_query(username="tourist"):
    """Test querying a specific user (default: tourist - famous competitive programmer)"""
    print("\n" + "="*60)
    print(f"TEST 3: User Query Test (username: {username})")
    print("="*60)
    
    graphql_url = "https://leetcode.com/graphql"
    
    # Query from leetcode_scraper.py
    profile_query = {
        "query": """
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    ranking
                    userAvatar
                    realName
                }
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                    totalSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
        }
        """,
        "variables": {"username": username}
    }
    
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com',
        'Origin': 'https://leetcode.com'
    }
    
    try:
        print(f"Querying user: {username}")
        response = requests.post(
            graphql_url,
            json=profile_query,
            headers=headers,
            timeout=60
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n[OK] Response received:")
            print(json.dumps(data, indent=2))
            
            # Check for errors
            if 'errors' in data:
                print(f"\n[ERROR] GraphQL Errors: {data['errors']}")
                return False
            
            # Check for user data
            if 'data' in data and data['data']:
                matched_user = data['data'].get('matchedUser')
                if matched_user:
                    print(f"\n[OK] User found: {matched_user.get('username')}")
                    
                    # Extract problems solved
                    submit_stats = matched_user.get('submitStats', {})
                    ac_submissions = submit_stats.get('acSubmissionNum', [])
                    
                    total_solved = 0
                    for stat in ac_submissions:
                        if stat.get('difficulty', '').lower() == 'all':
                            total_solved = stat.get('count', 0)
                            break
                        total_solved += stat.get('count', 0)
                    
                    print(f"[OK] Problems Solved: {total_solved}")
                    return True
                else:
                    print(f"\n[WARNING] User '{username}' not found")
                    return False
            else:
                print(f"\n[ERROR] No data in response")
                return False
        else:
            print(f"[ERROR] HTTP {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_simpler_query(username="tourist"):
    """Test with simpler query (like platform_scrapers.py)"""
    print("\n" + "="*60)
    print(f"TEST 4: Simpler Query Test (username: {username})")
    print("="*60)
    
    graphql_url = "https://leetcode.com/graphql"
    
    # Simpler query similar to platform_scrapers.py
    query = {
        "query": """
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                username
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
            userContestRanking(username: $username) {
                attendedContestsCount
                rating
                globalRanking
                topPercentage
            }
        }
        """,
        "variables": {"username": username}
    }
    
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://leetcode.com',
        'Origin': 'https://leetcode.com'
    }
    
    try:
        print(f"Querying user: {username}")
        response = requests.post(
            graphql_url,
            json=query,
            headers=headers,
            timeout=60
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if 'errors' in data:
                print(f"[ERROR] GraphQL Errors: {data['errors']}")
                return False
            
            if 'data' in data:
                print("\n[OK] Response structure:")
                print(json.dumps(data, indent=2))
                
                matched_user = data['data'].get('matchedUser')
                if matched_user:
                    print(f"\n[OK] User found: {matched_user.get('username')}")
                    return True
                else:
                    print(f"\n[WARNING] User not found")
                    return False
            else:
                print(f"[ERROR] No data field")
                return False
        else:
            print(f"[ERROR] HTTP {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_student_username():
    """Test with actual student username"""
    print("\n" + "="*60)
    print("TEST 5: Student Username Test")
    print("="*60)
    
    username = "Aadhamsharief"  # From your student list
    return test_user_query(username)

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("LeetCode API Diagnostic Test")
    print("="*60)
    
    results = []
    
    # Test 1: Basic connection
    results.append(("Basic Connection", test_basic_connection()))
    time.sleep(2)
    
    # Test 2: GraphQL endpoint
    results.append(("GraphQL Endpoint", test_graphql_endpoint()))
    time.sleep(2)
    
    # Test 3: User query (famous user)
    results.append(("User Query (tourist)", test_user_query("tourist")))
    time.sleep(3)
    
    # Test 4: Simpler query
    results.append(("Simpler Query", test_simpler_query("tourist")))
    time.sleep(3)
    
    # Test 5: Student username
    results.append(("Student Username", test_student_username()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} - {test_name}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n[SUCCESS] All tests passed! API is working correctly.")
    else:
        print("\n[WARNING] Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()

