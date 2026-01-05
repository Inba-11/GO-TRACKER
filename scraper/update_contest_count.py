from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

# Get MongoDB connection
mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/go-tracker')
client = MongoClient(mongodb_uri)
db = client['go-tracker']
students_collection = db['students']

# Update INBATAMIZHAN P's record with contest count
result = students_collection.update_one(
    {'rollNumber': '711523BCB023'},
    {
        '$set': {
            'platforms.codechef.totalContests': 96,
            'platforms.codechef.contestCountUpdatedAt': '2025-01-05T14:30:00Z'
        }
    }
)

print(f'Updated {result.modified_count} record(s)')

# Verify the update
student = students_collection.find_one({'rollNumber': '711523BCB023'})
if student and student.get('platforms', {}).get('codechef', {}).get('totalContests'):
    print(f'Verified: totalContests = {student["platforms"]["codechef"]["totalContests"]}')
else:
    print('Warning: totalContests not found in record')

client.close()