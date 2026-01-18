const axios = require('axios');
const cheerio = require('cheerio');

class CodeforcesScraper {
  constructor() {
    this.baseUrl = 'https://codeforces.com';
    this.apiUrl = 'https://codeforces.com/api';
  }

  /**
   * Scrape Codeforces profile data for INBATAMIZHAN P
   * Username: Inba_tamizh
   */
  async scrapeProfile(username = 'Inba_tamizh') {
    try {
      console.log(`🔍 Scraping Codeforces profile: ${username}`);
      
      // Get user info from API
      const userInfo = await this.getUserInfo(username);
      const userStatus = await this.getUserStatus(username);
      const userRating = await this.getUserRating(username);
      
      // Calculate problems solved
      const problemsSolved = this.calculateProblemsSolved(userStatus);
      
      const scrapedData = {
        username: username,
        profileUrl: `https://codeforces.com/profile/${username}`,
        
        // Rating data
        rating: userInfo.rating || 0,
        maxRating: userInfo.maxRating || 0,
        rank: userInfo.rank || 'unrated',
        maxRank: userInfo.maxRank || 'unrated',
        
        // Problems and submissions
        totalSolved: problemsSolved.total,
        totalSubmissions: userStatus.length,
        acceptedSubmissions: problemsSolved.accepted,
        
        // Contest data
        contestsAttended: userRating.length,
        recentContests: userRating.slice(-5).reverse().map(contest => ({
          contestId: contest.contestId,
          contestName: contest.contestName,
          rank: contest.rank,
          oldRating: contest.oldRating,
          newRating: contest.newRating,
          ratingChange: contest.newRating - contest.oldRating
        })),
        
        // Recent submissions
        recentSubmissions: userStatus.slice(0, 10).map(sub => ({
          problem: `${sub.problem.contestId}${sub.problem.index} - ${sub.problem.name}`,
          verdict: sub.verdict,
          language: sub.programmingLanguage,
          timestamp: new Date(sub.creationTimeSeconds * 1000)
        })),
        
        // Additional stats
        ratingChangeLastContest: userRating.length > 0 ? 
          userRating[userRating.length - 1].newRating - userRating[userRating.length - 1].oldRating : 0,
        avgProblemRating: this.calculateAvgProblemRating(userStatus),
        recentSolved: problemsSolved.recentSolved,
        
        // User details
        country: userInfo.country || '',
        city: userInfo.city || '',
        organization: userInfo.organization || '',
        contribution: userInfo.contribution || 0,
        friendOfCount: userInfo.friendOfCount || 0,
        lastOnlineTime: userInfo.lastOnlineTimeSeconds ? 
          new Date(userInfo.lastOnlineTimeSeconds * 1000) : null,
        registrationTime: userInfo.registrationTimeSeconds ? 
          new Date(userInfo.registrationTimeSeconds * 1000) : null,
        
        // Metadata
        lastUpdated: new Date(),
        dataSource: 'codeforces_api'
      };
      
      console.log('✅ Codeforces scraping successful!');
      console.log(`📊 Rating: ${scrapedData.rating}, Max: ${scrapedData.maxRating}`);
      console.log(`🏆 Rank: ${scrapedData.rank}, Problems: ${scrapedData.totalSolved}`);
      console.log(`📝 Contests: ${scrapedData.contestsAttended}, Submissions: ${scrapedData.totalSubmissions}`);
      
      return {
        success: true,
        data: scrapedData
      };
      
    } catch (error) {
      console.error('❌ Codeforces scraping failed:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Get user info from Codeforces API
   */
  async getUserInfo(username) {
    try {
      const response = await axios.get(`${this.apiUrl}/user.info`, {
        params: { handles: username },
        timeout: 10000
      });

      if (response.data.status === 'OK' && response.data.result.length > 0) {
        return response.data.result[0];
      }
      
      throw new Error('User not found');
    } catch (error) {
      console.error('Error fetching user info:', error.message);
      return {};
    }
  }

  /**
   * Get user submission status
   */
  async getUserStatus(username) {
    try {
      const response = await axios.get(`${this.apiUrl}/user.status`, {
        params: { 
          handle: username,
          from: 1,
          count: 1000 // Get last 1000 submissions
        },
        timeout: 15000
      });

      if (response.data.status === 'OK') {
        return response.data.result;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user status:', error.message);
      return [];
    }
  }

  /**
   * Get user rating history
   */
  async getUserRating(username) {
    try {
      const response = await axios.get(`${this.apiUrl}/user.rating`, {
        params: { handle: username },
        timeout: 10000
      });

      if (response.data.status === 'OK') {
        return response.data.result;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user rating:', error.message);
      return [];
    }
  }

  /**
   * Calculate problems solved from submissions
   */
  calculateProblemsSolved(submissions) {
    const solvedProblems = new Set();
    const recentSolved = new Set();
    let acceptedCount = 0;
    
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    submissions.forEach(sub => {
      if (sub.verdict === 'OK') {
        const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
        solvedProblems.add(problemId);
        acceptedCount++;
        
        // Check if solved in last week
        const subTime = sub.creationTimeSeconds * 1000;
        if (subTime >= oneWeekAgo) {
          recentSolved.add(problemId);
        }
      }
    });
    
    return {
      total: solvedProblems.size,
      accepted: acceptedCount,
      recentSolved: recentSolved.size
    };
  }

  /**
   * Calculate average problem rating
   */
  calculateAvgProblemRating(submissions) {
    const solvedProblems = new Map();
    
    submissions.forEach(sub => {
      if (sub.verdict === 'OK' && sub.problem.rating) {
        const problemId = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solvedProblems.has(problemId)) {
          solvedProblems.set(problemId, sub.problem.rating);
        }
      }
    });
    
    if (solvedProblems.size === 0) return 0;
    
    const totalRating = Array.from(solvedProblems.values()).reduce((sum, rating) => sum + rating, 0);
    return Math.round(totalRating / solvedProblems.size);
  }

  /**
   * Update student's Codeforces data in database
   */
  async updateStudentData(Student, rollNumber, username = 'Inba_tamizh') {
    try {
      console.log(`\n🔄 Updating Codeforces data for ${rollNumber}...`);
      
      const result = await this.scrapeProfile(username);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const codeforcesData = result.data;

      // Update student document
      const student = await Student.findOne({ rollNumber: rollNumber });
      
      if (!student) {
        throw new Error(`Student with roll number ${rollNumber} not found`);
      }

      // Update Codeforces platform data
      student.platforms.codeforces = {
        username: codeforcesData.username,
        rating: codeforcesData.rating,
        maxRating: codeforcesData.maxRating,
        rank: codeforcesData.rank,
        maxRank: codeforcesData.maxRank,
        problemsSolved: codeforcesData.totalSolved,
        totalSolved: codeforcesData.totalSolved,
        totalSubmissions: codeforcesData.totalSubmissions,
        acceptedSubmissions: codeforcesData.acceptedSubmissions,
        contestsAttended: codeforcesData.contestsAttended,
        recentContests: codeforcesData.recentContests,
        ratingChangeLastContest: codeforcesData.ratingChangeLastContest,
        avgProblemRating: codeforcesData.avgProblemRating,
        recentSubmissions: codeforcesData.recentSubmissions,
        recentSolved: codeforcesData.recentSolved,
        country: codeforcesData.country,
        city: codeforcesData.city,
        organization: codeforcesData.organization,
        contribution: codeforcesData.contribution,
        friendOfCount: codeforcesData.friendOfCount,
        lastOnlineTime: codeforcesData.lastOnlineTime,
        registrationTime: codeforcesData.registrationTime,
        lastUpdated: codeforcesData.lastUpdated,
        dataSource: codeforcesData.dataSource,
        updatedAt: new Date()
      };

      student.lastScrapedAt = new Date();
      await student.save();

      console.log('✅ Student Codeforces data updated successfully!');
      
      return {
        success: true,
        data: codeforcesData
      };

    } catch (error) {
      console.error('❌ Failed to update student Codeforces data:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CodeforcesScraper;
