require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const connectDB = require('./config/database');

const createAadhamStudent = async () => {
  try {
    await connectDB();
    
    console.log('Checking if student Aadham exists...');
    
    // Check if student already exists
    let student = await Student.findOne({ rollNumber: '711523BCB001' });
    
    if (student) {
      console.log('✅ Student already exists!');
      console.log('Name:', student.name);
      console.log('Roll Number:', student.rollNumber);
      console.log('Email:', student.email);
      console.log('Is Active:', student.isActive);
      
      // Test password
      const testPassword = '711523BCB001';
      const isMatch = await student.comparePassword(testPassword);
      console.log('\n🔐 Password Test:');
      console.log('Test Password:', testPassword);
      console.log('Match Result:', isMatch ? '✅ PASS' : '❌ FAIL');
      
      // If password doesn't match, update it
      if (!isMatch) {
        console.log('\n⚠️ Password mismatch. Updating password...');
        student.password = testPassword; // This will be hashed by the pre-save hook
        await student.save();
        console.log('✅ Password updated successfully!');
      }
      
      return student;
    }
    
    // Create new student
    console.log('Creating new student...');
    const studentData = {
      name: 'AADHAM SHARIEF A',
      rollNumber: '711523BCB001',
      email: '711523bcb001@student.edu',
      password: '711523BCB001', // This will be hashed by the pre-save hook
      batch: 'B',
      department: 'Computer Science & Business Systems',
      year: 2,
      isActive: true
    };
    
    student = new Student(studentData);
    await student.save();
    
    console.log('✅ Student created successfully!');
    console.log('Name:', student.name);
    console.log('Roll Number:', student.rollNumber);
    console.log('Email:', student.email);
    console.log('Batch:', student.batch);
    
    // Verify password works
    const testPassword = '711523BCB001';
    const isMatch = await student.comparePassword(testPassword);
    console.log('\n🔐 Password Verification:');
    console.log('Test Password:', testPassword);
    console.log('Match Result:', isMatch ? '✅ PASS' : '❌ FAIL');
    
    return student;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAadhamStudent();

