const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/studentController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', getAllStudents);
router.get('/roll/:rollNumber', getStudentByRollNumber);

// Student routes (authenticated)
router.get('/me', auth, getMe);
router.put('/me/avatar', auth, updateAvatar);
router.put('/me/resume', auth, updateResume);
router.delete('/me/resume', auth, deleteResume);
router.post('/me/repositories', auth, addRepository);
router.delete('/me/repositories/:id', auth, deleteRepository);

// Staff/Owner routes (authenticated)
router.get('/:id', auth, getStudentById);
router.post('/:id/scrape', auth, scrapeStudentData);

// Owner only routes (add role check middleware later)
router.post('/', auth, createStudent);
router.put('/:id', auth, updateStudent);
router.delete('/:id', auth, deleteStudent);

module.exports = router;

