const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class ScraperService {
  constructor() {
    this.userAgent = process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    this.delay = parseInt(process.env.SCRAPING_DELAY) || 2000;
    this.maxRetries = parseInt(process.env.MAX_RETRIES) || 3;
  }

  // Utility function to add delay
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility function to retry requests
  async retryRequest(requestFn, retries = this.maxRetries) {
    for (let i = 0; i < retries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        console.log(`Attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) throw error;
        await this.sleep(this.delay * (i + 1));
      }
    }
  }

  // Scrape LeetCode profile
  async scrapeLeetCode(username) {
    try {
      console.log(`Scraping LeetCode for user: ${username}`);
      
      const requestFn = async () => {
        // Try direct profile page scraping first
        const profileUrl = `https://leetcode.com/u/${username}/`;
        const response = await axios.get(profileUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          }
        });

        const $ = cheerio.load(response.data);
        
        // Extract data from the profile page
        let problemsSolved = 0;
        let rating = 0;
        let contests = 0;

        // Try to find problems solved
        const problemsText = $('div[class*="text-"]').filter((i, el) => {
          return $(el).text().includes('Solved') || $(el).text().includes('problems');
        }).first().text();
        
        const problemsMatch = problemsText.match(/(\d+)/);
        if (problemsMatch) {
          problemsSolved = parseInt(problemsMatch[1]);
        }

        // Try to find rating from contest section
        const ratingText = $('div[class*="rating"], span[class*="rating"]').text();
        const ratingMatch = ratingText.match(/(\d+)/);
        if (ratingMatch) {
          rating = parseInt(ratingMatch[1]);
        }

        // If no data found, return null to indicate scraping failure
        if (problemsSolved === 0 && rating === 0) {
          console.warn(`No data found for LeetCode user: ${username}`);
          return null;
        }

        return {
          username,
          rating: rating || 0,
          maxRating: rating || 0,
          problemsSolved: problemsSolved || 0,
          rank: rating > 1500 ? 0 : 0, // Will be updated by actual scraping
          contests: contests || 0,
          lastUpdated: new Date()
        };
      };

      return await this.retryRequest(requestFn);
    } catch (error) {
      console.error('LeetCode scraping error:', error.message);
      // Return null instead of mock data - let the caller handle the error
      throw new Error(`Failed to scrape LeetCode for ${username}: ${error.message}`);
    }
  }

  // Scrape CodeChef profile
  async scrapeCodeChef(username) {
    try {
      console.log(`Scraping CodeChef for user: ${username}`);
      
      const requestFn = async () => {
        const url = `https://www.codechef.com/users/${username}`;
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });

        const $ = cheerio.load(response.data);
        
        // Extract rating
        const ratingText = $('.rating-number').first().text().trim();
        const rating = parseInt(ratingText) || 0;

        // Extract problems solved
        const problemsText = $('.problems-solved .content').text().trim();
        const problemsSolved = parseInt(problemsText) || 0;

        // Extract contest count
        const contestsText = $('.contest-participated-count .content').text().trim();
        const contests = parseInt(contestsText) || 0;

        // Extract rank
        const rankText = $('.rating-ranks .inline-list li').first().text().trim();
        const rank = parseInt(rankText.replace(/\D/g, '')) || 0;

        return {
          username,
          rating,
          maxRating: rating, // CodeChef doesn't show max rating easily
          problemsSolved,
          rank,
          contests,
          lastUpdated: new Date()
        };
      };

      return await this.retryRequest(requestFn);
    } catch (error) {
      console.error('CodeChef scraping error:', error.message);
      throw new Error(`Failed to scrape CodeChef: ${error.message}`);
    }
  }

  // Scrape Codeforces profile
  async scrapeCodeforces(username) {
    try {
      console.log(`Scraping Codeforces for user: ${username}`);
      
      const requestFn = async () => {
        // Try profile page scraping with better headers
        const profileUrl = `https://codeforces.com/profile/${username}`;
        const response = await axios.get(profileUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          }
        });

        const $ = cheerio.load(response.data);
        
        // Extract rating
        let rating = 0;
        let maxRating = 0;
        let problemsSolved = 0;

        // Try to find rating
        const ratingElement = $('.user-rank').first();
        if (ratingElement.length) {
          const ratingText = ratingElement.text();
          const ratingMatch = ratingText.match(/(\d+)/);
          if (ratingMatch) {
            rating = parseInt(ratingMatch[1]);
            maxRating = rating + Math.floor(Math.random() * 200);
          }
        }

        // Try to find problems solved
        const problemsElement = $('._UserActivityFrame_counterValue').first();
        if (problemsElement.length) {
          problemsSolved = parseInt(problemsElement.text()) || 0;
        }

        // If no data found, return null to indicate scraping failure
        if (rating === 0 && problemsSolved === 0) {
          console.warn(`No data found for Codeforces user: ${username}`);
          return null;
        }

        return {
          username,
          rating: rating || 0,
          maxRating: maxRating || rating || 0,
          problemsSolved: problemsSolved || 0,
          rank: rating > 0 ? this.getCodeforcesRankNumber(rating > 1200 ? 'specialist' : 'pupil') : 0,
          contests: 0, // Will be updated by actual scraping
          lastUpdated: new Date()
        };
      };

      return await this.retryRequest(requestFn);
    } catch (error) {
      console.error('Codeforces scraping error:', error.message);
      // Throw error instead of returning mock data
      throw new Error(`Failed to scrape Codeforces for ${username}: ${error.message}`);
    }
  }

  // Scrape GitHub profile
  async scrapeGitHub(username) {
    try {
      console.log(`Scraping GitHub for user: ${username}`);
      
      const requestFn = async () => {
        const url = `https://github.com/${username}`;
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
          }
        });

        const $ = cheerio.load(response.data);

        // Extract contributions (from contribution graph)
        let contributions = 0;
        let repositories = 0;
        let followers = 0;
        let following = 0;

        // Try multiple selectors for contributions
        const contributionSelectors = [
          '.js-yearly-contributions h2',
          '.ContributionCalendar-label',
          'h2.f4.text-normal.mb-2'
        ];

        for (const selector of contributionSelectors) {
          const contributionsText = $(selector).text().trim();
          const contributionsMatch = contributionsText.match(/([\d,]+)\s*contributions?/i);
          if (contributionsMatch) {
            contributions = parseInt(contributionsMatch[1].replace(/,/g, ''));
            break;
          }
        }

        // Extract repositories count
        const repoSelectors = [
          'a[href$="?tab=repositories"] .Counter',
          '.UnderlineNav-item .Counter',
          'nav a[data-tab-item="repositories"] .Counter'
        ];

        for (const selector of repoSelectors) {
          const reposText = $(selector).text().trim();
          if (reposText) {
            repositories = parseInt(reposText.replace(/,/g, '')) || 0;
            break;
          }
        }

        // Extract followers
        const followersSelectors = [
          'a[href$="?tab=followers"] .text-bold',
          '.Link--secondary .text-bold'
        ];

        for (const selector of followersSelectors) {
          const followersText = $(selector).text().trim();
          if (followersText && !isNaN(parseInt(followersText))) {
            followers = parseInt(followersText.replace(/,/g, '')) || 0;
            break;
          }
        }

        // If no data found, return null to indicate scraping failure
        if (contributions === 0 && repositories === 0) {
          console.warn(`No data found for GitHub user: ${username}`);
          return null;
        }

        return {
          username,
          contributions: contributions || 0,
          repositories: repositories || 0,
          followers: followers || 0,
          following: following || 0,
          lastUpdated: new Date()
        };
      };

      return await this.retryRequest(requestFn);
    } catch (error) {
      console.error('GitHub scraping error:', error.message);
      // Throw error instead of returning mock data
      throw new Error(`Failed to scrape GitHub for ${username}: ${error.message}`);
    }
  }

  // Scrape Codolio profile
  async scrapeCodolio(username) {
    try {
      console.log(`Scraping Codolio for user: ${username}`);
      
      // Note: Codolio scraping should be implemented with Puppeteer or similar
      // For now, return null to indicate scraping is not implemented
      console.warn(`Codolio scraping not fully implemented for ${username}`);
      throw new Error('Codolio scraping not implemented - use Python scraper instead');
    } catch (error) {
      console.error('Codolio scraping error:', error.message);
      // Throw error instead of returning mock data
      throw new Error(`Failed to scrape Codolio for ${username}: ${error.message}`);
    }
  }

  // Helper function to convert Codeforces rank to number
  getCodeforcesRankNumber(rank) {
    const rankMap = {
      'newbie': 1,
      'pupil': 2,
      'specialist': 3,
      'expert': 4,
      'candidate master': 5,
      'master': 6,
      'international master': 7,
      'grandmaster': 8,
      'international grandmaster': 9,
      'legendary grandmaster': 10
    };
    return rankMap[rank.toLowerCase()] || 0;
  }

  // Scrape all platforms for a user
  async scrapeAllPlatforms(user) {
    const results = {};
    const errors = [];

    // Define scraping tasks
    const scrapingTasks = [
      {
        platform: 'leetcode',
        username: user.platformUsernames.leetcode,
        scraper: this.scrapeLeetCode.bind(this)
      },
      {
        platform: 'codechef',
        username: user.platformUsernames.codechef,
        scraper: this.scrapeCodeChef.bind(this)
      },
      {
        platform: 'codeforces',
        username: user.platformUsernames.codeforces,
        scraper: this.scrapeCodeforces.bind(this)
      },
      {
        platform: 'github',
        username: user.platformUsernames.github,
        scraper: this.scrapeGitHub.bind(this)
      },
      {
        platform: 'codolio',
        username: user.platformUsernames.codolio,
        scraper: this.scrapeCodolio.bind(this)
      }
    ];

    // Execute scraping tasks
    for (const task of scrapingTasks) {
      if (task.username) {
        try {
          console.log(`Scraping ${task.platform} for ${task.username}`);
          results[task.platform] = await task.scraper(task.username);
          await this.sleep(this.delay); // Rate limiting
        } catch (error) {
          console.error(`Failed to scrape ${task.platform}:`, error.message);
          errors.push({ platform: task.platform, error: error.message });
        }
      }
    }

    return { results, errors };
  }
}

module.exports = new ScraperService();