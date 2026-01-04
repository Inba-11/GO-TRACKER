const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const auth = require('../middleware/auth');
const Student = require('../models/Student');

// POST /api/scraping/trigger - Trigger Python scraper
router.post('/trigger', auth, async (req, res) => {
  try {
    // Only allow staff and owner to trigger scraping
    if (req.user.role !== 'staff' && req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Only staff and owners can trigger scraping'
      });
    }

    const scraperPath = path.join(__dirname, '../../scraper');
    const pythonScript = path.join(scraperPath, 'scrape_all_students.py');

    // Execute Python scraper in background
    const pythonProcess = exec(
      `cd "${scraperPath}" && python scrape_all_students.py`,
      { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
    );

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Scraping completed successfully');
      } else {
        console.error(`❌ Scraping failed with code ${code}`);
      }
    });

    res.json({
      success: true,
      message: 'Scraping process started in background',
      note: 'This will take several minutes. Check server logs for progress.'
    });

  } catch (error) {
    console.error('Trigger scraping error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/scraping/student/:id - Scrape single student
router.post('/student/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Call Node.js scraper service (existing)
    const scraperService = require('../services/scraperService');
    const { results, errors } = await scraperService.scrapeAllPlatforms(student);

    // Update student
    if (results.leetcode) student.platforms.leetcode = results.leetcode;
    if (results.codechef) student.platforms.codechef = results.codechef;
    if (results.codeforces) student.platforms.codeforces = results.codeforces;
    if (results.github) student.platforms.github = results.github;
    if (results.codolio) student.platforms.codolio = results.codolio;

    student.lastScrapedAt = new Date();
    await student.save();

    res.json({
      success: true,
      data: student,
      scrapingResults: {
        successful: Object.keys(results),
        errors: errors
      }
    });

  } catch (error) {
    console.error('Scrape student error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/scraping/status - Get scraping status
router.get('/status', auth, async (req, res) => {
  try {
    const students = await Student.find({ isActive: true });
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentlyScraped = students.filter(s => s.lastScrapedAt > oneHourAgo).length;
    const scrapedToday = students.filter(s => s.lastScrapedAt > oneDayAgo).length;
    const neverScraped = students.filter(s => !s.lastScrapedAt).length;

    res.json({
      success: true,
      data: {
        totalStudents: students.length,
        recentlyScraped: recentlyScraped,
        scrapedToday: scrapedToday,
        neverScraped: neverScraped,
        lastScrapedStudent: students
          .sort((a, b) => (b.lastScrapedAt || 0) - (a.lastScrapedAt || 0))[0]
      }
    });

  } catch (error) {
    console.error('Get scraping status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
