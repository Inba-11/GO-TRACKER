#!/usr/bin/env python3
"""
Update CodeChef rating and maxRating for INBATAMIZHAN P (711523BCB023)
Fetches accurate ratings from CodeChef profile and updates MongoDB
"""

import sys
import os
from datetime import datetime

# Add the scraper directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient
from codechef_scraper import scrape_codechef_user
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def update_codechef_ratings():
    """Update CodeChef rating and maxRating for INBATAMIZHAN P"""
    try:
        # Connect to MongoDB
        mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        client = MongoClient(mongodb_uri)
        db = client['go-tracker']
        students_collection = db['students']
        
        roll_number = '711523BCB023'
        username = 'kit27csbs23'
        
        logger.info(f"Fetching CodeChef data for {username}...")
        
        # Scrape CodeChef profile data (with contest history to get accurate max rating)
        codechef_data = scrape_codechef_user(username, include_contest_history=True)
        
        if not codechef_data:
            logger.error(f"Failed to scrape CodeChef data for {username}")
            return False
        
        logger.info(f"Scraped Data:")
        logger.info(f"  Rating: {codechef_data.get('rating', 0)}")
        logger.info(f"  Max Rating: {codechef_data.get('maxRating', 0)}")
        logger.info(f"  Problems Solved: {codechef_data.get('totalSolved', 0)}")
        
        # Find student
        student = students_collection.find_one({'rollNumber': roll_number})
        
        if not student:
            logger.error(f"Student with roll number {roll_number} not found!")
            return False
        
        logger.info(f"Found student: {student['name']} ({roll_number})")
        
        # Get current values for comparison
        current_rating = student.get('platforms', {}).get('codechef', {}).get('rating', 0)
        current_max_rating = student.get('platforms', {}).get('codechef', {}).get('maxRating', 0)
        
        logger.info(f"Current values in DB:")
        logger.info(f"  Rating: {current_rating}")
        logger.info(f"  Max Rating: {current_max_rating}")
        
        # Update MongoDB with accurate ratings
        update_data = {
            'platforms.codechef.rating': codechef_data.get('rating', 0),
            'platforms.codechef.maxRating': codechef_data.get('maxRating', 0),
            'platforms.codechef.lastUpdated': datetime.now()
        }
        
        # Also update other fields if available
        if codechef_data.get('totalSolved', 0) > 0:
            update_data['platforms.codechef.problemsSolved'] = codechef_data.get('totalSolved', 0)
        if codechef_data.get('globalRank', 0) > 0:
            update_data['platforms.codechef.globalRank'] = codechef_data.get('globalRank', 0)
        if codechef_data.get('countryRank', 0) > 0:
            update_data['platforms.codechef.countryRank'] = codechef_data.get('countryRank', 0)
        if codechef_data.get('stars', 0) > 0:
            update_data['platforms.codechef.stars'] = codechef_data.get('stars', 0)
        if codechef_data.get('league'):
            update_data['platforms.codechef.league'] = codechef_data.get('league', '')
        if codechef_data.get('division'):
            update_data['platforms.codechef.division'] = codechef_data.get('division', '')
        
        update_result = students_collection.update_one(
            {'rollNumber': roll_number},
            {'$set': update_data}
        )
        
        if update_result.modified_count > 0:
            logger.info(f"Successfully updated ratings in MongoDB!")
            logger.info(f"  Rating: {current_rating} -> {codechef_data.get('rating', 0)}")
            logger.info(f"  Max Rating: {current_max_rating} -> {codechef_data.get('maxRating', 0)}")
            return True
        else:
            logger.warning(f"No changes made to MongoDB (data may be identical)")
            return False
            
    except Exception as e:
        logger.error(f"Error updating ratings: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("\n" + "="*80)
    print("CODECHEF RATINGS UPDATER")
    print("="*80)
    print(f"Updating ratings for INBATAMIZHAN P (711523BCB023)")
    print(f"Username: kit27csbs23")
    print("="*80 + "\n")
    
    success = update_codechef_ratings()
    
    if success:
        print("\n" + "="*80)
        print("Update Complete!")
        print("="*80 + "\n")
    else:
        print("\n" + "="*80)
        print("Update Failed!")
        print("="*80 + "\n")
        sys.exit(1)

