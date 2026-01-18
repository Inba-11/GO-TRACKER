const axios = require('axios');
const cheerio = require('cheerio');

class LeetCodeScraper {
  constructor() {
    this.baseUrl = 'https://leetcode.com';
    this.graphqlUrl = 'https://leetcode.com/graphql';
  }

  /**
   * Scrape LeetCode profile data for INBATAMIZHAN P
   * Username: inbatamizh
   */
  async scrapeProfile(username = 'inbatamizh') {
    try {
      console.log(`🔍 Scraping LeetCode profile: ${username}`);
      
      // Get user profile data using GraphQL API
      const profileData = await this.getUserProfile(username);
      const contestData = await this.getUserContestData(username);
      const submissionStats = await this.getSubmissionStats(username);
      
      const scrapedData = {
        username: username,
        profileUrl: `https://leetcode.com/u/${username}/`,
        
        // Problems solved
        problemsSolved: profileData.submitStats?.acSubmissionNum?.[0]?.count || 0,
        easySolved: profileData.submitStats?.acSubmissionNum?.[1]?.count || 0,
        mediumSolved: profileData.submitStats?.acSubmissionNum?.[2]?.count || 0,
        hardSolved: profileData.submitStats?.acSubmissionNum?.[3]?.count || 0,
        
        // Contest data
        rating: Math.round(contestData.userContestRanking?.rating || 0),
        maxRating: Math.round(contestData.userContestRanking?.topPercentage || 0),
        contestsAttended: contestData.userContestRanking?.attendedContestsCount || 0,
        globalRank: contestData.userContestRanking?.globalRanking || 0,
        
        // Additional stats
        totalSubmissions: submissionStats.totalSubmissions || 0,
        acceptanceRate: submissionStats.acceptanceRate || 0,
        ranking: profileData.profile?.ranking || 0,
        reputation: profileData.profile?.reputation || 0,
        
        // Badges and achievements
        badges: profileData.badges || [],
        activeBadge: profileData.activeBadge || null,
        
        // Recent submissions
        recentSubmissions: submissionStats.recentSubmissions || [],
        
        // Metadata
        lastUpdated: new Date(),
        dataSource: 'leetcode_graphql'
      };
      
      console.log('✅ LeetCode scraping successful!');
      console.log(`📊 Problems: ${scrapedData.problemsSolved} (E:${scrapedData.easySolved}, M:${scrapedData.mediumSolved}, H:${scrapedData.hardSolved})`);
      console.log(`🏆 Rating: ${scrapedData.rating}, Contests: ${scrapedData.contestsAttended}`);
      
      return {
        success: true,
        data: scrapedData
      };
      
    } catch (error) {
      console.error('❌ LeetCode scraping failed:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Get user profile data using GraphQL
   */
  async getUserProfile(username) {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
            reputation
            starRating
            realName
            aboutMe
            userAvatar
            location
            skillTags
            websites
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
            totalSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          badges {
            id
            displayName
            icon
            creationDate
          }
          activeBadge {
            id
            displayName
            icon
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        this.graphqlUrl,
        {
          query: query,
          variables: { username: username }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      return response.data.data.matchedUser || {};
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      return {};
    }
  }

  /**
   * Get user contest ranking data
   */
  async getUserContestData(username) {
    const query = `
      query userContestRankingInfo($username: String!) {
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
          badge {
            name
          }
        }
        userContestRankingHistory(username: $username) {
          attended
          rating
          ranking
          trendDirection
          problemsSolved
          totalProblems
          finishTimeInSeconds
          contest {
            title
            startTime
          }
        }
      }
    `;

    try {
      const response = await axios.post(
        this.graphqlUrl,
        {
          query: query,
          variables: { username: username }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      return response.data.data || {};
    } catch (error) {
      console.error('Error fetching contest data:', error.message);
      return {};
    }
  }

  /**
   * Get submission statistics
   */
  async getSubmissionStats(username) {
    const query = `
      query userProfileCalendar($username: String!) {
        matchedUser(username: $username) {
          userCalendar {
            activeYears
            streak
            totalActiveDays
            submissionCalendar
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        recentSubmissionList(username: $username, limit: 10) {
          title
          titleSlug
          timestamp
          statusDisplay
          lang
        }
      }
    `;

    try {
      const response = await axios.post(
        this.graphqlUrl,
        {
          query: query,
          variables: { username: username }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      const data = response.data.data;
      const matchedUser = data.matchedUser || {};
      const recentSubmissions = data.recentSubmissionList || [];

      const totalSubmissions = matchedUser.submitStatsGlobal?.acSubmissionNum?.reduce(
        (sum, item) => sum + (item.count || 0), 0
      ) || 0;

      return {
        totalSubmissions: totalSubmissions,
        acceptanceRate: totalSubmissions > 0 ? 
          Math.round((matchedUser.submitStatsGlobal?.acSubmissionNum?.[0]?.count / totalSubmissions) * 100) : 0,
        recentSubmissions: recentSubmissions.slice(0, 5).map(sub => ({
          title: sub.title,
          status: sub.statusDisplay,
          language: sub.lang,
          timestamp: new Date(parseInt(sub.timestamp) * 1000)
        })),
        streak: matchedUser.userCalendar?.streak || 0,
        totalActiveDays: matchedUser.userCalendar?.totalActiveDays || 0
      };
    } catch (error) {
      console.error('Error fetching submission stats:', error.message);
      return {
        totalSubmissions: 0,
        acceptanceRate: 0,
        recentSubmissions: [],
        streak: 0,
        totalActiveDays: 0
      };
    }
  }

  /**
   * Update student's LeetCode data in database
   */
  async updateStudentData(Student, rollNumber, username = 'inbatamizh') {
    try {
      console.log(`\n🔄 Updating LeetCode data for ${rollNumber}...`);
      
      const result = await this.scrapeProfile(username);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const leetcodeData = result.data;

      // Update student document
      const student = await Student.findOne({ rollNumber: rollNumber });
      
      if (!student) {
        throw new Error(`Student with roll number ${rollNumber} not found`);
      }

      // Update LeetCode platform data
      student.platforms.leetcode = {
        username: leetcodeData.username,
        problemsSolved: leetcodeData.problemsSolved,
        easySolved: leetcodeData.easySolved,
        mediumSolved: leetcodeData.mediumSolved,
        hardSolved: leetcodeData.hardSolved,
        rating: leetcodeData.rating,
        maxRating: leetcodeData.maxRating,
        contestsAttended: leetcodeData.contestsAttended,
        globalRank: leetcodeData.globalRank,
        ranking: leetcodeData.ranking,
        reputation: leetcodeData.reputation,
        totalSubmissions: leetcodeData.totalSubmissions,
        acceptanceRate: leetcodeData.acceptanceRate,
        streak: leetcodeData.streak,
        totalActiveDays: leetcodeData.totalActiveDays,
        badges: leetcodeData.badges,
        activeBadge: leetcodeData.activeBadge,
        recentSubmissions: leetcodeData.recentSubmissions,
        lastUpdated: leetcodeData.lastUpdated,
        dataSource: leetcodeData.dataSource
      };

      student.lastScrapedAt = new Date();
      await student.save();

      console.log('✅ Student LeetCode data updated successfully!');
      
      return {
        success: true,
        data: leetcodeData
      };

    } catch (error) {
      console.error('❌ Failed to update student LeetCode data:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = LeetCodeScraper;
