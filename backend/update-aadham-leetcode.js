require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const connectDB = require('./config/database');

/**
 * Update Aadham's student record with LeetCode information
 * 
 * Usage:
 *   node update-aadham-leetcode.js <leetcode-username>
 * 
 * Example:
 *   node update-aadham-leetcode.js aadham123
 *   node update-aadham-leetcode.js "aadham-sharief"
 * 
 * Or edit DEFAULT_USERNAME below and run without arguments
 */

// Default username - edit this if you want to set it directly
const DEFAULT_USERNAME = null; // Change to 'aadham123' or whatever the username is

const updateAadhamLeetCode = async () => {
  try {
    // Get LeetCode username from command line argument or use default
    let leetcodeUsername = process.argv[2] || DEFAULT_USERNAME;
    
    if (!leetcodeUsername) {
      console.log('⚠️  No LeetCode username provided!');
      console.log('\nOption 1 - Command line:');
      console.log('  node update-aadham-leetcode.js <username>');
      console.log('  Example: node update-aadham-leetcode.js aadham123');
      console.log('\nOption 2 - Edit script:');
      console.log('  Edit this file and set DEFAULT_USERNAME at the top');
      console.log('  Then run: node update-aadham-leetcode.js');
      process.exit(1);
    }

    await connectDB();
    
    console.log('🔍 Searching for student Aadham...');
    
    const student = await Student.findOne({ rollNumber: '711523BCB001' });
    
    if (!student) {
      console.log('❌ Student not found! Please create the student first.');
      process.exit(1);
    }
    
    console.log(`✅ Found student: ${student.name}`);
    console.log(`📝 Current LeetCode username: ${student.platformUsernames?.leetcode || 'Not set'}`);
    console.log(`🔗 Current LeetCode link: ${student.platformLinks?.leetcode || 'Not set'}`);
    
    // Build LeetCode profile URL
    const leetcodeUrl = `https://leetcode.com/u/${leetcodeUsername}/`;
    
    // Update student record
    student.platformUsernames = student.platformUsernames || {};
    student.platformLinks = student.platformLinks || {};
    
    student.platformUsernames.leetcode = leetcodeUsername;
    student.platformLinks.leetcode = leetcodeUrl;
    
    await student.save();
    
    console.log('\n✅ Successfully updated LeetCode information!');
    console.log(`📝 LeetCode username: ${leetcodeUsername}`);
    console.log(`🔗 LeetCode profile URL: ${leetcodeUrl}`);
    console.log('\n🎯 Next steps:');
    console.log('1. The scraper will automatically pick this up on the next cycle (every 90 minutes)');
    console.log('2. Or use the "Refresh LeetCode" button on the dashboard to scrape immediately');
    console.log('3. Check the dashboard to see LeetCode stats appear');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

updateAadhamLeetCode();

