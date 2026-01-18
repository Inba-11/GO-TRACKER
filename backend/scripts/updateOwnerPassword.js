require('dotenv').config();
const mongoose = require('mongoose');
const Owner = require('../models/Owner');
const connectDB = require('../config/database');

const updateOwnerPassword = async () => {
  try {
    await connectDB();
    
    console.log('📝 Updating owner password...');
    
    const owner = await Owner.findOne({ email: 'owner@bytebuster.com' });
    
    if (!owner) {
      console.log('⚠️  Owner not found. Run initOwner.js first to create the owner account.');
      process.exit(1);
    }
    
    // Update password (will be hashed automatically by pre-save hook)
    owner.password = 'thotuparu@123';
    await owner.save();
    
    console.log('✅ Owner password updated successfully!');
    console.log('📧 Email: owner@bytebuster.com');
    console.log('🔑 New Password: thotuparu@123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating owner password:', error);
    process.exit(1);
  }
};

updateOwnerPassword();

