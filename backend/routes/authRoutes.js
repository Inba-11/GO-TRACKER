const express = require('express');
const router = express.Router();
const { login, getMe, getStaffUsernames } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateLogin } = require('../middleware/validate');

// POST /api/auth/login
router.post('/login', validateLogin, login);

// GET /api/auth/me
router.get('/me', auth, getMe);

// GET /api/auth/staff/usernames - Get all staff usernames for dropdown
router.get('/staff/usernames', getStaffUsernames);

module.exports = router;

