require('dotenv').config();
const mongoose = require('mongoose');
const Owner = require('../models/Owner');
const connectDB = require('../config/database');

// Owner credentials from frontend
const ownerData = {
  email: "owner@bytebuster.com",
  password: "thotupar@123"
};

const initOwner = async () => {
  try {
    await connectDB();
    
    console.log('📝 Initializing owner account...');
    
    const existingOwner = await Owner.findOne({ email: ownerData.email });
    
    if (existingOwner) {
      console.log('⚠️  Owner already exists, skipping...');
      process.exit(0);
    }
    
    const newOwner = new Owner(ownerData);
    await newOwner.save();
    console.log('✅ Created owner account');
    
    console.log('✅ Owner initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing owner:', error);
    process.exit(1);
  }
};

initOwner();

