require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student');

const addSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/go-tracker');
    
    console.log('✅ Connected to MongoDB');
    console.log('📊 Adding sample weekly progress and daily submissions data...\n');

    const students = await Student.find({ isActive: true });
    
    for (const student of students) {
      // Generate weekly progress for last 8 weeks
      const weeklyProgress = [];
      for (let i = 8; i >= 1; i--) {
        weeklyProgress.push({
          week: `Week ${9 - i}`,
          codechef: Math.floor(Math.random() * 15) + 5,
          hackerrank: Math.floor(Math.random() * 10) + 3,
          leetcode: Math.floor(Math.random() * 20) + 10,
          atcoder: Math.floor(Math.random() * 5) + 1,
          codeforces: Math.floor(Math.random() * 12) + 5,
          github: Math.floor(Math.random() * 30) + 10
        });
      }
      
      // Generate daily submissions for last 90 days
      const dailySubmissions = [];
      const today = new Date();
      for (let i = 90; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dailySubmissions.push({
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 8)
        });
      }
      
      // Update student
      student.weeklyProgress = weeklyProgress;
      student.platforms.codolio.dailySubmissions = dailySubmissions;
      
      // Add some sample badges
      if (student.platforms.codolio.badges.length === 0) {
        student.platforms.codolio.badges = [
          {
            id: 'streak-7',
            name: '7 Day Streak',
            description: 'Solved problems for 7 consecutive days',
            icon: '🔥',
            earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'first-100',
            name: 'Century',
            description: 'Solved 100 problems',
            icon: '💯',
            earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'early-bird',
            name: 'Early Bird',
            description: 'Solved a problem before 6 AM',
            icon: '🌅',
            earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
      }
      
      await student.save();
      console.log(`✅ Updated ${student.name}`);
    }
    
    console.log(`\n🎉 Successfully added sample data to ${students.length} students!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addSampleData();
