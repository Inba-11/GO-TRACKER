const Student = require('../models/Student');
const scraperService = require('../services/scraperService');
const auth = require('../middleware/auth');

// GET /api/students - Get all students
const getAllStudents = async (req, res) => {
  try {
    const { batch, sortBy = 'rollNumber', order = 'asc' } = req.query;
    
    let query = { isActive: true };
    if (batch && batch !== 'ALL') {
      query.batch = batch;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    
    if (sortBy === 'totalProblems') {
      // Sort by virtual field requires aggregation
      const students = await Student.aggregate([
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
      ]);
      return res.json({ success: true, data: students });
    } else {
      sortOptions[sortBy] = sortOrder;
    }

    const students = await Student.find(query).sort(sortOptions);
    res.json({ success: true, data: students });
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

module.exports = {
  getAllStudents,
  getMe,
  getStudentById,
  getStudentByRollNumber,
  updateAvatar,
  updateResume,
  deleteResume,
  addRepository,
  deleteRepository,
  createStudent,
  updateStudent,
  deleteStudent,
  scrapeStudentData
};

