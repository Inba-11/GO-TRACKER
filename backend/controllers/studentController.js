const Student = require('../models/Student');
const scraperService = require('../services/scraperService');
const auth = require('../middleware/auth');

// GET /api/students - Get all students with pagination
const getAllStudents = async (req, res) => {
  try {
    const { 
      batch, 
      sortBy = 'rollNumber', 
      order = 'asc',
      page = 1,
      limit = 20
    } = req.query;
    
    // Parse pagination parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100); // Max 100 per page
    const skip = (pageNum - 1) * limitNum;
    
    let query = { isActive: true };
    if (batch && batch !== 'ALL') {
      query.batch = batch;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    
    if (sortBy === 'totalProblems') {
      // Sort by virtual field requires aggregation
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            totalProblems: {
              $add: [
                { $ifNull: ['$platforms.leetcode.problemsSolved', 0] },
                { $ifNull: ['$platforms.codechef.problemsSolved', 0] },
                { $ifNull: ['$platforms.codeforces.problemsSolved', 0] },
                { $ifNull: ['$platforms.hackerrank.problemsSolved', 0] },
                { $ifNull: ['$platforms.atcoder.problemsSolved', 0] }
              ]
            }
          }
        },
        { $sort: { totalProblems: sortOrder } }
      ];
      
      // Get total count
      const countPipeline = [...pipeline, { $count: 'total' }];
      const countResult = await Student.aggregate(countPipeline);
      const total = countResult[0]?.total || 0;
      
      // Add pagination
      pipeline.push({ $skip: skip }, { $limit: limitNum });
      
      const students = await Student.aggregate(pipeline);
      
      return res.json({ 
        success: true, 
        data: students,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } else {
      sortOptions[sortBy] = sortOrder;
    }

    // Get total count for pagination
    const total = await Student.countDocuments(query);
    
    // Get paginated students, exclude password field
    const students = await Student.find(query)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for better performance on read-only queries
    
    res.json({ 
      success: true, 
      data: students,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/students/me - Get current student
const getMe = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/students/:id - Get student by ID
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/students/roll/:rollNumber - Get student by roll number
const getStudentByRollNumber = async (req, res) => {
  try {
    const student = await Student.findOne({ rollNumber: req.params.rollNumber, isActive: true });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Get student by roll number error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/students/me/avatar - Update student avatar
const updateAvatar = async (req, res) => {
  try {
    const { avatarId, customAvatar } = req.body;
    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    if (customAvatar) {
      student.avatar = customAvatar;
    } else if (avatarId) {
      student.defaultAvatar = avatarId;
    }

    await student.save();
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/students/me/resume - Update resume link
const updateResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body;
    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    student.resume = resumeUrl || null;
    await student.save();
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/students/me/platform-links - Update platform links and usernames
const updatePlatformLinks = async (req, res) => {
  try {
    const { platformLinks, platformUsernames } = req.body;
    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Initialize platformLinks if it doesn't exist (for old documents)
    if (!student.platformLinks) {
      student.platformLinks = {
        leetcode: '',
        codechef: '',
        codeforces: '',
        github: '',
        codolio: ''
      };
    }

    // Initialize platformUsernames if it doesn't exist (for old documents)
    if (!student.platformUsernames) {
      student.platformUsernames = {
        leetcode: '',
        codechef: '',
        codeforces: '',
        github: '',
        codolio: ''
      };
    }

    // Update platform links if provided
    if (platformLinks) {
      if (platformLinks.leetcode !== undefined) student.platformLinks.leetcode = platformLinks.leetcode || '';
      if (platformLinks.codechef !== undefined) student.platformLinks.codechef = platformLinks.codechef || '';
      if (platformLinks.codeforces !== undefined) student.platformLinks.codeforces = platformLinks.codeforces || '';
      if (platformLinks.github !== undefined) student.platformLinks.github = platformLinks.github || '';
      if (platformLinks.codolio !== undefined) student.platformLinks.codolio = platformLinks.codolio || '';
    }

    // Update platform usernames if provided
    if (platformUsernames) {
      if (platformUsernames.leetcode !== undefined) student.platformUsernames.leetcode = platformUsernames.leetcode || '';
      if (platformUsernames.codechef !== undefined) student.platformUsernames.codechef = platformUsernames.codechef || '';
      if (platformUsernames.codeforces !== undefined) student.platformUsernames.codeforces = platformUsernames.codeforces || '';
      if (platformUsernames.github !== undefined) student.platformUsernames.github = platformUsernames.github || '';
      if (platformUsernames.codolio !== undefined) student.platformUsernames.codolio = platformUsernames.codolio || '';
    }

    // Auto-extract username from URL if URL is provided but username is not
    const extractUsername = (url, platform) => {
      if (!url || typeof url !== 'string') return '';
      
      try {
        if (platform === 'leetcode') {
          const match = url.match(/leetcode\.com\/u\/([^\/\?]+)/);
          return match ? match[1] : '';
        } else if (platform === 'codechef') {
          const match = url.match(/codechef\.com\/users\/([^\/\?]+)/);
          return match ? match[1] : '';
        } else if (platform === 'codeforces') {
          const match = url.match(/codeforces\.com\/profile\/([^\/\?]+)/);
          return match ? match[1] : '';
        } else if (platform === 'github') {
          const match = url.match(/github\.com\/([^\/\?]+)/);
          return match ? match[1] : '';
        } else if (platform === 'codolio') {
          const match = url.match(/codolio\.com\/profile\/([^\/\?]+)/);
          return match ? match[1] : '';
        }
      } catch (e) {
        return '';
      }
      return '';
    };

    // Auto-extract usernames from URLs
    const platforms = ['leetcode', 'codechef', 'codeforces', 'github', 'codolio'];
    platforms.forEach(platform => {
      const url = student.platformLinks[platform];
      if (url && !student.platformUsernames[platform]) {
        const extractedUsername = extractUsername(url, platform);
        if (extractedUsername) {
          student.platformUsernames[platform] = extractedUsername;
        }
      }
    });

    await student.save();
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Update platform links error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/students/me/resume - Delete resume link
const deleteResume = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    student.resume = null;
    await student.save();
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/students/me/repositories - Add project repository
const addRepository = async (req, res) => {
  try {
    const { name, url, description } = req.body;
    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    student.projectRepositories.push({
      name,
      url,
      description: description || ''
    });

    await student.save();
    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Add repository error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/students/me/repositories/:id - Delete repository
const deleteRepository = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    student.projectRepositories = student.projectRepositories.filter(
      repo => repo._id.toString() !== req.params.id
    );

    await student.save();
    res.json({ success: true, message: 'Repository deleted successfully' });
  } catch (error) {
    console.error('Delete repository error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/students - Create new student (Owner only)
const createStudent = async (req, res) => {
  try {
    const studentData = req.body;
    
    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [
        { email: studentData.email },
        { rollNumber: studentData.rollNumber }
      ]
    });

    if (existingStudent) {
      return res.status(400).json({ 
        success: false, 
        error: 'Student with this email or roll number already exists' 
      });
    }

    const student = new Student(studentData);
    await student.save();

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    console.error('Create student error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/students/:id - Update student (Owner only)
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Update student error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/students/:id - Delete student (Owner only)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/students/:id/scrape - Scrape student data
const scrapeStudentData = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Check if data is fresh (less than 1 hour old)
    if (!student.needsRefresh() && !req.query.force) {
      return res.json({ 
        success: true, 
        data: student, 
        message: 'Data is fresh, use ?force=true to force refresh' 
      });
    }

    console.log(`Starting scraping for student: ${student.name} (${student.rollNumber})`);
    
    const { results, errors } = await scraperService.scrapeAllPlatforms(student);

    // Update student with scraped data
    if (results.leetcode) student.platforms.leetcode = results.leetcode;
    if (results.codechef) student.platforms.codechef = results.codechef;
    if (results.codeforces) student.platforms.codeforces = results.codeforces;
    if (results.github) student.platforms.github = results.github;
    if (results.codolio) student.platforms.codolio = results.codolio;

    // Add any errors
    errors.forEach(error => {
      student.addScrapingError(error.platform, error.error);
    });

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
    console.error('Scrape student data error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/students/me/scrape - Scrape current student's data (LeetCode, CodeChef & Codeforces)
const scrapeMyData = async (req, res) => {
  try {
    // ✅ USER VERIFICATION: Extract and verify user from JWT token
    const userId = req.user.id;
    const userRole = req.user.role;
    const userEmail = req.user.email;
    
    console.log('='.repeat(80));
    console.log('🔐 USER VERIFICATION CHECK');
    console.log('='.repeat(80));
    console.log(`📋 JWT Token User ID: ${userId}`);
    console.log(`👤 User Role: ${userRole}`);
    console.log(`📧 User Email: ${userEmail}`);
    console.log(`⏰ Request Time: ${new Date().toISOString()}`);
    
    // Security check: Only students can scrape their own data
    if (userRole !== 'student') {
      console.error(`❌ SECURITY: Invalid role ${userRole} attempting to scrape student data`);
      return res.status(403).json({ 
        success: false, 
        error: 'Only students can scrape their own data' 
      });
    }
    
    // Find student by ID from JWT token
    const student = await Student.findById(userId);
    
    if (!student) {
      console.error(`❌ SECURITY: Student not found for user ID: ${userId}`);
      return res.status(404).json({ 
        success: false, 
        error: 'Student not found. Please contact support.' 
      });
    }
    
    // ✅ VERIFICATION: Log student details to confirm correct user
    console.log('='.repeat(80));
    console.log('✅ USER VERIFIED - Scraping authorized for:');
    console.log('='.repeat(80));
    console.log(`👤 Student Name: ${student.name}`);
    console.log(`🆔 Roll Number: ${student.rollNumber}`);
    console.log(`📧 Student Email: ${student.email}`);
    console.log(`🆔 MongoDB ID: ${student._id}`);
    console.log(`✅ ID Match: ${student._id.toString() === userId ? 'YES ✓' : 'NO ✗'}`);
    
    // Double-check: Ensure the student ID matches the JWT user ID
    if (student._id.toString() !== userId) {
      console.error(`❌ SECURITY BREACH: Student ID mismatch!`);
      console.error(`   JWT User ID: ${userId}`);
      console.error(`   Student ID: ${student._id}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Security verification failed. Access denied.' 
      });
    }
    
    console.log('='.repeat(80));
    console.log('🚀 STARTING SCRAPING PROCESS (LeetCode, CodeChef & Codeforces)');
    console.log('='.repeat(80));
    console.log('📋 Platform URLs Found:');
    console.log(`   LeetCode: ${student.platformLinks?.leetcode || 'Not set'}`);
    console.log(`   CodeChef: ${student.platformLinks?.codechef || 'Not set'}`);
    console.log(`   Codeforces: ${student.platformLinks?.codeforces || 'Not set'}`);
    console.log('='.repeat(80));

    const { exec } = require('child_process');
    const path = require('path');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const scraperPath = path.join(__dirname, '../../scraper');
    const rollNumber = student.rollNumber;
    const scrapingResults = {
      successful: [],
      errors: []
    };

    const startTime = Date.now();

    // Scrape LeetCode if username/link exists (using Python scraper)
    if (student.platformLinks?.leetcode || student.platformUsernames?.leetcode) {
      try {
        const leetcodeUrl = student.platformLinks?.leetcode || 
          `https://leetcode.com/u/${student.platformUsernames?.leetcode}/`;
        
        if (leetcodeUrl && (leetcodeUrl.includes('leetcode.com') || student.platformUsernames?.leetcode)) {
          console.log(`📊 [${student.name}] Scraping LeetCode for: ${leetcodeUrl}`);
          const leetcodeStartTime = Date.now();
          
          console.log(`   🔄 Running Python scraper: update_leetcode_student.py`);
          console.log(`   📝 Roll Number: ${rollNumber}`);
          console.log(`   🔗 URL/Username: ${leetcodeUrl}`);
          
          // Determine OS for Python command
          const isWindows = process.platform === 'win32';
          const pythonCmd = isWindows ? 'python' : 'python3';
          
          // Pass URL to Python script (it handles both URLs and usernames)
          // -u flag forces unbuffered stdout/stderr (critical for Node.js to see output in real-time)
          const command = isWindows 
            ? `cd /d "${scraperPath}" && ${pythonCmd} -u update_leetcode_student.py ${rollNumber} "${leetcodeUrl}"`
            : `cd "${scraperPath}" && ${pythonCmd} -u update_leetcode_student.py ${rollNumber} "${leetcodeUrl}"`;
          
          const { stdout, stderr } = await execAsync(
            command,
            { 
              maxBuffer: 1024 * 1024 * 10, 
              timeout: 300000, // 5 minute timeout
              cwd: scraperPath,
              shell: isWindows
            }
          );
          
          const leetcodeDuration = ((Date.now() - leetcodeStartTime) / 1000).toFixed(2);
          
          // Enhanced success detection
          const successIndicators = ['✅', 'Successfully', 'Update Complete', 'MongoDB updated', 'Data updated', 'completed'];
          const isSuccess = successIndicators.some(indicator => 
            stdout.toLowerCase().includes(indicator.toLowerCase())
          );
          
          if (isSuccess) {
            scrapingResults.successful.push('leetcode');
            console.log(`✅ [${student.name}] LeetCode scraping completed (${leetcodeDuration}s)`);
            
            // Try to extract stats from stdout for logging
            const problemsMatch = stdout.match(/problems.*?(\d+)/i) || stdout.match(/solved[:\s]+(\d+)/i);
            const ratingMatch = stdout.match(/rating[:\s]+(\d+)/i) || stdout.match(/current.*?rating[:\s]+(\d+)/i);
            const maxRatingMatch = stdout.match(/max.*?rating[:\s]+(\d+)/i);
            const contestsMatch = stdout.match(/contests[:\s]+(\d+)/i);
            
            if (problemsMatch) console.log(`   📈 Problems: ${problemsMatch[1]}`);
            if (ratingMatch) console.log(`   ⭐ Rating: ${ratingMatch[1]}`);
            if (maxRatingMatch) console.log(`   🏆 Max Rating: ${maxRatingMatch[1]}`);
            if (contestsMatch) console.log(`   🎯 Contests: ${contestsMatch[1]}`);
            
            // Fetch updated student from MongoDB and log updated data
            const updatedStudent = await Student.findById(userId);
            if (updatedStudent && updatedStudent.platforms?.leetcode) {
              const leetcodeData = updatedStudent.platforms.leetcode;
              console.log(`   ✅ LeetCode data updated in database:`);
              console.log(`      Problems: ${leetcodeData.problemsSolved || 'N/A'}`);
              console.log(`      Rating: ${leetcodeData.rating || 'N/A'}`);
              if (leetcodeData.maxRating) console.log(`      Max Rating: ${leetcodeData.maxRating}`);
              if (leetcodeData.contestsAttended) console.log(`      Contests: ${leetcodeData.contestsAttended}`);
            }
          } else {
            scrapingResults.errors.push({ platform: 'leetcode', error: 'Scraping may have failed - check logs' });
            console.log(`⚠️ [${student.name}] LeetCode scraping may have failed`);
            if (stderr) console.log(`   Error output: ${stderr.substring(0, 300)}`);
            if (stdout && stdout.length < 500) console.log(`   Output: ${stdout}`);
          }
        }
      } catch (error) {
        console.error(`❌ [${student.name}] LeetCode scraping error:`, error.message);
        scrapingResults.errors.push({ platform: 'leetcode', error: error.message });
      }
    } else {
      console.log(`ℹ️ [${student.name}] No LeetCode profile link/username found - skipping`);
    }

    // Scrape CodeChef if username/link exists
    if (student.platformLinks?.codechef || student.platformUsernames?.codechef) {
      try {
        const codechefUsername = student.platformUsernames?.codechef || 
          student.platformLinks?.codechef?.split('/').pop()?.split('?')[0] || '';
        
        if (codechefUsername) {
          console.log(`📊 [${student.name}] Scraping CodeChef for: ${codechefUsername}`);
          const codechefStartTime = Date.now();
          const codechefUrl = student.platformLinks?.codechef || `https://www.codechef.com/users/${codechefUsername}`;
          
          console.log(`   🔄 Running Python scraper: update_codechef_student.py`);
          console.log(`   📝 Roll Number: ${rollNumber}`);
          console.log(`   🔗 URL: ${codechefUrl}`);
          
          // Determine OS for Python command (same as LeetCode)
          const isWindows = process.platform === 'win32';
          const pythonCmd = isWindows ? 'python' : 'python3';
          
          // Pass URL to Python script (it will extract username from URL)
          // -u flag forces unbuffered stdout/stderr (critical for Node.js to see output in real-time)
          const command = isWindows 
            ? `cd /d "${scraperPath}" && ${pythonCmd} -u update_codechef_student.py ${rollNumber} "${codechefUrl}"`
            : `cd "${scraperPath}" && ${pythonCmd} -u update_codechef_student.py ${rollNumber} "${codechefUrl}"`;
          
          const { stdout, stderr } = await execAsync(
            command,
            { 
              maxBuffer: 1024 * 1024 * 10, 
              timeout: 300000, // 5 minute timeout
              cwd: scraperPath,
              shell: isWindows
            }
          );
          
          const codechefDuration = ((Date.now() - codechefStartTime) / 1000).toFixed(2);
          
          // Enhanced success detection
          const successIndicators = ['✅', 'Successfully', 'Update Complete', 'MongoDB updated', 'Data updated', 'completed'];
          const isSuccess = successIndicators.some(indicator => 
            stdout.toLowerCase().includes(indicator.toLowerCase())
          );
          
          if (isSuccess) {
            scrapingResults.successful.push('codechef');
            console.log(`✅ [${student.name}] CodeChef scraping completed for ${codechefUsername} (${codechefDuration}s)`);
            
            // Try to extract stats from stdout for logging
            const ratingMatch = stdout.match(/rating[:\s]+(\d+)/i) || stdout.match(/rating.*?(\d{3,})/i);
            const problemsMatch = stdout.match(/problems[:\s]+(\d+)/i) || stdout.match(/problems.*?(\d+)/i);
            const contestsMatch = stdout.match(/contests[:\s]+(\d+)/i) || stdout.match(/contests.*?(\d+)/i);
            
            if (ratingMatch) console.log(`   ⭐ Rating: ${ratingMatch[1]}`);
            if (problemsMatch) console.log(`   📈 Problems: ${problemsMatch[1]}`);
            if (contestsMatch) console.log(`   🏆 Contests: ${contestsMatch[1]}`);
            
            // Fetch updated student from MongoDB and log updated data
            const updatedStudent = await Student.findById(userId);
            if (updatedStudent && updatedStudent.platforms?.codechef) {
              const codechefData = updatedStudent.platforms.codechef;
              console.log(`   ✅ CodeChef data updated in database:`);
              console.log(`      Rating: ${codechefData.rating || 'N/A'}`);
              console.log(`      Problems: ${codechefData.problemsSolved || 'N/A'}`);
              if (codechefData.totalContests) console.log(`      Contests: ${codechefData.totalContests}`);
            }
          } else {
            scrapingResults.errors.push({ platform: 'codechef', error: 'Scraping may have failed - check logs' });
            console.log(`⚠️ [${student.name}] CodeChef scraping may have failed`);
            if (stderr) console.log(`   Error output: ${stderr.substring(0, 300)}`);
            if (stdout && stdout.length < 500) console.log(`   Output: ${stdout}`);
          }
        }
      } catch (error) {
        console.error(`❌ [${student.name}] CodeChef scraping error:`, error.message);
        scrapingResults.errors.push({ platform: 'codechef', error: error.message });
      }
    } else {
      console.log(`ℹ️ [${student.name}] No CodeChef profile link/username found - skipping`);
    }

    // Scrape Codeforces if username/link exists
    if (student.platformLinks?.codeforces || student.platformUsernames?.codeforces) {
      try {
        const codeforcesUrl = student.platformLinks?.codeforces || 
          `https://codeforces.com/profile/${student.platformUsernames?.codeforces}`;
        
        if (codeforcesUrl && codeforcesUrl.includes('codeforces.com')) {
          console.log(`📊 [${student.name}] Scraping Codeforces for: ${codeforcesUrl}`);
          const codeforcesStartTime = Date.now();
          
          console.log(`   🔄 Running Python scraper: update_codeforces_student.py`);
          console.log(`   📝 Roll Number: ${rollNumber}`);
          console.log(`   🔗 URL: ${codeforcesUrl}`);
          
          // Determine OS for Python command (same as LeetCode)
          const isWindows = process.platform === 'win32';
          const pythonCmd = isWindows ? 'python' : 'python3';
          
          // Pass URL to Python script (it handles both URLs and usernames)
          // -u flag forces unbuffered stdout/stderr (critical for Node.js to see output in real-time)
          const command = isWindows 
            ? `cd /d "${scraperPath}" && ${pythonCmd} -u update_codeforces_student.py ${rollNumber} "${codeforcesUrl}"`
            : `cd "${scraperPath}" && ${pythonCmd} -u update_codeforces_student.py ${rollNumber} "${codeforcesUrl}"`;
          
          const { stdout, stderr } = await execAsync(
            command,
            { 
              maxBuffer: 1024 * 1024 * 10, 
              timeout: 300000, // 5 minute timeout
              cwd: scraperPath,
              shell: isWindows
            }
          );
          
          const codeforcesDuration = ((Date.now() - codeforcesStartTime) / 1000).toFixed(2);
          
          // Enhanced success detection
          const successIndicators = ['✅', 'Successfully', 'Update Complete', 'MongoDB updated', 'Data updated', 'completed'];
          const isSuccess = successIndicators.some(indicator => 
            stdout.toLowerCase().includes(indicator.toLowerCase())
          );
          
          if (isSuccess) {
            scrapingResults.successful.push('codeforces');
            console.log(`✅ [${student.name}] Codeforces scraping completed (${codeforcesDuration}s)`);
            
            // Try to extract stats from stdout for logging
            const ratingMatch = stdout.match(/rating[:\s]+(\d+)/i) || stdout.match(/current.*?rating[:\s]+(\d+)/i);
            const problemsMatch = stdout.match(/problems[:\s]+(\d+)/i) || stdout.match(/solved[:\s]+(\d+)/i);
            const contestsMatch = stdout.match(/contests[:\s]+(\d+)/i) || stdout.match(/total.*?contests[:\s]+(\d+)/i);
            
            if (ratingMatch) console.log(`   ⭐ Rating: ${ratingMatch[1]}`);
            if (problemsMatch) console.log(`   📈 Problems: ${problemsMatch[1]}`);
            if (contestsMatch) console.log(`   🏆 Contests: ${contestsMatch[1]}`);
            
            // Fetch updated student from MongoDB and log updated data
            const updatedStudent = await Student.findById(userId);
            if (updatedStudent && updatedStudent.platforms?.codeforces) {
              const codeforcesData = updatedStudent.platforms.codeforces;
              console.log(`   ✅ Codeforces data updated in database:`);
              console.log(`      Rating: ${codeforcesData.rating || 'N/A'}`);
              console.log(`      Problems: ${codeforcesData.problemsSolved || 'N/A'}`);
              if (codeforcesData.contestsAttended) console.log(`      Contests: ${codeforcesData.contestsAttended}`);
              if (codeforcesData.rank) console.log(`      Rank: ${codeforcesData.rank}`);
            }
          } else {
            scrapingResults.errors.push({ platform: 'codeforces', error: 'Scraping may have failed - check logs' });
            console.log(`⚠️ [${student.name}] Codeforces scraping may have failed`);
            if (stderr) console.log(`   Error output: ${stderr.substring(0, 300)}`);
            if (stdout && stdout.length < 500) console.log(`   Output: ${stdout}`);
          }
        }
      } catch (error) {
        console.error(`❌ [${student.name}] Codeforces scraping error:`, error.message);
        scrapingResults.errors.push({ platform: 'codeforces', error: error.message });
      }
    } else {
      console.log(`ℹ️ [${student.name}] No Codeforces profile link/username found - skipping`);
    }

    // Scrape GitHub if username/link exists
    if (student.platformLinks?.github || student.platformUsernames?.github) {
      try {
        const githubUrl = student.platformLinks?.github || 
          `https://github.com/${student.platformUsernames?.github}`;
        
        if (githubUrl && (githubUrl.includes('github.com') || student.platformUsernames?.github)) {
          console.log(`📊 [${student.name}] Scraping GitHub for: ${githubUrl}`);
          const githubStartTime = Date.now();
          
          console.log(`   🔄 Running Python scraper: update_github_student.py`);
          console.log(`   📝 Roll Number: ${rollNumber}`);
          console.log(`   🔗 URL/Username: ${githubUrl}`);
          
          // Determine OS for Python command
          const isWindows = process.platform === 'win32';
          const pythonCmd = isWindows ? 'python' : 'python3';
          
          // Pass URL to Python script (it handles both URLs and usernames)
          // -u flag forces unbuffered stdout/stderr (critical for Node.js to see output in real-time)
          const command = isWindows 
            ? `cd /d "${scraperPath}" && ${pythonCmd} -u update_github_student.py ${rollNumber} "${githubUrl}"`
            : `cd "${scraperPath}" && ${pythonCmd} -u update_github_student.py ${rollNumber} "${githubUrl}"`;
          
          const { stdout, stderr } = await execAsync(
            command,
            { 
              maxBuffer: 1024 * 1024 * 10, 
              timeout: 300000, // 5 minute timeout
              cwd: scraperPath,
              shell: isWindows
            }
          );
          
          const githubDuration = ((Date.now() - githubStartTime) / 1000).toFixed(2);
          
          // Enhanced success detection
          const successIndicators = ['✅', 'Successfully', 'Update Complete', 'MongoDB updated', 'Data updated', 'completed'];
          const isSuccess = successIndicators.some(indicator => 
            stdout.toLowerCase().includes(indicator.toLowerCase())
          );
          
          if (isSuccess) {
            scrapingResults.successful.push('github');
            console.log(`✅ [${student.name}] GitHub scraping completed (${githubDuration}s)`);
            
            // Try to extract stats from stdout for logging
            const reposMatch = stdout.match(/repositories[:\s]+(\d+)/i);
            const contributionsMatch = stdout.match(/contributions[:\s]+(\d+)/i);
            const followersMatch = stdout.match(/followers[:\s]+(\d+)/i);
            const streakMatch = stdout.match(/current.*?streak[:\s]+(\d+)/i) || stdout.match(/streak[:\s]+(\d+)/i);
            
            if (reposMatch) console.log(`   📦 Repositories: ${reposMatch[1]}`);
            if (contributionsMatch) console.log(`   📊 Contributions: ${contributionsMatch[1]}`);
            if (followersMatch) console.log(`   👥 Followers: ${followersMatch[1]}`);
            if (streakMatch) console.log(`   🔥 Streak: ${streakMatch[1]} days`);
            
            // Fetch updated student from MongoDB and log updated data
            const updatedStudent = await Student.findById(userId);
            if (updatedStudent && updatedStudent.platforms?.github) {
              const githubData = updatedStudent.platforms.github;
              console.log(`   ✅ GitHub data updated in database:`);
              console.log(`      Repositories: ${githubData.repositories || 'N/A'}`);
              console.log(`      Contributions: ${githubData.contributions || 'N/A'}`);
              if (githubData.followers) console.log(`      Followers: ${githubData.followers}`);
              if (githubData.currentStreak) console.log(`      Streak: ${githubData.currentStreak} days`);
            }
          } else {
            scrapingResults.errors.push({ platform: 'github', error: 'Scraping may have failed - check logs' });
            console.log(`⚠️ [${student.name}] GitHub scraping may have failed`);
            if (stderr) console.log(`   Error output: ${stderr.substring(0, 300)}`);
            if (stdout && stdout.length < 500) console.log(`   Output: ${stdout}`);
          }
        }
      } catch (error) {
        console.error(`❌ [${student.name}] GitHub scraping error:`, error.message);
        scrapingResults.errors.push({ platform: 'github', error: error.message });
      }
    } else {
      console.log(`ℹ️ [${student.name}] No GitHub profile link/username found - skipping`);
    }

    // Fetch updated student data (using the verified user ID)
    const updatedStudent = await Student.findById(userId);
    
    if (!updatedStudent) {
      console.error(`❌ ERROR: Could not fetch updated student data for ID: ${userId}`);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to retrieve updated data' 
      });
    }

    // Update last scraped timestamp
    updatedStudent.lastScrapedAt = new Date();
    await updatedStudent.save();

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('='.repeat(80));
    console.log('✅ SCRAPING COMPLETED');
    console.log('='.repeat(80));
    console.log(`👤 Student: ${updatedStudent.name} (${updatedStudent.rollNumber})`);
    console.log(`✅ Successful: ${scrapingResults.successful.join(', ') || 'None'}`);
    console.log(`❌ Errors: ${scrapingResults.errors.length > 0 ? scrapingResults.errors.map(e => `${e.platform}: ${e.error}`).join(', ') : 'None'}`);
    console.log(`⏱️  Total Duration: ${totalDuration}s`);
    console.log(`⏰ Completed at: ${new Date().toISOString()}`);
    console.log('='.repeat(80));

    res.json({
      success: true,
      data: updatedStudent,
      scrapingResults: scrapingResults,
      message: `Scraping completed. ${scrapingResults.successful.length} platform(s) updated successfully.`,
      verifiedUser: {
        name: updatedStudent.name,
        rollNumber: updatedStudent.rollNumber,
        email: updatedStudent.email
      },
      duration: `${totalDuration}s`
    });

  } catch (error) {
    console.error('='.repeat(80));
    console.error('❌ SCRAPE MY DATA ERROR');
    console.error('='.repeat(80));
    console.error(`User ID: ${req.user?.id || 'Unknown'}`);
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error('='.repeat(80));
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = {
  getAllStudents,
  getMe,
  getStudentById,
  getStudentByRollNumber,
  updateAvatar,
  updateResume,
  deleteResume,
  updatePlatformLinks,
  addRepository,
  deleteRepository,
  createStudent,
  updateStudent,
  deleteStudent,
  scrapeStudentData,
  scrapeMyData
};

