require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const connectDB = require('./config/database');

async function main() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const rollNumber = '711523BCB004';
    
    // Find the student
    let student = await Student.findOne({ rollNumber });

    if (!student) {
      console.log(`❌ Student with roll number ${rollNumber} not found`);
      process.exit(1);
    }

    console.log(`\n📋 Current Student Data:`);
    console.log(`   Name: ${student.name}`);
    console.log(`   Roll Number: ${student.rollNumber}`);
    console.log(`   Email: ${student.email}`);

    // Update the name
    student.name = 'AbinayaRenganathan';
    await student.save();

    console.log(`\n✅ Student name updated successfully!`);
    console.log(`   New Name: ${student.name}`);
    console.log(`   Roll Number: ${student.rollNumber}`);
    console.log(`   Email: ${student.email}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

