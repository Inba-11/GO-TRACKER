require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const connectDB = require('./config/database');

/**
 * Update INBATAMIZHAN P's CodeChef data with real scraped data
 */
async function updateInbatamizhanCodeChef() {
    try {
        await connectDB();
        
        console.log('🚀 Updating INBATAMIZHAN P CodeChef data...');
        
        // Real scraped data from CodeChef profile
        const realCodeChefData = {
            username: 'kit27csbs23',
            rating: 1264,
            maxRating: 1264,
            problemsSolved: 2,
            rank: 16720,
            globalRank: 16720,
            stars: 0,
            country: 'India',
            contests: 96,
            contestsAttended: 96,
            totalContests: 96,
            lastWeekRating: 1250, // Estimated
            contestCountUpdatedAt: new Date().toISOString(),
            lastUpdated: new Date()
        };

        // Update only the CodeChef platform data
        const result = await Student.updateOne(
            { rollNumber: '711523BCB023' },
            { 
                $set: { 
                    'platforms.codechef': realCodeChefData,
                    'lastScrapedAt': new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            console.error('❌ Student INBATAMIZHAN P not found');
            return;
        }

        console.log('✅ Successfully updated INBATAMIZHAN P CodeChef data!');
        console.log('📊 Updated Data:');
        console.log(`  Rating: ${realCodeChefData.rating}`);
        console.log(`  Problems Solved: ${realCodeChefData.problemsSolved}`);
        console.log(`  Global Rank: ${realCodeChefData.globalRank}`);
        console.log(`  Country: ${realCodeChefData.country}`);
        console.log(`  Contests: ${realCodeChefData.contests}`);
        console.log(`  Last Updated: ${realCodeChefData.lastUpdated}`);

        // Verify the update
        const updatedStudent = await Student.findOne({ rollNumber: '711523BCB023' });
        console.log('\n🔍 Verification:');
        console.log(`  Current Rating: ${updatedStudent.platforms.codechef.rating}`);
        console.log(`  Current Problems: ${updatedStudent.platforms.codechef.problemsSolved}`);
        
        return realCodeChefData;

    } catch (error) {
        console.error('❌ Error updating CodeChef data:', error);
        throw error;
    }
}

// Run the update
updateInbatamizhanCodeChef()
    .then(() => {
        console.log('✅ Update completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Update failed:', error);
        process.exit(1);
    });