const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tracker');
    
    // Search for students with SATHISH in name
    const students = await Student.find({ name: /SATHISH/i });
    
    console.log('Found students with SATHISH in name:');
    students.forEach(s => {
      console.log(`  Name: ${s.name}, Roll: ${s.rollNumber}`);
    });

    // Also search by roll number pattern
    const byRoll = await Student.find({ rollNumber: /BCB032/i });
    console.log('\nFound students with BCB032 in roll:');
    byRoll.forEach(s => {
      console.log(`  Name: ${s.name}, Roll: ${s.rollNumber}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
