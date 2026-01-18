const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tracker');
    console.log('✅ Connected to MongoDB');

    // Create student
    const student = new Student({
      name: 'LOURDU SATHISH J',
      rollNumber: '711523BCB032',
      email: 'sathish.j@example.com',
      password: 'password123', // Will be hashed
      batch: 'A',
      department: 'Computer Science & Business Systems',
      year: 2,
      platformLinks: {
        leetcode: 'https://leetcode.com/u/sathishjl07/',
        codechef: '',
        codeforces: '',
        github: '',
        codolio: ''
      },
      platformUsernames: {
        leetcode: 'sathishjl07',
        codechef: '',
        codeforces: '',
        github: '',
        codolio: ''
      },
      platforms: {
        leetcode: {
          username: 'sathishjl07',
          rating: 0,
          maxRating: 0,
          problemsSolved: 0,
          rank: 0,
          contests: 0,
          lastUpdated: new Date()
        },
        codechef: {},
        hackerrank: {},
        atcoder: {},
        codeforces: {},
        github: {},
        codolio: {}
      }
    });

    await student.save();
    console.log('✅ Student created successfully!');
    console.log(`   Name: ${student.name}`);
    console.log(`   Roll: ${student.rollNumber}`);
    console.log(`   Email: ${student.email}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
