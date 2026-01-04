const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const testAPI = async () => {
  console.log('🧪 Testing Go Tracker API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health Check:', healthResponse.data.message);

    // Test 2: Get All Users
    console.log('\n2. Testing Get All Users...');
    const usersResponse = await axios.get(`${API_BASE}/users`);
    console.log(`✅ Found ${usersResponse.data.data.length} users`);

    // Test 3: Get User by Roll Number
    console.log('\n3. Testing Get User by Roll Number...');
    try {
      const userResponse = await axios.get(`${API_BASE}/users/roll/711523BCB023`);
      const user = userResponse.data.data;
      console.log(`✅ Found user: ${user.name}`);
      console.log(`   Roll Number: ${user.rollNumber}`);
      console.log(`   Batch: ${user.batch}`);
      console.log(`   Platform Usernames:`, user.platformUsernames);

      // Test 4: Scrape User Data
      console.log('\n4. Testing User Data Scraping...');
      console.log('   This may take a while...');
      
      const scrapeResponse = await axios.post(`${API_BASE}/users/${user._id}/scrape?force=true`);
      const scrapingResults = scrapeResponse.data.scrapingResults;
      
      console.log(`✅ Scraping completed!`);
      console.log(`   Successful platforms: ${scrapingResults.successful.join(', ')}`);
      if (scrapingResults.errors.length > 0) {
        console.log(`   Errors: ${scrapingResults.errors.length}`);
        scrapingResults.errors.forEach(error => {
          console.log(`     - ${error.platform}: ${error.error}`);
        });
      }

      // Test 5: Get Updated User Data
      console.log('\n5. Testing Updated User Data...');
      const updatedUserResponse = await axios.get(`${API_BASE}/users/${user._id}`);
      const updatedUser = updatedUserResponse.data.data;
      
      console.log('✅ Updated platform stats:');
      if (updatedUser.platforms.leetcode?.problemsSolved) {
        console.log(`   LeetCode: ${updatedUser.platforms.leetcode.problemsSolved} problems, Rating: ${updatedUser.platforms.leetcode.rating}`);
      }
      if (updatedUser.platforms.codechef?.problemsSolved) {
        console.log(`   CodeChef: ${updatedUser.platforms.codechef.problemsSolved} problems, Rating: ${updatedUser.platforms.codechef.rating}`);
      }
      if (updatedUser.platforms.codeforces?.problemsSolved) {
        console.log(`   Codeforces: ${updatedUser.platforms.codeforces.problemsSolved} problems, Rating: ${updatedUser.platforms.codeforces.rating}`);
      }
      if (updatedUser.platforms.github?.contributions) {
        console.log(`   GitHub: ${updatedUser.platforms.github.contributions} contributions, ${updatedUser.platforms.github.repositories} repos`);
      }
      if (updatedUser.platforms.codolio?.totalSubmissions) {
        console.log(`   Codolio: ${updatedUser.platforms.codolio.totalSubmissions} submissions, Streak: ${updatedUser.platforms.codolio.currentStreak}`);
      }

    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ User not found. Run: node scripts/initUser.js');
      } else {
        throw error;
      }
    }

    // Test 6: Get Platform Statistics
    console.log('\n6. Testing Platform Statistics...');
    const statsResponse = await axios.get(`${API_BASE}/users/stats`);
    console.log('✅ Platform Statistics:', statsResponse.data.data);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.error('\nMake sure the server is running: npm run dev');
  }
};

// Run tests
testAPI();