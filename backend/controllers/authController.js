const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Owner = require('../models/Owner');

// Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'go-tracker-super-secret-jwt-key-2024-change-in-production', {
    expiresIn: '24h'
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Please provide identifier, password, and role'
      });
    }

    let user = null;
    let userData = null;

    if (role === 'student') {
      // Find student by name (case-insensitive) or roll number
      user = await Student.findOne({
        $or: [
          { name: { $regex: new RegExp(`^${identifier}$`, 'i') } },
          { rollNumber: identifier }
        ],
        isActive: true
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      userData = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: 'student',
        studentData: user
      };
    } else if (role === 'staff') {
      user = await Staff.findOne({
        username: { $regex: new RegExp(`^${identifier}$`, 'i') }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      userData = {
        id: user._id,
        email: user.email || `${user.username}@bytebuster.edu`,
        name: user.name || user.username,
        role: 'staff'
      };
    } else if (role === 'owner') {
      user = await Owner.findOne({
        email: identifier.toLowerCase()
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      userData = {
        id: user._id,
        email: user.email,
        role: 'owner'
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    const token = generateToken({
      id: userData.id,
      email: userData.email,
      role: userData.role
    });

    res.json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const { id, role } = req.user;

    let user = null;

    if (role === 'student') {
      user = await Student.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      return res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: 'student',
            studentData: user
          }
        }
      });
    } else if (role === 'staff') {
      user = await Staff.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      return res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email || `${user.username}@bytebuster.edu`,
            name: user.name || user.username,
            role: 'staff'
          }
        }
      });
    } else if (role === 'owner') {
      user = await Owner.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      return res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            role: 'owner'
          }
        }
      });
    }

    res.status(400).json({
      success: false,
      error: 'Invalid role'
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  login,
  getMe
};
