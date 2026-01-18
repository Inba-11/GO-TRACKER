require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const scraperService = require('./services/scraperService');
const connectDB = require('./config/database');

const scrapeSinglePlatform = async (rollNumber, platform) => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Find student
    const student = await Student.findOne({ rollNumber });
    if (!student) {
      console.error(`❌ Student not found: ${rollNumber}`);
      process.exit(1);
    }

    console.log(`📝 Student: ${student.name} (${rollNumber})`);
    console.log(`🎯 Platform: ${platform}\n`);

    // Get username for the platform
    let username = student.platformUsernames?.[platform];
    
    if (!username) {
      // Try to extract from URL
      const url = student.platformLinks?.[platform];
      if (url) {
        username = extractUsernameFromUrl(url, platform);
        if (username) {
          console.log(`📌 Extracted username from URL: ${username}`);
          // Update username in database
          if (!student.platformUsernames) {
            student.platformUsernames = {};
          }
          student.platformUsernames[platform] = username;
          await student.save();
        }
      }
    }

    if (!username) {
      console.error(`❌ No username found for ${platform}`);
      console.log(`💡 Add platform link through UI or update platformUsernames.${platform}`);
      console.log(`📋 Current platformLinks.${platform}: ${student.platformLinks?.[platform] || 'Not set'}`);
      process.exit(1);
    }

    console.log(`🔍 Scraping ${platform} for username: ${username}...\n`);

    // Scrape the specific platform
    let result;
    switch (platform) {
      case 'leetcode':
        result = await scraperService.scrapeLeetCode(username);
        break;
      case 'codechef':
        result = await scraperService.scrapeCodeChef(username);
        break;
      case 'codeforces':
        result = await scraperService.scrapeCodeforces(username);
        break;
      case 'github':
        result = await scraperService.scrapeGitHub(username);
        break;
      case 'codolio':
        result = await scraperService.scrapeCodolio(username);
        break;
      default:
        console.error(`❌ Unknown platform: ${platform}`);
        console.log(`💡 Supported platforms: leetcode, codechef, codeforces, github, codolio`);
        process.exit(1);
    }

    if (!result) {
      console.error(`❌ Failed to scrape ${platform} data`);
      process.exit(1);
    }

    // Update student with scraped data
    if (!student.platforms) {
      student.platforms = {};
    }
    student.platforms[platform] = result;
    student.lastScrapedAt = new Date();
    await student.save();

    console.log(`\n✅ Successfully scraped ${platform} data!`);
    console.log(`📊 Results:`);
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

function extractUsernameFromUrl(url, platform) {
  if (!url || typeof url !== 'string') return '';
  try {
    if (platform === 'leetcode') {
      const match = url.match(/leetcode\.com\/u\/([^\/\?]+)/);
      return match ? match[1] : '';
    } else if (platform === 'codechef') {
      const match = url.match(/codechef\.com\/users\/([^\/\?]+)/);
      return match ? match[1] : '';
    } else if (platform === 'codeforces') {
      const match = url.match(/codeforces\.com\/profile\/([^\/\?]+)/);
      return match ? match[1] : '';
    } else if (platform === 'github') {
      const match = url.match(/github\.com\/([^\/\?]+)/);
      return match ? match[1] : '';
    } else if (platform === 'codolio') {
      const match = url.match(/codolio\.com\/profile\/([^\/\?]+)/);
      return match ? match[1] : '';
    }
  } catch (e) {
    return '';
  }
  return '';
}

// Get command line arguments
const rollNumber = process.argv[2] || '711523BCB001'; // Default to Aadham
const platform = process.argv[3] || 'leetcode'; // Default to LeetCode

console.log(`🚀 Starting scrape for ${rollNumber} - Platform: ${platform}\n`);
scrapeSinglePlatform(rollNumber, platform);

