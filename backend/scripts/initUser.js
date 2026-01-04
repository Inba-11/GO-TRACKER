require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const initializeUser = async () => {
  try {
    console.log('Initializing user: INBATAMIZHAN P...');

    // Check if user already exists
    const existingUser = await User.findOne({ rollNumber: '711523BCB023' });
    if (existingUser) {
      console.log('User already exists:', existingUser.name);
      return existingUser;
    }

    // Create the user
    const userData = {
      name: 'INBATAMIZHAN P',
      rollNumber: '711523BCB023',
      email: 'inbatamizhan@example.com', // You can update this
      batch: 'B', // Assuming batch B, you can change this
      department: 'Computer Science',
      year: 3,
      
      // Platform usernames extracted from URLs
      platformUsernames: {
        leetcode: 'inbatamizh',
        codechef: 'kit27csbs23',
        codeforces: 'Inba_tamizh',
        github: 'Inba-11',
        codolio: 'Inba'
      },

      // Platform URLs
      platformUrls: {
        leetcode: 'https://leetcode.com/u/inbatamizh/',
        codechef: 'https://www.codechef.com/users/kit27csbs23',
        codeforces: 'https://codeforces.com/profile/Inba_tamizh',
        github: 'https://github.com/Inba-11',
        codolio: 'https://codolio.com/profile/Inba'
      },

      // Initialize empty platform stats (will be filled by scraping)
      platforms: {
        leetcode: {
          username: 'inbatamizh',
          rating: 0,
          maxRating: 0,
          problemsSolved: 0,
          rank: 0,
          contests: 0,
          lastUpdated: new Date()
        },
        codechef: {
          username: 'kit27csbs23',
          rating: 0,
          maxRating: 0,
          problemsSolved: 0,
          rank: 0,
          contests: 0,
          lastUpdated: new Date()
        },
        codeforces: {
          username: 'Inba_tamizh',
          rating: 0,
          maxRating: 0,
          problemsSolved: 0,
          rank: 0,
          contests: 0,
          lastUpdated: new Date()
        },
        github: {
          username: 'Inba-11',
          contributions: 0,
          repositories: 0,
          followers: 0,
          following: 0,
          lastUpdated: new Date()
        },
        codolio: {
          username: 'Inba',
          totalSubmissions: 0,
          currentStreak: 0,
          maxStreak: 0,
          lastUpdated: new Date()
        }
      },

      isActive: true,
      lastScrapedAt: new Date(0), // Set to epoch so it will be scraped immediately
      scrapingErrors: []
    };

    const user = new User(userData);
    await user.save();

    console.log('✅ User created successfully!');
    console.log('User ID:', user._id);
    console.log('Name:', user.name);
    console.log('Roll Number:', user.rollNumber);
    console.log('Platform Usernames:', user.platformUsernames);
    
    return user;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await initializeUser();
    console.log('\n🎉 User initialization completed!');
    console.log('\nNext steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Test scraping: POST /api/users/{userId}/scrape');
    console.log('3. View user data: GET /api/users/roll/711523BCB023');
  } catch (error) {
    console.error('Initialization failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

main();