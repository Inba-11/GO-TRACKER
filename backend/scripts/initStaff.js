require('dotenv').config();
const mongoose = require('mongoose');
const Staff = require('../models/Staff');
const connectDB = require('../config/database');

// Staff credentials from frontend
const staffData = [
  { username: "Pandiyarajan", password: "Mentor@123", name: "Pandiyarajan" },
  { username: "Tamilarasu", password: "Mentor@123", name: "Tamilarasu" },
  { username: "Priya", password: "Mentor@123", name: "Priya" },
  { username: "Seema", password: "Mentor@123", name: "Seema" },
  { username: "Narmatha", password: "Mentor@123", name: "Narmatha" },
  { username: "Sudarvizhi", password: "Mentor@123", name: "Sudarvizhi" },
  { username: "Hemalatha", password: "Mentor@123", name: "Hemalatha" },
];

const initStaff = async () => {
  try {
    await connectDB();
    
    console.log('📝 Initializing staff accounts...');
    
    for (const staff of staffData) {
      const existingStaff = await Staff.findOne({ username: staff.username });
      
      if (existingStaff) {
        console.log(`⚠️  Staff ${staff.username} already exists, skipping...`);
        continue;
      }
      
      const newStaff = new Staff(staff);
      await newStaff.save();
      console.log(`✅ Created staff: ${staff.username}`);
    }
    
    console.log('✅ Staff initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing staff:', error);
    process.exit(1);
  }
};

initStaff();

