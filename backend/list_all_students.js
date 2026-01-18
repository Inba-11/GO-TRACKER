const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tracker');
    
    const students = await Student.find().limit(20);
    
    console.log(`Total students found: ${students.length}\n`);
    students.forEach(s => {
      console.log(`Name: ${s.name}`);
      console.log(`Roll: ${s.rollNumber}`);
      console.log(`Email: ${s.email}`);
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
