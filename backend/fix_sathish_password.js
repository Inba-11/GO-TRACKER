const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tracker');
    console.log('✅ Connected to MongoDB');

    // Find and update the student
    const student = await Student.findOne({ rollNumber: '711523BCB032' });
    
    if (!student) {
      console.error('❌ Student not found');
      process.exit(1);
    }

    console.log(`Found student: ${student.name}`);
    
    // Update password (will be hashed by the pre-save hook)
    student.password = '711523BCB032';
    await student.save();
    
    console.log('✅ Password updated successfully!');
    console.log(`\n📝 Login Credentials:`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Password: 711523BCB032`);
    console.log(`   Role: student`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
