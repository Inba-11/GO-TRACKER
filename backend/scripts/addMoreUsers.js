require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const additionalUsers = [
  {
    name: 'RAJESH KUMAR',
    rollNumber: '711523BCB024',
    email: 'rajesh@example.com',
    batch: 'A',
    platformUsernames: {
      leetcode: 'rajesh_coder',
      codechef: 'rajesh24',
      codeforces: 'rajesh_cf',
      github: 'rajesh-dev',
      codolio: 'rajesh'
    },
    platformUrls: {
      leetcode: 'https://leetcode.com/u/rajesh_coder/',
      codechef: 'https://www.codechef.com/users/rajesh24',
      codeforces: 'https://codeforces.com/profile/rajesh_cf',
      github: 'https://github.com/rajesh-dev',
      codolio: 'https://codolio.com/profile/rajesh'
    }
  },
  {
    name: 'PRIYA SHARMA',
    rollNumber: '711523BCB025',
    email: 'priya@example.com',
    batch: 'A',
    platformUsernames: {
      leetcode: 'priya_codes',
      codechef: 'priya_chef',
      codeforces: 'priya_cf',
      github: 'priya-sharma',
      codolio: 'priya'
    },
    platformUrls: {
      leetcode: 'https://leetcode.com/u/priya_codes/',
      codechef: 'https://www.codechef.com/users/priya_chef',
      codeforces: 'https://codeforces.com/profile/priya_cf',
      github: 'https://github.com/priya-sharma',
      codolio: 'https://codolio.com/profile/priya'
    }
  },
  {
    name: 'ARJUN PATEL',
    rollNumber: '711523BCB026',
    email: 'arjun@example.com',
    batch: 'C',
    platformUsernames: {
      leetcode: 'arjun_algo',
      codechef: 'arjun26',
      codeforces: 'arjun_competitive',
      github: 'arjun-patel',
      codolio: 'arjun'
    },
    platformUrls: {
      leetcode: 'https://leetcode.com/u/arjun_algo/',
      codechef: 'https://www.codechef.com/users/arjun26',
      codeforces: 'https://codeforces.com/profile/arjun_competitive',
      github: 'https://github.com/arjun-patel',
      codolio: 'https://codolio.com/profile/arjun'
    }
  }
];

const addUsers = async () => {
  try {
    console.log('Adding additional users...');

    for (const userData of additionalUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ rollNumber: userData.rollNumber });
      if (existingUser) {
        console.log(`User ${userData.name} already exists`);
        continue;
      }

      // Generate realistic platform data
      const platforms = {
        leetcode: {
          username: userData.platformUsernames.leetcode,
          rating: Math.floor(Math.random() * 1000) + 1000, // 1000-2000
          maxRating: 0,
          problemsSolved: Math.floor(Math.random() * 300) + 50, // 50-350
          rank: Math.floor(Math.random() * 20000) + 5000,
          contests: Math.floor(Math.random() * 30) + 5,
          lastUpdated: new Date()
        },
        codechef: {
          username: userData.platformUsernames.codechef,
          rating: Math.floor(Math.random() * 800) + 1000, // 1000-1800
          maxRating: 0,
          problemsSolved: Math.floor(Math.random() * 200) + 30, // 30-230
          rank: Math.floor(Math.random() * 50000) + 10000,
          contests: Math.floor(Math.random() * 25) + 3,
          lastUpdated: new Date()
        },
        codeforces: {
          username: userData.platformUsernames.codeforces,
          rating: Math.floor(Math.random() * 700) + 800, // 800-1500
          maxRating: 0,
          problemsSolved: Math.floor(Math.random() * 150) + 20, // 20-170
          rank: 3, // Specialist
          contests: Math.floor(Math.random() * 20) + 8,
          lastUpdated: new Date()
        },
        github: {
          username: userData.platformUsernames.github,
          contributions: Math.floor(Math.random() * 800) + 100, // 100-900
          repositories: Math.floor(Math.random() * 30) + 5, // 5-35
          followers: Math.floor(Math.random() * 100) + 10, // 10-110
          following: Math.floor(Math.random() * 150) + 20, // 20-170
          lastUpdated: new Date()
        },
        codolio: {
          username: userData.platformUsernames.codolio,
          totalSubmissions: Math.floor(Math.random() * 400) + 100, // 100-500
          currentStreak: Math.floor(Math.random() * 40) + 5, // 5-45
          maxStreak: Math.floor(Math.random() * 60) + 20, // 20-80
          lastUpdated: new Date()
        }
      };

      // Set max ratings
      platforms.leetcode.maxRating = platforms.leetcode.rating + Math.floor(Math.random() * 200);
      platforms.codechef.maxRating = platforms.codechef.rating + Math.floor(Math.random() * 150);
      platforms.codeforces.maxRating = platforms.codeforces.rating + Math.floor(Math.random() * 300);

      const completeUserData = {
        ...userData,
        department: 'Computer Science',
        year: 3,
        platforms,
        isActive: true,
        lastScrapedAt: new Date(),
        scrapingErrors: []
      };

      const user = new User(completeUserData);
      await user.save();
      console.log(`✅ Added user: ${userData.name}`);
    }

    console.log('\n🎉 All users added successfully!');
  } catch (error) {
    console.error('❌ Error adding users:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

addUsers();