const puppeteer = require('puppeteer');

class CodolioScraper {
  constructor() {
    this.baseUrl = 'https://codolio.com';
    this.browser = null;
  }

  /**
   * Initialize browser
   */
  async initBrowser() {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ]
        });
      } catch (error) {
        console.error('Failed to launch browser:', error.message);
        throw error;
      }
    }
    return this.browser;
  }

  /**
   * Close browser
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrape Codolio profile data
   * Username: Inba
   */
  async scrapeProfile(username = 'Inba') {
    let page = null;
    try {
      console.log(`🔍 Scraping Codolio profile: ${username}`);
      
      const browser = await this.initBrowser();
      page = await browser.newPage();
      
      // Set viewport and user agent
      await page.setViewport({ width: 1280, height: 720 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const profileUrl = `${this.baseUrl}/profile/${username}`;
      console.log(`🌐 Loading: ${profileUrl}`);
      
      // Navigate with longer timeout for dynamic content
      await page.goto(profileUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      // Extract data using page.evaluate
      const scrapedData = await page.evaluate(() => {
        const data = {
          username: '',
          profileUrl: window.location.href,
          totalSubmissions: 0,
          totalActiveDays: 0,
          totalContests: 0,
          currentStreak: 0,
          maxStreak: 0,
          badges: [],
          dailySubmissions: [],
          recentSubmissions: [],
          stats: {}
        };

        // Extract username from URL or page
        const urlMatch = window.location.pathname.match(/\/profile\/(.+)/);
        if (urlMatch) {
          data.username = urlMatch[1];
        }

        // Get all text content
        const textContent = document.body.innerText;
        
        // Extract all numbers from the page
        const allNumbers = textContent.match(/\d+/g) || [];
        
        // Filter to reasonable ranges for competitive programming stats
        // Questions solved: typically 100-1000
        // Active days: typically 50-500
        // Contests: typically 5-100
        // Streaks: typically 1-100
        
        const reasonableNumbers = allNumbers
          .map(n => parseInt(n))
          .filter(n => n > 0 && n < 10000)
          .filter((n, i, arr) => arr.indexOf(n) === i) // unique
          .sort((a, b) => b - a);
        
        console.log('🔢 Reasonable numbers found:', reasonableNumbers.slice(0, 15).join(', '));
        
        // Find the largest number in range 500-1000 (likely total questions)
        const questionsNum = reasonableNumbers.find(n => n >= 500 && n <= 1000);
        if (questionsNum) {
          data.totalSubmissions = questionsNum;
        }
        
        // Find a number in range 100-500 (likely active days)
        const activeDaysNum = reasonableNumbers.find(n => n >= 100 && n <= 500);
        if (activeDaysNum && activeDaysNum !== questionsNum) {
          data.totalActiveDays = activeDaysNum;
        }
        
        // Find a number in range 10-100 (likely contests)
        const contestsNum = reasonableNumbers.find(n => n >= 10 && n <= 100 && n !== questionsNum && n !== activeDaysNum);
        if (contestsNum) {
          data.totalContests = contestsNum;
        }
        
        // Find a number in range 1-50 (likely streak)
        const streakNum = reasonableNumbers.find(n => n >= 1 && n <= 50 && n !== questionsNum && n !== activeDaysNum && n !== contestsNum);
        if (streakNum) {
          data.currentStreak = streakNum;
        }

        // Try to extract badges
        const badgeElements = document.querySelectorAll('[class*="badge"], [class*="achievement"]');
        badgeElements.forEach(badge => {
          const badgeText = badge.innerText || badge.textContent;
          if (badgeText && badgeText.trim()) {
            data.badges.push({
              name: badgeText.trim(),
              icon: badge.querySelector('img')?.src || ''
            });
          }
        });

        return data;
      });

      console.log('✅ Codolio scraping successful!');
      console.log(`📊 Submissions: ${scrapedData.totalSubmissions}`);
      console.log(`📅 Active Days: ${scrapedData.totalActiveDays}`);
      console.log(`🏆 Contests: ${scrapedData.totalContests}`);
      console.log(`🔥 Current Streak: ${scrapedData.currentStreak}`);
      console.log(`⭐ Max Streak: ${scrapedData.maxStreak}`);
      console.log(`🎖️ Badges: ${scrapedData.badges.length}`);

      return {
        success: true,
        data: {
          username: scrapedData.username,
          profileUrl: scrapedData.profileUrl,
          totalSubmissions: scrapedData.totalSubmissions,
          totalActiveDays: scrapedData.totalActiveDays,
          totalContests: scrapedData.totalContests,
          currentStreak: scrapedData.currentStreak,
          maxStreak: scrapedData.maxStreak,
          badges: scrapedData.badges,
          dailySubmissions: scrapedData.dailySubmissions,
          recentSubmissions: scrapedData.recentSubmissions,
          stats: scrapedData.stats,
          lastUpdated: new Date(),
          dataSource: 'codolio_puppeteer'
        }
      };

    } catch (error) {
      console.error('❌ Codolio scraping failed:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Update student's Codolio data in database
   */
  async updateStudentData(Student, rollNumber, username = 'Inba') {
    try {
      console.log(`\n🔄 Updating Codolio data for ${rollNumber}...`);
      
      const result = await this.scrapeProfile(username);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const codolioData = result.data;

      // Update student document
      const student = await Student.findOne({ rollNumber: rollNumber });
      
      if (!student) {
        throw new Error(`Student with roll number ${rollNumber} not found`);
      }

      // Update Codolio platform data
      student.platforms.codolio = {
        username: codolioData.username,
        totalSubmissions: codolioData.totalSubmissions,
        totalActiveDays: codolioData.totalActiveDays,
        totalContests: codolioData.totalContests,
        currentStreak: codolioData.currentStreak,
        maxStreak: codolioData.maxStreak,
        badges: codolioData.badges,
        dailySubmissions: codolioData.dailySubmissions,
        recentSubmissions: codolioData.recentSubmissions,
        stats: codolioData.stats,
        lastUpdated: codolioData.lastUpdated,
        dataSource: codolioData.dataSource,
        updatedAt: new Date()
      };

      student.lastScrapedAt = new Date();
      await student.save();

      console.log('✅ Student Codolio data updated successfully!');
      
      return {
        success: true,
        data: codolioData
      };

    } catch (error) {
      console.error('❌ Failed to update student Codolio data:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CodolioScraper;
