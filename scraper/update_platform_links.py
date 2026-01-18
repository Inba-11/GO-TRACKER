#!/usr/bin/env python3
"""Update platform links for a student"""
import sys
import os
import io
from pymongo import MongoClient

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

if len(sys.argv) < 4:
    print("Usage: python update_platform_links.py <roll_number> <platform> <url>")
    sys.exit(1)

roll_number = sys.argv[1]
platform = sys.argv[2]
url = sys.argv[3]

mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
client = MongoClient(mongodb_uri)
db = client['go-tracker']

# Extract username from URL if it's a Codeforces URL
username = None
if 'codeforces.com/profile/' in url:
    username = url.split('codeforces.com/profile/')[-1].split('/')[0].split('?')[0]

result = db['students'].update_one(
    {'rollNumber': roll_number},
    {'$set': {
        f'platformLinks.{platform}': url,
        **({f'platformUsernames.{platform}': username} if username else {})
    }}
)

if result.modified_count > 0:
    print(f"✅ Updated {platform} link for {roll_number}")
else:
    print(f"⚠️  No changes made (link may already be set)")

client.close()

