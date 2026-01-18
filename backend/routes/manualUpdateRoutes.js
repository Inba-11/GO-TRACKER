const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

/**
 * Manual update endpoint for CodeChef data
 * POST /api/manual-update/codechef/:rollNumber
 * 
 * Body: {
 *   problemsSolved: 501,
 *   rating: 1264,
 *   maxRating: 1314,
 *   contests: 96,
 *   stars: 1,
 *   league: "Bronze League",
 *   globalRank: 16720,
 *   country: "India"
 * }
 */
router.post('/codechef/:rollNumber', async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const {
      problemsSolved,
      rating,
      maxRating,
      contests,
      stars,
      league,
      globalRank,
      country,
      institution
    } = req.body;

    console.log(`📝 Manual CodeChef update for ${rollNumber}`);
    console.log('Data:', req.body);

    const student = await Student.findOne({ rollNumber });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Update CodeChef data
    student.platforms.codechef = {
      ...student.platforms.codechef,
      problemsSolved: problemsSolved || student.platforms.codechef.problemsSolved,
      rating: rating || student.platforms.codechef.rating,
      maxRating: maxRating || student.platforms.codechef.maxRating,
      contests: contests || student.platforms.codechef.contests,
      contestsAttended: contests || student.platforms.codechef.contestsAttended,
      stars: stars !== undefined ? stars : student.platforms.codechef.stars,
      league: league || student.platforms.codechef.league,
      globalRank: globalRank || student.platforms.codechef.globalRank,
      country: country || student.platforms.codechef.country,
      institution: institution || student.platforms.codechef.institution,
      lastUpdated: new Date()
    };

    student.lastScrapedAt = new Date();
    await student.save();

    console.log('✅ CodeChef data updated successfully');

    res.json({
      success: true,
      message: 'CodeChef data updated successfully',
      data: student.platforms.codechef
    });

  } catch (error) {
    console.error('❌ Manual update failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get current CodeChef data
 * GET /api/manual-update/codechef/:rollNumber
 */
router.get('/codechef/:rollNumber', async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const student = await Student.findOne({ rollNumber });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student.platforms.codechef
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
