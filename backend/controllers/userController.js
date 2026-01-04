const User = require('../models/User');
const scraperService = require('../services/scraperService');

// GET /api/users - Get all users
const getAllUsers = async (req, res) => {
  try {
    const { batch, sortBy = 'name', order = 'asc' } = req.query;
    
    let query = { isActive: true };
    if (batch && batch !== 'ALL') {
      query.batch = batch;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    
    if (sortBy === 'totalProblems') {
      // Sort by virtual field requires aggregation
      const users = await User.aggregate([
        { $match: query },
        {
          $addFields: {
            totalProblems: {
              $add: [
                { $ifNull: ['$platforms.leetcode.problemsSolved', 0] },
                { $ifNull: ['$platforms.codechef.problemsSolved', 0] },
                { $ifNull: ['$platforms.codeforces.problemsSolved', 0] }
              ]
            }
          }
        },
        { $sort: { totalProblems: sortOrder } }
      ]);
      return res.json({ success: true, data: users });
    } else {
      sortOptions[sortBy] = sortOrder;
    }

    const users = await User.find(query).sort(sortOptions);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/users/:id - Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/users/roll/:rollNumber - Get user by roll number
const getUserByRollNumber = async (req, res) => {
  try {
    const user = await User.findOne({ rollNumber: req.params.rollNumber, isActive: true });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by roll number error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/users - Create new user
const createUser = async (req, res) => {
  try {
    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: userData.email },
        { rollNumber: userData.rollNumber }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email or roll number already exists' 
      });
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/users/:id - Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/users/:id - Delete user (soft delete)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/users/:id/scrape - Scrape user data
const scrapeUserData = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if data is fresh (less than 1 hour old)
    if (!user.needsRefresh() && !req.query.force) {
      return res.json({ 
        success: true, 
        data: user, 
        message: 'Data is fresh, use ?force=true to force refresh' 
      });
    }

    console.log(`Starting scraping for user: ${user.name} (${user.rollNumber})`);
    
    const { results, errors } = await scraperService.scrapeAllPlatforms(user);

    // Update user with scraped data
    if (results.leetcode) user.platforms.leetcode = results.leetcode;
    if (results.codechef) user.platforms.codechef = results.codechef;
    if (results.codeforces) user.platforms.codeforces = results.codeforces;
    if (results.github) user.platforms.github = results.github;
    if (results.codolio) user.platforms.codolio = results.codolio;

    // Add any errors
    errors.forEach(error => {
      user.addScrapingError(error.platform, error.error);
    });

    user.lastScrapedAt = new Date();
    await user.save();

    res.json({ 
      success: true, 
      data: user, 
      scrapingResults: {
        successful: Object.keys(results),
        errors: errors
      }
    });
  } catch (error) {
    console.error('Scrape user data error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/users/scrape-all - Scrape all users data
const scrapeAllUsersData = async (req, res) => {
  try {
    const users = await User.find({ isActive: true });
    const results = [];

    for (const user of users) {
      try {
        if (user.needsRefresh() || req.query.force) {
          console.log(`Scraping data for ${user.name}`);
          
          const { results: scrapingResults, errors } = await scraperService.scrapeAllPlatforms(user);

          // Update user with scraped data
          if (scrapingResults.leetcode) user.platforms.leetcode = scrapingResults.leetcode;
          if (scrapingResults.codechef) user.platforms.codechef = scrapingResults.codechef;
          if (scrapingResults.codeforces) user.platforms.codeforces = scrapingResults.codeforces;
          if (scrapingResults.github) user.platforms.github = scrapingResults.github;
          if (scrapingResults.codolio) user.platforms.codolio = scrapingResults.codolio;

          // Add any errors
          errors.forEach(error => {
            user.addScrapingError(error.platform, error.error);
          });

          user.lastScrapedAt = new Date();
          await user.save();

          results.push({
            userId: user._id,
            name: user.name,
            successful: Object.keys(scrapingResults),
            errors: errors
          });
        } else {
          results.push({
            userId: user._id,
            name: user.name,
            skipped: 'Data is fresh'
          });
        }
      } catch (error) {
        console.error(`Error scraping ${user.name}:`, error);
        results.push({
          userId: user._id,
          name: user.name,
          error: error.message
        });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Scrape all users error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/users/stats - Get platform statistics
const getPlatformStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          avgLeetCodeRating: { $avg: '$platforms.leetcode.rating' },
          avgCodeChefRating: { $avg: '$platforms.codechef.rating' },
          avgCodeforcesRating: { $avg: '$platforms.codeforces.rating' },
          totalProblems: {
            $sum: {
              $add: [
                { $ifNull: ['$platforms.leetcode.problemsSolved', 0] },
                { $ifNull: ['$platforms.codechef.problemsSolved', 0] },
                { $ifNull: ['$platforms.codeforces.problemsSolved', 0] }
              ]
            }
          },
          totalGitHubContributions: { $sum: '$platforms.github.contributions' }
        }
      }
    ]);

    res.json({ success: true, data: stats[0] || {} });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByRollNumber,
  createUser,
  updateUser,
  deleteUser,
  scrapeUserData,
  scrapeAllUsersData,
  getPlatformStats
};