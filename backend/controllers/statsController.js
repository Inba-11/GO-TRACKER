const Student = require('../models/Student');

// GET /api/stats/overview - Get dashboard overview stats
const getOverview = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true });
    
    const totalProblems = students.reduce((acc, s) => 
      acc + (s.platforms.codechef?.problemsSolved || 0) + 
      (s.platforms.hackerrank?.problemsSolved || 0) + 
      (s.platforms.leetcode?.problemsSolved || 0) + 
      (s.platforms.atcoder?.problemsSolved || 0), 0
    );

    const totalContributions = students.reduce((acc, s) => 
      acc + (s.platforms.github?.contributions || 0), 0
    );

    res.json({
      success: true,
      data: {
        totalStudents: students.length,
        totalProblems,
        totalContributions,
        activePlatforms: 6
      }
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/stats/top-performers - Get top performers by platform
const getTopPerformers = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true });

    const topPerformers = {
      codechef: students.reduce((top, student) => {
        const rating = student.platforms.codechef?.rating || 0;
        return (!top || rating > (top.platforms.codechef?.rating || 0)) ? student : top;
      }, null),
      hackerrank: students.reduce((top, student) => {
        const rating = student.platforms.hackerrank?.rating || 0;
        return (!top || rating > (top.platforms.hackerrank?.rating || 0)) ? student : top;
      }, null),
      leetcode: students.reduce((top, student) => {
        const rating = student.platforms.leetcode?.rating || 0;
        return (!top || rating > (top.platforms.leetcode?.rating || 0)) ? student : top;
      }, null),
      atcoder: students.reduce((top, student) => {
        const rating = student.platforms.atcoder?.rating || 0;
        return (!top || rating > (top.platforms.atcoder?.rating || 0)) ? student : top;
      }, null),
      codeforces: students.reduce((top, student) => {
        const rating = student.platforms.codeforces?.rating || 0;
        return (!top || rating > (top.platforms.codeforces?.rating || 0)) ? student : top;
      }, null),
      github: students.reduce((top, student) => {
        const contributions = student.platforms.github?.contributions || 0;
        return (!top || contributions > (top.platforms.github?.contributions || 0)) ? student : top;
      }, null)
    };

    res.json({ success: true, data: topPerformers });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/stats/admin - Get admin dashboard stats
const getAdminStats = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true });
    
    const totalProblems = students.reduce((acc, s) => 
      acc + (s.platforms.codechef?.problemsSolved || 0) + 
      (s.platforms.hackerrank?.problemsSolved || 0) + 
      (s.platforms.leetcode?.problemsSolved || 0) + 
      (s.platforms.atcoder?.problemsSolved || 0), 0
    );

    const avgRating = students.reduce((acc, s) => {
      const ratings = [
        s.platforms.leetcode?.rating || 0,
        s.platforms.codechef?.rating || 0,
        s.platforms.codeforces?.rating || 0
      ].filter(r => r > 0);
      return acc + (ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0);
    }, 0) / students.length;

    res.json({
      success: true,
      data: {
        totalStudents: students.length,
        activeToday: Math.floor(students.length * 0.7),
        avgRating: Math.round(avgRating),
        systemStatus: 'Healthy'
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getOverview,
  getTopPerformers,
  getAdminStats
};

