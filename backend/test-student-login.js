require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/go-tracker');
    
    console.log('Connected to MongoDB');
    
    // Get first student
    const student = await Student.findOne({ rollNumber: '711523BCB001' });
    
    if (!student) {
      console.log('❌ Student not found');
      process.exit(1);
    }
    
    console.log('\n📋 Student Details:');
    console.log('Name:', student.name);
    console.log('Roll Number:', student.rollNumber);
    console.log('Email:', student.email);
    console.log('Password Hash:', student.password.substring(0, 20) + '...');
    console.log('Is Active:', student.isActive);
    
    // Test password comparison
    const testPassword = '711523BCB001';
    const isMatch = await student.comparePassword(testPassword);
    
    console.log('\n🔐 Password Test:');
    console.log('Test Password:', testPassword);
    console.log('Match Result:', isMatch ? '✅ PASS' : '❌ FAIL');
    
    // Test with name
    const studentByName = await Student.findOne({
      name: { $regex: new RegExp(`^${student.name}$`, 'i') },
      isActive: true
    });
    
    console.log('\n🔍 Name Search Test:');
    console.log('Search Name:', student.name);
    console.log('Found:', studentByName ? '✅ YES' : '❌ NO');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();
