const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');

// Middleware to check if user is admin/staff
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'staff' && req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// GET /api/admin/dashboard - Get admin dashboard data
router.get('/dashboard', auth, requireAdmin, async (req, res) => {
  try {
    const students = await Student.find({ isActive: true });
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Calculate platform coverage
    const platformCoverage = {};
    const platforms = ['leetcode', 'codechef', 'codeforces', 'github', 'codolio'];
    
    for (const platform of platforms) {
      const withData = students.filter(s => {
        const data = s.platforms[platform];
        return data && (data.rating > 0 || data.totalSolved > 0 || data.totalActiveDays > 0);
      }).length;
      
      platformCoverage[platform] = {
        coverage: Math.round((withData / students.length) * 100),
        studentsWithData: withData,
        totalStudents: students.length
      };
    }

    // Calculate update frequency
    const recentlyScraped = students.filter(s => s.lastScrapedAt > oneHourAgo).length;
    const scrapedToday = students.filter(s => s.lastScrapedAt > oneDayAgo).length;
    const scrapedThisWeek = students.filter(s => s.lastScrapedAt > sevenDaysAgo).length;
    const neverScraped = students.filter(s => !s.lastScrapedAt).length;

    // Calculate average ratings
    const avgRatings = {};
    for (const platform of platforms) {
      const ratings = students
        .map(s => s.platforms[platform]?.rating || 0)
        .filter(r => r > 0);
      
      avgRatings[platform] = ratings.length > 0 
        ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length)
        : 0;
    }

    // Get top performers
    const topPerformers = students
      .map(s => ({
        name: s.name,
        rollNumber: s.rollNumber,
        leetcodeRating: s.platforms.leetcode?.rating || 0,
        codechefRating: s.platforms.codechef?.rating || 0,
        codeforcesRating: s.platforms.codeforces?.rating || 0,
        totalScore: (s.platforms.leetcode?.rating || 0) + 
                   (s.platforms.codechef?.rating || 0) + 
                   (s.platforms.codeforces?.rating || 0)
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);

    // Get students needing updates
    const needsUpdate = students
      .filter(s => !s.lastScrapedAt || s.lastScrapedAt < oneDayAgo)
      .map(s => ({
        name: s.name,
        rollNumber: s.rollNumber,
        lastScraped: s.lastScrapedAt || 'Never',
        scrapingErrors: s.scrapingErrors?.length || 0
      }))
      .slice(0, 20);

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents: students.length,
          recentlyScraped,
          scrapedToday,
          scrapedThisWeek,
          neverScraped
        },
        platformCoverage,
        avgRatings,
        topPerformers,
        needsUpdate,
        timestamp: now
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/admin/logs - Get scraper logs
router.get('/logs', auth, requireAdmin, async (req, res) => {
  try {
    const db = require('../config/database').getDb();
    const logsCollection = db.collection('scraper_logs');
    
    const limit = parseInt(req.query.limit) || 100;
    const platform = req.query.platform || null;
    
    let query = {};
    if (platform) {
      query.platform = platform;
    }
    
    const logs = await logsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    
    // Group logs by platform
    const logsByPlatform = {};
    logs.forEach(log => {
      if (!logsByPlatform[log.platform]) {
        logsByPlatform[log.platform] = [];
      }
      logsByPlatform[log.platform].push(log);
    });
    
    res.json({
      success: true,
      data: {
        totalLogs: logs.length,
        logs,
        logsByPlatform
      }
    });

  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/admin/stats - Get system statistics
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const students = await Student.find({ isActive: true });
    const db = require('../config/database').getDb();
    const logsCollection = db.collection('scraper_logs');
    
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get recent logs
    const recentLogs = await logsCollection
      .find({ timestamp: { $gte: last24Hours } })
      .toArray();
    
    const weekLogs = await logsCollection
      .find({ timestamp: { $gte: last7Days } })
      .toArray();

    // Calculate success rate
    const successCount = recentLogs.filter(l => l.status === 'success').length;
    const errorCount = recentLogs.filter(l => l.status === 'error').length;
    const successRate = recentLogs.length > 0 
      ? Math.round((successCount / recentLogs.length) * 100)
      : 0;

    // Platform-wise stats
    const platformStats = {};
    const platforms = ['leetcode', 'codechef', 'codeforces', 'github', 'codolio'];
    
    for (const platform of platforms) {
      const platformLogs = recentLogs.filter(l => l.platform === platform);
      const platformSuccess = platformLogs.filter(l => l.status === 'success').length;
      
      platformStats[platform] = {
        total: platformLogs.length,
        success: platformSuccess,
        errors: platformLogs.filter(l => l.status === 'error').length,
        skipped: platformLogs.filter(l => l.status === 'skipped').length,
        successRate: platformLogs.length > 0 
          ? Math.round((platformSuccess / platformLogs.length) * 100)
          : 0,
        avgDataPoints: platformLogs.length > 0
          ? Math.round(platformLogs.reduce((sum, l) => sum + (l.data_points || 0), 0) / platformLogs.length)
          : 0
      };
    }

    // Get most common errors
    const errorLogs = recentLogs.filter(l => l.status === 'error');
    const errorMessages = {};
    errorLogs.forEach(log => {
      const msg = log.message?.substring(0, 50) || 'Unknown error';
      errorMessages[msg] = (errorMessages[msg] || 0) + 1;
    });

    const topErrors = Object.entries(errorMessages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));

    res.json({
      success: true,
      data: {
        period: {
          last24Hours: {
            totalLogs: recentLogs.length,
            successRate,
            successCount,
            errorCount
          },
          last7Days: {
            totalLogs: weekLogs.length
          }
        },
        platformStats,
        topErrors,
        timestamp: now
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/admin/student-health - Get individual student health
router.get('/student-health/:id', auth, requireAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const platformHealth = {};
    const platforms = ['leetcode', 'codechef', 'codeforces', 'github', 'codolio'];
    
    for (const platform of platforms) {
      const data = student.platforms[platform];
      const hasData = data && (data.rating > 0 || data.totalSolved > 0 || data.totalActiveDays > 0);
      const isStale = data && data.lastUpdated && 
        (new Date() - new Date(data.lastUpdated)) > (24 * 60 * 60 * 1000);
      
      platformHealth[platform] = {
        hasData,
        isStale,
        lastUpdated: data?.lastUpdated || null,
        dataPoints: data ? Object.keys(data).length : 0
      };
    }

    res.json({
      success: true,
      data: {
        student: {
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email
        },
        platformHealth,
        lastScrapedAt: student.lastScrapedAt,
        scrapingErrors: student.scrapingErrors || [],
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Get student health error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
