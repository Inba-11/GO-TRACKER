const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Student = require('../models/Student');

// Debug log path
const DEBUG_LOG_PATH = path.join(__dirname, '../../.cursor/debug.log');

function debugLog(location, message, data, hypothesisId) {
  try {
    const logDir = path.dirname(DEBUG_LOG_PATH);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const logEntry = {
      location,
      message,
      data,
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId
    };
    fs.appendFileSync(DEBUG_LOG_PATH, JSON.stringify(logEntry) + '\n', 'utf8');
  } catch (err) {
    // Silently fail if logging fails
    console.error('Debug log error:', err.message);
  }
}

/**
 * Extract username from platform URL
 * Handles various URL formats for each platform
 */
function extractUsernameFromUrl(urlOrUsername, platform) {
  if (!urlOrUsername) {
    return null;
  }
  
  // If it's already a username (no http/https), return as-is
  if (!urlOrUsername.startsWith('http')) {
    return urlOrUsername.trim();
  }
  
  const platformLower = platform.toLowerCase();
  
  // Platform-specific URL patterns
  const patterns = {
    leetcode: [
      /leetcode\.com\/u\/([^\/\?]+)/,
      /leetcode\.com\/profile\/([^\/\?]+)/,
      /leetcode\.com\/([^\/\?]+)/
    ],
    codechef: [
      /codechef\.com\/users\/([^\/\?]+)/,
      /codechef\.com\/u\/([^\/\?]+)/
    ],
    codeforces: [
      /codeforces\.com\/profile\/([^\/\?]+)/,
      /codeforces\.com\/users\/([^\/\?]+)/
    ],
    github: [
      /github\.com\/([^\/\?]+)/,
      /github\.com\/u\/([^\/\?]+)/
    ],
    codolio: [
      /codolio\.com\/users\/([^\/\?]+)/,
      /codolio\.com\/u\/([^\/\?]+)/,
      /codolio\.com\/profile\/([^\/\?]+)/
    ]
  };
  
  const platformPatterns = patterns[platformLower] || [];
  
  for (const pattern of platformPatterns) {
    const match = urlOrUsername.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Fallback: try to extract from last path segment
  try {
    const url = new URL(urlOrUsername);
    const pathSegments = url.pathname.split('/').filter(seg => seg);
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && !lastSegment.includes('.')) {
        return lastSegment.trim();
      }
    }
  } catch (e) {
    // Invalid URL, try simple regex fallback
    const fallbackMatch = urlOrUsername.match(/\/([^\/\?]+)(?:\?|$)/);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1].trim();
    }
  }
  
  return null;
}

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

// POST /api/scraping/inbatamizhan - Scrape INBATAMIZHAN P specifically
router.post('/inbatamizhan', async (req, res) => {
  try {
    console.log('🚀 INBATAMIZHAN P scraping endpoint triggered');
    
    // Import and run the enhanced scraper
    const { scrapeInbatamizhanCodeChefEnhanced } = require('../enhanced_inbatamizhan_scraper');
    
    const result = await scrapeInbatamizhanCodeChefEnhanced();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'INBATAMIZHAN P data updated successfully',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }

  } catch (error) {
    console.error('INBATAMIZHAN scraping error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to scrape INBATAMIZHAN P data'
    });
  }
});

// GET /api/scraping/inbatamizhan/contests - Get contest list for INBATAMIZHAN P
router.get('/inbatamizhan/contests', async (req, res) => {
  try {
    const Student = require('../models/Student');
    const rollNumber = '711523BCB023';
    
    const student = await Student.findOne({ rollNumber: rollNumber });
    
    if (!student || !student.platforms?.codechef) {
      return res.status(404).json({
        success: false,
        error: 'INBATAMIZHAN P CodeChef data not found'
      });
    }

    const contestList = student.platforms.codechef.contestList || [];
    
    res.json({
      success: true,
      data: {
        contests: contestList,
        totalContests: student.platforms.codechef.contests || 96,
        lastUpdated: student.platforms.codechef.lastUpdated
      }
    });

  } catch (error) {
    console.error('Get INBATAMIZHAN contests error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/scraping/inbatamizhan/status - Get scheduler status
router.get('/inbatamizhan/status', async (req, res) => {
  try {
    const inbatamizhanScheduler = require('../inbatamizhan_cron_scheduler');
    const status = inbatamizhanScheduler.getStatus();
    
    res.json({
      success: true,
      data: {
        scheduler: status,
        target: 'INBATAMIZHAN P (711523BCB023)',
        schedule: 'Every 30 minutes',
        timezone: 'Asia/Kolkata (IST)'
      }
    });

  } catch (error) {
    console.error('Get INBATAMIZHAN scheduler status error:', error);
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

// POST /api/scraping/refresh/:studentId/:platform - Refresh specific platform for a student
// Platforms: leetcode, codechef, codeforces, github, codolio
router.post('/refresh/:studentId/:platform', auth, async (req, res) => {
  try {
    const { studentId, platform } = req.params;
    
    // #region agent log
    debugLog('scrapingRoutes.js:refresh', 'Route called', { studentId, platform }, 'A');
    // #endregion
    
    // Validate platform
    const validPlatforms = ['leetcode', 'codechef', 'codeforces', 'github', 'codolio'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`
      });
    }
    
    // Find student
    const student = await Student.findById(studentId);
    // #region agent log
    debugLog('scrapingRoutes.js:253', 'Student lookup result', { studentId, studentFound: !!student }, 'C');
    // #endregion
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Check permissions: students can only refresh their own data, staff/owner can refresh any
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({
        success: false,
        error: 'You can only refresh your own data'
      });
    }
    
    // Log OLD data before scraping
    const platformKey = platform.toLowerCase();
    const oldPlatformData = student.platforms?.[platformKey] ? JSON.parse(JSON.stringify(student.platforms[platformKey])) : null;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 REFRESH REQUEST: ${platform.toUpperCase()} for ${student.name}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📋 Student: ${student.name} (${student.rollNumber})`);
    console.log(`🆔 Student ID: ${studentId}`);
    
    if (oldPlatformData) {
      console.log(`\n📊 OLD DATA (Before Scraping):`);
      console.log(`   ${JSON.stringify(oldPlatformData, null, 2).split('\n').join('\n   ')}`);
    } else {
      console.log(`\n📊 OLD DATA: No existing ${platform} data found`);
    }
    
    // Extract username from student document with multiple fallback strategies
    let username = student.platformUsernames?.[platformKey] || '';
    const platformLink = student.platformLinks?.[platformKey] || '';
    
    console.log(`\n🔗 Platform Link: ${platformLink || 'Not set'}`);
    console.log(`👤 Platform Username (stored): ${student.platformUsernames?.[platformKey] || 'Not set'}`);
    
    // Strategy 1: Use stored username if available
    if (username) {
      console.log(`✅ Using stored username: ${username}`);
    } else {
      // Strategy 2: Extract from platformLink if available
      if (platformLink) {
        username = extractUsernameFromUrl(platformLink, platformKey) || '';
        if (username) {
          console.log(`✅ Extracted username from URL: ${username}`);
        } else {
          console.log(`⚠️ Could not extract username from URL: ${platformLink}`);
        }
      } else {
        console.log(`⚠️ No platform link found for ${platform}`);
      }
      
      // Strategy 3: Try to get from existing platform data
      if (!username && student.platforms?.[platformKey]?.username) {
        username = student.platforms[platformKey].username;
        console.log(`✅ Using username from existing platform data: ${username}`);
      }
    }
    
    console.log(`👤 Final Username: ${username || 'Not found'}`);
    
    // #region agent log
    debugLog('scrapingRoutes.js:271', 'Username extraction result', { 
      username, 
      platformKey, 
      hasPlatformUsername: !!student.platformUsernames?.[platformKey], 
      hasPlatformLink: !!student.platformLinks?.[platformKey],
      platformLink: student.platformLinks?.[platformKey] || 'N/A',
      extractedFromLink: !student.platformUsernames?.[platformKey] && !!username && !!platformLink,
      extractedFromPlatformData: !username && !!student.platforms?.[platformKey]?.username
    }, 'D');
    // #endregion
    
    if (!username) {
      console.log(`\n❌ ERROR: ${platform} username not found`);
      console.log(`${'='.repeat(60)}`);
      console.log(`   Student: ${student.name} (${student.rollNumber})`);
      console.log(`   Platform Link: ${platformLink || 'Not set'}`);
      console.log(`   Stored Username: ${student.platformUsernames?.[platformKey] || 'Not set'}`);
      console.log(`   Platform Data Username: ${student.platforms?.[platformKey]?.username || 'Not set'}`);
      console.log(`${'='.repeat(60)}\n`);
      
      return res.status(400).json({
        success: false,
        error: `${platform} username not found. Please update your platform links first.`,
        details: {
          studentName: student.name,
          rollNumber: student.rollNumber,
          hasPlatformLink: !!platformLink,
          platformLink: platformLink || 'Not set',
          hasPlatformUsername: !!student.platformUsernames?.[platformKey],
          storedUsername: student.platformUsernames?.[platformKey] || 'Not set',
          hasPlatformDataUsername: !!student.platforms?.[platformKey]?.username,
          platformDataUsername: student.platforms?.[platformKey]?.username || 'Not set',
          suggestion: 'Please update your platform links in the dashboard settings.'
        }
      });
    }
    
    // Execute Python refresh script
    const scraperPath = path.join(__dirname, '../../scraper');
    const pythonScript = path.join(scraperPath, `refresh_${platformKey}.py`);
    const pythonCommand = `cd "${scraperPath}" && python -u refresh_${platformKey}.py "${studentId}" "${username}"`;
    
    // #region agent log
    debugLog('scrapingRoutes.js:293', 'Python script execution starting', { studentId, username, platformKey, pythonScript, scraperPath }, 'A');
    // #endregion
    
    console.log(`\n🚀 Starting Python Scraper:`);
    console.log(`   Script: ${pythonScript}`);
    console.log(`   Command: ${pythonCommand}`);
    console.log(`\n⏳ Scraping in progress...\n`);
    
    // ⚠️ CRASH FIX: Track if response has been sent to prevent multiple responses
    let responseSent = false;
    
    // Helper function to safely send response (prevents crash)
    const sendResponse = (statusCode, jsonData) => {
      if (responseSent) {
        console.warn('⚠️ Attempted to send response after it was already sent - ignoring');
        return;
      }
      if (res.headersSent) {
        console.warn('⚠️ Response headers already sent - ignoring');
        responseSent = true;
        return;
      }
      responseSent = true;
      try {
        res.status(statusCode).json(jsonData);
      } catch (err) {
        console.error('⚠️ Error sending response:', err.message);
      }
    };
    
    // Execute Python script with timeout
    // CodeChef uses Selenium which can take 2-3 minutes, so increase timeout
    const timeout = platformKey === 'codechef' ? 180000 : 90000; // 180 seconds for CodeChef, 90 for others
    let pythonProcess;
    let timeoutId;
    
    try {
      pythonProcess = exec(
        pythonCommand,
        { 
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
          timeout: timeout
        }
      );
    } catch (execError) {
      console.error(`\n❌ ERROR starting Python process:`, execError.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to start Python scraper',
        details: execError.message
      });
    }
    
    let output = '';
    let errorOutput = '';
    
    let jsonDataStart = false;
    let jsonDataBuffer = '';
    
    pythonProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(`[${platform}] ${text.trim()}`);
      
      // Check for JSON data markers
      if (text.includes('📦 SCRAPED_DATA_JSON_START')) {
        jsonDataStart = true;
        jsonDataBuffer = '';
        return;
      }
      if (text.includes('📦 SCRAPED_DATA_JSON_END')) {
        jsonDataStart = false;
        try {
          const parsedData = JSON.parse(jsonDataBuffer.trim());
          console.log(`\n${'='.repeat(60)}`);
          console.log(`📦 SCRAPED JSON DATA RECEIVED:`);
          console.log(JSON.stringify(parsedData, null, 2));
          console.log(`${'='.repeat(60)}\n`);
        } catch (e) {
          console.warn('⚠️ Failed to parse JSON data from scraper');
        }
        jsonDataBuffer = '';
        return;
      }
      
      // Accumulate JSON data if marker found
      if (jsonDataStart) {
        jsonDataBuffer += text;
      }
    });
    
    pythonProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.error(`[${platform}] ERROR: ${text.trim()}`);
    });
    
    // Handle Python process errors (not exit code, but actual errors)
    pythonProcess.on('error', (error) => {
      console.error(`\n❌ Python process error:`, error.message);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (!responseSent) {
        sendResponse(500, {
          success: false,
          error: 'Python process failed to start',
          details: error.message
        });
      }
    });
    
    // Store timeout ID so we can clear it when process completes
    timeoutId = setTimeout(() => {
      if (!pythonProcess.killed && !responseSent) {
        pythonProcess.kill();
        console.log(`\n${'='.repeat(60)}`);
        console.error(`⏱️ TIMEOUT: ${platform.toUpperCase()} refresh timed out for ${student.name}`);
        console.log(`${'='.repeat(60)}\n`);
        sendResponse(504, {
          success: false,
          error: `Refresh timeout after ${timeout / 1000} seconds`
        });
      }
    }, timeout);
    
    // Wait for process to complete
    pythonProcess.on('close', async (code) => {
      // Clear timeout since process completed (prevents timeout from firing)
      clearTimeout(timeoutId);
      
      // If response already sent (by timeout), don't send again
      if (responseSent) {
        console.log('⚠️ Process completed but response already sent (likely timeout)');
        return;
      }
      
      if (code === 0) {
        // ✅ Success - Python scraper updated MongoDB, now fetch updated data
        try {
          // Try to extract JSON data from output if present
          let scrapedJsonData = null;
          const jsonMatch = output.match(/📦 SCRAPED_DATA_JSON_START\s*([\s\S]*?)\s*📦 SCRAPED_DATA_JSON_END/);
          if (jsonMatch) {
            try {
              scrapedJsonData = JSON.parse(jsonMatch[1].trim());
              console.log(`\n${'='.repeat(60)}`);
              console.log(`📦 SCRAPED JSON DATA FOUND IN OUTPUT:`);
              console.log(JSON.stringify(scrapedJsonData, null, 2));
              console.log(`${'='.repeat(60)}\n`);
            } catch (parseError) {
              console.warn('⚠️ Failed to parse JSON data from output:', parseError.message);
            }
          }
          
          const updatedStudent = await Student.findById(studentId);
          if (updatedStudent) {
            const newPlatformData = updatedStudent.platforms?.[platformKey] ? JSON.parse(JSON.stringify(updatedStudent.platforms[platformKey])) : null;
            
            console.log(`\n${'='.repeat(60)}`);
            console.log(`✅ SUCCESS: ${platform.toUpperCase()} data refreshed for ${student.name}`);
            console.log(`${'='.repeat(60)}`);
            
            if (newPlatformData) {
              console.log(`\n📊 NEW DATA (After Scraping):`);
              console.log(`   ${JSON.stringify(newPlatformData, null, 2).split('\n').join('\n   ')}`);
            }
            
            console.log(`\n💾 MongoDB Updated: ✅`);
            console.log(`📅 Last Updated: ${newPlatformData?.lastUpdated || 'N/A'}`);
            console.log(`${'='.repeat(60)}\n`);
            
            // Send response with updated data to frontend (include scraped JSON if available)
            sendResponse(200, {
              success: true,
              message: `${platform} data refreshed successfully`,
              data: updatedStudent,
              platform: platformKey,
              oldData: oldPlatformData,
              newData: newPlatformData,
              scrapedData: scrapedJsonData, // Include raw scraped JSON for debugging
              scraperOutput: output.substring(0, 2000), // Include first 2000 chars of output
              scraperErrors: errorOutput.substring(0, 500) // Include first 500 chars of errors
            });
          } else {
            console.log(`\n❌ ERROR: Student data not found after refresh`);
            console.log(`${'='.repeat(60)}\n`);
            sendResponse(500, {
              success: false,
              error: 'Student data not found after refresh',
              scraperOutput: output.substring(0, 1000),
              scraperErrors: errorOutput.substring(0, 500)
            });
          }
        } catch (error) {
          console.error(`\n❌ ERROR fetching updated student:`, error.message);
          console.log(`${'='.repeat(60)}\n`);
          sendResponse(500, {
            success: false,
            error: 'Failed to fetch updated student data',
            details: error.message,
            scraperOutput: output.substring(0, 1000),
            scraperErrors: errorOutput.substring(0, 500)
          });
        }
      } else if (code === null) {
        // Process was killed (likely by timeout or system)
        // Check if data was still updated in MongoDB before failing
        console.log(`\n⚠️ Process was killed (exit code: null)`);
        console.log(`Checking if data was updated in MongoDB...`);
        
        try {
          const updatedStudent = await Student.findById(studentId);
          if (updatedStudent) {
            const newPlatformData = updatedStudent.platforms?.[platformKey];
            const newLastUpdated = newPlatformData?.lastUpdated;
            const oldLastUpdated = oldPlatformData?.lastUpdated;
            
            // Check if data was actually updated (lastUpdated changed)
            if (newLastUpdated && oldLastUpdated && 
                new Date(newLastUpdated) > new Date(oldLastUpdated)) {
              console.log(`\n${'='.repeat(60)}`);
              console.log(`✅ PARTIAL SUCCESS: ${platform.toUpperCase()} data was updated before process was killed`);
              console.log(`${'='.repeat(60)}`);
              console.log(`📊 Data was updated at: ${newLastUpdated}`);
              console.log(`${'='.repeat(60)}\n`);
              
              sendResponse(200, {
                success: true,
                message: `${platform} data refreshed (process was interrupted but data was saved)`,
                data: updatedStudent,
                platform: platformKey,
                oldData: oldPlatformData,
                newData: newPlatformData,
                warning: 'Process was interrupted but data was successfully saved'
              });
              return;
            }
          }
        } catch (checkError) {
          console.error(`Error checking MongoDB after process kill:`, checkError.message);
        }
        
        // If no data was updated, return error
        const errorMsg = errorOutput || output || 'Process was killed before completion';
        console.log(`\n${'='.repeat(60)}`);
        console.error(`❌ FAILED: ${platform.toUpperCase()} refresh failed - process was killed`);
        console.log(`${'='.repeat(60)}`);
        console.error(`Exit Code: null (process killed)`);
        console.error(`Error: ${errorMsg.substring(0, 500)}`);
        console.log(`${'='.repeat(60)}\n`);
        
        sendResponse(500, {
          success: false,
          error: `Refresh failed - process was killed before completion`,
          details: errorMsg.substring(0, 500),
          exitCode: null,
          stdout: output.substring(0, 1000),
          stderr: errorOutput.substring(0, 1000),
          suggestion: platformKey === 'codechef' ? 'CodeChef uses Selenium which takes longer. Try again or wait for the process to complete.' : ''
        });
      } else {
        // ❌ Process failed with non-zero exit code
        // Check if there's structured error JSON in output
        let structuredError = null;
        const errorJsonMatch = output.match(/📦 ERROR_JSON_START\s*([\s\S]*?)\s*📦 ERROR_JSON_END/);
        if (errorJsonMatch) {
          try {
            structuredError = JSON.parse(errorJsonMatch[1].trim());
            console.log(`\n${'='.repeat(60)}`);
            console.log(`📦 STRUCTURED ERROR RECEIVED:`);
            console.log(JSON.stringify(structuredError, null, 2));
            console.log(`${'='.repeat(60)}\n`);
          } catch (parseError) {
            console.warn('⚠️ Failed to parse error JSON from output:', parseError.message);
          }
        }
        
        const errorMsg = errorOutput || output || `Python script exited with code ${code}`;
        console.log(`\n${'='.repeat(60)}`);
        console.error(`❌ FAILED: ${platform.toUpperCase()} refresh failed for ${student.name}`);
        console.log(`${'='.repeat(60)}`);
        console.error(`Exit Code: ${code}`);
        console.error(`Error: ${errorMsg.substring(0, 500)}`);
        console.log(`${'='.repeat(60)}\n`);
        
        // #region agent log
        debugLog('scrapingRoutes.js:354', 'Python script failed', { studentId, username, exitCode: code, errorOutput: errorOutput.substring(0, 500), output: output.substring(0, 500), structuredError }, 'A');
        // #endregion
        
        // Return structured error response instead of generic 500
        if (structuredError) {
          // Return 200 with error status (not 500) so frontend can handle gracefully
          sendResponse(200, {
            success: false,
            platform: platformKey,
            status: 'failed',
            reason: structuredError.reason || 'scraping_failed',
            message: structuredError.message || `Failed to refresh ${platform} data`,
            lastUpdated: structuredError.lastUpdated || oldPlatformData?.lastUpdated,
            details: structuredError.details || {
              exitCode: code,
              errorOutput: errorMsg.substring(0, 500)
            },
            scraperOutput: output.substring(0, 1000),
            scraperErrors: errorOutput.substring(0, 500)
          });
        } else {
          // Fallback to error response if no structured error
          sendResponse(200, {
            success: false,
            platform: platformKey,
            status: 'failed',
            reason: 'unknown_error',
            message: `Failed to refresh ${platform} data`,
            lastUpdated: oldPlatformData?.lastUpdated,
            details: {
              exitCode: code,
              error: errorMsg.substring(0, 500)
            },
            scraperOutput: output.substring(0, 1000),
            scraperErrors: errorOutput.substring(0, 500)
          });
        }
      }
    });
    
  } catch (error) {
    console.error(`\n❌ ERROR in refresh route:`, error.message);
    console.log(`${'='.repeat(60)}\n`);
    // Check if response was already sent (shouldn't happen, but safety check)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    } else {
      console.warn('⚠️ Response already sent, cannot send error response');
    }
  }
});

module.exports = router;
