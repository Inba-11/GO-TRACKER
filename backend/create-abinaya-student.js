require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const connectDB = require('./config/database');

async function main() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const rollNumber = '711523BCB004';
    const studentData = {
      name: 'ABINAYA R',
      rollNumber: rollNumber,
      email: '711523bcb004@student.edu',
      password: '711523BCB004', // This will be hashed by the pre-save hook
      batch: 'C',
      department: 'Computer Science & Business Systems',
      year: 2,
      isActive: true,
      platformLinks: {
        leetcode: 'https://leetcode.com/u/AbinayaRenganathan/',
        codechef: '',
        codeforces: '',
        github: '',
        codolio: ''
      },
      platformUsernames: {
        leetcode: 'AbinayaRenganathan',
        codechef: '',
        codeforces: '',
        github: '',
        codolio: ''
      }
    };

    // Check if student already exists
    let student = await Student.findOne({ rollNumber });

    if (student) {
      console.log(`\n📋 Student ${student.name} (${rollNumber}) already exists in database`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Batch: ${student.batch}`);
      console.log(`   Is Active: ${student.isActive}`);
      
      // Update platform links if not set
      let updated = false;
      if (!student.platformLinks || !student.platformLinks.leetcode) {
        if (!student.platformLinks) {
          student.platformLinks = {};
        }
        student.platformLinks.leetcode = studentData.platformLinks.leetcode;
        updated = true;
        console.log(`   ✅ Updated LeetCode URL: ${studentData.platformLinks.leetcode}`);
      }
      
      if (!student.platformUsernames || !student.platformUsernames.leetcode) {
        if (!student.platformUsernames) {
          student.platformUsernames = {};
        }
        student.platformUsernames.leetcode = studentData.platformUsernames.leetcode;
        updated = true;
        console.log(`   ✅ Updated LeetCode Username: ${studentData.platformUsernames.leetcode}`);
      }

      // Update password if needed
      const isMatch = await student.comparePassword(studentData.password);
      if (!isMatch) {
        console.log(`   🔄 Updating password...`);
        student.password = studentData.password; // Will be hashed by pre-save hook
        updated = true;
      }

      if (updated) {
        await student.save();
        console.log(`\n✅ Student data updated successfully!`);
      } else {
        console.log(`\n✅ Student already has all information set.`);
      }
    } else {
      // Create new student
      student = new Student(studentData);
      await student.save();
      console.log(`\n✅ Student created successfully!`);
      console.log(`   Name: ${student.name}`);
      console.log(`   Roll Number: ${student.rollNumber}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Batch: ${student.batch}`);
      console.log(`   LeetCode URL: ${student.platformLinks.leetcode}`);
      console.log(`   LeetCode Username: ${student.platformUsernames.leetcode}`);
    }

    console.log(`\n📝 Login Credentials:`);
    console.log(`   Username: ${student.name}`);
    console.log(`   Password: ${studentData.password}`);
    console.log(`   Roll Number: ${rollNumber}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key error - Student may already exist with this roll number or email');
    }
    process.exit(1);
  }
}

main();

