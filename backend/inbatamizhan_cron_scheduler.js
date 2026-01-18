/**
 * 🕐 INBATAMIZHAN P Dedicated Cron Scheduler
 * Runs enhanced scraper every 30 minutes for real-time updates
 * Specifically designed for INBATAMIZHAN P (711523BCB023)
 */

require('dotenv').config();
const cron = require('node-cron');
const { scrapeInbatamizhanCodeChefEnhanced } = require('./enhanced_inbatamizhan_scraper');

class InbatamizhanCronScheduler {
    constructor() {
        this.isRunning = false;
        this.lastRunTime = null;
        this.successCount = 0;
        this.errorCount = 0;
        this.cronJob = null;
    }

    /**
     * Start the cron scheduler
     */
    start() {
        console.log('🚀 Starting INBATAMIZHAN P Dedicated Cron Scheduler');
        console.log('⏰ Schedule: Every 3600 seconds (1 hour)');
        console.log('🎯 Target: INBATAMIZHAN P (711523BCB023)');
        console.log('📊 Enhanced scraping with contest data');
        console.log('');

        // Run every hour (3600 seconds): 0 * * * *
        this.cronJob = cron.schedule('0 * * * *', async () => {
            await this.runScraper();
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata" // Indian timezone
        });

        // Run immediately on start
        this.runScraper();

        console.log('✅ INBATAMIZHAN P Cron Scheduler started successfully!');
        console.log('🔄 Next run: Every hour (3600 seconds)');
        console.log('🌍 Timezone: Asia/Kolkata (IST)');
    }

    /**
     * Stop the cron scheduler
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            console.log('🛑 INBATAMIZHAN P Cron Scheduler stopped');
        }
    }

    /**
     * Run the scraper
     */
    async runScraper() {
        if (this.isRunning) {
            console.log('⚠️ Scraper already running, skipping this cycle');
            return;
        }

        this.isRunning = true;
        const startTime = new Date();
        
        console.log('\n🔄 INBATAMIZHAN P Auto-Scraper Started');
        console.log(`⏰ Time: ${startTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
        console.log(`🎯 Target: INBATAMIZHAN P (711523BCB023)`);
        console.log('📊 Fetching enhanced CodeChef data...');

        try {
            const result = await scrapeInbatamizhanCodeChefEnhanced();
            
            if (result.success) {
                this.successCount++;
                this.lastRunTime = startTime;
                
                console.log('✅ INBATAMIZHAN P Auto-Scraper SUCCESS!');
                console.log(`📊 Data Updated:`);
                console.log(`  • Rating: ${result.data.rating}`);
                console.log(`  • Problems: ${result.data.problemsSolved}`);
                console.log(`  • Contests: ${result.data.contests}`);
                console.log(`  • Stars: ${result.data.stars}★`);
                console.log(`  • Country: ${result.data.country}`);
                console.log(`  • League: ${result.data.league}`);
                console.log(`  • Contest List: ${result.data.contestList ? result.data.contestList.length : 0} entries`);
                
            } else {
                this.errorCount++;
                console.log('❌ INBATAMIZHAN P Auto-Scraper FAILED');
                console.log(`Error: ${result.error}`);
            }
            
        } catch (error) {
            this.errorCount++;
            console.error('💥 INBATAMIZHAN P Auto-Scraper CRITICAL ERROR:', error.message);
        } finally {
            this.isRunning = false;
            const endTime = new Date();
            const duration = endTime - startTime;
            
            console.log(`⏱️ Duration: ${duration}ms`);
            console.log(`📈 Stats: ${this.successCount} success, ${this.errorCount} errors`);
            console.log(`🔄 Next run: ${this.getNextRunTime()}`);
            console.log('🔄 INBATAMIZHAN P Auto-Scraper Completed\n');
        }
    }

    /**
     * Get next run time
     */
    getNextRunTime() {
        const now = new Date();
        const nextRun = new Date(now);
        
        // Add 1 hour (3600 seconds)
        nextRun.setHours(now.getHours() + 1);
        nextRun.setMinutes(0); // Set to the top of the hour
        
        return nextRun.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastRunTime: this.lastRunTime,
            successCount: this.successCount,
            errorCount: this.errorCount,
            nextRunTime: this.getNextRunTime(),
            uptime: this.lastRunTime ? Date.now() - this.lastRunTime.getTime() : 0
        };
    }

    /**
     * Manual trigger
     */
    async triggerManual() {
        console.log('🔧 Manual trigger requested for INBATAMIZHAN P scraper');
        await this.runScraper();
    }
}

// Create and export singleton instance
const inbatamizhanScheduler = new InbatamizhanCronScheduler();

// Auto-start if this file is run directly
if (require.main === module) {
    console.log('🚀 INBATAMIZHAN P Dedicated Cron Scheduler');
    console.log('=' .repeat(60));
    
    inbatamizhanScheduler.start();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        inbatamizhanScheduler.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        inbatamizhanScheduler.stop();
        process.exit(0);
    });
    
    // Keep process alive
    console.log('🔄 Scheduler is running. Press Ctrl+C to stop.');
}

module.exports = inbatamizhanScheduler;