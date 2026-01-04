require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const addWeeklyProgressData = async () => {
  try {
    console.log('Adding weekly progress data...');

    const users = await User.find({ isActive: true });

    for (const user of users) {
      // Simulate last week's data (lower numbers)
      const lastWeekReduction = {
        leetcode: Math.floor(Math.random() * 15) + 5, // 5-20 problems less
        codechef: Math.floor(Math.random() * 10) + 3, // 3-13 problems less
        codeforces: Math.floor(Math.random() * 8) + 2, // 2-10 problems less
        github: Math.floor(Math.random() * 50) + 20   // 20-70 contributions less
      };

      // Add weekly progress field
      user.weeklyProgress = [
        {
          week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
          platforms: {
            leetcode: {
              problemsSolved: Math.max(0, (user.platforms.leetcode?.problemsSolved || 0) - lastWeekReduction.leetcode),
              rating: (user.platforms.leetcode?.rating || 0) - Math.floor(Math.random() * 50)
            },
            codechef: {
              problemsSolved: Math.max(0, (user.platforms.codechef?.problemsSolved || 0) - lastWeekReduction.codechef),
              rating: (user.platforms.codechef?.rating || 0) - Math.floor(Math.random() * 30)
            },
            codeforces: {
              problemsSolved: Math.max(0, (user.platforms.codeforces?.problemsSolved || 0) - lastWeekReduction.codeforces),
              rating: (user.platforms.codeforces?.rating || 0) - Math.floor(Math.random() * 40)
            },
            github: {
              contributions: Math.max(0, (user.platforms.github?.contributions || 0) - lastWeekReduction.github)
            }
          }
        },
        {
          week: new Date(), // This week
          platforms: {
            leetcode: {
              problemsSolved: user.platforms.leetcode?.problemsSolved || 0,
              rating: user.platforms.leetcode?.rating || 0
            },
            codechef: {
              problemsSolved: user.platforms.codechef?.problemsSolved || 0,
              rating: user.platforms.codechef?.rating || 0
            },
            codeforces: {
              problemsSolved: user.platforms.codeforces?.problemsSolved || 0,
              rating: user.platforms.codeforces?.rating || 0
            },
            github: {
              contributions: user.platforms.github?.contributions || 0
            }
          }
        }
      ];

      await user.save();
      console.log(`✅ Added weekly progress for: ${user.name}`);
    }

    console.log('\n🎉 Weekly progress data added successfully!');
  } catch (error) {
    console.error('❌ Error adding weekly progress:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

addWeeklyProgressData();