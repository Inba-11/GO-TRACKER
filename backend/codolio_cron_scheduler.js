const cron = require('node-cron');
const mongoose = require('mongoose');
const CodolioScraper = require('./codolio_scraper');
const Student = require('./models/Student');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/go-tracker';

// Statistics
let stats = {
  totalRuns: 0,
  successfulRuns: 0,
  failedRuns: 0,
  lastRunTime: null,
  lastRunStatus: null,
  lastRunDuration: null
};

/**
 * Scrape and update Codolio data for INBATAMIZHAN P
 */
async function scrapeCodolioData() {
  const startTime = Date.now();
  console.log('\n' + '='.repeat(80));
  console.log('🚀 INBATAMIZHAN P Codolio Auto-Scraper Started');
  console.log('='.repeat(80));
  console.log(`⏰ Time: ${new Date().toLocaleString()}`);
  
  try {
    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      console.log('📡 Connecting to MongoDB...');
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✅ MongoDB Connected');
    }

    // Initialize scraper
    const scraper = new CodolioScraper();
    
    // Scrape and update data for INBATAMIZHAN P
    const rollNumber = '711523BCB023';
    const username = 'Inba';
    
    console.log(`\n🎯 Target: ${rollNumber} (${username})`);
    console.log('📊 Fetching latest Codolio data...\n');
    
    const result = await scraper.updateStudentData(Student, rollNumber, username);
    
    // Close browser after scraping
    await scraper.closeBrowser();
    
    if (result.success) {
      const duration = Date.now() - startTime;
      
      // Update statistics
      stats.totalRuns++;
      stats.successfulRuns++;
      stats.lastRunTime = new Date();
      stats.lastRunStatus = 'success';
      stats.lastRunDuration = duration;
      
      console.log('\n' + '='.repeat(80));
      console.log('✅ INBATAMIZHAN P Codolio Auto-Scraper SUCCESS!');
      console.log('='.repeat(80));
      console.log('📊 Data Updated:');
      console.log(`  • Total Submissions: ${result.data.totalSubmissions}`);
      console.log(`  • Total Active Days: ${result.data.totalActiveDays}`);
      console.log(`  • Total Contests: ${result.data.totalContests}`);
      console.log(`  • Current Streak: ${result.data.currentStreak}`);
      console.log(`  • Max Streak: ${result.data.maxStreak}`);
      console.log(`  • Badges: ${result.data.badges.length}`);
      console.log(`  • Last Updated: ${result.data.lastUpdated.toLocaleString()}`);
      console.log(`⏱️ Duration: ${duration}ms`);
      console.log(`📈 Stats: ${stats.successfulRuns} success, ${stats.failedRuns} errors`);
      
      // Calculate next run time (1 hour from now)
      const nextRun = new Date(Date.now() + 60 * 60 * 1000);
      console.log(`🔄 Next run: ${nextRun.toLocaleString()}`);
      console.log('='.repeat(80));
      
    } else {
      throw new Error(result.error);
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Update statistics
    stats.totalRuns++;
    stats.failedRuns++;
    stats.lastRunTime = new Date();
    stats.lastRunStatus = 'failed';
    stats.lastRunDuration = duration;
    
    console.error('\n' + '='.repeat(80));
    console.error('❌ INBATAMIZHAN P Codolio Auto-Scraper FAILED!');
    console.error('='.repeat(80));
    console.error('Error:', error.message);
    console.error(`⏱️ Duration: ${duration}ms`);
    console.error(`📈 Stats: ${stats.successfulRuns} success, ${stats.failedRuns} errors`);
    console.error('='.repeat(80));
  }
  
  console.log('🔄 INBATAMIZHAN P Codolio Auto-Scraper Completed\n');
}

/**
 * Initialize and start the cron scheduler
 */
async function startScheduler() {
  console.log('\n' + '╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(18) + '🚀 CODOLIO AUTO-SCRAPER SCHEDULER' + ' '.repeat(27) + '║');
  console.log('║' + ' '.repeat(20) + 'INBATAMIZHAN P (711523BCB023)' + ' '.repeat(29) + '║');
  console.log('╚' + '═'.repeat(78) + '╝\n');
  
  console.log('📋 Configuration:');
  console.log('  • Target: INBATAMIZHAN P (711523BCB023)');
  console.log('  • Username: Inba');
  console.log('  • Schedule: Every 3600 seconds (1 hour)');
  console.log('  • Cron Expression: 0 * * * * (Every hour at minute 0)');
  console.log('  • MongoDB: ' + MONGODB_URI);
  console.log('  • Data Source: Codolio (Puppeteer)');
  console.log('  • Browser: Headless Chrome');
  console.log('');
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected Successfully!\n');
    
    // Run immediately on startup
    console.log('🎬 Running initial scrape...\n');
    await scrapeCodolioData();
    
    // Schedule cron job to run every hour (3600 seconds)
    console.log('\n⏰ Scheduling cron job...');
    cron.schedule('0 * * * *', async () => {
      await scrapeCodolioData();
    });
    
    console.log('✅ Cron job scheduled successfully!');
    console.log('📅 Will run every hour (3600 seconds)');
    console.log('🔄 Scheduler is now running...\n');
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Shutting down Codolio scheduler...');
      console.log('📊 Final Statistics:');
      console.log(`  • Total Runs: ${stats.totalRuns}`);
      console.log(`  • Successful: ${stats.successfulRuns}`);
      console.log(`  • Failed: ${stats.failedRuns}`);
      console.log(`  • Success Rate: ${stats.totalRuns > 0 ? Math.round((stats.successfulRuns / stats.totalRuns) * 100) : 0}%`);
      
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      console.log('👋 Goodbye!\n');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start scheduler:', error.message);
    process.exit(1);
  }
}

// Start the scheduler
startScheduler();

// Export for testing
module.exports = {
  scrapeCodolioData,
  stats
};
