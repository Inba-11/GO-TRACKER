const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const {
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
} = require('../controllers/studentController');
const auth = require('../middleware/auth');
const {
  validateStudentCreate,
  validateStudentUpdate,
  validateAvatarUpdate,
  validateResumeUpdate,
  validateRepository
} = require('../middleware/validate');

// Public routes
router.get('/', getAllStudents);
router.get('/roll/:rollNumber', getStudentByRollNumber);

// INBATAMIZHAN P specific route
router.get('/inbatamizhan', async (req, res) => {
  try {
    const rollNumber = '711523BCB023';
    const student = await Student.findOne({ rollNumber: rollNumber });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'INBATAMIZHAN P data not found'
      });
    }

    res.json({
      success: true,
      data: student,
      platforms: student.platforms,
      lastUpdated: student.lastScrapedAt || student.updatedAt
    });

  } catch (error) {
    console.error('Get INBATAMIZHAN data error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Student routes (authenticated)
router.get('/me', auth, getMe);
router.put('/me/avatar', auth, validateAvatarUpdate, updateAvatar);
router.put('/me/resume', auth, validateResumeUpdate, updateResume);
router.delete('/me/resume', auth, deleteResume);
router.put('/me/platform-links', auth, updatePlatformLinks);
router.post('/me/repositories', auth, validateRepository, addRepository);
router.delete('/me/repositories/:id', auth, deleteRepository);
router.post('/me/scrape', auth, scrapeMyData);

// Staff/Owner routes (authenticated) - moved after /me routes to avoid conflicts
router.get('/:id', getStudentById); // Temporarily make this public for testing

// Staff/Owner routes (authenticated)
// router.get('/:id', auth, getStudentById); // Moved above and made public for testing
router.post('/:id/scrape', auth, scrapeStudentData);

// Owner only routes (add role check middleware later)
router.post('/', auth, validateStudentCreate, createStudent);
router.put('/:id', auth, validateStudentUpdate, updateStudent);
router.delete('/:id', auth, deleteStudent);

module.exports = router;

