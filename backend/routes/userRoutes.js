const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users - Get all users with optional filtering and sorting
router.get('/', userController.getAllUsers);

// GET /api/users/stats - Get platform statistics
router.get('/stats', userController.getPlatformStats);

// GET /api/users/roll/:rollNumber - Get user by roll number
router.get('/roll/:rollNumber', userController.getUserByRollNumber);

// GET /api/users/:id - Get user by ID
router.get('/:id', userController.getUserById);

// POST /api/users - Create new user
router.post('/', userController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Delete user (soft delete)
router.delete('/:id', userController.deleteUser);

// POST /api/users/:id/scrape - Scrape data for specific user
router.post('/:id/scrape', userController.scrapeUserData);

// POST /api/users/scrape-all - Scrape data for all users
router.post('/scrape-all', userController.scrapeAllUsersData);

module.exports = router;