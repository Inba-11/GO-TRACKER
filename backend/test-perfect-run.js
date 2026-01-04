const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const testPerfectRun = async () => {
  console.log('🧪 Testing Perfect Run Setup...\n');

  const tests = [
    {
      name: 'Health Check',
      test: async () => {
        const response = await axios.get('http://localhost:5000/health');
        return response.data.success;
      }
    },
    {
      name: 'Users Count',
      test: async () => {
        const response = await axios.get(`${API_BASE}/users`);
        const count = response.data.data.length;
        console.log(`   Found ${count} users`);
        return count >= 4;
      }
    },
    {
      name: 'Platform Statistics',
      test: async () => {
        const response = await axios.get(`${API_BASE}/users/stats`);
        const stats = response.data.data;
        console.log(`   Total Problems: ${stats.totalProblems}`);
        console.log(`   Avg LeetCode Rating: ${Math.round(stats.avgLeetCodeRating)}`);
        console.log(`   GitHub Contributions: ${stats.totalGitHubContributions}`);
        return stats.totalProblems > 1000;
      }
    },
    {
      name: 'Real User Data (INBATAMIZHAN P)',
      test: async () => {
        const response = await axios.get(`${API_BASE}/users/roll/711523BCB023`);
        const user = response.data.data;
        console.log(`   LeetCode Problems: ${user.platforms.leetcode?.problemsSolved || 0}`);
        console.log(`   CodeChef Rating: ${user.platforms.codechef?.rating || 0}`);
        console.log(`   GitHub Contributions: ${user.platforms.github?.contributions || 0}`);
        return user.totalProblems > 0;
      }
    },
    {
      name: 'Top Performers',
      test: async () => {
        const response = await axios.get(`${API_BASE}/users?sortBy=totalProblems&order=desc`);
        const users = response.data.data;
        const topUser = users[0];
        console.log(`   Top Performer: ${topUser.name} (${topUser.totalProblems} problems)`);
        return topUser.totalProblems > 100;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing ${test.name}...`);
      const result = await test.test();
      if (result) {
        console.log(`✅ ${test.name} - PASSED\n`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - FAILED\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}\n`);
      failed++;
    }
  }

  console.log('========================================');
  console.log(`📊 TEST RESULTS:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log('========================================');

  if (failed === 0) {
    console.log('🎉 PERFECT RUN SUCCESSFUL!');
    console.log('🌐 Visit: http://localhost:5173/live-dashboard');
    console.log('📊 All systems operational!');
  } else {
    console.log('⚠️  Some tests failed. Check the setup.');
  }
};

testPerfectRun().catch(console.error);