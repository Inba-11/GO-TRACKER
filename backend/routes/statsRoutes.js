const express = require('express');
const router = express.Router();
const { getOverview, getTopPerformers, getAdminStats } = require('../controllers/statsController');
const auth = require('../middleware/auth');

// GET /api/stats/overview
router.get('/overview', auth, getOverview);

// GET /api/stats/top-performers
router.get('/top-performers', auth, getTopPerformers);

// GET /api/stats/admin
router.get('/admin', auth, getAdminStats);

module.exports = router;

