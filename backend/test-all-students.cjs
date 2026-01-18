require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// All 63 students data
const students = [
    { name: "AADHAM SHARIEF A", rollNumber: "711523BCB001", email: "711523bcb001@student.edu", batch: "B" },
    { name: "AARTHI V", rollNumber: "711523BCB002", email: "711523bcb002@student.edu", batch: "C" },
    { name: "ABINAYA R", rollNumber: "711523BCB003", email: "711523bcb003@student.edu", batch: "C" },
    { name: "ABINAYA R", rollNumber: "711523BCB004", email: "711523bcb004@student.edu", batch: "C" },
    { name: "AHAMED AMMAR O A", rollNumber: "711523BCB005", email: "711523bcb005@student.edu", batch: "A" },
    { name: "AKSHAI KANNAA MB", rollNumber: "711523BCB006", email: "711523bcb006@student.edu", batch: "B" },
    { name: "ALFRED ANTONY M", rollNumber: "711523BCB007", email: "711523bcb007@student.edu", batch: "D" },
    { name: "ANANDHAKUMAR S", rollNumber: "711523BCB008", email: "711523bcb008@student.edu", batch: "D" },
    { name: "ARJUN V B", rollNumber: "711523BCB009", email: "711523bcb009@student.edu", batch: "D" },
    { name: "ARUNA T", rollNumber: "711523BCB010", email: "711523bcb010@student.edu", batch: "C" },
    { name: "AYISHATHUL HAZEENA S", rollNumber: "711523BCB011", email: "711523bcb011@student.edu", batch: "A" },
    { name: "DELHI KRISHNAN S", rollNumber: "711523BCB012", email: "711523bcb012@student.edu", batch: "D" },
    { name: "DEVANYA N", rollNumber: "711523BCB013", email: "711523bcb013@student.edu", batch: "B" },
    { name: "DHIVAKAR S", rollNumber: "711523BCB014", email: "711523bcb014@student.edu", batch: "C" },
    { name: "DINESH S", rollNumber: "711523BCB015", email: "711523bcb015@student.edu", batch: "A" },
    { name: "DIVYADHARSHINI M", rollNumber: "711523BCB016", email: "711523bcb016@student.edu", batch: "A" },
    { name: "DURGA S", rollNumber: "711523BCB017", email: "711523bcb017@student.edu", batch: "C" },
    { name: "GITHENDRAN K", rollNumber: "711523BCB018", email: "711523bcb018@student.edu", batch: "C" },
    { name: "GOWSIKA S A", rollNumber: "711523BCB019", email: "711523bcb019@student.edu", batch: "A" },
    { name: "HARISH S", rollNumber: "711523BCB020", email: "711523bcb020@student.edu", batch: "C" },
    { name: "HARIVARSHA C S", rollNumber: "711523BCB021", email: "711523bcb021@student.edu", batch: "D" },
    { name: "INBATAMIZHAN P", rollNumber: "711523BCB023", email: "711523bcb023@student.edu", batch: "C" },
    { name: "JEGAN S", rollNumber: "711523BCB024", email: "711523bcb024@student.edu", batch: "C" },
    { name: "JENCY IRIN J", rollNumber: "711523BCB025", email: "711523bcb025@student.edu", batch: "B" },
    { name: "JOEL G", rollNumber: "711523BCB026", email: "711523bcb026@student.edu", batch: "C" },
    { name: "KASTHURI S", rollNumber: "711523BCB028", email: "711523bcb028@student.edu", batch: "C" },
    { name: "KAVIYA K", rollNumber: "711523BCB029", email: "711523bcb029@student.edu", batch: "D" },
    { name: "KOWSALYA S", rollNumber: "711523BCB030", email: "711523bcb030@student.edu", batch: "B" },
    { name: "LAKSHANA S", rollNumber: "711523BCB031", email: "711523bcb031@student.edu", batch: "A" },
    { name: "LOURDU SATHISH J", rollNumber: "711523BCB032", email: "711523bcb032@student.edu", batch: "D" },
    { name: "MAHA LAKSHMI M", rollNumber: "711523BCB033", email: "711523bcb033@student.edu", batch: "C" },
    { name: "MAHESHWARI D", rollNumber: "711523BCB034", email: "711523bcb034@student.edu", batch: "B" },
    { name: "MANO NIKILA R", rollNumber: "711523BCB035", email: "711523bcb035@student.edu", batch: "B" },
    { name: "MOHAMMED SYFUDEEN S", rollNumber: "711523BCB036", email: "711523bcb036@student.edu", batch: "C" },
    { name: "MONISHA G", rollNumber: "711523BCB037", email: "711523bcb037@student.edu", batch: "C" },
    { name: "NISHANTH S", rollNumber: "711523BCB038", email: "711523bcb038@student.edu", batch: "C" },
    { name: "NIVED V PUTHEN PURAKKAL", rollNumber: "711523BCB039", email: "711523bcb039@student.edu", batch: "B" },
    { name: "PRADEEPA P", rollNumber: "711523BCB040", email: "711523bcb040@student.edu", batch: "D" },
    { name: "PRAKASH B", rollNumber: "711523BCB041", email: "711523bcb041@student.edu", batch: "A" },
    { name: "PRAVIN M", rollNumber: "711523BCB042", email: "711523bcb042@student.edu", batch: "D" },
    { name: "RAGAVI A", rollNumber: "711523BCB043", email: "711523bcb043@student.edu", batch: "B" },
    { name: "RAJA S", rollNumber: "711523BCB044", email: "711523bcb044@student.edu", batch: "D" },
    { name: "RAJADURAI R", rollNumber: "711523BCB045", email: "711523bcb045@student.edu", batch: "A" },
    { name: "RISHI ADHINARAYAN V", rollNumber: "711523BCB046", email: "711523bcb046@student.edu", batch: "NON-CRT" },
    { name: "ROBERT MITHRAN", rollNumber: "711523BCB047", email: "711523bcb047@student.edu", batch: "A" },
    { name: "RUDRESH M", rollNumber: "711523BCB048", email: "711523bcb048@student.edu", batch: "NON-CRT" },
    { name: "SABARI YUHENDHRAN M", rollNumber: "711523BCB049", email: "711523bcb049@student.edu", batch: "A" },
    { name: "SADHANA M", rollNumber: "711523BCB050", email: "711523bcb050@student.edu", batch: "D" },
    { name: "SANJAY N", rollNumber: "711523BCB051", email: "711523bcb051@student.edu", batch: "D" },
    { name: "SARAN G", rollNumber: "711523BCB052", email: "711523bcb052@student.edu", batch: "D" },
    { name: "SHANMUGAPRIYA P", rollNumber: "711523BCB053", email: "711523bcb053@student.edu", batch: "C" },
    { name: "SHARVESH L", rollNumber: "711523BCB054", email: "711523bcb054@student.edu", batch: "A" },
    { name: "SOBHIKA P M", rollNumber: "711523BCB055", email: "711523bcb055@student.edu", batch: "A" },
    { name: "SOWMIYA S R", rollNumber: "711523BCB056", email: "711523bcb056@student.edu", batch: "A" },
    { name: "SWATHI K", rollNumber: "711523BCB057", email: "711523bcb057@student.edu", batch: "C" },
    { name: "THIRUMAL T", rollNumber: "711523BCB058", email: "711523bcb058@student.edu", batch: "B" },
    { name: "VIGNESHKUMAR N", rollNumber: "711523BCB059", email: "711523bcb059@student.edu", batch: "D" },
    { name: "VIKRAM S", rollNumber: "711523BCB060", email: "711523bcb060@student.edu", batch: "B" },
    { name: "VISHWA J", rollNumber: "711523BCB061", email: "711523bcb061@student.edu", batch: "D" },
    { name: "YOGANAYAHI M", rollNumber: "711523BCB063", email: "711523bcb063@student.edu", batch: "C" },
    { name: "CHANDRAN M", rollNumber: "711523BCB302", email: "711523bcb302@student.edu", batch: "D" },
    { name: "NISHANTH M", rollNumber: "711523BCB304", email: "711523bcb304@student.edu", batch: "D" },
    { name: "HARTHI S", rollNumber: "71153BCB022", email: "71153bcb022@student.edu", batch: "NON-CRT" }
];

// Test results tracking
const results = {
    total: students.length,
    loginSuccess: 0,
    loginFailed: 0,
    authSuccess: 0,
    authFailed: 0,
    apiSuccess: 0,
    apiFailed: 0,
    failedStudents: []
};

// Test individual student
async function testStudent(student, index) {
    console.log(`\n[${index + 1}/63] Testing ${student.name} (${student.rollNumber})`);
    
    const testResult = {
        name: student.name,
        rollNumber: student.rollNumber,
        login: false,
        auth: false,
        api: false,
        errors: []
    };

    try {
        // 1. Test Login (Authentication)
        console.log(`  🔐 Testing login...`);
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            identifier: student.rollNumber,
            password: student.rollNumber,
            role: 'student'
        });

        if (loginResponse.data.success && loginResponse.data.token) {
            testResult.login = true;
            results.loginSuccess++;
            console.log(`  ✅ Login successful`);

            const token = loginResponse.data.token;
            const userId = loginResponse.data.user.id;

            // 2. Test Authorization (Token validation)
            console.log(`  🛡️  Testing authorization...`);
            const authResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (authResponse.data.success && authResponse.data.data.user.role === 'student') {
                testResult.auth = true;
                results.authSuccess++;
                console.log(`  ✅ Authorization successful`);

                // 3. Test API Integration (Protected endpoints)
                console.log(`  🌐 Testing API integration...`);
                
                // Test student profile endpoint
                const profileResponse = await axios.get(`${API_BASE_URL}/students/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Test student by roll number endpoint
                const rollResponse = await axios.get(`${API_BASE_URL}/students/roll/${student.rollNumber}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (profileResponse.data.success && rollResponse.data.success) {
                    testResult.api = true;
                    results.apiSuccess++;
                    console.log(`  ✅ API integration successful`);
                    
                    // Verify data integrity
                    const profileData = profileResponse.data.data;
                    const rollData = rollResponse.data.data;
                    
                    if (profileData.rollNumber === student.rollNumber && 
                        rollData.rollNumber === student.rollNumber &&
                        profileData.platforms && rollData.platforms) {
                        console.log(`  ✅ Data integrity verified`);
                    } else {
                        testResult.errors.push('Data integrity check failed');
                    }
                } else {
                    testResult.errors.push('API endpoints failed');
                    results.apiFailed++;
                }
            } else {
                testResult.errors.push('Authorization failed');
                results.authFailed++;
            }
        } else {
            testResult.errors.push('Login failed');
            results.loginFailed++;
        }
    } catch (error) {
        testResult.errors.push(`Error: ${error.message}`);
        if (!testResult.login) results.loginFailed++;
        if (!testResult.auth) results.authFailed++;
        if (!testResult.api) results.apiFailed++;
        console.log(`  ❌ Error: ${error.message}`);
    }

    // Track failed students
    if (!testResult.login || !testResult.auth || !testResult.api) {
        results.failedStudents.push(testResult);
    }

    return testResult;
}

// Main test function
async function testAllStudents() {
    console.log('🚀 Starting comprehensive test for all 63 students...\n');
    console.log('Testing: Login → Authorization → API Integration\n');

    const startTime = Date.now();
    const testResults = [];

    // Test students in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < students.length; i += batchSize) {
        const batch = students.slice(i, i + batchSize);
        const batchPromises = batch.map((student, batchIndex) => 
            testStudent(student, i + batchIndex)
        );
        
        const batchResults = await Promise.all(batchPromises);
        testResults.push(...batchResults);
        
        // Small delay between batches
        if (i + batchSize < students.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Generate comprehensive report
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`Total Students Tested: ${results.total}`);
    console.log(`Test Duration: ${duration} seconds`);
    console.log('');
    
    console.log('🔐 LOGIN (Authentication):');
    console.log(`  ✅ Success: ${results.loginSuccess}/${results.total} (${((results.loginSuccess/results.total)*100).toFixed(1)}%)`);
    console.log(`  ❌ Failed:  ${results.loginFailed}/${results.total} (${((results.loginFailed/results.total)*100).toFixed(1)}%)`);
    console.log('');
    
    console.log('🛡️  AUTHORIZATION (Token Validation):');
    console.log(`  ✅ Success: ${results.authSuccess}/${results.total} (${((results.authSuccess/results.total)*100).toFixed(1)}%)`);
    console.log(`  ❌ Failed:  ${results.authFailed}/${results.total} (${((results.authFailed/results.total)*100).toFixed(1)}%)`);
    console.log('');
    
    console.log('🌐 API INTEGRATION (Protected Endpoints):');
    console.log(`  ✅ Success: ${results.apiSuccess}/${results.total} (${((results.apiSuccess/results.total)*100).toFixed(1)}%)`);
    console.log(`  ❌ Failed:  ${results.apiFailed}/${results.total} (${((results.apiFailed/results.total)*100).toFixed(1)}%)`);
    console.log('');

    // Batch distribution analysis
    const batchStats = {};
    students.forEach(student => {
        if (!batchStats[student.batch]) {
            batchStats[student.batch] = { total: 0, tested: 0 };
        }
        batchStats[student.batch].total++;
    });

    testResults.forEach(result => {
        const student = students.find(s => s.rollNumber === result.rollNumber);
        if (result.login && result.auth && result.api) {
            batchStats[student.batch].tested++;
        }
    });

    console.log('📊 BATCH DISTRIBUTION:');
    Object.keys(batchStats).sort().forEach(batch => {
        const stats = batchStats[batch];
        const percentage = ((stats.tested / stats.total) * 100).toFixed(1);
        console.log(`  Batch ${batch}: ${stats.tested}/${stats.total} (${percentage}%) students fully functional`);
    });
    console.log('');

    // Failed students details
    if (results.failedStudents.length > 0) {
        console.log('❌ FAILED STUDENTS:');
        results.failedStudents.forEach(student => {
            console.log(`  ${student.name} (${student.rollNumber}):`);
            console.log(`    Login: ${student.login ? '✅' : '❌'} | Auth: ${student.auth ? '✅' : '❌'} | API: ${student.api ? '✅' : '❌'}`);
            if (student.errors.length > 0) {
                console.log(`    Errors: ${student.errors.join(', ')}`);
            }
        });
    } else {
        console.log('🎉 ALL STUDENTS PASSED ALL TESTS!');
    }

    console.log('\n' + '='.repeat(80));
    
    const overallSuccess = results.loginSuccess === results.total && 
                          results.authSuccess === results.total && 
                          results.apiSuccess === results.total;
    
    if (overallSuccess) {
        console.log('🎉 OVERALL RESULT: ALL 63 STUDENTS FULLY INTEGRATED ✅');
    } else {
        console.log('⚠️  OVERALL RESULT: SOME INTEGRATION ISSUES DETECTED ❌');
    }
    
    console.log('='.repeat(80));
}

// Run the test
testAllStudents().catch(console.error);