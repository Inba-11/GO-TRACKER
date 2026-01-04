# scraper/verify_import.py
from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['go-tracker']
students = db.students

print(f"Total students: {students.count_documents({})}")
print("\nSample student:")
sample = students.find_one()
if sample:
    print(f"Name: {sample['name']}")
    print(f"Roll Number: {sample['rollNumber']}")
    print(f"Batch: {sample['batch']}")
    print(f"LeetCode: {sample['platformUsernames']['leetcode']}")
    print(f"CodeChef: {sample['platformUsernames']['codechef']}")
    print(f"Codeforces: {sample['platformUsernames']['codeforces']}")
    print(f"GitHub: {sample['platformUsernames']['github']}")

client.close()

