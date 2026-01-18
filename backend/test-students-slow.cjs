require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test a few representative students from each batch
const testStudents = [
    // Batch A
    { name: "AHAMED AMMAR O A", rollNumber: "711523BCB005", batch: "A" },
    { name: "DINESH S", rollNumber: "711523BCB015", batch: "A" },
    { name: "RAJADURAI R", rollNumber: "711523BCB045", batch: "A" },
    
    // Batch B  
    { name: "AADHAM SHARIEF A", rollNumber: "711523BCB001", batch: "B" },
    { name: "KOWSALYA S", rollNumber: "711523BCB030", batch: "B" },
    { name: "VIKRAM S", rollNumber: "711523BCB060", batch: "B" },
    
    // Batch C
    { name: "AARTHI V", rollNumber: "711523BCB002", batch: "C" },
    { name: "MOHAMMED SYFUDEEN S", rollNumber: "711523BCB036", batch: "C" },
    { name: "SWATHI K", rollNumber: "711523BCB057", batch: "C" },
    
    // Batch D
    { name: "ALFRED ANTONY M", rollNumber: "711523BCB007", batch: "D" },
    { name: "KAVIYA K", rollNumber: "711523BCB029", batch: "D" },
    { name: "VISHWA J", rollNumber: "711523BCB061", batch: "D" },
    
    // NON-CRT
    { name: "RISHI ADHINARAYAN V", rollNumber: "711523BCB046", batch: "NON-CRT" },
    { name: "HARTHI S", rollNumber: "71153BCB022", batch: "NON-CRT" },
    
    // Special cases
    { name: "CHANDRAN M", rollNumber: "711523BCB302", batch: "D" },
    { name: "NISHANTH M", rollNumber: "711523BCB304", batch: "D" }
];

async function testStudentDetailed(student, index) {
    console.log(`\n[${index + 1}/${testStudents.length}] Testing ${student.name} (${student.rollNumber}) - Batch ${student.batch}`);
    
    try {
        // 1. Test Login
        console.log(`  🔐 Testing login...`);
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            identifier: student.rollNumber,
            password: student.rollNumber,
            role: 'student'
        });

        if (!loginResponse.data.success) {
            console.log(`  ❌ Login failed: ${loginResponse.data.error}`);
            return false;
        }

        console.log(`  ✅ Login successful`);
        const token = loginResponse.data.token;
        const userData = loginResponse.data.user;

        // Verify login response data
        console.log(`    - User ID: ${userData.id}`);
        console.log(`    - Email: ${userData.email}`);
        console.log(`    - Role: ${userData.role}`);
        console.log(`    - Has Student Data: ${userData.studentData ? 'Yes' : 'No'}`);

        // 2. Test Authorization
        console.log(`  🛡️  Testing authorization...`);
        const authResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!authResponse.data.success) {
            console.log(`  ❌ Authorization failed: ${authResponse.data.error}`);
            return false;
        }

        console.log(`  ✅ Authorization successful`);
        console.log(`    - Verified Role: ${authResponse.data.data.user.role}`);

        // 3. Test API Integration - Student Profile
        console.log(`  🌐 Testing API integration...`);
        const profileResponse = await axios.get(`${API_BASE_URL}/students/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!profileResponse.data.success) {
            console.log(`  ❌ Profile API failed: ${profileResponse.data.error}`);
            return false;
        }

        const profile = profileResponse.data.data;
        console.log(`    - Profile Name: ${profile.name}`);
        console.log(`    - Profile Roll: ${profile.rollNumber}`);
        console.log(`    - Profile Batch: ${profile.batch}`);

        // 4. Test API Integration - Student by Roll Number
        const rollResponse = await axios.get(`${API_BASE_URL}/students/roll/${student.rollNumber}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!rollResponse.data.success) {
            console.log(`  ❌ Roll lookup API failed: ${rollResponse.data.error}`);
            return false;
        }

        const rollData = rollResponse.data.data;
        console.log(`    - Roll Lookup Name: ${rollData.name}`);

        // 5. Verify Platform Data
        if (profile.platforms) {
            const platforms = Object.keys(profile.platforms);
            console.log(`    - Platform Data: ${platforms.join(', ')}`);
            
            // Check if platform data exists
            const hasData = platforms.some(platform => 
                profile.platforms[platform] && 
                (profile.platforms[platform].problemsSolved > 0 || 
                 profile.platforms[platform].contributions > 0 ||
                 profile.platforms[platform].totalSubmissions > 0)
            );
            console.log(`    - Has Platform Stats: ${hasData ? 'Yes' : 'No'}`);
        }

        // 6. Verify Weekly Progress
        if (profile.weeklyProgress && profile.weeklyProgress.length > 0) {
            console.log(`    - Weekly Progress: ${profile.weeklyProgress.length} weeks`);
        }

        console.log(`  ✅ All tests passed for ${student.name}`);
        return true;

    } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        if (error.response) {
            console.log(`    - Status: ${error.response.status}`);
            console.log(`    - Data: ${JSON.stringify(error.response.data)}`);
        }
        return false;
    }
}

async function runDetailedTest() {
    console.log('🚀 Starting detailed test for representative students from each batch...\n');
    
    let successCount = 0;
    let failCount = 0;
    const results = {};

    for (let i = 0; i < testStudents.length; i++) {
        const student = testStudents[i];
        const success = await testStudentDetailed(student, i);
        
        if (success) {
            successCount++;
        } else {
            failCount++;
        }

        // Track by batch
        if (!results[student.batch]) {
            results[student.batch] = { success: 0, fail: 0 };
        }
        
        if (success) {
            results[student.batch].success++;
        } else {
            results[student.batch].fail++;
        }

        // Wait between requests to avoid rate limiting
        if (i < testStudents.length - 1) {
            console.log(`  ⏳ Waiting 3 seconds before next test...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 DETAILED TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`Total Students Tested: ${testStudents.length}`);
    console.log(`✅ Success: ${successCount} (${((successCount/testStudents.length)*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failCount} (${((failCount/testStudents.length)*100).toFixed(1)}%)`);
    console.log('');

    console.log('📊 BATCH RESULTS:');
    Object.keys(results).sort().forEach(batch => {
        const batchResult = results[batch];
        const total = batchResult.success + batchResult.fail;
        const percentage = ((batchResult.success / total) * 100).toFixed(1);
        console.log(`  Batch ${batch}: ${batchResult.success}/${total} (${percentage}%) successful`);
    });

    console.log('\n' + '='.repeat(80));
    
    if (successCount === testStudents.length) {
        console.log('🎉 ALL REPRESENTATIVE STUDENTS PASSED! System is fully functional.');
    } else {
        console.log('⚠️  Some students failed. Check individual results above.');
    }
    
    console.log('='.repeat(80));
}

runDetailedTest().catch(console.error);