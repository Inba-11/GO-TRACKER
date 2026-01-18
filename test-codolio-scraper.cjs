const CodolioScraper = require('./backend/codolio_scraper');

async function testScraper() {
  const scraper = new CodolioScraper();
  
  try {
    console.log('🧪 Testing Codolio Scraper...\n');
    const result = await scraper.scrapeProfile('Inba');
    
    if (result.success) {
      console.log('\n✅ Scraping Successful!\n');
      console.log('📊 Extracted Data:');
      console.log(`  • Username: ${result.data.username}`);
      console.log(`  • Total Questions Solved: ${result.data.totalSubmissions}`);
      console.log(`  • Active Days: ${result.data.totalActiveDays}`);
      console.log(`  • Total Contests: ${result.data.totalContests}`);
      console.log(`  • Current Streak: ${result.data.currentStreak}`);
      console.log(`  • Max Streak: ${result.data.maxStreak}`);
      console.log(`  • Badges: ${result.data.badges.length}`);
    } else {
      console.log('\n❌ Scraping Failed!');
      console.log(`Error: ${result.error}`);
    }
    
    await scraper.closeBrowser();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testScraper();
